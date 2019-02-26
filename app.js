// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')


// Initialize variables
var app = express();


// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// Import routes
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');

// DB Conection
mongoose.connection.openUri('mongodb://admin:admin123@ds149875.mlab.com:49875/hospitaldb', (err, res) => {
    if ( err ) throw err;
    console.log(`MongoDB: \x1b[32m%s\x1b[0m`, 'online')
});

// Routes
app.use('/users', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Listen
var port = 3000;
app.listen( port, () => console.log(`Express server on port ${port}: \x1b[32m%s\x1b[0m`, 'online'));