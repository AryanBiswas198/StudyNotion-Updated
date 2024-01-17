const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewurlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {console.log("DB Connected Successfully")})
    .catch((err) => {
        console.log("DB Connection failed");
        console.error(err);
        process.exit(1);
    })
};