const jwt = require('jsonwebtoken');

module.exports = {
  /*
   * Middleware to require a valid auth token
   *
   * Only calls next() if the request has a valid auth token
   */
  requireAuthorization: async function (req, res, next) {
    try {
      const auth_value = req.get('Authorization').split(' ');

      const auth_type = auth_value[0];
      const token = auth_value[1];

      if (auth_type !== "Bearer") {
        res.status(400).json({
          "error": "Invalid authorization token"
        });
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.locals = { user: payload.sub };
      next();
    } catch (err) {
      res.status(400).json({
        "error": "Invalid authorization token"
      });
    }
  }
};
