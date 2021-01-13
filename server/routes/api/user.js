const { User } = require("../../schema/user");
const response = require("../../routes/api/response");
const { generateSignToken } = require("../../utils/utils");
const Joi = require("joi");
const _ = require("lodash");
const bcrypt = require("bcrypt");

exports.login = async function (req, res) {
  try {
    let body = _.pick(req.body, ["username", "password"]);
    console.log(body);
    const verifyJoiSchema = {
      username: Joi.string().required(),
      password: Joi.string().required(),
    };

    let validateResult = Joi.validate(body, verifyJoiSchema);
    if (validateResult.error) {
      return res
        .status(response.STATUS_UNPROCESSABLE_ENTITY)
        .json(
          response.createResponse(response.FAILED, validateResult.error.message)
        );
    }

    let userFound = await User.findOne({ username: body.username });

    if (!userFound) {
      return res
        .status(response.STATUS_UNAUTHORIZED)
        .json(
          response.createResponse(
            response.FAILED,
            "No users were found with this username"
          )
        );
    }

    let comparePass = await bcrypt.compare(body.password, userFound.password);
    console.log(userFound.password + "\n" + body.password);

    if (!comparePass) {
      return res
        .status(response.STATUS_UNAUTHORIZED)
        .json(
          response.createResponse(
            response.FAILED,
            "Wrong username/password , please try again"
          )
        );
    }

    if (userFound.blocked) {
      return res
        .status(response.STATUS_FORBIDDEN)
        .json(
          response.createResponse(
            response.FAILED,
            "this phone number is blocked , please contact support"
          )
        );
    }

    let updateObject = {};

    updateObject.public_key = await generateSignToken(
      {
        _id: userFound._id,
        date: new Date(),
      },
      userFound.secret_key
    );
    updateObject.updated_at = new Date().getTime();

    await User.findByIdAndUpdate(userFound._id, updateObject);

    let finalUser = await User.findById(
      userFound._id,
      "_id name username public_key profile"
    );
    return res.status(response.STATUS_OK).json(
      response.createResponse(response.SUCCESS, `Success`, {
        user: finalUser,
      })
    );
  } catch (e) {
    console.log(e);
    return res
      .status(response.STATUS_BAD_REQUEST)
      .json(
        response.createResponse(response.ERROR, "Something went wrong :" + e)
      );
  }
};

exports.register = async function (req, res) {
  try {
    let body = _.pick(req.body, [
      "firstname",
      "lastname",
      "email",
      "country",
      "gender",
      "phoneno",
      "username",
      "password",
      "device_model",
    ]);
    const verifyJoiSchema = {
      username: Joi.string().required(),
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      email: Joi.string().required(),
      country: Joi.string().required(),
      gender: Joi.string().required(),
      phoneno: Joi.string().required(),
      device_model: Joi.string().required(),
      password: Joi.string().required(),
    };

    let validateResult = Joi.validate(body, verifyJoiSchema);

    if (validateResult.error) {
      return res
        .status(response.STATUS_UNPROCESSABLE_ENTITY)
        .json(
          response.createResponse(response.FAILED, validateResult.error.message)
        );
    }

    let finalUser = await User.findOne(
      { username: body.username },
      "_id name username public_key blocked profile"
    );

    if (finalUser) {
      return res.status(response.STATUS_CONFLICT).json(
        response.createResponse(response.FAILED, "Already registered ", {
          user: finalUser,
        })
      );
    } else if (!finalUser) {
      let newUser = new User(body);
      await newUser.save();
      let registeredUser = await User.findById(
        newUser._id,
        "_id name username public_key blocked profile"
      );
      return res.status(response.STATUS_OK).json(
        response.createResponse(response.SUCCESS, "registered", {
          user: registeredUser,
        })
      );
    }
  } catch (e) {
    return res
      .status(response.STATUS_BAD_REQUEST)
      .json(response.createResponse(response.ERROR, e));
  }
};

exports.findUserName = async function (req, res) {
  try {
    let username = req.params.username;

    const foundUsers = await User.find(
      {
        $or: [{ username: { $regex: ".*" + username + ".*" } }],
      },
      "_id name username profile last_seen"
    );

    return res.status(response.STATUS_OK).json(
      response.createResponse(response.SUCCESS, `Success`, {
        users: foundUsers,
      })
    );
  } catch (e) {
    console.log(e);
    return res
      .status(response.STATUS_BAD_REQUEST)
      .json(
        response.createResponse(response.ERROR, "Something went wrong :" + e)
      );
  }
};

exports.users = async function (req, res) {
  try {
    const foundUsers = await User.find();

    return res.status(response.STATUS_OK).json(
      response.createResponse(response.SUCCESS, `Success`, {
        users: foundUsers,
      })
    );
  } catch (e) {
    console.log(e);
    return res
      .status(response.STATUS_BAD_REQUEST)
      .json(
        response.createResponse(response.ERROR, "Something went wrong :" + e)
      );
  }
};

exports.user_update = async function (req, res) {
  const username = req.params.username;
  User.updateOne({ username: req.params.username }, req.body)
    .then((result) => res.json(result))
    .catch((err) => {
      res
        .status(response.STATUS_BAD_REQUEST)
        .json(
          response.createResponse(
            response.ERROR,
            "Something went wrong :" + err
          )
        );
    });
};
