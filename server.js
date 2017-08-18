var express=require('express');
var app=express();
var server=require('http').Server(app);
var io=require('socket.io')(server);
var ejs=require('ejs');
var engine=require('ejs-mate');
var morgan=require('morgan');
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
var session=require('express-session');
var cookieParser=require('cookie-parser');
var flash=require('express-flash');
var MongoStore=require('connect-mongo')(session);

var secret=require('./config/conf');
var User=require('./models/user');
var Chat=require('./models/chat');

mongoose.connect(secret.db,function(error){
	if(error)
	{
		console.log(error);
	}
	else
	{
		console.log("Connected To Database...");
	}
});

app.use(express.static(__dirname+"/public"));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
	resave:true,
	saveUninitialized:true,
	secret:secret.secretKey,
}));
app.use(flash());
app.engine('ejs',engine);
app.set('view engine','ejs');


var userRoutes=require('./routes/user');
app.use(userRoutes);
var chatRoutes=require('./routes/chat');
app.use(chatRoutes);

var users={};

io.on('connection', function(socket){
	
	var user=null;

  	socket.on('username',function(u){
  		user=u;
  		users[user]=socket;
  		for(var key in users)
  		{
  			if(key!==user)
  			{
  				users[key].emit('newUserOnline',user);
  				socket.emit('newUserOnline',key);
  			}
  		}
  		console.log(user+" connected!");
  	});

  	socket.on('message',function(data){
  		var chat=new Chat();
  		chat.to=data.to;
  		chat.from=data.from;
  		chat.message=data.message;
  		chat.time=new Date().getTime();
      	chat.isRead=false;
  		chat.save(function(error,newChat){
  			if(error) console.log(error);
	  		if(users[chat.to])
	        {
	          users[chat.to].emit('message',newChat);
	        }
  		});
	});
  	
  	socket.on('disconnect', function () {
  		delete users[user];
  		for(var key in users)
  		{
  			if(key!==user)
  			{
  				users[key].emit('userOffline',user);
  			}
  		}
    	console.log(user+' disconnected');
  	});

});


app.get('/',function(req,res,next){
	res.render('main/home');
});



server.listen(secret.port,function(){
	console.log("Server Listening on Port 3000...");
});
