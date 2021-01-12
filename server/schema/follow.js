const { mongoose } = require("./../database/mongoose");
let Schema = mongoose.Schema;

const followSchema = Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      follower: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    {
      timestamps: true,
    }
  );

  let Follow = mongoose.model('Follow', followSchema);

   module.exports = { Follow};