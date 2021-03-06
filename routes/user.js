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

    if (name.length<1) {
        res.render('signup', {
            message: "Error: username left blank.",
            first:fname,
            last:lname,
            email:email,
            user:name
        });
        return;
    }
    if (fname.length<1) {
        res.render('signup', {
            message: "Error: first name left blank.",
            first:fname,
            last:lname,
            email:email,
            user:name
        });
        return;
    }
    if (lname.length<1) {
        res.render('signup', {
            message: "Error: last name left blank.",
            first:fname,
            last:lname,
            email:email,
            user:name
        });
        return;
    }
    if (email.length<1) {
        res.render('signup', {
            message: "Error: email left blank.",
            first:fname,
            last:lname,
            email:email,
            user:name
        });
        return;
    }
    if (pass.length<1) {
        res.render('signup', {
            message: "Error: password left blank.",
            first:fname,
            last:lname,
            email:email,
            user:name
        });
        return;
    }



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
                message: message,
                first:fname,
                last:lname,
                email:email,
                user:name
              });
            });

          } else {
            message = "Account already exists with that email.";
            console.log('Query : ', find_email);
            res.render('signup', {
                message: message,
                first:fname,
                last:lname,
                email:email,
                user:name
                });
          }
        });
      } else {
        console.log("result" + result);
        message = "Account already exists with that username.";
        console.log('Query : ', find_username);
        res.render('signup', {
            message: message,
            first:fname,
            last:lname,
            email:email,
            user:name
            });
      }


    });

  } else {
    res.render('signup', {
      message: "",
      first:"",
      last:"",
      email:"",
      user:""
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
        req.session.my_private_key = "";
        console.log(results[0].id);
        res.render('dashboard.ejs', {
          message: ""
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
      message: ""
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
      message:"",
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
      private_key: req.session.my_private_key,
      message:""
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
    request(
        {url: url, json: true},
        function(error, response, body) {
            console.log("fetching");
            if (!error && response.statusCode === 200) { //statuscode 200 is good!
              console.log("200");
              //console.log(body); // Print the json response - will be entire chain
              var sql = "SELECT * FROM `blockchaincontract`.`users` WHERE `id`='" + userId + "'";
              console.log(sql);
              db.query(sql, function(err, sql_result) {
                  var public_key = sql_result[0].public_key;
                  //console.log("getting user - "+sql_result[0].user_name);
                  //console.log("getting user's key - "+sql_result[0].public_key);

                  res.send(body.filter(function(block) { //send filtered list
                     // console.log("block:"+JSON.stringify(block) );
                     // console.log("filtering blocks - block is key:"+block.publicKey);
                     // console.log("filtering blocks - user is key:"+public_key);
                    return block.publicKey == public_key; //test used for filter
                  }));

                });
            }
            else{console.log(error);}
        }
    );
}

exports.num_contracts = function(req, res, next) {
  var user = req.session.user,
    userId = req.session.userId;
  console.log('userId=' + userId);

  var request = require("request");
  var url = "http://localhost:9090/GetBlockChain"; //api for blockchain
  console.log("loading contracts");
  request(
      {url: url, json: true},
      function(error, response, body) {
          console.log("fetching");
          if (!error && response.statusCode === 200) { //statuscode 200 is good!
            console.log("200");
            //console.log(body); // Print the json response - will be entire chain
            var sql = "SELECT * FROM `blockchaincontract`.`users` WHERE `id`='" + userId + "'";
            console.log(sql);
            db.query(sql, function(err, sql_result) {
                var public_key = sql_result[0].public_key;
                //console.log("getting user - "+sql_result[0].user_name);
                //console.log("getting user's key - "+sql_result[0].public_key);

                res.send(body.filter(function(block) { //send filtered list
                    //console.log("block:"+JSON.stringify(block) );
                    //console.log("filtering blocks - block is key:"+block.publicKey);
                    //console.log("filtering blocks - user is key:"+public_key);
                  return (block.publicKey == public_key) ; //test used for filter
              }));

              });
          }
          else{console.log(error);}
      }
  );
}

//-----------------------------------------------send page functionality----------------------------------------------

exports.send = function(req, res, next) {
  var user = req.session.user,
    userId = req.session.userId;

  if (req.method == "POST") {
    //var multer = require('multer'); // v1.0.5
    //var upload = multer(); // for parsing multipart/form-data
    var post = req.body;
    var recipient = post.recipients;

    if (!req.files.length){
        res.render("send.ejs", {message:"Error: No file selected."} );
        return;
    }

    var file = req.files[0].buffer;
    var filesize = req.files[0].size;

    var http = require("http");

    var options = {
      hostname: 'localhost',
      port: 9090,
      path: '/addBlock',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    var my_request = http.request(options, function(result) {
      console.log('Status: ' + result.statusCode);
      console.log('Headers: ' + JSON.stringify(result.headers));
      result.setEncoding('utf8');
      result.on('data', function(body) {
        console.log('Body: ' + body);
      });
    });

    my_request.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    //   console.log("file size: " + filesize);
    //   console.log(String(file));
    //   console.log("sending to uid " + recipient);
    //   console.log(req);
    console.log("recipient is:" + recipient);
    if (recipient == -1){
        res.render("send.ejs", {message:"Error: Recipient was not selected."} );
        return;
    }

    if (filesize > 512000) {
        res.render("send.ejs", {message:"Error: File too large."} );
        return;
    }


    var sql = "SELECT * FROM `blockchaincontract`.`users` WHERE `id`='" + recipient + "' order by last_name asc limit 1";
    //
    //   var public_key = 0;
    db.query(sql, function(err, results) {
      if (err) {
        console.log(err);
        res.render("send.ejs", {
          message: "Error sending contract - could not find user."
        });
      } else {
        //console.log("results is:"+String(results[0]) );
        //var my_public_key = results[0].public_key;
        console.log("publickey:" + results[0].public_key);
        var my_username = results[0].user_name;
        var my_publickey = results[0].public_key;

        // console.log("sending contract username:" + my_publickey);
        // name = results[0].last_name + ', ' + results[0].first_name;
        // console.log(name + ': ' + public_key);

        //use file
        //use public_key
        var contract = String(file);
        var dummyVar = "/";
        var dummyVar2 = "\n";

        var encrypted_contract = encrypt_contract(contract, my_publickey);
        var pub_key = my_publickey;
        var stringifiedKey = JSON.stringify(pub_key);
        var parsedKey = JSON.parse(stringifiedKey);

        // console.log('Public Key: ', my_publickey);
        // console.log('stringified pub_key: ', stringifiedKey);
        // console.log('parsed pub_key: \n', parsedKey);

        //console.log('Encrypted Contract: ', encrypted_contract);
        var jsonData = '{"data" : "'+ encrypted_contract +'", "username" : "' + my_username + '", "publickey" : '+JSON.stringify(pub_key)+'}';
        //console.log('JSON Shit: \n', jsonshit);


        my_request.write(jsonData);
        my_request.end();
        res.render("send.ejs", {
          message: "Contract sent successfully."
        });

      }
    });

    //
    //   var message = "";
    //   if (filesize < 512) {
    //   // send to blockchain
    //       var request = require("request");
    //       var url = "http://localhost:9090/addBlock"; //api for blockchain
    //       console.log("Sending contracts");
    //       request({
    //         url: url,
    //         json: true
    //       }, function(error, response, body) {
    //         console.log("Sending...");
    //         //if (!error && response.statusCode === 200) { //statuscode 200 is good!
    //           console.log("200");
    //           console.log("send - body" + body); // Print the json response - will be entire chain
    //           console.log("send - usr" + user.user_name);
    //         //}
    //
    //       /*
    //       {"data" : "TEST BLOCK 4", "username" : "roven", "publickey" : "mypublickey"}
    //       */
    //       })
    //
    //
    //     message = "Successfully sent.";
    //   } else {
    //     message = "File too large";
    //     console.log("File too large.");
    //   }
    //   res.render('send.ejs', {
    //     message: message
    //   });
    // write data to request body


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
    res.send(results.filter(function(rec){
      return rec.public_key != null && String(rec.public_key).length > 15;
    }));
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

exports.generate_keys = function(req, res) {
  console.log("generating keys");
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
    res.send( {private_key, public_key} );
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
    buffer);
  return encrypted_contract.toString("base64");
};



exports.decrypt_contract = function(req, res) {
  try {
    var encrypted_contract = req.body.contents;
     console.log("decrypting this:" + encrypted_contract);
     //console.log("####SESSION PRIVATE KEY:"+ String(req.session.my_private_key) );
    var buffer = new Buffer(encrypted_contract, "base64");
    var decrypted_contract = crypto.privateDecrypt({
      "key": req.session.my_private_key,
      padding: constants.RSA_PKCS1_PADDING
    }, buffer);
    var decrypted_contract = decrypted_contract.toString("utf8");

    res.send(decrypted_contract);
  }
  catch (error) {
    console.log(error);
    console.log("error encountered, returning contents still encrypted:" + String(req.body.contents) );
    res.send( String(req.body.contents) );
  }
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

    //console.log("uploaded private key:" + file);
    req.session.my_private_key = String(file);
    //console.log("saved: "+req.session.my_private_key);
    res.render("received.ejs", {message:"Private key uploaded successfully.",private_key: req.session.my_private_key});


};

exports.session_has_private_key = function(req, res, next){
    res.send(req.session.my_private_key.length > 1);
};
