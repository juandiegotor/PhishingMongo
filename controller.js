var express= require("express");//llamo a express
var bodyParser=require("body-parser");//parser que sirve con los form y peticiones json
var methodOverride=require("method-override");//para sobrescribir un metodo que sirve para borrar


var app=express();//se inicia express



var User=require("./models/user").User;
var Page=require("./models/page").Page;
var Account=require("./models/account").Account;

//Se le dice que va a usar a app que es el objeto de express
//-----------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
//-----------------------------



app.use("/public",express.static('public'));//usar esta carpeta

//redirecciono a las paginas cuando el link sea alguno de estos
//---------------GET---------------------------------------
//redirecciono a main
app.get("/",function(req,res){
  res.render("index.jade");

});


//redirecciono a editar
app.get("/edit/editAccount/:id",function(req,res){

  Account.findOne({_id:req.params.id}).populate("ownerUser").populate("ownerPage")
  .exec(function(err,account){



    User.find().exec(function(err,users){

      Page.find().exec(function(err,pages){


      res.render("./edit/editAccount.jade",{account:account,users:users,pages:pages});

      })
    })



      


  });



});

app.get("/edit/editPage/:id",function(req,res){


Page.findOne({_id:req.params.id}).exec(function(err,page){

  res.render("./edit/editPage.jade",{page:page});


  });


});


app.get("/edit/editUser/:id",function(req,res){

  User.findOne({_id:req.params.id}).exec(function(err,user){

    res.render("./edit/editUser.jade",{user:user});


    });

});



app.get("/Add/addAccount",function(req,res){

  User.find().exec(function(err,users){

    Page.find().exec(function(err,pages){


      res.render("./add/addAccount.jade",{users:users,pages:pages});

    })
  })



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

  Account.find().populate("ownerUser").populate("ownerPage").exec(function(err,accounts){
    //inner join con las otras dos tablas puedo acceder a atributos de la tabla con account.ownerPage.nombre
  res.render("Account.jade",{accounts:accounts});

  });



});


app.get("/page",function(req,res){



  Page.find().exec(function(err,pages){

  res.render("Page.jade",{pages:pages});

  });

});

//borrar cuenta

app.get("/delete/account/:id",function(req,res){

  Account.findOneAndRemove({_id:req.params.id},function(err){

    if(!err){
      res.redirect("/account");

    }else{
      console.log(err);
    }

  });
});

//borrar usuario
app.get("/delete/user/:id",function(req,res){

  User.findOneAndRemove({_id:req.params.id},function(err){

    if(!err){

        Account.findOneAndRemove({ownerUser:req.params.id},function(err){
             if(!err){
               res.redirect("/user");
             }

        });

    }else{
      console.log(err);
    }

  });
});

//borrar pagina

app.get("/delete/page/:id",function(req,res){

  Page.findOneAndRemove({_id:req.params.id},function(err){

    if(!err){



              Account.findOneAndRemove({ownerPage:req.params.id},function(err){
                   if(!err){
                     res.redirect("/page");
                   }

              });
    }else{
      console.log(err);
    }

  });
});


app.get("/page/search/:busq",function(req,res){


  Page.find({name:req.params.busq},function(err,pages){

       if(!err){
         res.render("Page.jade",{pages:pages});
       }
       else{
         res.redirect("/page");
       }

    });

  });


  app.get("/account/search/:busq",function(req,res){


    Account.find({username:req.params.busq}).populate("ownerPage").populate("ownerUser").exec(function(err,accounts){

         if(!err){
           res.render("Account.jade",{accounts:accounts});
         }
         else{
           res.redirect("/account");
         }

      });

    });

  app.get("/user/search/:busq",function(req,res){


    User.find({name:req.params.busq},function(err,users){
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


app.post("/account/search",function(req,res){

  var busqueda=String(req.body.search);

  if(busqueda!=""){
    console.log(busqueda);
    res.redirect("/account/search/"+busqueda);


  }else{
  res.redirect("/account");
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

app.post("/Add/addAccount",function(req,res){
  var ischangeda=false;

  if(String(req.body.ischanged)=="on"){
  ischangeda=true;
  }


Page.findOne({name:req.body.page}).exec(function(err,pages){
  if(!err&&pages!=null){

  var pageId=pages._id;
    console.log(pageId);

    User.findOne({name:req.body.user}).exec(function(err,users){

      if(!err&&users!=null){
      var  userId=users._id;
        console.log(userId);

        var account=new Account({
          username:req.body.username,
          password:req.body.password,
          isChanged:ischangeda,
          ownerUser:userId,
          ownerPage:pageId
        });
        account.save().then(function(us){
      //res.send("Se guardo correctamente");
      res.redirect("/account");
        },
      function(err){
        res.send("No se pudo guardar");

      });

    }else{
      res.send("us no valido");
    }

    });

  }else{
    res.send("pag no valida");
  }

});




//  res.redirect("/Add/addAccount");

});

//-------------------Edit---------------------

app.post("/edit/editAccount/:id",function(req,res){

  var ischangeda=false;

  if(String(req.body.ischanged)=="on"){
  ischangeda=true;
  }


Page.findOne({name:req.body.page}).exec(function(err,pages){
  if(!err&&pages!=null){

  var pageId=pages._id;
    console.log(pageId);

    User.findOne({name:req.body.user}).exec(function(err,users){

      if(!err&&users!=null){
      var  userId=users._id;
        console.log(userId);

        var data={
          username:req.body.username,
          password:req.body.password,
          isChanged:ischangeda,
          ownerUser:userId,
          ownerPage:pageId
        };

        Account.update({_id:req.params.id},data,function(err){
          if(!err){
            res.redirect("/account");
          }else{
            console.log(err);
          }


        });

      }

    else{
      res.send("us no valido");
    }

    });

  }else{
    res.send("pag no valida");
  }

});

});

app.post("/edit/editPage/:id",function(req,res){

  var ishttpa=false;

  if(String(req.body.ishttp)=="on"){
  ishttpa=true;
  }

  var data={
  name:req.body.name,
  url:req.body.url,
  ishttp:ishttpa,
  protocol:req.body.protocol
  }

    Page.update({_id:req.params.id},data,function(err){

      if(!err){
        res.redirect("/page");
      }else{
        console.log(err);
      }

    });
});


app.post("/edit/editUser/:id",function(req,res){

  var data ={
    name:req.body.name,
    lastname:req.body.lastname,
    address:req.body.address,
    identification:req.body.identification
  };

    User.update({_id:req.params.id},data,function(err){
            if(!err){
              res.redirect("/user");
            }else{
              console.log(err);
            }

    });







});




app.listen(8080);//puerto de escucha
