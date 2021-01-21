const mongoose = require("mongoose");

async function connectToMongoose() {
    try {
        await mongoose.connect("mongodb://localhost:27017/rba",{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        let connection = mongoose.connection.readyState === 1? "Connected to Mongoose!": "Not connected to Mongoose!";
        console.log(connection);
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectToMongoose;
