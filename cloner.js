async function getCurrentTabUrl() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [ tab ] = await chrome.tabs.query(queryOptions);
    return tab.url;
}

async function StartCloning() {
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

  fetch(LEETCODE_GRAPHQL_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(GET_QUESTION_CONTENT_QUERY)
  })
    .then(response => response.json())
    .then(res => {
      console.log(res.data);
    })
    .catch(err => {
      console.error(err);
    });
}


async function RemoveClonedFiles() {

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