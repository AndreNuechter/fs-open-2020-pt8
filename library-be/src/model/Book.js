const mongoose = require('mongoose');
const { MONGO_URL } = require('../util/constants.js');

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        minlength: 2
    },
    published: {
        type: Number,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    },
    genres: [
        { type: String }
    ]
});

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
schema.set('toJSON', {
    transform(_, returnedObject) {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Book', schema);