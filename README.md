<center><h1>Database-API</h1></center>

This project is mainly intended to work in-tandem with a [DynamoDB table](#dynamodb-table) that uses [Vignere Encryption](https://en.wikipedia.org/wiki/Vigenère_cipher) 
to encrypt 700+ popular phrases from movies. However, some features of this project, like its [SQL interface](DatabaseAPI/app/sqlWorkspace.html), can be used for other use cases. Features include password/key based encryption and decryption. Users can use this feature to encrypt/decrypt specific items from the table using their corresponding uuid as the passwprd. Users can also use this feature to encrypt or decrypt data they input themselves. This project also features a previously mentioned SQL interface where users can query tables from AWS DynamoDB.

## Table of contents 
### Sections
* [Getting Started](#getting-started)
* [Instructions](#instructions)
    * [Cryptography](#cryptography)
    * [SQL-Queries](#sql-queries)
        * [General-Queries](#general-queries)
        * [Decryption-Queries](#decryption-queries)
* [Dependencies](#dependencies)
* [Routes-for-localhost-4040](#routes-for-localhost-4040)
    * [parseCSV](#parsecsv)
    * [populateDB](#populatedb)
    * [getData](#getdata)
    * [receiveQuery](#receivequery)
    * [getQueryData](#getquerydata)
* [Populating-a-New-DynamoDB-Database](#populating-a-new-dynamodb-database)
* [env-Password-and-Database-Reference](#env-password-and-database-reference)
* [DynamoDB-Table-Schema](#dynamodb-table-schema)
### Files
* [Server](DatabaseAPI/app/server.js)
* [Landing Page](DatabaseAPI/app/cryptography.html)
* [Expanded SQL Page](DatabaseAPI/app/sqlWorkspace.html)
* [Query Results](DatabaseAPI/app/normalQueryResults.html)
* [Query Results (Decryption)](DatabaseAPI/app/decryptionQueryResults.html)
* [css styles](DatabaseAPI/app/styles.css)
* [Password Varification](DatabaseAPI/app/passwordForm.html)
* [Data used](DatabaseAPI/app/movie_quotes.csv) [[Source](https://github.com/prasertcbs/basic-dataset/blob/master/movie_quotes.csv?plain=1)]


# Getting-Started
### NOTE 
If this is your first time running this project, refer to the [Dependencies](#dependencies) section for installation of dependencies.
### Open the project
* Navigate to the appropriate folder in the repository using:
```bash
cd DatabaseApi/app
```
* Run the server using:
```bash
nodemon server.js
```
* To navigate to the landing page of the project, launch your browser and type this url:
```bash
localhost:4040
```

# Instructions
## Cryptography
Once on the landing page, there are mutiple features available.
On the left half of the page, there are options to <span style="color: yellow;">Encrypt</span> and <span style="color: yellow;">Decrypt</span>. To use these features, a user must first enter a password in the password input box. This password will be used to generate a key unique to the password for encrypting and decrypting. The user can either choose to enter "Plain Text" to be encrypted, or "Cipher Text" to be decrypted. Both actions use the same key generated from the password. If the user is trying to decrypt the "encrypted_phrase" item from the DynamoDB table, the key for each item is unique to that item's uuid. 

## SQL-Queries
### General-Queries
On the right half of the landing page is an SQL Query interface that the user can use to interact and query a DynamoDB database. To make a queries, type your query in the grey feild and then click the <span style="color: #007bff;">Make Query</span> button to execute the query. The results of the query will be displayed on a new pop-up window. NOTE: You may have to enable or approve pop-up windows. 

### Decryption-Queries
This interface also includes a Decryption Query option. A user can choose to decrypt the "encrypted_phrase" key(s) from the DynamoDB table using this feature. In order to use this decryption query, the query <span style="color: red;">MUST</span> at least include the selection of <span style="color: yellow;">encrypted_phrase</span> and <span style="color: yellow;">uuid</span> from the table. Once formatting a proper query, user can execute the query by clicking the <span style="color: #007bff;">Decryption Query</span> button. The results of the query will be displayed on a new pop-up window. The user will be shown a list of all decrypted fetched phrases. There will also be a toggle button with the option to see the JSON format of the data fetched by the query.


NOTE: The databases the user is able to query is related to each user's individual AWS profile. A user cannot access someone's private DynamoDB database.


# Dependencies
### To install all packages needed for this project, run this command in the terminal:
```bash
npm run install-packages
```
### Note:
This command will install all of the following listed packages. If "npm install-packages" does not work, you can copy all the following installation commands to install the packages individually.
```bash
npm install express
npm install node
npm install nodemon
npm install @aws-sdk/client-dynamodb
npm install @aws-sdk/lib-dynamodb
npm install dotenv
npm install uuid
npm install fs
```

# Routes-for-localhost-4040
## parseCSV
This route parses the .csv data of movie information so that the server can later use it to populate a DynamoDB database.

## populateDB
This route populates your DynamoDB database with the movie info that was gathered from [parseCSV](#parsecsv). This route ONLY needs to be called if you are [populating a new database](#populating-a-new-dynamodb-database). It does not need to be called if accessing an existing database with the movie info already added. Calling this route prompts the user for a password. More info on this in the [.env](#env-password-and-database-reference) section.
<br><span style="color: red;">IMPORTANT:</span> the parseCSV route must be called ONCE before calling the populateDB route.

## getData
This route serves as a simple way to test database connection through a hard-coded sql query. If you are using a custom database or a database not created by "updateDB" route, it is possible that this route might not function as intended.

## receiveQuery
This POST route receives an SQL Query from the user in the from of a string. It then executes the query on the selected DynamoDB database and updates the variable "queryData" with the query's results.

## getQueryData
This route is called by [normalQueryResults](DatabaseAPI/app/normalQueryResults.html), [decryptionQueryResults](DatabaseAPI/app/decryptionQueryResults.html), & [sqlWorkspace](DatabaseAPI/app/sqlWorkspace.html) to get the results of the user's query from "queryData".




# Populating-a-New-DynamoDB-Database
To populate a new DynamoDB table, you have to first declare the name of your table in your .env file; [more info](#env-password-and-database-reference). Aftert that, you must call the [parseCSV](#parsecsv) route by typing "localhost:4040/parseCSV" into your browser url. Finally call the route [populateDB](#populatedb) by typing "localhost:4040/populateDB" into your browser url. NOTE: This action may take a while, give it some time to process.

# env-Password-and-Database-Reference
In order to maintain privacy, as well as allow this project to be used by others, this project has been setup to allow others to use personal DynamoDB databases. This is accomplished through the use of a .env file and a password. The [populateDB](#populatedb) route is password protected for the sake of not over-populating a table, and for the sake of not allowing non-authorized people to add data to a DynamoDB table. When "populateDB" is called, the user is taken to a page where they are prompted to enter a password. This password is unique to the local .env file in each individual repository. To have full use of the features in this project, it is <span style="color: red;">REQUIRED</span> that a .env file exists in the same root directory as where the [server.js](DatabaseAPI/app/server.js) and other files are being stored. If you do not have a .env file with the correct configuration, as stated in the next line, some features will not be available. Create a file named ".env". In the .env file, follow this format to declare your <span style="color: yellow;">password</span> and the name of the <span style="color: yellow;">DynamoDB table</span> you want populate.

        PASSWORD=yourPassword
        TABLE=table_name

NOTE: String notation such as single or double quotes is not necessary. However, variables "PASSWORD" and "TABLE" <span style="color: red;">MUST</span> be called exaclt as such and remain in all caps.


# DynamoDB-Table-Schema
Whether you are using this project to access the original DynamoDB table, or you intend to make your own, all items in the table will follow this schema after being populated by [populateDB](#populatedb):

    {
        "uuid": "35c25121-01fd-4d78-bfae-2fcd6de5c76c",
        "date": "4/20/2024, 1:35:19 PM",
        "encrypted_phrase": "nznf m hu izge uqkzxl",
        "movieInfo": {
            "movie": "Star Wars Empire Strikes Back",
            "year": "1980"
        }
    }