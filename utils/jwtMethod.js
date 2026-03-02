const JWT = require("jsonwebtoken");

exports.jwtCreator = async (user) => {
  let { _id, fullName, email, phoneNumber, role, panned } = user;
  let payload = {
    _id,
    fullName,
    email,
    phoneNumber,
    role,
    panned,
  };
  let accessToken = JWT.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  let refreshToken = JWT.sign({ userId: _id }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
  return {accessToken, refreshToken};
};

// for get or create document from specific collection
exports.getOrCreate = async (Model, query, data = {}) => {
  const doc = await Model.findOne(query).lean();

  if (doc) return doc;

  const createdDoc = await Model.create(data);
  return createdDoc;
};

