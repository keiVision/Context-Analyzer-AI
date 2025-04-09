document.addEventListener('DOMContentLoaded', function() {
    const screenshotButton = document.getElementById('take-screenshot');
  
    screenshotButton.addEventListener('click', function() {
      // Отправка сообщения в активную вкладку для начала действия
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "take-screenshot" });
      });
    });
  });
  