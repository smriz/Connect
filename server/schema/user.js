const { mongoose } = require("./../database/mongoose");
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;
const bcrypt = require("bcrypt");
const { generateSignToken, genUuid } = require("./../utils/utils");
const { find, result } = require("lodash");

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
    unique: true,
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
    bff: { type: String, default: "0" },
    bonded: { type: String, default: "0" },
    friends: { type: String, default: "0" },
    fans: { type: String, default: "0" },
    bio: { type: String, default: "" },
    tag: { type: String, default: "messenger" },
    tag_color: { type: String, default: "white" },
    profile_visits: { type: String, default: "0" },
    connections: { type: String, default: "0" },
    popularity: { type: String, default: "new" },
  },

  requests: [{ user: { username: String, id: String } }],

  requested: [{ user: { username: String, id: String } }],

  friend_list: { type: ["Mixed"] },
  last_seen: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },

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

userSchema.post("updateOne", async function () {
  const username = this.getQuery().username;
  console.log(this.getQuery().username);
  var bff = 0,
    bonded = 0,
    friend = 0,
    fans = 0;

  bff = User.find({ username: username })
    .then((result) => {
      // console.log(bff_array);

      bff = result[0].friend_list.length;

      var bff_arr = [],
        bonded_arr = [],
        friends_arr = [],
        fans_arr = [];

      result[0].friend_list.forEach((friend) => {
        if (friend.type === "bff") {
          bff_arr.push(friend.id);
        }
        if (friend.type === "bonded") {
          bonded_arr.push(friend.id);
        }
        if (friend.type === "friends") {
          friends_arr.push(friend.id);
        }
        if (friend.type === "fans") {
          fans_arr.push(friend.id);
        }

        console.log("bff" + bff_arr.length);
        console.log("bonded" + bonded_arr.length);
        console.log("frirneds" + friends_arr.length);
        console.log("fans" + fans_arr.length);
      });
      const find = this.set(
        { phoneno: bff_arr.length.toString() },
        { "profile.bonded": bonded_arr.length.toString() },
        { "profile.friends": friends_arr.length.toString() },
        { "profile.fans": fans_arr.length.toString() }
      );
    })
    .catch((err) => {
      console.log(err);
    });

  // bonded = await this.find({
  //   "friend_list.type": { $eq: "bff" },
  // });

  // friend = await User.find({ "friend_list.type": { $eq: "friend" } }).length;

  // fans = await User.find({ "friend_list.type": { $eq: "fans" } }).length;

  // console.log(this.created_at);
  // console.log(docToUpdate);
  // console.log(friend);
  // console.log(fans);
  // next();
});

let User = mongoose.model("User", userSchema);

module.exports = { User };
