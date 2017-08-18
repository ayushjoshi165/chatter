var router=require('express').Router();

var User=require('../models/user');
var Chat=require('../models/chat');

router.get('/chat-window/:username',function(req,res,next){
	User.find({},function(error,users){
		if(error) return next(error);
		User.findOne({username:req.params.username},function(err,user){
			if(err) return next(err);
			res.render('chat/chat-window',{user:user,users:users});	
		});
	});
});

router.post('/chats',function(req,res,next){
	var user=req.body.user;
	var friend=req.body.friend;
	Chat.find({$and:[{$or:[{from:user},{from:friend}]},{$or:[{to:user},{to:friend}]}]},function(error,chats){
    if(error) return next(error);
			res.json(chats);		
	});
});

router.post('/chats/set-read',function(req,res,next){
  var user=req.body.user;
  var friend=req.body.friend;
  var data={};
  data["user"]=user;
  data["friend"]=friend;
  Chat.find({from:friend,to:user,isRead:false},function(error,chats){
    if(error) return next(error);
    chats.forEach(function(chat){
      chat.isRead=true;
      chat.save();
    });
    res.json(data);
  });
});

router.get('/unread-chats/:username',function(req,res,next){
  Chat.find({to:req.params.username,isRead:false},function(error,chats){
    if(error) return next(error);
    res.json(chats);
  });
});

module.exports=router;