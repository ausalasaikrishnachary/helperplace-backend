const mysql = require("mysql2/promise");


const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "Gudnet",
  port: 3306
  
});


// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "Gudnet",
//   port: 4306
// });


module.exports = db;

