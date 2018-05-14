/**
* Module dependencies.
*/
var multer = require('multer'); // v1.0.5
var upload = multer({
  limits: { fileSize: 512000 }
}); // for parsing multipart/form-data

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');




//var methodOverride = require('method-override');
var session = require('express-session');
var app = express();
var mysql = require('mysql');
var bodyParser=require("body-parser");
var connection = mysql.createConnection({
              host     : 'localhost',
              user     : 'blockchaincontract',
              password : 'mypassword',
              database : 'blockchaincontract'
            });



connection.connect();

global.db = connection;

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 600000 },
              rolling: true
            }))

// development only

app.get('/', routes.index);//call for main index page
app.get('/signup', user.signup);//call for signup page
app.post('/signup', user.signup);//call for signup post
app.get('/login', routes.index);//call for login page
app.post('/login', user.login);//call for login post
app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/home/received', user.received);//call for received page
app.get('/home/send', user.send);//call for received page
app.post('/home/send', upload.any(), user.send);
app.get('/home/logout', user.logout);//call for logout
app.get('/home/profile',user.profile);//to render users profile
app.post('/home/profile', upload.any(),user.profile);
app.post('/api/1/load_recipients', user.load_recipients);
app.post('/api/1/load_contracts', user.load_contracts);
app.post('/api/1/sign_contract', user.sign_contract);
app.post('/api/1/generate_keys', user.generate_keys);
app.post('/api/1/num_contracts', user.num_contracts);
app.post('/api/1/upload_private_key', upload.any(), user.upload_private_key);
app.post('/api/1/decrypt_contract', user.decrypt_contract);
app.post('/api/1/session_has_private_key', user.session_has_private_key);
//Middleware
app.listen(8080)
