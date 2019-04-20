var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED

exports.verifyToken = function( req, res, next ) {

    var token = req.query.token;

    jwt.verify( token, SEED, ( err, decoded ) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Invalid token',
                errors: err,
            })
        }

        req.user = decoded.user

        next();


    });

}

exports.verifyAdminRole = function( req, res, next ) {

    var user = req.user;

    if ( user.role === 'ADMIN_ROLE' ) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Invalid token - NO ADMIN',
            errors: { message: 'You are not an administrator, you can not do that.'},
        }) 
    }

}

exports.verifyAdminRoleOrSelf = function( req, res, next ) {

    var user = req.user;
    var id = req.params.id;

    if ( user.role === 'ADMIN_ROLE' || user._id === id ) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Invalid token - NO ADMIN or the same user',
            errors: { message: 'You are not an administrator, you can not do that.'},
        }) 
    }

}