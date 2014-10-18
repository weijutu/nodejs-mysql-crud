var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var mysql = require('mysql');
var app = express();

var pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : '1743775',
    database : 'demo_nodejs'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
app.get('/', function(req, res){
    pool.getConnection(function(err, connection){
        connection.query('select * from users', function(err, rows, fields){
            if (err)
                throw err;
            res.render('user', { title: '使用者列表', user: rows });
        });
        connection.release();
    });
});
app.get('/create', function(req, res){
    res.render('create', {
        title: '建立新的使用者'
    });
});
app.post('/create', function(req, res){
    pool.getConnection(function(err, connection){
        connection.query('insert into users set ?', {
            id: req.body.user.id,
            name: req.body.user.name,
            description: req.body.user.description
        }, function(err, fields){
            if (err)
                throw err;
        });

        connection.query('select * from users', function(err, rows, field){
            if (err)
                throw err;
            res.render('user', {
                title: '使用者列表',
                user: rows
            });
        });
        connection.release();
    });
});

app.post('/update', function(req, res) {
    pool.getConnection(function(err, connection) {
        connection.query('update users set ? where id = ?', [{
            id : req.body.user.id,
            name : req.body.user.name,
            description : req.body.user.description
        },req.body.user.id], function(err, fields) {
            if (err)
                throw err;
        });
        connection.query('SELECT * from users', function(err, rows, fields) {
            if (err)
                throw err;
            res.render('user', {
                title : '使用者列表',
                user : rows
            });
        });
        connection.release();
    });
});

app.get('/update/:id', function(req, res) {
    pool.getConnection(function(err, connection) {
        connection.query('SELECT * from users where id=?',[req.params.id],function(err, rows, fields) {
            if (err)
                throw err;
            console.log('search is success.');
            res.render('create', {
                title : 'Update user',
                user : rows[0]
            });
        });
        connection.release();
    });
});




app.get('/delete/:id', function(req, res) {
    pool.getConnection(function(err, connection) {
        connection.query('delete from users  where id = ?', [req.params.id], function(err, fields) {
            if (err)
                throw err;
        });
        connection.query('SELECT * from users', function(err, rows, fields) {
            if (err)
                throw err;
            res.render('user', {
                title : '使用者列表',
                user : rows
            });
        });
        connection.release();
    });
});

app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var mysql = require('mysql');
 



module.exports = app;
