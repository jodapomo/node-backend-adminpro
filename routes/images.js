var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:collection/:img', (req, res, next) => {

    var collection = req.params.collection;
    var img = req.params.img;

    var imgPath = path.resolve( __dirname, `../uploads/${ collection }/${ img }` );

    if ( fs.existsSync( imgPath ) ) {
        res.sendFile( imgPath );
    } else {
        var pathNoImg = path.resolve( __dirname, '../assets/no-img.jpg')
        res.sendFile(pathNoImg)
    }

});

module.exports = app;