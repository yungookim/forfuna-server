//Handles routing, broadcasting(in the future using socket.io) To reduce 
//the bandwidth for the users, this router saves encrypted messages from 
//the users in memcached and listens for updates.
//When other users request a particular user's info, it simple sends back 
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
	var data = JSON.stringify(req.body);
	data = data.substring(1, data.length-4);
	//BUG : parse needs to be done twice.
	//it will do for now. @Fix it 
	data = JSON.parse(JSON.parse(data));
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
			return;
		}
		console.log(status);
	});
	res.send('');
});

app.post('/get_friend', function(req, res, next){
	var key = removeGarbage(JSON.stringify(req.body));
	key = key.substring(1, key.length-1);

	client.get(key, function(err, response) {
		if (err) {
			console.log(err);
			return;
		} 
		res.send(response);
	});
});
app.listen(3000);


function removeGarbage(str){
	return str.substring(1, str.length-4);
}

