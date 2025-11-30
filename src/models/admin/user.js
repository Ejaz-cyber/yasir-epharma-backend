const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../../helpers");

const emailRegexp =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegexp =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/;

  // const userSchema = new Schema(
  //   {
  //     name: {
  //       type: String,
  //       required: true,
  //     },
  //     email: {
  //       type: String,
  //       match: emailRegexp,
  //       unique: true,
  //       required: [true, "Email is required"],
  //     },
  //     password: {
  //       type: String,
  //       match: [
  //         passwordRegexp,
  //         "Password must contain at least one digit, one uppercase letter, one lowercase letter, one special character, and be at least 6 characters long",
  //       ],
  //       minlength: 6,
  //       required: [true, "Set password for user"],
  //     },
  //     token: {
  //       type: String,
  //       default: "",
  //     }
  //   },
  //   { versionKey: false, timestamps: true }
  // );

  // userSchema.post("save", handleMongooseError);

  const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().pattern(passwordRegexp).min(6).required().messages({'string.pattern.base': 'Password must contain at least one digit, one uppercase letter, one lowercase letter, one special character, and be at least 6 characters long'}),
  });

  const loginSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().pattern(passwordRegexp).min(6).required(),
  });

  // const User = model("user", userSchema);

  const schemas = { loginSchema, registerSchema };


module.exports = {
  // User,
  schemas
};