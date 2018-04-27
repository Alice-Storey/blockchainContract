//---------------------------------------------signup page call------------------------------------------------------
exports.signup = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post = req.body;
      var name = post.user_name;
      var pass = post.password;
      var fname = post.first_name;
      var lname = post.last_name;

      //var public_key = post.public_key;
      var email = post.email;
      var sql = "INSERT INTO `blockchaincontract`.`users` (`first_name`,`last_name`,`email`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + email + "','" + name + "','" + pass + "')";
     
      var query = db.query(sql, function(err, result) {
         message = "Succesfully! Your account has been created.";
         console.log('Query : ', sql);
         res.render('signup.ejs',{message: message});
      });
   } else {
      res.render('signup');
   }
};

//-----------------------------------------------login page call------------------------------------------------------
exports.login = function(req, res){
   var message = '';
   var sess = req.session;

   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      console.log(name);
      var pass= post.password;
      var sql="SELECT id, first_name, last_name, user_name FROM `blockchaincontract`.`users` WHERE `user_name`='"+name+"' and password = '"+pass+"'";

      db.query(sql, function(err, results){
         if(results.length){
            req.session.userId = results[0].id;
            req.session.user = results[0];
            console.log(results[0].id);
            res.redirect('/home/dashboard');
         }
         else{
            console.log('Query : ', sql);
            message = 'Wrong Credentials.';
            res.render('index.ejs',{message: message});
         }

      });
   } else {
      res.render('index.ejs',{message: message});
   }

};
//-----------------------------------------------dashboard page functionality----------------------------------------------

exports.dashboard = function(req, res, next){
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('userId='+userId);

   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `blockchaincontract`.`users` WHERE `id`='"+userId+"'";

   db.query(sql, function(err, results){
      res.render('dashboard.ejs', {user:user});
   });
};

//-----------------------------------------------received page functionality----------------------------------------------

exports.received = function(req, res, next){
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('userId='+userId);

   if(userId == null){
      res.redirect("/login");
      return;
   }

   //var sql="SELECT * FROM `blockchaincontract`.`users` WHERE `id`='"+userId+"'";

    db.query(sql, function(err, results){
      res.render('received.ejs', {user:user});
   });

};

exports.load_contracts = function(req, res, next) {
    var user =  req.session.user,
    userId = req.session.userId;
    console.log('userId='+userId);
}

exports.sign_contract = function(req, res, next) {
    var user =  req.session.user,
    userId = req.session.userId;
    console.log('userId='+userId);
}

//-----------------------------------------------send page functionality----------------------------------------------

exports.send = function(req, res, next){
    var user =  req.session.user,
    userId = req.session.userId;
    console.log('userId='+userId);



    if(req.method == "POST"){
        //var multer = require('multer'); // v1.0.5
        //var upload = multer(); // for parsing multipart/form-data
        var post = req.body;
        var recipient = post.recipients;
        var file = req.files[0].buffer;
        var filesize = req.files[0].size;

        console.log("file size: " + filesize);
        console.log(String(file));
        console.log("sending to uid "+recipient);
        //console.log(req);
        var sql="SELECT * FROM `blockchaincontract`.`users` WHERE `id`='"+recipient+"' order by last_name asc limit 1";

        var public_key = 0;
        db.query(sql, function(err, results){
            public_key = results[0].public_key;
            name = results[0].last_name + ', ' + results[0].first_name;
            console.log(name + ': ' + public_key);
        });

        var message = "";
        if (filesize<512) {
            // do something with the file contents
            message = "Successfully sent.";
        }
        else {
            message = "File too large";
            console.log("File too large.");
        }
        res.render('send.ejs',{message: message});
   }
   else {
        if(userId == null){
           res.redirect("/login");
           return;
        }

        res.render('send.ejs', {user:user});
    }
};

exports.load_recipients = function(req, res, next){
    var user =  req.session.user,
    userId = req.session.userId;
    console.log('userId='+userId);


    var sql="SELECT * FROM `blockchaincontract`.`users` WHERE `id`<>'"+userId+"' order by last_name asc";

    db.query(sql, function(err, results){
        res.send(results);
    });
};

//------------------------------------logout functionality----------------------------------------------
exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/login");
   })
};

//--------------------------------render user details after login--------------------------------
exports.profile = function(req, res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `blockchaincontract`.`users` WHERE `id`='"+userId+"'";
   db.query(sql, function(err, result){
      res.render('profile.ejs',{data:result});
   });
};

//---------------------------------edit users details after login----------------------------------
exports.editprofile=function(req,res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `blockchaincontract`.`users` WHERE `id`='"+userId+"'";
   db.query(sql, function(err, results){
      res.render('edit_profile.ejs',{data:results});
   });
};

exports.generate_keys=function(req,res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }
}
