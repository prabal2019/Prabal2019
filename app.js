//+++++++++++++++++++++++++++++++++++++++++++++++++++++++
/*
File name: app.js
Objective: This file is written to fetch data from 
xero account using node js. The data are rendered using 
ejs template (home.ejs)
Written by: Prabal Mahanta
Dated 20 November 2019
*/
//++++++++++++++++++++++++++++++++++++++++++++++++++++++

//Get  Express module 
var express = require('express');

// Create a bodyParser object of body parsing middleware.
var parser = require('body-parser');
var path = require('path');

//Calls the express function express() 
var app = express();
app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())
 

let lastRequestToken = null;

const exphbs = require('express-handlebars');

//Get the config
const config = require('./config.json');

//connects to xero rest api 
const XeroClient = require('xero-node').AccountingAPIClient;
let xero = new XeroClient(config);


app.use(function(req,res,next){
    res.locals.userValue = null;
    next();
})
 
// set the view Engine to ejs
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
 
// declare global variable globalString
global.globalString='';

//Nevigate to xero to get the authorisation done
app.get('/',async function(req,res){
lastRequestToken = await xero.oauth1Client.getRequestToken();
let authoriseURL =  xero.oauth1Client.buildAuthoriseUrl(lastRequestToken);
res.redirect(authoriseURL);
})

//Set up a callback
app.get('/callback',async function(req,res) {
let oauth_verifier = req.query.oauth_verifier;
let accessToken = await xero.oauth1Client.swapRequestTokenforAccessToken(lastRequestToken,oauth_verifier);

//get data from xero accounts
//let org = await xero.organisations.get();
//let org = await xero.contacts.get();
let org = await xero.accounts.get();

globalString = org;

res.render('home',{
        topicHead : 'Beanworks Project'
});   

});

app.get('/',function(req,res){
    res.render('home',{
        topicHead : 'Beanworks Project'  
    });
    
});
// post data back for rendering
app.post('/Xerodata',function(req,res){
    var xeroaccount = {
        id : JSON.stringify(globalString.Id),
        //DateTimeUTC : JSON.stringify(globalString.DateTimeUTC) 
         alldata : globalString
    }
    res.render('home',{
        userValue : xeroaccount,
        topicHead : 'Beanworks Project'
        
    });
     
});

// set the port 3000
app.listen(3000,function(){
    console.log('server running on port 3000');
})