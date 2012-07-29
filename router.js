//Handles routing, broadcasting(in the future using socket.io) To reduce 
//the bandwidth for the users, this router saves encrypted messages from 
//the users in memcached and listens for updates.
//When other users request a particular user's info, it simple sends back 
//the encrypted messages so the decryption can be done in the user's side.


var express = require('express'), 
;

var app = module.exports = express.createServer();

app.configure(function(){
 	app.use(express.bodyParser());
});

app.get('/*', function(req, res, next){
	res.render('index');
});


app.post('/prepare_profile', function(req, res, next){
	var data = req.body;
});


app.listen(3000);
