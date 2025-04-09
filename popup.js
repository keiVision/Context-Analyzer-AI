document.addEventListener('DOMContentLoaded', () => {
    const helloElem = document.getElementById('hello');
    helloElem.textContent = 'Hello World!';
  });

// DOMContentLoaded: ждём загрузки DOM.
// document.getElementById('hello'): находим элемент <h1>.
// textContent: изменяем текст на "Hello World".