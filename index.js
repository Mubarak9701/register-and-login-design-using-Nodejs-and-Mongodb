'use strict';
var express = require('express');
var fs=require('fs');
var path = require('path');
var cookieparser=require('cookie-parser');
var app=express();
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var pincode=require('pincode');
app.set('view engine','ejs');
app.use(express.urlencoded({extended:false}));
app.use(cookieparser());
const mongoose=require('mongoose');
var mydb='mongodb://localhost/tiffian';
var uri='mongodb+srv://Mubarak:Mubarak@9701@cluster0.oxfya.mongodb.net/test';
mongoose.set('useFindAndModify', false);
mongoose.connect(mydb,{ useNewUrlParser: true,useUnifiedTopology:true ,useCreateIndex:true });
mongoose.Promise=global.Promise;
global.crypto = require('crypto');
const User=require('./user');
const Vendor=require('./vendor');
var sid="AC1c7f423d48745ed18a5d3957407ba8ad";
var token="af122a3d21cb3a81ec80b3c73017b902";
//var serviceid ="VA89b347ee8bf3cb4bea69d526ddd862e7";
var serviceid ="VA22761fe480b1935060db7147fa5421e7";
var mob="+918639984811";
var client = require('twilio')(sid,token);

function checkAuthenticatedvendor(req,res,next){
	if(req.isAuthenticated()){
		return next()
	}
	res.redirect('/mobile/mobile');
}

function checkAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next()
	}
	res.redirect('/user/mobile')
}

app.get('/',function(req,res){
	res.sendFile(path.join(__dirname+'/mainpage.html'));
})

app.get('/vendor/register',function(req,res){
    res.sendFile(path.join(__dirname+'/register.html'));
})

app.get('/user/register',function(req,res){
    res.sendFile(path.join(__dirname+'registerusers.html'));
})

app.get('/vendor/verifyotp',(req,res)=>{
    res.sendFile(path.join(__dirname+'/otp1.html'));
})

app.get('/vendor/mobile',(req,res)=>{
    res.sendFile(path.join(__dirname+'/mobile1.html'));
})

app.get('/user/verifyotp',(req,res)=>{
    res.sendFile(path.join(__dirname+'/otp.html'));
})

app.get('/user/mobile',(req,res)=>{
    res.sendFile(path.join(__dirname+'/mobile.html'));
})

app.get('/user/login',function(req,res){
    res.sendFile(path.join(__dirname+'/login.html'))
})

app.get('/vendor/login',function(req,res){
    res.sendFile(path.join(__dirname+'/login1.html'))
})

app.get('/user/list',function(req,res){
    let data1=fs.readFileSync('list.json');
    let data=JSON.parse(data1);
    res.render(path.join(__dirname+'/internal.ejs'),{data:data});
})

app.post("/vendor/register",
    [
        check("name", "Please Enter a Valid name").not().isEmpty(),
        check("pincode", "Please enter a valid pincode").isLength({min:6 , max:6}),
        check("mobilenumber", "Please enter a valid mobile number").isLength({min:10 , max:10}),
        check("password", "Please enter a valid password").not().isEmpty()
	],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        console.log(req.body);
        const {mobilenumber}=req.cookies.userdata;
        const {name,pincode,password} = req.body;
		var mobu="+91"+((req.body.mobilenumber).toString());
        try {
            let user = await Vendor.findOne({mobilenumber});
            if (user) {
                return res.status(400).json({message: "User Already Exists"});
            }
            console.log('no user present with this number');
            user = new Vendor({name,mobilenumber,pincode,password});
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            const payload = {user: {id: user.id}};
            jwt.sign(
                payload,"randomString", {expiresIn: 10000},
                (err, token) => {
					if (err) throw err;
                    else
					{   
                        user.save({name,mobilenumber,pincode,password});
                        res.clearCookie('userdata');
                        res.send("registered successfully");
                        res.redirect('/vendor/login');                
                    }});
		} 
		catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
}});

app.post('/vendor/mobile',[check("mobilenumber","please enter a valid mobile number").isLength({min:10,max:10})],(req,res)=>{
    var mobilenumber=req.body.mobilenumber;
    var mobu="+91"+((mobilenumber).toString());
    client.verify
        .services(serviceid)
        .verifications
        .create({
        from : mob,
        to : mobu,
        channel : "sms"
    }).then((messege) =>{
            console.log(messege);
            res.cookie("userdata",mobilenumber);
            res.redirect('/vendor/verifyotp');
        });
})

