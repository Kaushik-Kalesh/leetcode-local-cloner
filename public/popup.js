document.getElementById("cloneButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "startClone" });
});

document.getElementById("donateButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "donate" });
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
    const TESTING_PY_SCRIPT = `from solution import Solution

sol = Solution()

expected_outputs = []
with open('question.txt', 'r') as f:
    for line in f.readlines():
        if line.startswith('Output:'):
            expected_output = line.strip('Output:').strip()
            if expected_output in ('true', 'false'): expected_output = expected_output.capitalize()
            expected_outputs.append(expected_output)

method_name = [method for method in dir(Solution) if callable(
    getattr(Solution, method)) and not method.startswith("__")][0]

with open('testcases.txt', 'r') as f:
    for i, line in enumerate(f.readlines()):
        print(f'Testcase {i + 1}')
        line = line.rstrip('\\n')

        print(f'Input: {line}')
        print(f'Expected Output: {expected_outputs[i]}')
        output = eval(f"str(sol.{method_name}({line}))")
        print(f'Output: {output}')

        status = ('FAILED', 'PASSED')[eval(output) == eval(expected_outputs[i])]
        print(f'Status: {status}\\n')`;

    const SOLUTION_PY_CMT = `'''
    Ensure your helper methods are private, i.e their name starts with __ (for example: def __helper(self):
'''\n`;

    const files = [
      { name: "question.txt", content: html2text(data.questionContent) },
      {
        name: "solution.py",
        content:
          SOLUTION_PY_CMT + data.langs.Python3.replaceAll("List[", "list["),
      },
      { name: "testcases.txt", content: data.testcases.join("\n") },
      { name: "test.py", content: TESTING_PY_SCRIPT },
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
