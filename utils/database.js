const mongoose = require("mongoose");

async function connectToMongoose() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION,{
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
