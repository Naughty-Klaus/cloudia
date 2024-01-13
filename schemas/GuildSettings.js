const mongoose = require('mongoose');
const { RequiredArray, RequiredString, RequiredBoolean } = require('./types/RequiredTypes');

module.exports = mongoose.model('guild_settings', mongoose.Schema({
    _id: RequiredString,
    users: RequiredArray,
    features: RequiredArray
}));