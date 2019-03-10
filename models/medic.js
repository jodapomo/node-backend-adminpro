var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var medicoSchema = new Schema({

    name: {
        type: String,
        required: [true, 'Name is required'] 
    },
    img: {
        type: String,
        required: false 
    },
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    hospital: {
        type: Schema.Types.ObjectId, 
        ref: 'Hospital', 
        required: [true, 'Hospital id is required']
    }
});

module.exports = mongoose.model('Medic', medicoSchema);