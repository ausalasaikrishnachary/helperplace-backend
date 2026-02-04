const mysql = require("mysql2/promise");

// Prod Credentials
const db = mysql.createPool({
  host: "localhost",
  user: "gudnet_app",
  password: "StrongPass@123",
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

