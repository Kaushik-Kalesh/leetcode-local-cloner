async function getCurrentTabUrl() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.url;
}

async function getData() {
  const PROXY_URL = "https://llc-proxy.onrender.com";
  let lcQuestionURL = await getCurrentTabUrl();
  let lcQuestionURLSplit = lcQuestionURL.slice(0, -1).split("/");

  if (!lcQuestionURL.startsWith('https://leetcode.com/problems/')) {
    return null;
  }

  let lcQuestionTitle = lcQuestionURLSplit[4];

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
      resData.testcases.push(e.replace('\n', ','));
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

async function startCloning() {
  const data = await getData();
  if(data == null) { return; }

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        message: "Download Zip",
        ...data,
      });
    });
  });
}

async function processDonation() {
  //TODO: Process Donations
}

// Connect with frontend
async function listenForMessages() {
  await chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.action === "startClone") {
        await startCloning();
      } else if (message.action === "donate") {
        await processDonation();
      } else if (message.action === "Debug") {
        console.log(message.log);
      } else if (message.action === "Error") {
        console.error(message.error);
      }
    }
  );
}

listenForMessages();
