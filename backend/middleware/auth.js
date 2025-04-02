const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // トークンが無効
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // トークンがない
  }
};

module.exports = authenticate;