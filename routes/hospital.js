var express = require('express');

var mdAuth = require('../middlewares/authentication');

var app = express();

var Hospital = require('../models/hospital');

// ============================================
// Get all hospitals
// ============================================
app.get('/', (req, res, next) => {

    
    var offset = req.query.offset || 0;

    offset = Number(offset);

    Hospital.find({})
        .skip(offset)
        .limit(5)
        .populate('user', 'name email')
        .exec( (err, hospitals) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading hospitals',
                    errors: err,
                })
            }

            Hospital.count({}, (err, count) => {
                
                res.status(200).json({
                    ok: true,
                    hospitals,
                    count,
                });
                
            })

            
        });
});

// ============================================
// Get Hospital by id
// ============================================ 
app.get('/:id', (req, res, next) => {

    var id = req.params.id;

    Hospital.findById(id)
        .populate('user', 'name email img')
        .exec( (err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error searching hospital',
                    errors: err,
                })
            }

            if ( !hospital ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Hospital with id ' + id + ' does not exist.',
                    errors: {
                        message: 'Hospital does not exist'
                    }
                });
            }
                
            res.status(200).json({
                ok: true,
                hospital
            });
        });
});


// ============================================
// Update hospital
// ============================================
app.put('/:id', mdAuth.verifyToken, ( req, res ) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error finding hospital',
                errors: err,
            })
        }

        if( !hospital ) {
            return res.status(400).json({
                ok: false,
                message: `The hospital with id ${id} does not exist`,
                errors: { message: `The hospital with id ${id} does not exist` },
            })
        }

        hospital.name = body.name;
        hospital.user = req.user._id;

        hospital.save( (err, savedHospital ) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error updating hospital',
                    errors: err,
                })
            }

            res.status(200).json({
                ok: true,
                hospital: savedHospital
            });
        })
    })
});


// ============================================
// Create new hospital
// ============================================
app.post('/', mdAuth.verifyToken, ( req, res ) => {

    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        user: req.user._id,
    });

    hospital.save( ( err, newHospital ) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error creating hospital',
                errors: err,
            })
        }

        res.status(201).json({
            ok: true,
            hospital: newHospital,
        });
    });
});


// ============================================
// Delete user by hospital
// ============================================
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    
    var id = req.params.id;
    
    Hospital.findByIdAndRemove(id, ( err, deletedHospital ) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting hospital',
                errors: err,
            })
        }

        if ( !deletedHospital ) {
            return res.status(400).json({
                ok: false,
                message: `The hospital with id ${id} does not exist`,
                errors: { message: `The hospital with id ${id} does not exist` },
            })
        }

        res.status(200).json({
            ok: true,
            hospital: deletedHospital
        });
    });

})


module.exports = app;