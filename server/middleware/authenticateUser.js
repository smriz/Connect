const { User } = require("./../schema/user");
const _ = require("lodash");
const response = require("./../routes/api/response");

exports.authenticateUser = async (req, res, next) => {
  try {
    let token = req.headers.public_key;

    //
    let user = await User.findOne({ public_key: token });
    if (!user) {
      return res
        .status(response.STATUS_UNAUTHORIZED)
        .json(response.createResponse(response.FAILED, "UNAUTHORIZED"));
    }
    req.body.users = _.pick(user, [
      "_id",
      "name",
      "username",
      "public_key",
      "blocked",
      "profile",
    ]);
    next();
  } catch (e) {
    return res
      .status(response.REASON_SERVER_ERR)
      .json(response.createResponse(response.ERROR, "UNAUTHORIZED"));
  }
};
