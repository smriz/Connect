const { mongoose } = require("./../database/mongoose");
let Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const { generateSignToken, genUuid } = require("./../utils/utils");

let userSchema = new Schema({
  name: { type: String, trim: true, minlength: 3, maxlength: 30 },

  username: {
    type: String,
    minlength: 5,
    maxlength: 30,
    unique: true,
    trim: true,
  },

  public_key: { type: String, unique: true },

  secret_key: { type: String, trim: true },

  password: { type: String, trim: true },

  blocked: { type: Boolean, default: false },

  device_model: { type: String, trim: true, default: null },

  profile: {
    type: String,
    default: " ",
    trim: true,
  },
  mood: { type: String, required: true, default: "happy" },

  last_seen: { type: Number, required: true, default: new Date().getTime() },

  updated_at: { type: Number, required: true, default: new Date().getTime() },

  created_at: { type: Number, required: true, default: new Date().getTime() },
});

userSchema.pre("save", async function (next) {
  console.log(this);

  let passSalt = await bcrypt.genSaltSync(10);

  this.password = bcrypt.hashSync(this.password, passSalt);

  let tokenObject = { _id: this._id, date: new Date() };

  this.secret_key = await genUuid();

  this.public_key = await generateSignToken(tokenObject, this.secret_key);

  this.updated_at = new Date().getTime();
  this.last_seen = new Date().getTime();
  this.created_at = new Date().getTime();
  next();
});

let User = mongoose.model("User", userSchema);

module.exports = { User };