const mongoose = require("mongoose"); //mongoose
const DB_URI =
  "mongodb+srv://master:master123@cluster1.luv3e.mongodb.net/xrosstalk?retryWrites=true&w=majority"; // our temp uri for MongoDB

mongoose
  .connect(DB_URI, {
    //To fix all deprecation warnings, follow the below steps:
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    //successfully connected to database
    console.log("DB connected to : " + DB_URI);
  })
  .catch((err) => {
    //fail to connect database and print error
    console.log("DB failed :  " + DB_URI + " : " + err);
  });

module.exports = {
  mongoose,
};
