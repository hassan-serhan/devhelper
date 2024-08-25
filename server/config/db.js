const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoConnectionString");

const connectDB = async () => {
    try {
        await mongoose.connect(db);
      //  console.log("connected to Mongodb Successfully");
    }
    catch(err) {
        //console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;