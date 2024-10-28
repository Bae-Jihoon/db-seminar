import express, { Request, Response } from 'express';
import mysql from 'mysql';
import path from 'path';
import axios from 'axios';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// MySQL 연결 풀 설정
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Zhixun2002*',
  database: 'bookstore',
  connectionLimit: 10
});

// 산술 연산 API
app.get('/arithmetics/add', (req: Request, res: Response) => {
  const lhs = parseInt(req.query.lhs as string);
  const rhs = parseInt(req.query.rhs as string);

  if (lhs<0 || rhs<0) {
    return res.status(400).json({ error: 'Invalid numbers' });
  }

  const result = lhs + rhs;

  if (result < 0) {
    return res.status(400).json({ error: 'The result must be a non-negative integer' });
  }
  res.json({ result });
});

app.get('/arithmetics/sub', (req: Request, res: Response) => {
  const lhs = parseInt(req.query.lhs as string);
  const rhs = parseInt(req.query.rhs as string);

  if (lhs<0 || rhs<0) {
    return res.status(400).json({ error: 'Invalid numbers' });
  }

  const result = lhs - rhs;

  if (result < 0) {
    return res.status(400).json({ error: 'The result must be a non-negative integer' });
  }
  res.json({ result });
});

app.get('/arithmetics/mul', (req: Request, res: Response) => {
  const lhs = parseInt(req.query.lhs as string);
  const rhs = parseInt(req.query.rhs as string);

  if (lhs<0 || rhs<0) {
    return res.status(400).json({ error: 'Invalid numbers' });
  }

  const result = lhs * rhs;

  if (result < 0) {
    return res.status(400).json({ error: 'The result must be a non-negative integer' });
  }
  res.json({ result });
});

app.get('/arithmetics/div', (req: Request, res: Response) => {
  const lhs = parseInt(req.query.lhs as string);
  const rhs = parseInt(req.query.rhs as string);

  if (lhs<0 || rhs<=0) {
    return res.status(400).json({ error: 'Invalid numbers' });
  }

  const result = lhs / rhs;

  if (result < 0) {
    return res.status(400).json({ error: 'The result must be a non-negative integer' });
  }
  res.json({ result });
});

// 도서 관리 API

// 1. 도서 목록 가져오기
app.get('/books', (req: Request, res: Response) => {
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
app.post('/books', (req: Request, res: Response) => {
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
app.post('/books/price/total', async (req: Request, res: Response) => {
  const { bookEntries } = req.body;
  if (!Array.isArray(bookEntries) || bookEntries.length === 0) {
    return res.status(400).json({ error: 'Invalid book entries' });
  }

  let totalCost = 0;
  try {
    for (const entry of bookEntries) {
      const { bookId, quantity } = entry;
      
      const [book] = await new Promise<any[]>((resolve, reject) => {
        pool.query('SELECT price FROM books WHERE id = ?', [bookId], (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      });

      if (book && typeof book.price === 'number') {
        const response = await axios.get<{ result: number }>(`http://localhost:${port}/arithmetics/mul`, {
          params: {
            lhs: book.price,
            rhs: quantity
          }
        });
        totalCost += response.data.result;
      }
    }
    res.json({ totalCost });
  } catch (error) {
    console.error("오류 발생:", error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 4. 도서 삭제 API (DELETE /books/:id)
app.delete('/books/:id', (req: Request, res: Response) => {
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
