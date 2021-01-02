const mongoose = require('mongoose');
const { MONGO_URL } = require('../util/constants.js');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    born: {
        type: Number,
    },
    bookCount: {
        type: Number
    }
});

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
schema.set('toJSON', {
    transform(_, returnedObject) {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Author', schema);