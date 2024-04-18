document.getElementById("cloneButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "startClone" });
});

document.getElementById("removeButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "removeFiles" });
});

function debug(msg) {
  chrome.runtime.sendMessage({ action: "Debug", log: msg });
}
function error(err) {
  chrome.runtime.sendMessage({ action: "Error", error: err.message });
}

function html2text(html) {
  var tag = document.createElement("div");
  tag.innerHTML = html;
  return tag.innerText;
}

function downloadZIP(data) {
  try {
    const files = [
      { name: "question.txt", content: html2text(data.questionContent) },
      { name: "solution.c", content: data.langs.C },
    ];

    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.name, file.content);
    });

    zip.generateAsync({ type: "blob" }).then((blob) => {
      const url = URL.createObjectURL(blob);

      // Dynamic download link creation
      const link = document.createElement("a");
      link.href = url;
      link.download = data.title + ".zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  } catch (err) {
    error(err);
  }
}

navigator.serviceWorker.addEventListener("message", (event) => {
  if (event.data.message === "Download Zip") {
    downloadZIP(event.data);
  }
});
