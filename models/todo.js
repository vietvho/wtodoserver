const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    userID: String,
    tasks: [{
        id: String,
        title: String,
        done: Boolean,
        category: String,
        listOrder: Number,
    }]
});

module.exports = mongoose.model('Todo',todoSchema);