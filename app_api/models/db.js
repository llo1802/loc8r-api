require('./locations')
const mongoose = require('mongoose');
var gracefulShutdown;

//const dbURI = 'mongodb://localhost/Loc8r';
const dbURI = 'mongodb+srv://myatlasdbuser:tnekf1802@cluster0.pbkwsdd.mongodb.net/Loc8r';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected',function(){
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error',function(err){
    console.log('Mongoose connected err ' + dbURI);
});

mongoose.connection.on('disconnected',function(){
    console.log('Mongoose disconnected to ' + dbURI);
});

var gracefulShutdown = function (msg, callback){
    mongoose.connection.close(function(){
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
}

process.once('SIGUSR2', function(){
    gracefulShutdown('nodemon restart',function(){
        process.kill(process.pid,'SIGUSR2');
    });
});

process.on('SIGINT', function(){
    gracefulShutdown('app termination shutdown',function(){
        process.exit(0);
    });
});

process.on('SIGTERM', function(){
    gracefulShutdown('Heroku app shutdown',function(){
        process.exit(0);
    });
});