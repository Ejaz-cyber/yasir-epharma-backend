const jwt = require('jsonwebtoken');
const {HttpError} = require('../../helpers');
// const {User} = require('../../models/admin/user');
const User = require('../../models/user.model').default;
const {SECRET_KEY} = process.env;

const authenticate = async (req, res, next) => {
  const {authorization = ""} = req.headers;
  const [bearer, token] = authorization.split(" ");
  console.log("bearer", bearer)
  console.log("token:", token)
  if(bearer !== 'Bearer') {
    next(HttpError(401));
  }
  try {
    // @ts-ignore
    const {id} = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);
    if(!user || !user.token || user.token !== token) {
        next(HttpError(401));
    }
    // req.user = user;
    req.user = {
      _id: id,
      name: user.name,
      email: user.email
    }
    console.log("req-------", req.body)
    next();
  } catch {
    next(HttpError(401));
  }
}

module.exports = authenticate;