async function getCurrentTabUrl() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [ tab ] = await chrome.tabs.query(queryOptions);
    return tab.url;
}

async function getData() {
  var resData = {}

  // TODO: Use jQuery to fix CORS block from client side
  const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
  const LEETCODE_GRAPHQL_API_ENDPOINT = 'https://leetcode.com/graphql';
  var lcQuestionURL = await getCurrentTabUrl();  
  var lcQuestionTitle = lcQuestionURL.slice(0, -1).split('/').pop()

  const GET_QUESTION_CONTENT_QUERY = {
    query: `query questionContent($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                content
              }
            }`,
    variables: {"titleSlug": lcQuestionTitle},
    operationName: "questionContent"
  }
  const GET_EXAMPLE_TESTCASES_QUERY = {
    query: `query consolePanelConfig($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                exampleTestcaseList
              }	
            }`,
    variables: {"titleSlug": lcQuestionTitle},
    operationName: "consolePanelConfig"
  }
  const GET_CODE_SNIPPETS_QUERY = {
    query: `query questionEditorData($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                codeSnippets {
                  lang
                  code    
                } 
              }
    }`,
    variables: {"titleSlug": lcQuestionTitle},
    operationName: "questionEditorData"
  }

  try {
    const [questionContentRes, exampleTestcasesRes, codeSnippetsRes] = await Promise.all([
      fetch(PROXY_URL + LEETCODE_GRAPHQL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(GET_QUESTION_CONTENT_QUERY)
      }),
      fetch(PROXY_URL + LEETCODE_GRAPHQL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(GET_EXAMPLE_TESTCASES_QUERY)
      }),
      fetch(PROXY_URL + LEETCODE_GRAPHQL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(GET_CODE_SNIPPETS_QUERY)
      })
    ]);

    const resData = {};

    const questionContentData = await questionContentRes.json();
    resData.questionContent = questionContentData.data.question.content;

    const exampleTestcasesData = await exampleTestcasesRes.json();
    resData.testcases = [];
    exampleTestcasesData.data.question.exampleTestcaseList.forEach(e => {
      let [inp, out] = e.split('\n');
      resData.testcases.push({ input: inp, expected_output: out });
    });

    const codeSnippetsData = await codeSnippetsRes.json();
    resData.langs = {};
    codeSnippetsData.data.question.codeSnippets.forEach(e => {
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
        console.log("CLONE!");
        await StartCloning();
      }
      else if (message.action == 'removeFiles') {
        await RemoveClonedFiles();
      }
  })
}

listenForMessages()