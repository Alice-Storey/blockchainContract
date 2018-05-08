var my_private_key;
//---------------------------------------------signup page call------------------------------------------------------
exports.signup = function(req, res) {
  message = '';
  if (req.method == "POST") {
    var post = req.body;
    var name = post.user_name;
    var pass = post.password;
    var fname = post.first_name;
    var lname = post.last_name;
    var email = post.email;


    var find_username = "SELECT id, first_name, last_name, user_name FROM `blockchaincontract`.`users` WHERE `user_name`='" + name + "'";
    var query_username = db.query(find_username, function(err, result) {
      if (result.length == 0) { //if no users with user_name

        var find_email = "SELECT id, first_name, last_name, user_name FROM `blockchaincontract`.`users` WHERE `email`='" + email + "'";
        var query_email = db.query(find_email, function(err, result2) {
          if (result2.length == 0) { //if no users with email
            message = "Account created.";

            //var public_key = post.public_key;
            var sql = "INSERT INTO `blockchaincontract`.`users` (`first_name`,`last_name`,`email`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + email + "','" + name + "','" + pass + "')";

            var query = db.query(sql, function(err, result3) {
              message = "Your account has been created.";
              console.log('Query : ', sql);
              res.render('signup.ejs', {
                message: message
              });
            });

          } else {
            message = "Account already exists with that email.";
            console.log('Query : ', find_email);
            res.render('signup.ejs', {
              message: message
            });
          }
        });
      } else {
        console.log("result" + result);
        message = "Account already exists with that username.";
        console.log('Query : ', find_username);
        res.render('signup.ejs', {
          message: message
        });
      }


    });

  } else {
    res.render('signup', {
      message: ""
    });
  }
};

//-----------------------------------------------login page call------------------------------------------------------
exports.login = function(req, res) {
  var message = '';
  var sess = req.session;

  if (req.method == "POST") {
    var post = req.body;
    var name = post.user_name;
    console.log(name);
    var pass = post.password;
    var sql = "SELECT id, first_name, last_name, user_name FROM `blockchaincontract`.`users` WHERE `user_name`='" + name + "' and password = '" + pass + "'";

    db.query(sql, function(err, results) {
      if (results.length) {
        message = "";
        req.session.userId = results[0].id;
        req.session.user = results[0];
        console.log(results[0].id);
        res.render('dashboard.ejs', {
          message: message
        });
      } else {
        console.log('Query : ', sql);
        message = 'Wrong Credentials.';
        res.render('index.ejs', {
          message: message
        });
      }

    });
  } else {
    res.render('index.ejs', {
      message: message
    });
  }

};
//-----------------------------------------------dashboard page functionality----------------------------------------------

exports.dashboard = function(req, res, next) {
  var user = req.session.user,
    userId = req.session.userId;
  console.log('userId=' + userId);

  if (userId == null) {
    res.redirect("/login");
    return;
  }

  var sql = "SELECT * FROM `blockchaincontract`.`users` WHERE `id`='" + userId + "'";

  db.query(sql, function(err, results) {
    res.render('dashboard.ejs', {
      user: user
    });
  });
};

//-----------------------------------------------received page functionality----------------------------------------------

exports.received = function(req, res, next) {
  var user = req.session.user,
    userId = req.session.userId;
  console.log('userId=' + userId);

  if (userId == null) {
    res.redirect("/login");
    return;
  }

  var sql = "SELECT * FROM `blockchaincontract`.`users` WHERE `id`='" + userId + "'";

  db.query(sql, function(err, results) {
    res.render('received.ejs', {
      user: user,
      private_key: my_private_key
    });
  });

};

exports.load_contracts = function(req, res, next) {
  var user = req.session.user,
    userId = req.session.userId;
  console.log('userId=' + userId);

  var request = require("request");
  var url = "http://localhost:9090/GetBlockChain"; //api for blockchain
  console.log("loading contracts");
  request({
    url: url,
    json: true
  }, function(error, response, body) {
    console.log("fetching");
    if (!error && response.statusCode === 200) { //statuscode 200 is good!
      console.log("200");
      console.log(body); // Print the json response - will be entire chain
      console.log(user.user_name);


      res.send(body.filter(function(block) { //send filtered list
        return block.username == user.user_name; //test used for filter
      }));
    }
  })


}

exports.num_contracts = function(req, res, next) {
  var user = req.session.user,
    userId = req.session.userId;
  console.log('userId=' + userId);

  var request = require("request");
  var url = "http://localhost:9090/GetBlockChain"; //api for blockchain
  console.log("loading contracts");
  request({
    url: url,
    json: true
  }, function(error, response, body) {
    console.log("fetching");
    if (!error && response.statusCode === 200) { //statuscode 200 is good!
      /*console.log("200");
      console.log(body); // Print the json response - will be entire chain
      console.log(user.user_name);
      */
      users_blocks = body.filter(function(block) { //send filtered list
        return block.username == user.user_name; //test used for filter
      });
      console.log("length: " + users_blocks.length);
      res.send([users_blocks.length]);
    }
  })
}



exports.sign_contract = function(req, res, next) {
  var user = req.session.user,
    userId = req.session.userId;
  console.log('userId=' + userId);

  var sign_index = req.body.index; //index on chain to be signed
  var private_key = req.body.private_key;
  //var private_key = String(req.body.private_key); //alternate

  console.log("signing block " + sign_index + " with private key " + String(private_key));
  var success = true;
  var statusCode = "150";

  //do thing here to sign

  if (success) {} else {
    statuscode = 350;
  }

  res.send(statusCode);
}

//-----------------------------------------------send page functionality----------------------------------------------

