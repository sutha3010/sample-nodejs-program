const express = require('express');
const router = express.Router();
var conn = require("../connection");


// router.post('/', function(req,res){

//   var emp_id = req.body.emp_id;
//   var emp_name = req.body.emp_name;
//   var emp_email = req.body.emp_email;
//   var emp_dept = req.body.emp_dept;

  // console.log(req.body);


// conn.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     var sql = "INSERT INTO employee(Emp_Id, Emp_email, Emp_name, Emp_dept) VALUES ('"+emp_id+"','"+emp_name+"','"+emp_email+"','"+emp_dept+"')";    
//     conn.query(sql, function (err, result) {
//       if (err) throw err;
//       // console.log("Number of records inserted: " + result.affectedRows);

//       res.send('Form filled successfully' +result.insertId);
//     });
//   });
// });

module.exports = router;