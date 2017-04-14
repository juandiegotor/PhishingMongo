var express= require("express");//llamo a express
var bodyParser=require("body-parser");//parser que sirve con los form y peticiones json
var methodOverride=require("method-override");//para sobrescribir un metodo que sirve para borrar
var expressValidator = require('express-validator');//para las validaciones
var expressSession = require('express-session');//para las validaciones

var app=express();//se inicia express

var User=require("./models/user").User;
var Page=require("./models/page").Page;
var Account=require("./models/account").Account;

//Se le dice que va a usar a app que es el objeto de express
//-----------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//inicio el validator
app.use(expressValidator());
app.use(methodOverride("_method"));
//-----------------------------

app.use("/public",express.static('public'));//usar esta carpeta
app.use(expressSession({secret: 'max', saveUninitialized: false, resave: false}));

//redirecciono a las paginas cuando el link sea alguno de estos
//---------------GET---------------------------------------
app.get("/",function(req,res){
  res.render("index.jade", {succes:false, errors:req.session.errors});
  req.session.errors = null;
});

app.get("/edit/editAccount/:id",function(req,res){
  //encontrar la cuenta actual
  Account.findOne({_id:req.params.id}).populate("ownerUser").populate("ownerPage")
  .exec(function(err,account){
    //encontrar el usuario
    User.findOne({_id:account.ownerUser}).exec(function(err, user) {
      //encontrar la pagina
      Page.findOne({_id:account.ownerPage}).exec(function(err, page) {
        //encontrar el resto de los usuarios
        User.find({_id: {$ne: account.ownerUser}}).exec(function(err, otherUsers) {
          //encontrar el resto de las paginas
          Page.find({_id: {$ne: account.ownerPage}}).exec(function(err, otherPages) {
            //render the page
            res.render(
              "./edit/editAccount.jade",
              {account:account, user:user, page:page, otherUsers:otherUsers, otherPages:otherPages}
            );
          });
        });
      });
    });
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

  //obtengo las paginas creadas
  Page.find(function(err, pags) {
    //obtengo los usuarios creados
    User.find(function(err, uss) {
      //render
      res.render("./add/addAccount.jade",{pages:pags, users:uss});
    });
  });
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

//find Page
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

//find account
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

//find user
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


//-------------------POST-----------------------------
//hago las validaciones de los datos
//formularios
//add user
app.post("/Add/addUser",function(req,res){
  //recibo el formulario userAdd para guardar datos en mongo
  //console.log("Name: "+req.body.name);
  //console.log("LastName: "+req.body.lastname);
  //console.log("Address: "+req.body.address);
  //console.log("Identification : "+req.body.identification);
  //creacion del document

  /***VALIDACION***/
  req.check('name', 'Invalid Name, a name is only made from letters').isAlpha();
  req.check('lastname', 'Invalid Last Name, a last name is only made from letters').isAlpha();
  req.check('identification', 'Invalid Identification, an identification contains only numbers').isNumeric();

  var errors = req.validationErrors();
  if(errors){
    req.session.errors = errors;
    console.log(errors);
    res.redirect('/user');
  } else {
    var user =new User({
      name:req.body.name.toLowerCase(),
      lastname:req.body.lastname.toLowerCase(),
      address:req.body.address,
      identification:req.body.identification
    });

    //la collection se llama como cree el document pero con s al final
    //lo guardo
    //Se guarda con una promise necesita dos funciones como parametro
    user.save()
      .then(
        function(us){
          //res.send("El usuario se guardo exitosamente");
          res.redirect("/user");
        },
        function(err){
          console.log(err);
          //res.send("No se pudo guardar");
          res.redirect("/user");
        }
      );
  }
});

//add page
app.post("/Add/addPage",function(req,res){
  req.check('name', 'Invalid Name, the page name has to be alphanumeric').isAlphanumeric();
  req.check('url', 'Invalid URL, the url is not a qualified domain name').isFQDN();
  req.check('protocol', 'Invalid Protocol, the protocol name has to be alphanumeric').isAlphanumeric();

  var errors = req.validationErrors();
  if(errors){
    req.session.errors = errors;
    console.log(errors);
    res.redirect("/page");
  } else {
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

    page.save()
      .then(
        function(pa){
          //res.send("Pagina guardada exitosamente");
          res.redirect("/page");
        },

        function(err){
          console.log(err);
          //res.send("No se pudo guardar la pagina");
          res.redirect("/page");
        }
      );
  }
});

//search page
app.post("/page/search",function(req,res){
  var busqueda=String(req.body.search);
  if(busqueda!=""){
    console.log(busqueda);
    res.redirect("/page/search/"+busqueda);
  }else{
    res.redirect("/page");
  }
});

//search account
app.post("/account/search",function(req,res){
  var busqueda=String(req.body.search);
  if(busqueda!=""){
    console.log(busqueda);
    res.redirect("/account/search/"+busqueda);
  }else{
    res.redirect("/account");
  }
});

//search user
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

    var account = new Account({
      username:req.body.username,
      password:req.body.password,
      isChanged:ischangeda,
      ownerUser:req.body.user,
      ownerPage:req.body.page
    });

    account.save()
      .then(
        function(us){
          res.redirect("/account");
        },
        function(err){
          console.log(err);
          res.redirect("/account")
        }
      );
});

//-------------------Edit---------------------
app.post("/edit/editAccount/:id",function(req,res){
  var ischangeda=false;
  if(String(req.body.ischanged)=="on"){
    ischangeda=true;
  }

  var data = {
    username:req.body.username,
    password:req.body.password,
    isChanged:ischangeda,
    ownerUser:req.body.user,
    ownerPage:req.body.page
  };

  Account.update({_id:req.params.id},data,function(err){
    if(!err){
      res.redirect("/account");
    }else{
      console.log(err);
    }
  });
});


app.post("/edit/editPage/:id",function(req,res){
  req.check('name', 'Invalid Name, the page name has to be alphanumeric').isAlphanumeric();
  req.check('url', 'Invalid URL, the url is not a qualified domain name').isFQDN();
  req.check('protocol', 'Invalid Protocol, the protocol name has to be alphanumeric').isAlphanumeric();

  var errors = req.validationErrors();
  if(errors){
    req.session.errors = errors;
    console.log(errors);
    res.redirect("/page");
  } else {
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
  }
});


app.post("/edit/editUser/:id",function(req,res){
  req.check('name', 'Invalid Name, a name is only made from letters').isAlpha();
  req.check('lastname', 'Invalid Last Name, a last name is only made from letters').isAlpha();
  req.check('identification', 'Invalid Identification, an identification contains only numbers').isNumeric();

  var errors = req.validationErrors();
  if(errors){
    req.session.errors = errors;
    console.log(errors);
    res.redirect('/user');
  } else {
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
  }
});


app.listen(8000);//puerto de escucha
