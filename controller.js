var express= require("express");//llamo a express
var bodyParser=require("body-parser");//parser que sirve con los form y peticiones json
var methodOverride=require("method-override");//para sobrescribir un metodo que sirve para borrar

var app=express();//se inicia express

var User=require("./models/user").User;
var Page=require("./models/page").Page;

//Se le dice que va a usar a app que es el objeto de express
//-----------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
//-----------------------------



//redirecciono a las paginas cuando el link sea alguno de estos
//---------------GET---------------------------------------
app.get("/",function(req,res){
  res.render("index.jade");

});


app.get("/Add/addAccount",function(req,res){

res.render("./add/addAccount.jade");

});

app.get("/Add/addPage",function(req,res){

res.render("./add/addPage.jade");

});


app.get("/Add/adduser",function(req,res){

  res.render("./add/addUser.jade");

});



app.get("/user",function(req,res){

  User.find().exec(function(err,users){

   res.render("User.jade",{users:users});

  });


});




app.get("/account",function(req,res){

  res.render("Account.jade");

});


app.get("/account",function(req,res){

  res.render("Account.jade");

});


app.get("/page",function(req,res){



  Page.find().exec(function(err,pages){

  res.render("Page.jade",{pages:pages});

  });

});



//borrar usuario
app.get("/delete/user/:id",function(req,res){

  User.findOneAndRemove({_id:req.params.id},function(err){

    if(!err){
      res.redirect("/user");
    }else{
      console.log(err);
    }

  });
});

//borrar pagina

app.get("/delete/page/:id",function(req,res){

  Page.findOneAndRemove({_id:req.params.id},function(err){

    if(!err){
      res.redirect("/page");
    }else{
      console.log(err);
    }

  });
});


app.get("/page/search/:busq",function(req,res){


  Page.search(req.params.busq,function(err,pages){

       if(!err){
         res.render("Page.jade",{pages:pages});
       }
       else{
         res.redirect("/page");
       }

    });
  });

  app.get("/user/search/:busq",function(req,res){


    User.search(req.params.busq,function(err,users){
        //console.log(users);
         if(!err){
           res.render("User.jade",{users:users});
         }
         else{
           res.redirect("/user");
         }

    });

    });






//------------------------------------------------------



//-------------------POST-----------------------------
//formularios
app.post("/Add/addUser",function(req,res){
//recibo el formulario userAdd para guardar datos en mongo


//console.log("Name: "+req.body.name);
//console.log("LastName: "+req.body.lastname);
//console.log("Address: "+req.body.address);
//console.log("Identification : "+req.body.identification);

//creacion del document
var user =new User({
  name:req.body.name,
  lastname:req.body.lastname,
  address:req.body.address,
  identification:req.body.identification
});

//la collection se llama como cree el document pero con s al final
//lo guardo
//Se guarda con una promise necesita dos funciones como parametro
user.save().then(function(us){

 //res.send("El usuario se guardo exitosamente");



 res.redirect("/user");


},function(err){

console.log(err);
//res.send("No se pudo guardar");
res.redirect("/user");


});
 //



});

app.post("/Add/addPage",function(req,res){


//console.log(req.body.ishttp);


//miro como esta el checkbox y le asigno algo a la variable
var ishttpa=false;

if(String(req.body.ishttp)=="on"){
ishttpa=true;
}




console.log(ishttpa);

//creo el documento
  var page =new Page({
    name:req.body.name,
    url:req.body.url,
    ishttp:ishttpa,
    protocol:req.body.protocol
  });

page.save().then(function(pa){
  //res.send("Pagina guardada exitosamente");
  res.redirect("/page");

},function(err){
  console.log(err);
  //res.send("No se pudo guardar la pagina");
  res.redirect("/page");



});
});


app.post("/page/search",function(req,res){

  var busqueda=String(req.body.search);

  if(busqueda!=""){
    console.log(busqueda);
    res.redirect("/page/search/"+busqueda);


  }else{
  res.redirect("/page");
  }



});

app.post("/user/search",function(req,res){

  var busqueda=String(req.body.search);

  if(busqueda!=""){
    console.log(busqueda);
    res.redirect("/user/search/"+busqueda);
  }
  else{
  res.redirect("/user");
  }




});





app.listen(8080);//puerto de escucha
