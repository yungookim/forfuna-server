//Handles routing, broadcasting(in the future using socket.io) To reduce 
//the bandwidth for the users, this router saves encrypted messages from 
//the users in memcached and listens for updates.
//When other users request a particular user's info, it simply sends back 
//the encrypted messages so the decryption can be done in the user's side.


var express = require('express'), 
mc = require('mc');

var client = new mc.Client();
client.connect(function() {
  console.log("Connected to the localhost memcache on port 11211!");
});

var app = module.exports = express.createServer();

app.configure(function(){
	app.use(express.bodyParser());
});

app.get('/*', function(req, res, next){
	res.render('index');
});

app.post('/prepare_profile', function(req, res, next){
	var data = req.body;
	//BUG : parse needs to be done twice.
	//it will do for now. @Fix it 
	if (data.id == "GUBxhEHhQo"){
		//dont save. this is a new user.
		res.send('');
		return;
	}
	var key = data.id + "@" + data.uuid;
	//Save to memcached
	client.set(key, JSON.stringify(data), { flags: 0, exptime: 0}, function(err, status) {
		if (err) { 
			console.log(err);
			res.send('');	
			return;
		}
		console.log(status);
	});
	res.send('');
});

app.post('/get_friend_info', function(req, res, next){
	var key = req.body.fid;
	client.get(key, function(err, response) {
		if (err) {
			console.log(err);
			res.send('');	
			return;
		} 
		res.send(response);
	});
});

app.post('/request_friend', function(req, res, next){
	var data = req.body;
	//id@uuid-type for key management? 'type' can be 'profile', 'frequest', etc
	//Save to memcached
	var key = data.id + "@" + data.uuid + '-frequest';
	client.set(key, JSON.stringify(data), { flags: 0, exptime: 0}, function(err, status) {
		if (err) { 
			console.log(err);
			res.send('');	
			return;
		}
		console.log(status);
	});
	res.send('');	
});

app.post('/get_updates', function(req, res, next){
	var key = req.body.id + "@" + req.body.uuid;
	var keys = [key + "-frequest"];
	client.get(keys, function(err, response) {
		if (err){
			console.log(err);
			res.send('');
			return;
		}
		res.send(response);
	});
});

app.post('/remove', function(req, res, next){
	var key = req.body.id + "@" + req.body.uuid;
	var length = req.body.length;
	var keys = [key + "-frequest"];
	client.get(keys, function(err, response) {
		if (err){
			console.log(err);
			return;
		}
		if (JSON.stringify(response).length == length){
			//Probably an old data.
			//Delete
			client.set(key + '-frequest', '',{flags: 0, exptime : 1}, function(err, status){
				if (err){
					console.log('at /remove, set : ' + err);
					res.send('');
					return;
				}
				console.log('at /remove, set : ' + status);
			});
		}
	});
	res.send('');
});
app.listen(3000);

