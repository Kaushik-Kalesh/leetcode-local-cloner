import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;
app.use(cors());

const LEETCODE_GRAPHQL_API_ENDPOINT = 'https://leetcode.com/graphql';

app.get("/content/:title", async (req, res) => {
    const GET_QUESTION_CONTENT_QUERY = {
        query: `query questionContent($titleSlug: String!) {
                  question(titleSlug: $titleSlug) {
                    content
                  }
                }`,
        variables: {"titleSlug": req.params.title},
        operationName: "questionContent"
      }
    const response = await fetch(LEETCODE_GRAPHQL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(GET_QUESTION_CONTENT_QUERY)
    });
    res.json(await response.json());
})

app.get("/testcases/:title", async (req, res) => {
    const GET_EXAMPLE_TESTCASES_QUERY = {
        query: `query consolePanelConfig($titleSlug: String!) {
                  question(titleSlug: $titleSlug) {
                    exampleTestcaseList
                  }	
                }`,
        variables: {"titleSlug": req.params.title},
        operationName: "consolePanelConfig"
    }
    const response = await fetch(LEETCODE_GRAPHQL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(GET_EXAMPLE_TESTCASES_QUERY)
    });
    res.json(await response.json());
})

app.get("/code-snippets/:title", async (req, res) => {
    const GET_CODE_SNIPPETS_QUERY = {
        query: `query questionEditorData($titleSlug: String!) {
                  question(titleSlug: $titleSlug) {
                    codeSnippets {
                      lang
                      code    
                    } 
                  }
        }`,
        variables: {"titleSlug": req.params.title},
        operationName: "questionEditorData"
    }
    const response = await fetch(LEETCODE_GRAPHQL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(GET_CODE_SNIPPETS_QUERY)
    });
    res.json(await response.json());
})

app.listen(PORT, () => {
    console.log(`Listening at Port ${PORT}...`);
})