var express = require('express');

var fileUpload = require('express-fileupload');

var fs = require('fs');

var app = express();

var User = require('../models/user');
var Medic = require('../models/medic');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


app.put('/:collection/:id', (req, res, next) => {

    var collection = req.params.collection;
    var id = req.params.id;

    // Valid collecions
    var validCollections = ['hospitals', 'users', 'medics'];

    if( validCollections.indexOf( collection ) < 0 ) {
        return res.status(400).json({
            ok: false,
            message: 'Not valid extcollectionension',
            errors: {
                message: 'Valid collection are ' + validCollections.join(', ')
            },
        })
    }

    if( !req.files ) {
        return res.status(400).json({
            ok: false,
            message: 'No image selected',
            errors: {
                message: 'You must select an image'
            },
        })
    }

    // Get file name
    var file = req.files.img;
    var cutedName = file.name.split('.');
    var fileExt  = cutedName[cutedName.length - 1];

    // Valid extensions
    var validExt = ['png', 'jpg', 'gif', 'jpeg'];

    if ( validExt.indexOf(fileExt) < 0 ) {
        return res.status(400).json({
            ok: false,
            message: 'Not valid extension',
            errors: {
                message: 'Valid extensions are ' + validExt.join(', ')
            },
        })
    }

    // New file name
    var fileName = `${ id }-${ new Date().getMilliseconds() }.${ fileExt }`;

    // Move file to path
    var path = `./uploads/${ collection }/${fileName}`;

    file.mv( path, err => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error moving file',
                errors: err
            })
        }

        uploadByCollection( collection, id, fileName, res )
    })

});


function uploadByCollection( collection, id, fileName, res ) {

    if( collection == 'users' ) {
      User.findById( id, (err, user) => {

        if ( !user ) {
            return res.status(400).json({
                ok: false,
                message: 'User does not exist',
                errors: {
                    message: 'User does not exist'
                }
            })
        }

        var oldPath = './uploads/users/' + user.img;

        // If file existe => delete
        if( fs.existsSync(oldPath) ) {
            fs.unlinkSync( oldPath )
        }

        user.img = fileName;

        user.save( (err, updatedUser) => {

            updatedUser.password = ':)'

            return res.status(200).json({
                ok: true,
                message: 'User image updated',
                updatedUser
            })

        })

      }); 
    }

    if( collection == 'medics' ) {
        Medic.findById( id, (err, medic) => {

            if ( !medic ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Medic does not exist',
                    errors: {
                        message: 'Medic does not exist'
                    }
                })
            }

            var oldPath = './uploads/medics/' + medic.img;
    
            // If file existe => delete
            if( fs.existsSync(oldPath) ) {
                fs.unlinkSync( oldPath )
            }
    
            medic.img = fileName;
    
            medic.save( (err, updatedMedic) => {
    
                return res.status(200).json({
                    ok: true,
                    message: 'Medic image updated',
                    updatedMedic
                })
            })
        }); 
    }

    if( collection == 'hospitals' ) {
        Hospital.findById( id, (err, hospital) => {

            if ( !hospital ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Hospital does not exist',
                    errors: {
                        message: 'Hospital does not exist'
                    }
                })
            }

            var oldPath = './uploads/hospitals/' + hospital.img;
    
            // If file existe => delete
            if( fs.existsSync(oldPath) ) {
                fs.unlinkSync( oldPath )
            }
    
            hospital.img = fileName;
    
            hospital.save( (err, updatedHospital) => {
    
                return res.status(200).json({
                    ok: true,
                    message: 'Hospital image updated',
                    updatedHospital
                })
            })
        }); 
    }

}

module.exports = app;