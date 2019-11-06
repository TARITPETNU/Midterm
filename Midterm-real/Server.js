var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var Mongo = require('mongodb');
var MongoClient = Mongo.MongoClient;
var url = "mongodb://localhost:27017";
var options = { useUnifiedTopology: true, useNewUrlParser: true };

app.set('view engine', 'ejs');


app.get('/', function (req, res) {
    res.render('pages/Home');
});

app.get('/Products', function (req, res) {
    MongoClient.connect(url, options, function (err, db) {
        if (err) throw err;
        var dbo = db.db("CoC");
        var query = {};
        var sort = { 
            subject_name: 1 
          };
        dbo.collection("subject").find(query).sort(sort).toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            res.render('pages/Products', { Data: result });
            db.close();
        });
    });
});

app.get('/Products/Detail/:subject_id', function (req, res) {
    var sid = req.params.subject_id;
    MongoClient.connect(url, options, function (err, db) {
        if (err) throw err;
        var dbo = db.db("CoC");
        console.log(sid);
        var query = { subject_id: sid };

        dbo.collection("subject").findOne(query, function (err, result) {
            if (err) throw err;
            console.log(result);
            res.render('pages/Detail', { subject: result });
            db.close();
        });
    });
});


app.get('/Products/Edit/:subject_id', function (req, res) {   
    MongoClient.connect(url, options, function (err, db) {
        var sid = req.params.subject_id;
        if (err) throw err;
        var dbo = db.db("CoC");
        console.log(sid);
        var query = {subject_id : sid};
        var sort = { 
            subject_name: 1 
          };
        dbo.collection("subject").findOne(query, function (err, result) {
            if (err) throw err;
            res.render('pages/Edit', { subject: result });
            db.close();
        });
    });
});

app.post("/ProductSave", function (req, res) {
    var newSubjectID = req.body.subject_id;
    var newSubjectName = req.body.subject_name;
    var newRoom = req.body.room;
    var newSchedule = req.body.schedule;
    
    MongoClient.connect(url, options, function (err, db) {
        if (err) throw err;
        var dbo = db.db("CoC");
        var query = { subject_id: newSubjectID }
        var newvalues = { $set: { subject_id: newSubjectID, subject_name: newSubjectName, room: newRoom, schedule: newSchedule } };
        dbo.collection("subject").updateOne(query, newvalues, function (err, result) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
            res.redirect("/Products");
        });
    });
});

app.get('/Products/Add', function (req, res) {
    res.render('pages/Add');
});
app.post("/ProductAdd", function (req, res) {
    var newSubjectID = req.body.subject_id;
    var newSubjectName = req.body.subject_name;
    var newRoom = req.body.room;
    var newSchedule = req.body.schedule;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("CoC");
        var myobj = { subject_id: newSubjectID, subject_name: newSubjectName, room: newRoom, schedule: newSchedule };
        dbo.collection("subject").insertOne(myobj, function(err, result) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
          res.redirect("/Products");
        });
      });
});

app.get('/Products/Delete/:subject_id', function(req,res){
    var sid = req.params.subject_id;
    MongoClient.connect(url, function(err, db) 
    {
        if (err) throw err;
        var dbo = db.db("CoC");
        var query = { subject_id: sid };
        dbo.collection("subject").deleteOne(query, function(err, obj)
        {
          if (err) throw err;
          console.log("1 document deleted");
          db.close();
          res.redirect("/Products");
        });
      });
});

app.listen(8080);

