const clientDynamoDB =  require("@aws-sdk/client-dynamodb");
const clientDynamoLib = require("@aws-sdk/lib-dynamodb");
const express = require("express")
const uuid = require("uuid")
const app = express() // ALWAYS
const dotenv = require('dotenv').config();

const fs = require("fs")

const client = new clientDynamoDB.DynamoDBClient({});
const docClient = clientDynamoLib.DynamoDBDocumentClient.from(client);
const errorLog = (errorMsg) => console.error(`[ERROR] ${errorMsg}`);
const serverLog = (serverMsg) => console.log(`[SERVER] ${serverMsg}`);
const DBLog = (DBMsg) => console.log(`[DB] ${DBMsg}`);
const varification = (varMsg) => console.log(`[Varification] ${varMsg}`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let movieData = null;
let queryData = []
const table = process.env.TABLE;



async function populateDB() {
  const items = [];
  let nItems = 0

  for (let i = 1; i < movieData.length; i++) {
    const itemID = uuid.v4();
    const movieInfo_JSON = { movie: movieData[i][1], year: movieData[i][3] };
    serverLog(itemID)
    nItems++;

    items.push({
      "uuid": itemID,
      encrypted_phrase: encryptVigenere(gen_key_from_pass(itemID), movieData[i][0]),
      movieInfo: movieInfo_JSON,
      date: getDate()
    });
  }
  try {
      for (const item of items) {
          const putCommand = new clientDynamoLib.PutCommand({
              TableName: table,
              Item: item
          });
          await docClient.send(putCommand);
      }
      serverLog(`${nItems} Item(s) added`);

      const result = { status: "Success" };
      return result;

  } catch (error) {
      errorLog(error.message);

      const result = { status: "Failure" };
      return result; 
  }
}

app.post("/testDB", function(req, res) {
  console.log("/updateDB with " + req.body)
  returnVal = req.body
    // send() method returns HTML to the caller / client 
    res.json(returnVal);
});

const personalPassword = process.env.PASSWORD;
app.get("/populateDB", function(req, res) {
  res.sendFile(__dirname + "/passwordForm.html");
});

app.post("/populateDB", function(req, res) {
  movieData = readLocalCSV("movie_quotes.csv")
  const password = req.body.password;
  let returnVal = {status: "Function Did Not Return Expected Value"}

  if (password == personalPassword) {
    // If the password is correct, perform the database population
    varification("Correct Password");

    // populateDB().then(function(returnVal) {
    //   serverLog("Returned ID " + returnVal);
    // });
    console.log(movieData)
  } else {
    varification(`Incorrect Password "${password}"`)
    returnVal = {status: "Incorrect Password"}
  }
  
  res.json(returnVal);
});

// app.get("/populateDB", function(req, res) {
//   const password = prompt("Enter Password:")
//   let html;
//   if (password == hardCodePassword) {
//     html = "<h1>Updated DB</h1>"
//     // populateDB().then(function(returnVal) {
//     //   serverLog("Returned ID " + returnVal);
//     //   html += "<p>UPDATED : " + returnVal + "</p>";
//     //   // send() method returns HTML to the caller / client 
//     //   res.send(html);
//     // });
//     res.send(html);
//   } else {
//     html = "<h1>Incorrect Password</h1>"
//     res.send(html);
//   }
// });

// Used for development
app.get("/getData", async function(req, res) {
  try {
    serverLog('Processing ' + req.url);
    const selectItemStatementCommand = new clientDynamoLib.ExecuteStatementCommand({
        Statement: `SELECT movieInfo.movie FROM ${table} WHERE movieInfo.year = ?`,
        Parameters: ['2002']
    });
    serverLog(`Selected items from ${table}`);
    const selectItemResponse = await docClient.send(selectItemStatementCommand);
    
    // Log the retrieved items
    for (let i = 0; i < selectItemResponse.Items.length; i++) {
        DBLog(`Got results: ${JSON.stringify(selectItemResponse.Items[i])}`);
    }
    
    // Respond with the retrieved items
    res.json(selectItemResponse.Items);
  } catch (error) {
      errorLog(error.message);
      res.status(500).json({ error: 'Internal Server Error' }); // Respond with an error status and message
  }
});


app.get("/getQueryData", (req, res) => {
  res.send(queryData)
});

app.post("/receiveQuery", async (req, res) => {
  try {
    query(req.body);
    // Don't send a response here
  } catch (error) {
    errorLog(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


async function query(query_JSON) {
  query_string = query_JSON["query"]
  queryData = []
  serverLog(`Query Sent to Server : ${query_string}`)
  try {
    const selectItemStatementCommand = new clientDynamoLib.ExecuteStatementCommand({
        Statement: query_string
    });
    serverLog(`Executed Query at ${getDate()}`);
    const selectItemResponse = await docClient.send(selectItemStatementCommand);

    
    // Log the retrieved items
    for (let i = 0; i < selectItemResponse.Items.length; i++) {
        DBLog(`Got results: ${JSON.stringify(selectItemResponse.Items[i])}`);
        queryData.push(JSON.stringify(selectItemResponse.Items[i]))
    }
    
    // Respond with the retrieved items. (Type: Array of Objects)
    return selectItemResponse.Items;

  } catch (error) {
    errorLog(error.message);

    if (error.message.includes("Statement wasn't well formed")) {
      errorLog('Syntax error in query');
      return []; // Return an empty array to indicate no results due to syntax error
    } else {
      throw error;
    }
  }
}


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/cryptography.html")
});

app.get("/decryption-redirect", (req, res) => {
  res.sendFile(__dirname + "/decryptionQueryResults.html")
});

app.get("/redirect", (req, res) => {
  res.sendFile(__dirname + "/normalQueryResults.html")
});

app.get("/sqlWorkspace", (req, res) => {
  res.sendFile(__dirname + "/sqlWorkspace.html")
});




// START A SERVER 
app.listen(4040, function() {
  serverLog(`Sever started at ${getDate()}`)
  serverLog("Listening on port 4040..."); // RECOMMENDED
 });



function letterToIndex(letter) {
  let idx = 0;
  if (letter.charCodeAt(0) == 45) {
    idx = letter.charCodeAt(0) - 18

  } else if (letter.charCodeAt(0) >= 48 && letter.charCodeAt(0) <= 57) {
    idx = letter.charCodeAt(0) - 21;
  } else if (letter.charCodeAt(0) <= 122 && letter.charCodeAt(0) >= 97) {
      idx = letter.charCodeAt(0) - 97;

  } else if (letter.charCodeAt(0) <= 90 && letter.charCodeAt(0) >= 65) {
      idx = letter.charCodeAt(0) - 65;

  }
  return idx;
}

function indexToLetter(idx) {
  idx = idx + 97;
  return String.fromCharCode(idx);
}

function vigenereIndex(keyLetter, plainTextLetter) {
  const keyIndex = letterToIndex(keyLetter);
  const plainTextIndex = letterToIndex(plainTextLetter);
  const newIndex = (plainTextIndex + keyIndex) % 26;
  const index = indexToLetter(newIndex);
  return index;
}

function undoVig(keyLetter, cipherTextLetter) {
  const keyIndex = letterToIndex(keyLetter);
  const cipherTextIndex = letterToIndex(cipherTextLetter);
  const newIndex = (cipherTextIndex - keyIndex + 26) % 26;
  const index = indexToLetter(newIndex);
  return index;
}

function removeDuplicates(myString) {
  let newStr = "";
  for (let ch of myString) {
      if (!newStr.includes(ch)) {
          newStr += ch;
      }
  }
  return newStr;
}

function removeMatches(myString, remove) {
  let newStr = "";
  for (let ch of myString) {
      if (!remove.includes(ch)) {
          newStr += ch;
      }
  }
  return newStr;
}

function gen_key_from_pass(password) {
    password = password.replace(/[-0-9]/g, "");
    const alphabet = 'abcdefghijklmnopqrstuvwxyz ';
    let key = "";
    password = password.toLowerCase();
    password = removeDuplicates(password);
    const lastChar = password.slice(-1);
    const lastIdx = alphabet.indexOf(lastChar);
    const afterString = removeMatches(alphabet.slice(lastIdx + 1), password);
    const beforeString = removeMatches(alphabet.slice(0, lastIdx), password);
    key = password + afterString + beforeString;
    serverLog(key)
    return key;
}

function encryptVigenere(key, plainText) {
  plainText = plainText.replace(/[^\w\s]/g, "");
  let cipherText = "";
  const keyLen = key.length;
  for (let i = 0; i < plainText.length; i++) {
      let ch = plainText[i].toLowerCase();
      if (ch === " ") {
          cipherText += ch;
      } else {
          cipherText += vigenereIndex(key[i % keyLen], ch);
      }
  }
  return cipherText;
}

function decryptVigenere(key, cipherText) {
  let plainText = "";
  const keyLen = key.length;
  for (let i = 0; i < cipherText.length; i++) {
      let ch = cipherText[i];
      if (ch === " ") {
          plainText += ch;
      } else {
          plainText += undoVig(key[i % keyLen], ch);
      }
  }
  return plainText;
}

function readLocalCSV(filePath) {
  try {
      // Read the CSV file synchronously
      const csvText = fs.readFileSync(filePath, 'utf-8');
      
      // Parse the CSV text
      const rows = csvText.split('\n').map(row => row.split(','));
      
      // Return the parsed CSV data
      return rows;
  } catch (error) {
      errorLog(error.message);
      return error.message;
  }
}

function getDate() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString(); 
  return formattedDate
}