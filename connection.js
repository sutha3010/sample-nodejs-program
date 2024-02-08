var mysql = require('mysql');

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database:"maxevent"
  });
  

  module.exports = conn;