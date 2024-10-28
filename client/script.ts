// 도서 목록을 가져와서 화면에 표시하는 함수
async function fetchBooks() {
  const response = await fetch('/books');
  const books = await response.json();
  const bookList = document.getElementById('book-list');

  if (bookList) {
    bookList.innerHTML = books.map((book: any) =>
      `<p>${book.id}. ${book.title} by ${book.author} (${book.year}) - $${book.price} 
      <button class="delete-btn" data-id="${book.id}">삭제</button></p>`
    ).join('');
    addDeleteListeners();
  }
}

// 도서 추가 기능
document.getElementById('book-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const titleInput = document.getElementById('title') as HTMLInputElement;
  const authorInput = document.getElementById('author') as HTMLInputElement;
  const yearInput = document.getElementById('year') as HTMLInputElement;
  const priceInput = document.getElementById('price') as HTMLInputElement;

  const title = titleInput.value;
  const author = authorInput.value;
  const year = parseInt(yearInput.value, 10);
  const price = parseFloat(priceInput.value);

  await fetch('/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, year, price })
  });

  // 도서 목록을 다시 불러옵니다.
  await fetchBooks();
});

// 도서 삭제 기능
function addDeleteListeners() {
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const bookId = (event.target as HTMLElement).getAttribute('data-id');
      if (bookId) {
        await deleteBook(parseInt(bookId));
        await fetchBooks(); // 삭제 후 도서 목록 갱신
      }
    });
  });
}

async function deleteBook(bookId: number): Promise<void> {
  const response = await fetch(`/books/${bookId}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    alert("도서가 삭제되었습니다.");
  } else {
    alert("도서 삭제에 실패했습니다.");
  }
}

// 총 가격 계산 기능
document.getElementById('calculate-total')?.addEventListener('click', async () => {
  const bookIdsInput = document.getElementById('book-ids') as HTMLInputElement;
  const bookEntries = bookIdsInput.value.split(',').map(entry => {
    const [bookId, quantity] = entry.split(':').map(Number);
    return { bookId, quantity };
  });

  const response = await fetch('/books/price/total', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookEntries })
  });

  const data = await response.json();
  const checkoutResult = document.getElementById('checkout-result');
  if (checkoutResult) {
    checkoutResult.textContent = `Total Cost: $${data.totalCost}`;
  }
});

// 페이지 로드 시 도서 목록 불러오기
fetchBooks();