app.post('/vendor/verifyotp',[check("otp","please enter a valid otp").isLength({min:6,max:6})],(req,res)=>{
    console.log(req.cookies.userdata);
    var mobilenumber=req.cookies.userdata;
    var mo="+91"+((mobilenumber).toString());
    console.log('verifying');
	client.verify.services(serviceid).verificationChecks.create({
    	to : mo,
        code : req.body.otp
	}).then((data) => {
		if(data.status=='approved'){
            console.log("success");
            res.clearCookie('userdata');
            res.cookie("userdata",mobilenumber);
			res.redirect('/vendor/register');
		}});
});

app.post("/user/register",
    [
        check("name", "Please Enter a Valid name").not().isEmpty(),
		check("username", "Please enter a valid username").not().isEmpty(),
        check("pincode", "Please enter a valid pincode").isLength({min:6 , max:6}),
        check("password", "Please enter a valid password").not().isEmpty()
	],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        console.log(req.query.name);
        console.log(req.body);
        const {mobilenumber}=req.cookies.userdata;
        const {name,username,pincode,password} = req.body;
		var mobu="+91"+((req.body.mobilenumber).toString());
        try {
            let user = await User.findOne({mobilenumber});
            if (user) {
                return res.status(400).json({message: "User Already Exists"});
            }
            console.log('no user present with this number');
            user = new User({name,mobilenumber,username,pincode,password});
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            const payload = {user: {id: user.id}};
            console.log('otp sending');
            jwt.sign(
                payload,"randomString", {expiresIn: 10000},
                (err, token) => {
					if (err) throw err;
                    else
					{   
                        user.save({name,mobilenumber,username,pincode,password});
                        res.clearCookie('userdata');
                        res.redirect('/user/list');              
                    }});
		} 
		catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
}});

app.post('/user/mobile',[check("mobilenumber","please enter a valid mobile number").isLength({min:10,max:10})],(req,res)=>{
    var mobilenumber=req.body.mobilenumber;
    var mobu="+91"+((mobilenumber).toString());
    client.verify
        .services(serviceid)
        .verifications
        .create({
        from : mob,
        to : mobu,
        channel : "sms"
    }).then((messege) =>{
            console.log(messege);
            res.cookie("userdata",mobilenumber);
            res.redirect('/user/verifyotp');
        });
})

app.post('/user/verifyotp',[check("otp","please enter a valid otp").isLength({min:6,max:6})],(req,res)=>{
    console.log(req.cookies.userdata);
    var mobilenumber=req.cookies.userdata;
    var mo="+91"+((mobilenumber).toString());
    console.log('verifying');
	client.verify.services(serviceid).verificationChecks.create({
    	to : mo,
        code : req.body.otp
	}).then((data) => {
		if(data.status=='approved'){
            console.log("success");
            res.clearCookie('userdata');
            res.cookie("userdata",mobilenumber);
			res.redirect('/user/register');
		}});
});

app.post('/vendor/login',[
	check("mobilenumber", "Please enter a valid mobilenumber").isLength({min:10 , max:10}),
	check("password", "Please enter a valid password").not().isEmpty()],
	  async (req, res) => {
			const errors = validationResult(req);
  
			if (!errors.isEmpty()) {
		  return res.status(400).json({
				errors: errors.array()});
		  }
  
		const { mobilenumber, password } = req.body;
		try {
		  let user = await Vendor.findOne({mobilenumber});
		  if (!user)
				return res.status(400).json({
			  message: "User Not Exist"
			});
  
		  const isMatch = await bcrypt.compare(password, user.password);
		  if (!isMatch)
				return res.status(400).json({
			  message: "Incorrect Password !"
			});
  
		  const payload = {user: {id: user.id}};
		  jwt.sign(payload,"secret",{expiresIn: 3600},
			(err, token) => {
				if (err) throw err;
				//console.log(token)
				res.cookie("Userdata",req.body.mobilenumber);
				res.send("sucessfull login");
			  });
		} 
		catch (e) {
		  console.error(e);
		  res.status(500).json({message: "Server Error"});
}});
        
app.post('/user/login',[
    check("username", "Please enter a valid username").not().isEmpty(),
    check("password", "Please enter a valid password").not().isEmpty()],
        async (req, res) => {
            const errors = validationResult(req);
    
            if (!errors.isEmpty()) {
            return res.status(1).json({errors: errors.array()});
            }
    
        const { username, password } = req.body;
        try {
            let user = await User.findOne({username});
            if (!user)
                return res.status(400).json({message:'invalid credentials'});
    
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({message:'invalid credentials'});
    
            const payload = {user: {id: user.id}};
            jwt.sign(payload,"secret",{expiresIn: 3600},
            (err, token) => {
                if (err) throw err;
                res.redirect('/user/list')
                });
        } 
        catch (e) {
            console.error(e);
            res.status(500).json({message: "Server Error"});
}});

app.listen(5000,function(){
	console.log("listening on port number  5000")
})