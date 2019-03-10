var express = require('express');

var mdAuth = require('../middlewares/authentication');

var app = express();

var Medic = require('../models/medic');

// ============================================
// Get all medics
// ============================================
app.get('/', (req, res, next) => {

    var offset = req.query.offset || 0;

    offset = Number(offset);

    Medic.find({})
        .skip(offset)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec( (err, medics) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading medics',
                    errors: err,
                })
            }


            Medic.count({}, (err, count) => {
                
                res.status(200).json({
                    ok: true,
                    medics,
                    count,
                });
            })

            
        });
});


// ============================================
// Update medics
// ============================================
app.put('/:id', mdAuth.verifyToken, ( req, res ) => {

    var id = req.params.id;
    var body = req.body;

    Medic.findById( id, (err, medic) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error finding medic',
                errors: err,
            })
        }

        if( !medic ) {
            return res.status(400).json({
                ok: false,
                message: `The medic with id ${id} does not exist`,
                errors: { message: `The medic with id ${id} does not exist` },
            })
        }

        medic.name = body.name;
        medic.user = req.user._id;
        medic.hospital = body.hospital;

        medic.save( (err, savedMedic ) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error updating medic',
                    errors: err,
                })
            }

            res.status(200).json({
                ok: true,
                medic: savedMedic
            });
        })
    })
});


// ============================================
// Create new hospital
// ============================================
app.post('/', mdAuth.verifyToken, ( req, res ) => {

    var body = req.body;

    var medic = new Medic({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital,
    });

    medic.save( ( err, newMedic ) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error creating medic',
                errors: err,
            })
        }

        res.status(201).json({
            ok: true,
            medic: newMedic,
        });
    });
});


// ============================================
// Delete user by medic
// ============================================
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    
    var id = req.params.id;
    
    Medic.findByIdAndRemove(id, ( err, deletedMedic ) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting medic',
                errors: err,
            })
        }

        if ( !deletedMedic ) {
            return res.status(400).json({
                ok: false,
                message: `The medic with id ${id} does not exist`,
                errors: { message: `The medic with id ${id} does not exist` },
            })
        }

        res.status(200).json({
            ok: true,
            medic: deletedMedic
        });
    });

})


module.exports = app;