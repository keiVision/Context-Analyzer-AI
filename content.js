let timeout;
let currentButtons;
let fadeTimeout;

function createButtons(x, y, selectedText) {
  if (currentButtons) currentButtons.remove();

  const container = document.createElement('div');
  container.className = 'selection-buttons';
  container.style.top = `${y + window.scrollY}px`;
  container.style.left = `${x + window.scrollX}px`;

  const explainBtn = document.createElement('button');
  explainBtn.textContent = 'Explain';
  explainBtn.className = 'selection-button button-explain';
  container.appendChild(explainBtn);

  const queryBtn = document.createElement('button');
  queryBtn.textContent = 'Query';
  queryBtn.className = 'selection-button button-query';
  container.appendChild(queryBtn);

  document.body.appendChild(container);
  requestAnimationFrame(() => { container.style.opacity = 1; });

  explainBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentButtons) {
      currentButtons.remove();
      currentButtons = null;
    }
    showPopupText(x, y + 30, selectedText);
  });

  queryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentButtons) {
      currentButtons.remove();
      currentButtons = null;
    }
    showQueryInput(x + 100, y + 30);
  });

  currentButtons = container;
}

function fadeAndRemove(element) {
  let opacity = 1;
  const interval = setInterval(() => {
    if (element.matches(':hover')) {
      clearInterval(interval);
      element.style.opacity = 1;
      return;
    }
    opacity -= 0.05;
    element.style.opacity = opacity;
    if (opacity <= 0) {
      clearInterval(interval);
      element.remove();
    }
  }, 250);
}

function makeDraggable(el) {
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  el.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    el.style.cursor = 'move';
  });
}

function showPopupText(x, y, text) {
  const popup = document.createElement('div');
  popup.className = 'popup-text';
  popup.style.top = `${y + window.scrollY}px`;
  popup.style.left = `${x + window.scrollX}px`;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.className = 'popup-close';
  closeBtn.onclick = () => popup.remove();
  popup.appendChild(closeBtn);

  const content = document.createElement('div');
  popup.appendChild(content);
  document.body.appendChild(popup);

  makeDraggable(popup);

  let i = 0;
  const interval = setInterval(() => {
    content.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 15);

  popup.addEventListener('mouseenter', () => {
    clearTimeout(fadeTimeout);
    popup.style.opacity = 1;
  });

  popup.addEventListener('mouseleave', () => {
    fadeTimeout = setTimeout(() => fadeAndRemove(popup), 500);
  });
}

function showQueryInput(x, y) {
  const container = document.createElement('div');
  container.className = 'query-input-container';
  container.style.top = `${y + window.scrollY}px`;
  container.style.left = `${x + window.scrollX}px`;
  container.style.width = '250px';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.className = 'popup-close';
  closeBtn.onclick = () => container.remove();
  container.appendChild(closeBtn);

  const input = document.createElement('input');
  input.placeholder = 'Type your query...';
  container.appendChild(input);
  document.body.appendChild(container);
  input.focus();

  makeDraggable(container);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      showPopupText(x, y + 70, input.value);
      container.remove();
    }
  });

  container.addEventListener('mouseenter', () => {
    clearTimeout(fadeTimeout);
    container.style.opacity = 1;
  });

  container.addEventListener('mouseleave', () => {
    fadeTimeout = setTimeout(() => fadeAndRemove(container), 500);
  });
}

window.addEventListener('mouseup', (event) => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return;

  const range = selection.getRangeAt(0);
  const rects = range.getClientRects();
  const lastRect = rects[rects.length - 1];
  const selectedText = selection.toString();

  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (currentButtons) return; // Prevent respawning if already visible
    createButtons(lastRect.right, lastRect.bottom, selectedText);
  }, 300);
});

window.addEventListener('click', (e) => {
  if (currentButtons && !currentButtons.contains(e.target)) {
    currentButtons.remove();
    currentButtons = null;
  }
});