var mongoose=require("mongoose");//llamo la libreria de mongoose
var Schema=mongoose.Schema;//guardo los Schemas de mongoose en una variable

mongoose.connect("mongodb://localhost/phishing");//conexion a mongo


//creo el schema que dira como son los documentos de mongo
var user_schema= new Schema({
name:{type:String ,required:[true,"name requerido"]},//le digo el tipo y que se necesita sino  se ingresa name manda error
lastname:{type:String ,required:[true,"lastname requerido"]},
address:{type:String,required:[true,"address requerido"]},
identification:{type:Number,required:[true,"identification requerida"],unique:[true,"la identification ya existe"],min:[1000000,"identificacion no valida"]}//se le puede poner minimo
//unique para que sea unica



});


var User=mongoose.model("User",user_schema);//Creacion del modelo se llama User

module.exports.User=User; // digo que voy a exportar
