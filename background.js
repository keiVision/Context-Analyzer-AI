// Обработчик команд с клавиатуры
chrome.commands.onCommand.addListener(function(command) {
  if (command === "take-screenshot") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "take-screenshot" });
    });
  }
});

// Обработчик сообщений от content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "capture-screenshot") {
    // Захватываем видимую область вкладки
    chrome.tabs.captureVisibleTab(null, { format: "png" }, function(dataUrl) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // Устанавливаем размеры canvas в соответствии с выделенной областью
        canvas.width = request.rect.width;
        canvas.height = request.rect.height;
        
        // Вырезаем выделенную область из полного скриншота
        ctx.drawImage(img, 
          request.rect.left, 
          request.rect.top, 
          request.rect.width, 
          request.rect.height,
          0, 0, 
          request.rect.width, 
          request.rect.height
        );
        
        // Получаем DataURL вырезанной области
        const croppedDataUrl = canvas.toDataURL('image/png');
        
        // Создаем Blob из DataURL
        const blob = dataURLtoBlob(croppedDataUrl);
        
        // Создаем объект для буфера обмена
        const item = new ClipboardItem({ "image/png": blob });
        
        // Копируем в буфер обмена
        navigator.clipboard.write([item]).then(() => {
          sendResponse({ success: true });
        }).catch(err => {
          console.error('Ошибка при копировании в буфер обмена:', err);
          sendResponse({ success: false, error: err.message });
        });
      };
      
      img.src = dataUrl;
    });
    return true; // Сообщаем, что будем использовать асинхронный ответ
  }
});

// Функция для конвертации DataURL в Blob
function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
  