var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var nodemailer = require('nodemailer');
//var async = require('async');
var crypto = require('crypto');
const { fileLoader } = require('ejs');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});
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
app.post('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/forgot-password', function(request, response) {
	response.sendFile(path.join(__dirname + '/forgot-password.html'));
});
app.get('/reset', function(request, response) {
	response.sendFile(path.join(__dirname + '/reset-password.html'));
});
app.post('/update-password', function(request, response) {
	var otp=request.body.otp;
	var password=request.body.password;
	var  sql = "SELECT email FROM my_otp WHERE otp = '"+otp+"'";
	connection.query(sql, function (err, results,fields) {  
		if (results.length > 0) {
			email=results[0].email;
			var  sql = "UPDATE USERS set PASSWORD='"+password+"' where EMAIL='"+email+"'";
			connection.query(sql, function (err, results,fields) {  
				response.redirect('/login');
			});  
		} 
		else {
			response.end("Incorrect OTP");
		}
		
	});  
});
app.post('/reset-password', function(request, response) {
	var email = request.body.email;
	var digits='0123456789';
	let otp='';
	for(let i=0;i<6;i++){
		otp+=digits[Math.floor(Math.random()*10)];
	}
	sql = "DELETE FROM my_otp where email ='"+email+"'";  
	connection.query(sql, function (err, result) {  
	if (err) throw err;  
	console.log("Record deleted.");  
	});
	sql = "INSERT INTO my_otp (EMAIL,OTP) VALUES ('"+email+"','"+otp+"')";  
	connection.query(sql, function (err, result) {  
	if (err) throw err;  
	console.log("1 record inserted.");  
	});  

	const mailOptions = {
		from: 'graphgenerator2020@gmail.com', // sender address
		to: email, // list of receivers
		subject: 'Your password reset link.  ', // Subject line
		text: 'http://localhost:3000/password/'+email+'     Please use the otp: '+otp+' to reset the password.'// plain text body
	  };
	  transporter.sendMail(mailOptions, function (err, info) {
		if(err)
		  console.log(err)
		else
		  console.log(info);
	 });
	 response.redirect('/reset');
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
			response.end("Username already exists.");
		} 
		else if(password!==cpassword)
		{	response.end("Passwords do not match.");}
		else {
			sql = "INSERT INTO users (EMAIL,USERNAME,PASSWORD) VALUES ('"+email+"','"+username+"','"+password+"')";  
			connection.query(sql, function (err, result) {  
			if (err) throw err;  
			console.log("1 record inserted");  
			response.redirect('/login');
			});  
		}
	});  
	//response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/mycss', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.css'));
});
app.get('/logo', function(request, response) {
	response.sendFile(path.join(__dirname + '/logo1.png'));
});
app.get('/person', function(request, response) {
	response.sendFile(path.join(__dirname + '/person.png'));
});
//For authentication of users
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
//When user successfully login
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		//response.send('Welcome back, ' + request.session.username + '!');
		response.redirect('http://localhost:7777/D3/BarChart/html3.html');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});
app.listen(3000);