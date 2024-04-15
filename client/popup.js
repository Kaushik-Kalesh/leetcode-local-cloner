document.getElementById('cloneButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'startClone' });
});

document.getElementById('removeButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'removeFiles' });
});