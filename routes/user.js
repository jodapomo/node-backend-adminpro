var express = require('express');
var bcrypt = require('bcryptjs');

var mdAuth = require('../middlewares/authentication');

var app = express();

var User = require('../models/user');

// ============================================
// Get all users
// ============================================
app.get('/', (req, res, next) => {

    var offset = req.query.offset || 0;

    offset = Number(offset);

    User.find({}, 'name email img role google')
        .skip(offset)
        .limit(5)
        .exec( (err, users) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading users',
                    errors: err,
                })
            }

            User.count({}, (err, count) => {
                
                res.status(200).json({
                    ok: true,
                    users,
                    count,
                });
            })

        });
});


// ============================================
// Update user
// ============================================
app.put('/:id', mdAuth.verifyToken, ( req, res ) => {

    var id = req.params.id;
    var body = req.body;

    User.findById( id, (err, user) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error finding user',
                errors: err,
            })
        }

        if( !user ) {
            return res.status(400).json({
                ok: false,
                message: `The user with id ${id} does not exist`,
                errors: { message: `The user with id ${id} does not exist` },
            })
        }

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save( (err, savedUser ) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error updating user',
                    errors: err,
                })
            }

            savedUser.password = ':)';

            res.status(200).json({
                ok: true,
                user: savedUser
            });
        })
    })
});

// ============================================
// Create new user
// ============================================
app.post('/', ( req, res ) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });

    user.save( ( err, newUser ) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error creating user',
                errors: err,
            })
        }

        res.status(201).json({
            ok: true,
            user: newUser,
            tokenuser: req.user
        });
    });
});


// ============================================
// Delete user by id
// ============================================
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    
    var id = req.params.id;
    
    User.findByIdAndRemove(id, ( err, deletedUser ) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting user',
                errors: err,
            })
        }

        if ( !deletedUser ) {
            return res.status(400).json({
                ok: false,
                message: `The user with id ${id} does not exist`,
                errors: { message: `The user with id ${id} does not exist` },
            })
        }

        res.status(200).json({
            ok: true,
            user: deletedUser
        });
    });

})


module.exports = app;