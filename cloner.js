async function getCurrentTabUrl() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [ tab ] = await chrome.tabs.query(queryOptions);
    return tab.url;
}

async function getData() {
  const PROXY_URL = "http://localhost:3000";
  let lcQuestionURL = await getCurrentTabUrl();  
  let lcQuestionURLSplit = lcQuestionURL.slice(0, -1).split('/')

  if(lcQuestionURLSplit[2] !== 'leetcode.com') { return null; }

  if(lcQuestionURLSplit[lcQuestionURLSplit.length - 1] === 'description') {
    lcQuestionURLSplit.pop();
  }
  let lcQuestionTitle = lcQuestionURLSplit.pop();

  const resData = {};
  try {
    // const [questionContentRes, exampleTestcasesRes, codeSnippetsRes] = await Promise.all([
    //   fetch(PROXY_URL + "/content/" + lcQuestionTitle),
    //   fetch(PROXY_URL + "/testcases/" + lcQuestionTitle),
    //   fetch(PROXY_URL + "/code-snippets/" + lcQuestionTitle),
    // ]);
    
    // const questionContentData = await questionContentRes.json();
    // const exampleTestcasesData = await exampleTestcasesRes.json();
    // const codeSnippetsData = await codeSnippetsRes.json();

    fetch(PROXY_URL + "/content/" + lcQuestionTitle)
      .then(res => res.json())
      .then(data => {
        resData.questionContent = data.data.question.content;
      })


    fetch(PROXY_URL + "/testcases/" + lcQuestionTitle)
      .then(res => res.json())
      .then(data => {
        resData.testcases = [];
        data.data.question.exampleTestcaseList.forEach(e => {
          let [inp, out] = e.split('\n');
          resData.testcases.push({ input: inp, expected_output: out });
        });
      })


    fetch(PROXY_URL + "/code-snippets/" + lcQuestionTitle)
    .then(res => res.json())
    .then(data => {
      resData.langs = {};
      data.data.question.codeSnippets.forEach(e => {
        resData.langs[e.lang] = e.code;
      });
    })

    return resData;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function StartCloning() {
  const data = await getData();
  console.log(data);
  //TODO: Create necessary files in the local file system
}

async function RemoveClonedFiles() {
  //TODO: Remove the created files
}

// Connect with frontend
async function listenForMessages() {
  await chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      if (message.action === 'startClone') {        
        await StartCloning();
      }
      else if (message.action == 'removeFiles') {
        await RemoveClonedFiles();
      }
  })
}

listenForMessages()