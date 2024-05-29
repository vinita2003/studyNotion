const mongoose = require("mongoose");

require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(console.log("MongoDb Connected"))
    .catch((error) => {
        console.log("DB connected Issues");
        console.error(error);
        process.exit(1);
    })
}