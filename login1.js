var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var nodemailer = require('nodemailer');
//var async = require('async');
var crypto = require('crypto');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});

var  hbs = require('nodemailer-express-handlebars'),
  email = process.env.MAILER_EMAIL_ID || 'graphgenerator2020@gmail.com',
  pass = process.env.MAILER_PASSWORD || 'generator@2020'
  nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
  auth: {
    user: email,
    pass: pass
  }
});

var handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.resolve('./api/templates/'),
  extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));



var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		   user: 'graphgenerator2020@gmail.com',
		   pass: 'generator@2020'
	   }
   });

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());



app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});
app.get('/forgot-password', function(request, response) {
	response.sendFile(path.join(__dirname + '/forgot-password.html'));
});
app.post('/reset-password', function(request, response) {
	var email = request.body.email;
	token = crypto.randomBytes(32).toString('hex');
	console.log(token);
	const mailOptions = {
		from: 'graphgenerator2020@gmail.com', // sender address
		to: email, // list of receivers
		subject: 'Your password reset link.', // Subject line
		html: '<p>http://localhost:3000/</p>{{token}}'// plain text body
	  };
	  transporter.sendMail(mailOptions, function (err, info) {
		if(err)
		  console.log(err)
		else
		  console.log(info);
	 });
	 response.end();
});
app.post('/register-user', function(request, response) {
	var email = request.body.email;
	var username = request.body.username;
	var password = request.body.password;
	var cpassword = request.body.cpassword;
	var  sql = "SELECT USERNAME FROM USERS WHERE username = '"+username+"'";
	connection.query(sql, function (err, results,fields) {  
		if (results.length > 0) {
			//return response.render('',{message:'Username already exists.'});
			response.send("Username already exists.");
		} 
		else if(password!==cpassword)
		{	response.send("Passwords do not match.");}
		else {
			sql = "INSERT INTO users (EMAIL,USERNAME,PASSWORD) VALUES ('"+email+"','"+username+"','"+password+"')";  
			connection.query(sql, function (err, result) {  
			if (err) throw err;  
			console.log("1 record inserted");  
			});  
			response.redirect('/login');
		}
		response.end();
		});  
	
	//response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/mycss', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.css'));
});
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT USERNAME,PASSWORD FROM USERS WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});
app.listen(3000);