var express=require("express");
var bodyParser=require("body-parser");
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const mongoose = require('mongoose');
const Schema=mongoose.Schema
mongoose.connect('mongodb://localhost:27017/test', {
useUnifiedTopology: true,
useNewUrlParser: true,
});
var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
    console.log("connection succeeded");
})

var app=express()

const loginschema=new Schema({
  name:String,
  password:String,
  email:String,
  phone:String,
});
const imageschema=new Schema({
  contentType: String,
  path: String,
  image: Buffer,
});

app.use(bodyParser.json());
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

const log4=mongoose.model('log4',imageschema);
const log3=mongoose.model('log3',loginschema);

var storage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'upload/')
  },
  filename:function(req,file,cb){
    cb(null,file.fieldname +'-'+ Date.now()+path.extname(file.originalname))
  }
})
var upload=multer({
  storage:storage
})


app.post('/sign_up',upload.single('filename'), function(req,res){
  var img=fs.readFileSync(req.file.path);
  var encode_image=img.toString('base64');

  var finalImg={
    contentType:req.file.mimetype,
    path:req.file.path,
    image:new Buffer(encode_image,'base64'),
  };
    var name = req.body.name;
    var email =req.body.email;
    var pass = req.body.password;
    var phone =req.body.phone;

    var data = {
        "name": name,
        "password":pass,
        "email":email,
        "phone":phone,
    }
    var text=log3(data).save(function(err,data){
      if(err) throw err;
    });

    var img=log4(finalImg).save(function(err,data){
      if(err) throw err;
    });
        console.log("Record inserted Successfully");

    return res.redirect('signup_success.html');
})


app.get('/',function(req,res){
res.set({
    'Access-control-Allow-Origin': '*'
    });
return res.redirect('index.html');
}).listen(3000)


console.log("server listening at port 3000");
