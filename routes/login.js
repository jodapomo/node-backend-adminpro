var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var app = express();


var User = require('../models/user');


// ============================================
// Normal auth
// ============================================
app.post('/', ( req, res ) => {

    var body = req.body;

    User.findOne( { email: body.email }, ( err, userDB ) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error finding user',
                errors: err,
            })
        }

        if( !userDB ) {
            return res.status(400).json({
                ok: false,
                message: `Incorrect credentials - email`,
                errors: { message: `Incorrect credentials - email` },
            })
        }

        if ( !bcrypt.compareSync( body.password, userDB.password ) ) {
            return res.status(400).json({
                ok: false,
                message: `Incorrect credentials - password`,
                errors: { message: `Incorrect credentials - password` },
            })
        }

        userDB.password = ':)';
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // expires in 4 hours
        

        res.status(200).json({
            ok: true,
            user: userDB,
            token,
            id: userDB._id,
            menu: getMenu( userDB.role )
        }); 
    });
});


// ============================================
// Google auth
// ============================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }


app.post('/google', async (req, res) => {

    var token = req.body.token;
    
    var validToken = true;

    var googleUser = await verify(token)
        .catch( e => {
            validToken = false;
            return res.status(403).json({
                ok: false,
                message: 'Token not valid.'
            }); 
        });

    if ( !validToken ) {
        return;
    }

    User.findOne( { email: googleUser.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error finding user',
                errors: err,
            })
        }

        if( userDB ) {
            if ( userDB.google === false ) {
                return res.status(400).json({
                    ok: false,
                    message: 'You must use your normal authentication',
                    errors: err,
                })
            } else {
                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // expires in 4 hours
                
        
                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token,
                    id: userDB._id,
                    menu: getMenu( userDB.role )
                }); 
            }
        } else {
            // User no exist in db
            var newUser = new User();

            newUser.name = googleUser.name;
            newUser.email = googleUser.email;
            newUser.img = googleUser.img;
            newUser.google = true;
            newUser.password = ':)';
            
            newUser.save( (err, savedUser) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error saving and login user',
                        errors: err,
                    })
                }

                var token = jwt.sign({ user: savedUser }, SEED, { expiresIn: 14400 }); // expires in 4 hours
                
        
                res.status(200).json({
                    ok: true,
                    user: savedUser,
                    token,
                    id: savedUser._id,
                    menu: getMenu( savedUser.role )
                }); 
            });
        }

    });
});

function getMenu( ROLE ) {

    var menu = [
        {
            title: 'Main',
            icon: 'mdi mdi-gauge',
            submenu: [
            { title: 'Dashboard', url: '/dashboard'},
            { title: 'Progress Bars', url: '/progress'},
            { title: 'Graphics', url: '/graphics1'},
            { title: 'Promises', url: '/promises'},
            { title: 'Rxjs', url: '/rxjs'},
            ]
        },
        {
            title: 'Maintenance',
            icon: 'mdi mdi-folder-lock-open',
            submenu: [
            // { title: 'Users', url: '/users'},
            { title: 'Hospitals', url: '/hospitals'},
            { title: 'Medics', url: '/medics'},
            ]
        }
    ];

    if ( ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ title: 'Users', url: '/users'});
    }
    

    return menu;
}


module.exports = app;