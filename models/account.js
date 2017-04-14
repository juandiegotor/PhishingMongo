var mongoose=require("mongoose");//llamo la libreria de mongoose
var Schema=mongoose.Schema;//guardo los Schemas de mongoose en una variable

var account_schema=new Schema({
  username:{type:String,required:true},
  password:{type:String,required:true},
  isChanged:{type:Boolean,required:true},

  ownerUser:{type:Schema.Types.ObjectId,ref:"User"},

  ownerPage:{type:Schema.Types.ObjectId,ref:"Page"}

});

var Account=mongoose.model("Account",account_schema);

module.exports.Account=Account;
