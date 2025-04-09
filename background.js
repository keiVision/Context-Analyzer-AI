chrome.commands.onCommand.addListener(function(command) {
    if (command === "take-screenshot") {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "take-screenshot" });
      });
    }
  });
  
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "capture-screenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, function(dataUrl) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        canvas.width = request.rect.width;
        canvas.height = request.rect.height;
        ctx.drawImage(img, 
          request.rect.left, 
          request.rect.top, 
          request.rect.width, 
          request.rect.height,
          0, 0, 
          request.rect.width, 
          request.rect.height
        );
        
        const croppedDataUrl = canvas.toDataURL('image/png');
        
        // Копируем в буфер обмена
        const blob = dataURLtoBlob(croppedDataUrl);
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(() => {
          sendResponse({ success: true });
        });
      };
      
      img.src = dataUrl;
    });
    return true;
  }
});

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
  