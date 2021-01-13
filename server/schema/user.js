const { mongoose } = require("./../database/mongoose");
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;
const bcrypt = require("bcrypt");
const { generateSignToken, genUuid } = require("./../utils/utils");

let userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 30,
  },
  firstname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  lastname: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  phoneno: {
    type: Number,
    required: true,
    length: 10,
  },
  public_key: { type: String, unique: true },

  secret_key: { type: String, trim: true },

  password: { type: String, trim: true },

  blocked: { type: Boolean, default: false },

  device_model: { type: String, trim: true, default: null },

  profile: {
    type: { type: String, default: "public" },
    mood: { type: String, default: "white" },
    bff: { type: String, default: "" },
    friends: { type: String, default: "0" },
    fans: { type: String, default: "0" },
    bio: { type: String, default: "" },
    tag: { type: String, default: "messanger" },
    profile_visits: { type: String, default: "0" },
    connections: { type: String, default: "0" },
    popularity: { type: String, default: "new" },
  },

  requests: [{ id: { type: ObjectId, ref: "User" } }],

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
