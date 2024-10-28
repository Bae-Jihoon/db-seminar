"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
// MySQL 연결 풀 설정
const pool = mysql_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Zhixun2002*',
    database: 'bookstore',
    connectionLimit: 10
});
// 산술 연산 API
app.get('/arithmetics/add', (req, res) => {
    const lhs = parseInt(req.query.lhs);
    const rhs = parseInt(req.query.rhs);
    if (lhs < 0 || rhs < 0) {
        return res.status(400).json({ error: 'Invalid numbers' });
    }
    const result = lhs + rhs;
    if (result < 0) {
        return res.status(400).json({ error: 'The result must be a non-negative integer' });
    }
    res.json({ result });
});
app.get('/arithmetics/sub', (req, res) => {
    const { lhs, rhs } = req.query;
    const num1 = parseFloat(lhs);
    const num2 = parseFloat(rhs);
    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({ error: 'Invalid numbers' });
    }
    const result = num1 - num2;
    res.json({ result });
});
app.get('/arithmetics/mul', (req, res) => {
    const { lhs, rhs } = req.query;
    const num1 = parseFloat(lhs);
    const num2 = parseFloat(rhs);
    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({ error: 'Invalid numbers' });
    }
    const result = num1 * num2;
    res.json({ result });
});
app.get('/arithmetics/div', (req, res) => {
    const { lhs, rhs } = req.query;
    const num1 = parseFloat(lhs);
    const num2 = parseFloat(rhs);
    if (isNaN(num1) || isNaN(num2) || num2 === 0) {
        return res.status(400).json({ error: 'Invalid numbers or division by zero' });
    }
    const result = num1 / num2;
    res.json({ result });
});
// 도서 관리 API
// 1. 도서 목록 가져오기
app.get('/books', (req, res) => {
    pool.query('SELECT * FROM books', (error, results) => {
        if (error) {
            console.error("SQL 오류:", error);
            res.status(500).json({ error: '서버 오류' });
            return;
        }
        res.json(results);
    });
});
// 2. 새로운 도서 추가하기
app.post('/books', (req, res) => {
    const { title, author, year, price } = req.body;
    if (!title || !author || typeof year !== 'number' || typeof price !== 'number') {
        res.status(400).json({ error: '잘못된 요청' });
        return;
    }
    const query = 'INSERT INTO books (title, author, year, price) VALUES (?, ?, ?, ?)';
    pool.query(query, [title, author, year, price], (error, results) => {
        if (error) {
            console.error("SQL 오류:", error);
            res.status(500).json({ error: '서버 오류' });
            return;
        }
        res.status(201).json({ id: results.insertId, title, author, year, price });
    });
});
// 3. 책 가격 합계 계산 API (POST /books/price/total)
app.post('/books/price/total', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookEntries } = req.body;
    if (!Array.isArray(bookEntries) || bookEntries.length === 0) {
        return res.status(400).json({ error: 'Invalid book entries' });
    }
    let totalCost = 0;
    try {
        for (const entry of bookEntries) {
            const { bookId, quantity } = entry;
            const [book] = yield new Promise((resolve, reject) => {
                pool.query('SELECT price FROM books WHERE id = ?', [bookId], (error, results) => {
                    if (error)
                        return reject(error);
                    resolve(results);
                });
            });
            if (book && typeof book.price === 'number') {
                const response = yield axios_1.default.get(`http://localhost:${port}/arithmetics/mul`, {
                    params: {
                        lhs: book.price,
                        rhs: quantity
                    }
                });
                totalCost += response.data.result;
            }
        }
        res.json({ totalCost });
    }
    catch (error) {
        console.error("오류 발생:", error);
        res.status(500).json({ error: '서버 오류' });
    }
}));
// 4. 도서 삭제 API (DELETE /books/:id)
app.delete('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id, 10);
    if (isNaN(bookId)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }
    const query = 'DELETE FROM books WHERE id = ?';
    pool.query(query, [bookId], (error, results) => {
        if (error) {
            console.error("SQL 오류:", error);
            res.status(500).json({ error: '서버 오류' });
            return;
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully', bookId });
    });
});
// 서버 실행
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
