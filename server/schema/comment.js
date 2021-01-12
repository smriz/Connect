const { mongoose } = require("./../database/mongoose");
let Schema = mongoose.Schema;

const commentSchema = Schema(
    {
      comment: {
        type: String,
        required: true,
      },
      post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    {
      timestamps: true,
    }
  );


let Comment = mongoose.model('Comment', commentSchema);

   module.exports = { Comment};