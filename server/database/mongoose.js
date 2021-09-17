const mongoose = require("mongoose"); //mongoose
const DB_URI =
  "mongodb+srv://master:master1234@cluster1.luv3e.mongodb.net/xrosstalk?retryWrites=true&w=majority"; // our local uri for MongoDB

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB connected to : " + DB_URI);
  })
  .catch((err) => {
    console.log("DB failed :  " + DB_URI + " : " + err);
  });

module.exports = {
  mongoose,
};
