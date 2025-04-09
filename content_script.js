let overlay;
let screenshotArea;
let isSelecting = false;

// Функция для создания наложения
function createOverlay() {
  overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '999999';
  overlay.style.pointerEvents = 'none'; // Запрещаем взаимодействие с наложением
  document.body.appendChild(overlay);

  // Включаем блокировку взаимодействия с текстом
  document.body.style.pointerEvents = 'none';
}

// Функция для удаления наложения
function removeOverlay() {
  if (overlay) {
    document.body.removeChild(overlay);
    overlay = null;
  }

  // Восстанавливаем возможность взаимодействия с текстом
  document.body.style.pointerEvents = 'auto';
}

// Функция для начала выбора области
function startSelecting(e) {
  isSelecting = true;
  screenshotArea = document.createElement('div');
  screenshotArea.style.position = 'absolute';
  screenshotArea.style.border = '2px dashed #fff';
  screenshotArea.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  document.body.appendChild(screenshotArea);
  screenshotArea.style.left = `${e.clientX}px`;
  screenshotArea.style.top = `${e.clientY}px`;

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// Обработчик перемещения мыши при выделении
function onMouseMove(e) {
  if (isSelecting && screenshotArea) {
    const width = e.clientX - parseInt(screenshotArea.style.left);
    const height = e.clientY - parseInt(screenshotArea.style.top);
    screenshotArea.style.width = `${width}px`;
    screenshotArea.style.height = `${height}px`;
  }
}

// Завершение выделения
function onMouseUp() {
  if (isSelecting) {
    isSelecting = false;
    const rect = screenshotArea.getBoundingClientRect();
    captureScreenshot(rect);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.removeChild(screenshotArea);
  }
}

// Функция для захвата области экрана
function captureScreenshot(rect) {
  chrome.runtime.sendMessage({ action: 'capture-screenshot', rect: rect }, (response) => {
    if (response.success) {
      console.log('Скриншот сохранен.');
    }
  });
}

// Слушаем сообщения от popup.js и background.js
chrome.runtime.onMessage.add
