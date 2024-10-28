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
var _a, _b;
// 도서 목록을 가져와서 화면에 표시하는 함수
function fetchBooks() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('/books');
        const books = yield response.json();
        const bookList = document.getElementById('book-list');
        if (bookList) {
            bookList.innerHTML = books.map((book) => `<p>${book.id}. ${book.title} by ${book.author} (${book.year}) - $${book.price} 
      <button class="delete-btn" data-id="${book.id}">삭제</button></p>`).join('');
            addDeleteListeners();
        }
    });
}
// 도서 추가 기능
(_a = document.getElementById('book-form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const yearInput = document.getElementById('year');
    const priceInput = document.getElementById('price');
    const title = titleInput.value;
    const author = authorInput.value;
    const year = parseInt(yearInput.value, 10);
    const price = parseFloat(priceInput.value);
    yield fetch('/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, year, price })
    });
    // 도서 목록을 다시 불러옵니다.
    yield fetchBooks();
}));
// 도서 삭제 기능
function addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
            const bookId = event.target.getAttribute('data-id');
            if (bookId) {
                yield deleteBook(parseInt(bookId));
                yield fetchBooks(); // 삭제 후 도서 목록 갱신
            }
        }));
    });
}
function deleteBook(bookId) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`/books/${bookId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert("도서가 삭제되었습니다.");
        }
        else {
            alert("도서 삭제에 실패했습니다.");
        }
    });
}
// 총 가격 계산 기능
(_b = document.getElementById('calculate-total')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    const bookIdsInput = document.getElementById('book-ids');
    const bookEntries = bookIdsInput.value.split(',').map(entry => {
        const [bookId, quantity] = entry.split(':').map(Number);
        return { bookId, quantity };
    });
    const response = yield fetch('/books/price/total', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookEntries })
    });
    const data = yield response.json();
    const checkoutResult = document.getElementById('checkout-result');
    if (checkoutResult) {
        checkoutResult.textContent = `Total Cost: $${data.totalCost}`;
    }
}));
// 페이지 로드 시 도서 목록 불러오기
fetchBooks();
