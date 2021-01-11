const { mongoose } = require("./../database/mongoose");
let Schema = mongoose.Schema;
const postSchema = Schema(
    {
      title: String,
      image: String,
      imagePublicId: String,
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      likes: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Like',
        },
      ],
      comments: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Comment',
        },
      ],
    },
    {
      timestamps: true,
    }
  );

  let Post = mongoose.model('Post', postSchema);

   module.exports = { Post};