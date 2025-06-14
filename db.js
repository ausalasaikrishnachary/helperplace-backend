const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',       // or your DB host
  user: 'root',            // your DB username
  password: '', // your DB password
  database: 'helperplace',
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL as ID ' + connection.threadId);
});

module.exports = connection;
