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
	data = JSON.parse(data);
	var key = data.id + "#" + data.uuid;
	//strip them so that the end users cannot read it.
	data.id = '';
	data.uuid = '';
	//Save to memcached
	client.set(key, data, { flags: 0, exptime: 0}, function(err, status) {
		if (err) { 
			console.log(err); // 'STORED' on success!
		}
	});
});

app.listen(3000);
