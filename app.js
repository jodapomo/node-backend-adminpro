// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')


// Initialize variables
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
    next();
});


// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// Import routes
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicRoutes = require('./routes/medic');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/images');

// DB Conection
mongoose.connection.openUri('mongodb://admin:admin123@ds149875.mlab.com:49875/hospitaldb', (err, res) => {
    if ( err ) throw err;
    console.log(`MongoDB: \x1b[32m%s\x1b[0m`, 'online')
});

// Serve index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Routes
app.use('/users', userRoutes);
app.use('/hospitals', hospitalRoutes);
app.use('/medics', medicRoutes);
app.use('/login', loginRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagesRoutes);

app.use('/', appRoutes);


// Listen
var port = 3000;
app.listen( port, () => console.log(`Express server on port ${port}: \x1b[32m%s\x1b[0m`, 'online'));