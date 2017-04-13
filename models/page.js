var mongoose=require("mongoose");//llamo la libreria de mongoose
var Schema=mongoose.Schema;//guardo los Schemas de mongoose en una variable


//creo el schema que dira como son los documentos de mongo

var page_schema=new Schema({
  name:{type:String,required:true},
  url:{type:String,required:true},
  protocol:{type:String,required:true},
  ishttp:{type:Boolean,default:false}
});

var Page=mongoose.model("Page",page_schema);

module.exports.Page = Page;
