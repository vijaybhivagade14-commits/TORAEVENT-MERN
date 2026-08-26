const mongosee = require("mongoose");
const eventSchema = new mongosee.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true, 
    },
    location: {
        type: String,
        required: true,
    },
category: {
        type: String,
        required: true,
    },
    totalSeats: {
        type: Number,
        required: true, 
    },
    availableSeats: {
        type: Number,

        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongosee.Schema.Types.ObjectId,
        ref: "User",
        required: true, 
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongosee.model("Event", eventSchema);