const connectToDatabase = require("./utils/database");
const mongoose = require("mongoose");
const app = require("./server.js");

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const server = app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});

connectToDatabase();

// Graceful Shutdown
process.on("SIGINT", () => {
    const exitTimeout = setTimeout(() => {
        process.exit(1);
    }, 10000);

    server.close(async () => {
        await mongoose.connection.close();
        const connection = mongoose.connection.readyState === 0;
        if (connection) console.log("Server and database successfully closed");
        
        clearTimeout(exitTimeout);
    })
});