exports.send = function(req, res, next) {
  var user = req.session.user,
    userId = req.session.userId;
  console.log('userId=' + userId);



  if (req.method == "POST") {
    //var multer = require('multer'); // v1.0.5
    //var upload = multer(); // for parsing multipart/form-data
    var post = req.body;
    var recipient = post.recipients;
    var file = req.files[0].buffer;
    var filesize = req.files[0].size;

    console.log("file size: " + filesize);
    console.log(String(file));
    console.log("sending to uid " + recipient);
    console.log(req);
    var sql = "SELECT * FROM `blockchaincontract`.`users` WHERE `id`='" + recipient + "' order by last_name asc limit 1";

    var public_key = 0;
    db.query(sql, function(err, results) {
      if (err) {
        console.log(err);
      } else {
        var public_key = results[0].public_key;
        name = results[0].last_name + ', ' + results[0].first_name;
        console.log(name + ': ' + public_key);

        //use file
        //use public_key
        var contract = String(file);

        var encrypted_contract = encrypt_contract(contract, public_key);
        console.log('Contract: ', contract);
        console.log('Public Key: ', public_key);
        console.log('Encrypted Contract: ', encrypted_contract);

      }
    });

    var message = "";
    if (filesize < 512) {





      message = "Successfully sent.";
    } else {
      message = "File too large";
      console.log("File too large.");
    }
    res.render('send.ejs', {
      message: message
    });
  } else {
    if (userId == null) {
      res.redirect("/login");
      return;
    }

    res.render('send.ejs', {
      user: user
    });
  }
};

exports.load_recipients = function(req, res, next) {
  var user = req.session.user,
    userId = req.session.userId;
  console.log('userId=' + userId);


  var sql = "SELECT * FROM `blockchaincontract`.`users` WHERE `id`<>'" + userId + "' order by last_name asc";

  db.query(sql, function(err, results) {
    res.send(results);
  });
};

//------------------------------------logout functionality----------------------------------------------
exports.logout = function(req, res) {
  req.session.destroy(function(err) {
    res.redirect("/login");
  })
};

//--------------------------------render user details after login--------------------------------
exports.profile = function(req, res) {
  var userId = req.session.userId;
  if (userId == null) {
    res.redirect("/login");
    return;
  }
  var message = "";
  if (req.method == "POST") {
    console.log('myusername : ' + req.body.user_name);
    var post = req.body;
    var user_name = post.user_name;
    var password = post.password;
    var first_name = post.first_name;
    var last_name = post.last_name;
    var email = post.email;
    var sql2 = "UPDATE users SET" +
      " password = '" + password + "'" +
      ", first_name = '" + first_name + "'" +
      ", last_name = '" + last_name + "'" +
      " WHERE id = " + userId;
    if (password && first_name && last_name) {
      db.query(sql2, function(err, result) {
        console.log(sql2);
        message = "Your account has been updated.";
      });
    } else {
      message = "One or more fields blank.";
      console.log("Error updating profile." + sql2);
    }


  }

  var sql = "SELECT * FROM `blockchaincontract`.`users` WHERE `id`='" + userId + "'";
  db.query(sql, function(err, result) {
    res.render('profile.ejs', {
      data: result,
      message: message
    });
  });
};

//---------------------------------edit users details after login----------------------------------
exports.editprofile = function(req, res) {
  var userId = req.session.userId;
  if (userId == null) {
    res.redirect("/login");
    return;
  }

  var sql = "SELECT * FROM `blockchaincontract`.`users` WHERE `id`='" + userId + "'";
  db.query(sql, function(err, results) {
    res.render('edit_profile.ejs', {
      data: results
    });
  });
};

exports.generate_keys = function(req, res) {
  var userId = req.session.userId;
  if (userId == null) {
    res.redirect("/login");
    return;
  }

  var keypair = require('keypair');

  var pair = keypair();
  var public_key = pair.public;
  var private_key = pair.private;
  console.log("Public Key : ", public_key);
  console.log("Private Key : ", private_key);

  var sql = "UPDATE users SET public_key = '" + public_key + "' WHERE id=" + userId;

  db.query(sql, function(err, results) {
    res.send(private_key);
    // console.log("Private Key : " + err + sql);
  });

}

const crypto = require('crypto')
var constants = require('constants')

var encrypt_contract = function(contract, public_key) {
  var buffer = new Buffer(contract);
  var encrypted_contract = crypto.publicEncrypt({
      "key": public_key,
      padding: constants.RSA_PKCS1_PADDING
    },
    buffer);;
  return encrypted_contract.toString("base64");
};



exports.decrypt_contract = function(req, res) {
  var encrypted_contract = req.body.contents;
  var private_key = req.body.public_key;
  var buffer = new Buffer(encrypted_contract, "base64");
  var decrypted_contract = crypto.privateDecrypt({
    "key": private_key,
    padding: constants.RSA_PKCS1_PADDING
  }, buffer);;
  var decrypted_contract = decrypted_contract.toString("utf8");

  res.send(decrypted_contract);
};



exports.upload_private_key = function(req, res, next){
    var user =  req.session.user,
    userId = req.session.userId;
    console.log('userId='+userId);

    var post = req.body;
    var recipient = post.recipients;
    //console.log(req.files.length + " files found");
    var file = req.files[0].buffer;
    //var file = req.file.buffer;
    var filesize = req.files[0].size;

    console.log("uploaded private key:" + file);
    my_private_key = file;
    console.log("saved: "+my_private_key);
    res.render("received.ejs", {message:"Private key uploaded successfully.",private_key: my_private_key});


}
