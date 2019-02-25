// Requires
var express = require('express');
var mongoose = require('mongoose');


// Initialize variables
var app = express();


// DB Conection
mongoose.connection.openUri('mongodb://admin:admin123@ds149875.mlab.com:49875/hospitaldb', (err, res) => {
    if ( err ) throw err;
    console.log(`MongoDB: \x1b[32m%s\x1b[0m`, 'online')
});

// Routes
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        message: 'Request executed correctly'
    })

});


// Listen
var port = 3000;
app.listen( port, () => console.log(`Express server on port ${port}: \x1b[32m%s\x1b[0m`, 'online'));