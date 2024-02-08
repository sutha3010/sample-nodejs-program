const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 5000;
const path = require('path');
const ejs = require('ejs');
const { Readable } = require('stream');
const queryString = require('querystring');
const fs = require('fs');
var conn = require("./connection");
let routes = require("./js/route");
app.use('/', routes);
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended:true}));
require("dotenv").config()
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
var http = require('http');


// Define a route
app.get('/submit-form', (req, res) => {
  res.render('sample');
  // res.sendFile(__dirname+'/sample');
  // res.send('GET request received for /submit-form');
  // var {emp_id,emp_name,emp_email,emp_dept} = req.query;
  // res.send('Form data received successfully');
});

app.post('/submit-form', function(req,res){

  var emp_id = req.body.emp_id;
  var emp_name = req.body.emp_name;
  var emp_email = req.body.emp_email;
  var emp_dept = req.body.emp_dept;

conn.connect(function(err) {
    if (err) throw err;
    else{
    console.log("Connected!");
    }
  });

    // Insert data into 'employee' table
  var employeeSql  = "INSERT INTO employee(Emp_Id, Emp_email, Emp_name, Emp_dept) VALUES ('"+emp_id+"','"+emp_name+"','"+emp_email+"','"+emp_dept+"')";      
  conn.query(employeeSql , function (err, result) {
    if (err) throw err;
    // console.log("Number of records inserted: " + result.affectedRows);
    console.log('Form filled successfully' +result.insertId);
    res.send('Form filled successfully' +result.insertId);
  });

  var event_name = req.body.event_name;
  var event_date = req.body.event_date;
  var event_time = req.body.event_time;
  var event_venue = req.body.event_venue;

  // Insert data into 'events' table
   var eventsSql  = "INSERT INTO event(Event_name, Event_date, Event_time, Event_venue) VALUES ('"+event_name+"','"+event_date+"','"+event_time+"','"+event_venue+"')";    
     conn.query(eventsSql , function (err, result) {
       if (err) throw err;          
       res.send('Form filled successfully' +result.insertId);
     });


     var pre_yes = req.body.pre_yes;
     var pre_no = req.body.pre_no ;
     var veg = req.body.veg ;
     var non_veg = req.body.non_veg ;

if(pre_yes !=null){
pref=pre_yes;
}
else{
  pref=pre_no;
}

if(veg !=null){
food = veg;
}
else{
  food=non_veg;
}

// Insert data into 'userpreference' table
var userSql = "INSERT INTO userpreference (Emp_Id, Availability, Food_pref, Emp_dept) VALUES (?,?,?,?)";
conn.query(userSql, [emp_id, pref, food, emp_dept], function (err, result) {
  if (err) {
    console.error(err);
    res.status(500).send('Error while inserting data into the database');
  } else {
    if (result && result.insertId !== undefined) {
      console.log('Form filled successfully with ID: ' + result.insertId);
      res.send('Form filled successfully with ID: ' + result.insertId);
    } else {
      console.error('No insertId returned after successful insertion');
      res.status(500).send('Error while processing the form');
    }
  }
});


});


const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
      });

      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            console.log("*ERR: ", err)
            reject();
          }
          resolve(token); 
        });
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.USER_EMAIL,
          accessToken,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
        },
        secure: true,
        tls: { rejectUnauthorized: false }
      });
      return transporter;
  } catch (err) {
    return err
  }
};

// Convert form data to URL-encoded format
const formData = {
  // name: 'John Doe',
  // email: 'john@example.com',
  // message: 'This is a test message'
};
const formUrl = 'http://localhost:5000/submit-form?' + queryString.stringify(formData);

// Read the image file
const imageContent = fs.readFileSync('public/assets/annual.png');

const sendMail = async () => {
  try {
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: 'suthavenikumar@gmail.com',
      subject: "Form Submission Received",
      // text: "Hi, this is a test email",
      html: `
      <html>
        <head>
          <style>
            /* Inline CSS styles */
            body {
              font-family: Arial, sans-serif;
              background-color: #ffb7c5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffb7c5;
              border-radius: 5px;            
              box-shadow: 0 3px 20px rgba(252, 142, 172, 1);
            }
            h1 {
              color: #333333;
              text-align: center;
            }
            p {
              color: #ff007f;
              font-size: 16px;
              line-height: 1.6;
            }
            a {
              color: #007bff;
              text-decoration: none;
              font-weight: bold;
            }
            a:hover {
              text-decoration: underline;
            }
           
          </style>
        </head>
        <body>
          <div class="container">
          <h1>Hello !!! Maxval Champs, you have been invited to join the occassion with us....</h1>
            <h2>Fill the Form and confirm your presence</h2>
            <p>A form submission has been received. Click <a href="${formUrl}">here</a> to view the form.</p>
          </div>
        </body>
      </html>
    `,
      attachments: [
        {
          filename: 'annual.png', // Name of the attachment
        content: imageContent, // Content of the attachment
        encoding: 'base64' // Encoding type
        }
      ]
    }

    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(mailOptions);
  } catch (err) {
    console.log("ERROR: ", err)
  }
};

sendMail()

// Start the server
app.listen(process.env.PORT || port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

