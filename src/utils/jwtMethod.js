const JWT = require("jsonwebtoken");

exports.jwtCreator = async (user) => {
  let { password, ...payload } = user["_doc"];
  let accessToken = JWT.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  let refreshToken = JWT.sign(
    { userId: payload["_id"] },
    process.env.SECRET_KEY,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
  );
  return { accessToken, refreshToken };
};

// for get or create document from specific collection
exports.getOrCreate = async (Model, query, data = {}) => {
  const doc = await Model.findOne(query).lean();

  if (doc) return doc;

  const createdDoc = await Model.create(data);
  return createdDoc;
};
