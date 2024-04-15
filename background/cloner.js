import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

var lcQuestionURL = '';

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    var activeTab = tabs[0];
    lcQuestionURL = activeTab.url;
});
  
console.log(lcQuestionURL);

// Initialize GraphQL client
const client = new ApolloClient({
  uri: lcQuestionURL, 
  cache: new InMemoryCache()
});


const GET_QUESTION_QUERY = gql`
  query GetQuestion($questionId: ID!) {
    question(id: $questionId) {
      id
      title
      content
    }
  }
`;

// async function fetchQuestionData(questionId) {
//   try {
//     const { data } = await client.query({
//       query: GET_QUESTION_QUERY,
//       variables: { questionId }
//     });

//     console.log('Question data:', data);
//   } catch (err) {
//     console.error('Error fetching question data:', err);
//   }
// }

function StartCloning() {

}

function RemoveClonedFiles() {

}

// Connect with frontend
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startClone') {
        StartCloning();
    }
    else if (message.action == 'removeFiles') {
        RemoveClonedFiles();
    }
})