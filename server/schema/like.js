const { mongoose } = require("./../database/mongoose");
let Schema = mongoose.Schema;

const likeSchema = Schema(
    {
      post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    {
      timestamps: true,
    }
  );

  let Like = mongoose.model('Like', likeSchema);

   module.exports = { Like};