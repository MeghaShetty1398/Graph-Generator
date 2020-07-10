var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
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
app.post('/register-user', function(request, response) {
	var email = request.body.email;
	var username = request.body.username;
	var password = request.body.password;
	var  sql = "SELECT USERNAME FROM USERS WHERE username = '"+username+"'";
	connection.query(sql, function (err, results,fields) {  
		if (results.length > 0) {
			
			response.send("Username already exists.");
		} else {
			sql = "INSERT INTO users (EMAIL,USERNAME,PASSWORD) VALUES ('"+email+"','"+username+"','"+password+"')";  
			connection.query(sql, function (err, result) {  
			if (err) throw err;  
			console.log("1 record inserted");  
			response.sendFile(path.join(__dirname + '/login.html'));
			});  
		}
		response.end();
		});  
	
	//response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
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