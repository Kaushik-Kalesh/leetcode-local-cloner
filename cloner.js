async function getCurrentTabUrl() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.url;
}

async function getData() {
  const PROXY_URL = "http://localhost:3000";
  let lcQuestionURL = await getCurrentTabUrl();
  let lcQuestionURLSplit = lcQuestionURL.slice(0, -1).split("/");

  if (lcQuestionURLSplit[2] !== "leetcode.com") {
    return null;
  }

  if (lcQuestionURLSplit[lcQuestionURLSplit.length - 1] === "description") {
    lcQuestionURLSplit.pop();
  }
  let lcQuestionTitle = lcQuestionURLSplit.pop();

  const resData = {
    title: lcQuestionTitle,
    questionContent: "",
    testcases: [],
    langs: {},
  };
  try {
    const [questionContentRes, exampleTestcaseRes, codeSnippetsRes] =
      await Promise.all([
        fetch(PROXY_URL + "/content/" + lcQuestionTitle),
        fetch(PROXY_URL + "/testcases/" + lcQuestionTitle),
        fetch(PROXY_URL + "/code-snippets/" + lcQuestionTitle),
      ]);

    const questionContentData = await questionContentRes.json();
    resData.questionContent = questionContentData.data.question.content;

    const exampleTestcaseData = await exampleTestcaseRes.json();
    exampleTestcaseData.data.question.exampleTestcaseList.forEach((e) => {
      let [inp, out] = e.split("\n");
      resData.testcases.push({ input: inp, expected_output: out });
    });

    const codeSnippetsData = await codeSnippetsRes.json();
    codeSnippetsData.data.question.codeSnippets.forEach((e) => {
      resData.langs[e.lang] = e.code;
    });

    return resData;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function StartCloning() {
  const data = await getData();

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        message: "Download Zip",
        ...data,
      });
    });
  });
}

async function RemoveClonedFiles() {
  //TODO: Remove the created files
}

// Connect with frontend
async function listenForMessages() {
  await chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.action === "startClone") {
        await StartCloning();
      } else if (message.action === "removeFiles") {
        await RemoveClonedFiles();
      } else if (message.action === "Debug") {
        console.log(message.log);
      } else if (message.action === "Error") {
        console.error(message.error);
      }
    }
  );
}

listenForMessages();
