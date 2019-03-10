var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medic = require('../models/medic');
var User = require('../models/user');


// ============================================
// Search all
// ============================================
app.get('/all/:term', (req, res, next) => {

    var search = req.params.term;

    var regex = new RegExp( search, 'i');

    Promise.all( [
        searchHospitals(regex),
        searchMedics(regex),
        searchUsers(regex),
    ]).then( ([hospitals, medics, users]) => {
        res.status(200).json({
            ok: true,
            hospitals,
            medics,
            users
        })  
    })


});


// ============================================
// Search by collection
// ============================================
app.get('/:collection/:search', (req, res) => {

    var search = req.params.search;
    var collection  = req.params.collection;

    var regex = new RegExp( search, 'i');

    var promise;

    switch ( collection ) {
        case 'users':
            promise = searchUsers(regex)
        break;

        case 'medics':
            promise = searchMedics(regex)
        break;

        case 'hospitals':
            promise = searchHospitals(regex)
        break;

        default:
            return res.status(400).json({
                ok: false,
                message: 'Valid collections names are: users, medics and hospitals',
                error: { message: 'Valid collections names are: users, medics and hospitals' },
            })  
    }

    promise.then( data => {
        res.status(200).json({
            ok: true,
            [collection]: data
        }) 
    })

});

function searchHospitals( regex ) {
    
    return new Promise( (resolve, reject ) => {

        Hospital.find({ name: regex })
            .populate('user', 'name email')
            .exec((err, hospitals) => {

                if ( err ) {
                    reject('Error loading hospitals', err)
                } else {
                    resolve(hospitals)
                }
        });
    })
}

function searchMedics( regex ) {
    
    return new Promise( (resolve, reject ) => {

        Medic.find({ name: regex })
        .populate('user', 'name email')
        .populate('hospital')
        .exec((err, medics) => {

            if ( err ) {
                reject('Error loading medics', err)
            } else {
                resolve(medics)
            }

        });
    })
}

function searchUsers( regex ) {
    
    return new Promise( (resolve, reject ) => {

        User.find({}, 'name email role')
            .or([ { nombre: regex }, { email: regex } ])
            .exec((err, users) => {

                if ( err ) {
                    reject('Error loading users', err)
                } else {
                    resolve(users)
                }
        });
    })
}

module.exports = app;