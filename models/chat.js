var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var ChatSchema=new Schema({
	from:String,
	to:String,
	message:String,
	isRead:Boolean,
	time:{type:Date, default:Date.now()}
});

module.exports=mongoose.model("Chat",ChatSchema);