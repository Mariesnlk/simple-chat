const express = require('express');
//const app = express()
const mongo = require('mongodb').MongoClient;
const url  = 'mongodb://localhost:27017';
var app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/',(req, res) => {
	res.render("index")
} )

// app.get('/', function(req, res){
//   res.send('<h1>Hello world</h1>');
// });

//server = app.listen(3000)
http.listen(3000, function(){
    console.log('listening on *:3000');
});

let collection;

mongo.connect(url,{
         useNewUrlParser: true,
         useUnifiedTopology: true
        }, (err, client) => {
            if(err){
                console.error(err);
                console.log("You have some problems");
                return
            }
            console.log("You have success");
            const db = client.db('kennel');
            collection = db.collection('messages');
            // collection.insertOne({message:newMessage}, (err, result) =>{

            // })
            // collection.find().toArray((err, items)=>{

            // })
        //}
    })
//listen on every connection
io.on('connection', (socket)=>{
	console.log('New user connected');
	let info;
	mongo.connect(url, {
		 useNewUrlParser: true,
    	 useUnifiedTopology: true
    	}, (err, client) => {
    		if(err) {
    			console.log(err);
    			console.log("You have some problems");
    			return;
    		}
    		console.log("You have success");
    		const db = client.db('kennel');
    		collection = db.collection('messages');
    		//get all the documents added to the collectiosn
    		collection.find().toArray((err, items) =>{
    			info = items;
    			socket.emit('Hello', info);
    		})
    	//}
	})

	socket.username = "Anonymous";
	//listen on change_username
	socket.on('change_username', (data)=>{
		socket.username = data.username;
	})
	//listen on new_message
	socket.on('new_message', data=>{
		//broadcast a new message
		io.sockets.emit('new_message', {message : data.message, username : socket.username});
        //add this message to the db
        collection.insertOne({message: data.message, username: socket.username, date: new Date() //date 
        }, (err, result) => {
            if(err) throw err;
            console.log("message added into db");
        }); 
	})
	//listen on typing
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username});
    });

    //on delete button click
    socket.on('delete', (data) => {
        collection.deleteOne({message: data.message}, (err, item) => {
            if(err) throw err;
            console.log("success");
        })
    });

    socket.on('add_all_messages', (data) => {
    	console.log('test');
    	collection.find().toArray((err, items) => {
    		if(err) throw err;
    		io.emit('add_all_messages', items);
    	});
    });

    //let newMessage = socket.username + data.message;
    

});
