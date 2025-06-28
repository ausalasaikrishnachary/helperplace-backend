// const mysql = require("mysql2/promise");

// const connection = mysql.createPool({
//   host: 'localhost',       // or your DB host
//   user: 'root',            // your DB username
//   password: '', // your DB password
//   database: 'helperplace', 
  
// });

// connection.connect((err) => {
//   if (err) {
//     console.error('❌ Error connecting to MySQL:', err.stack);
//     return;
//   }
//   console.log('✅ Connected to MySQL as ID ' + connection.threadId);
// });

// module.exports = connection;


const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "helperplace"
});

module.exports = db;