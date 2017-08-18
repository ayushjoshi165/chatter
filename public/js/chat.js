
$(document).ready(function(){


var user=getUserName();
var friend=null;
setNewMessages(user);

var socket=io();
socket.emit('username',user);
socket.on('message',function(chat){
	if(chat.from===friend)
	{
		appendAtEndOfChat(chat.message,"right");
		setMessageRead(user,friend);
		$("#chatWindow").animate({ scrollTop: $('#chatWindow').prop("scrollHeight")}, 1000);
	}
	else
	{
		var f="#"+chat.from;
		if($(f).find('#newMessage').html()==="")
		{
		$(f).find('#newMessage').html("new");
		$(f).prependTo('#list');
		$("#list").animate({ scrollTop: 0 }, 1000);
		}
	}
});

socket.on('newUserOnline',function(username){
	var f="#"+username;
	$(f).find('#status').html("online");
	$(f).prependTo('#list');
	$("#list").animate({ scrollTop: 0 }, 1000);
});

socket.on('userOffline',function(username){
	var f="#"+username;
	$(f).find('#status').html("");
});


function setNewMessages(user)
{
	var url="/unread-chats/"+user;
	$.ajax({
		url:url,
		type:"GET",
		success:function(res){
			for(var i=0;i<res.length;i++)
			{
				var f="#"+res[i].from;
				if($(f).find('#newMessage').html()==="")
				{
					$(f).find('#newMessage').html("new");
					$(f).prependTo('#list');
				}
			}
		},
		failure:function(){
			alert("Unable to send request, Please try after some time.");
		}
	});
}

function setMessageRead(user,friend)
{
	var data={};
	data["user"]=user;
	data["friend"]=friend;
	$.ajax({
		url:"/chats/set-read",
		type:"POST",
		data:JSON.stringify(data),
		contentType:"application/json",
		success:function(res){
			var f="#"+res["friend"];
      		$(f).find('#newMessage').html("");
		},
		failure:function(){
			alert("Unable to send request, Please try after some time.");
		}
	});
}

function getUserName()
{
var b=$('#userName').clone();
b.children('img').remove();	
return b.text().trim();
}

function appendAtEndOfChat(message,position)
{
	if(position==="right")
	{
		$('#chatArea').append('<div class="bubble-container"><div class="bubble you">'+message+'</div></div>');	
	}
	else if(position==="left")
	{
		$('#chatArea').append('<div class="bubble-container"><div class="bubble me">'+message+'</div></div>');
	}
}

function sendMessage(message)
{
	var data={};
	data["to"]=friend;
	data["from"]=user;
	data["message"]=message;
	socket.emit('message',data);
	appendAtEndOfChat(message,"left");
	$("#chatWindow").animate({ scrollTop: $('#chatWindow').prop("scrollHeight")}, 1000);
	var f="#"+friend;
	$(f).prependTo('#list');
	$('#messageText').val("");
	$('#messageText').focus();
}

function fillChatArea(user,friend)
{
	$('#chatArea').html("");
	var f="#"+friend;
	$('#friend').html('<div class="chip"><img src="'+$(f).find("img").attr("src")+'">'+$(f).find("p").text()+'</div>');
	var data={};
	data["user"]=user;
	data["friend"]=friend;
	$.ajax({
		url:"/chats",
		type:"POST",
		data:JSON.stringify(data),
		contentType:"application/json",
		success:function(res){
			for(i=0;i<res.length;i++)
			{
				if(res[i].from===friend)
				{
					appendAtEndOfChat(res[i].message,"right");
				}
				else
				{
					appendAtEndOfChat(res[i].message,"left")					
				}
			}
			$("#chatWindow").animate({ scrollTop: $('#chatWindow').prop("scrollHeight")}, 1000);
			$('#messageText').val("");
			$('#messageText').focus();
		},
		failure:function(){
			alert("Unable to send request, Please try after some time.");
		}
	});
}


$('.collection-item').click(function(){
      friend=$(this).find("p").text();
      fillChatArea(user,friend);
      setMessageRead(user,friend);
});

$('#search').keyup(function(){
	var query=$('#search').val();
	var regExp = new RegExp(query, 'i');
	$('.collection-item').each(function(i,div){
		if(regExp.test($(div).find("p").text()))
		{
			$(this).show();
		}	
		else
		{
			$(this).hide();
		}
	});
});

$('#messageButton').click(function(){
	if(friend===null) return;
	var txt=$('#messageText').val();
	if(txt==="") return;
	sendMessage(txt);
});

$('#messageText').keypress(function(e){
	if(e.which==13)
	{
		if(friend===null) return;
		var txt=$('#messageText').val();
		if(txt==="") return;
		sendMessage(txt);
	}
});

$('#friend').click(function(){
	if(friend)
	alert();
});


});