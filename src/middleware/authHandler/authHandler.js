import jwt from "jsonwebtoken";

const Authenticate = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, global.gConfig.secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: "failed",
          code: "401",
          error: {
            type: "TokenRequired",
            // fetch only message from each error
            details: {
              message: "Auth Token Is Missing."
            }
          }
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({
      status: "failed",
      code: "401",
      error: {
        type: "TokenRequired",
        // fetch only message from each error
        details: {
          message: "Auth Token Is Missing."
        }
      }
    });
  }
};

const AuthenticateApiAccess = (req, res, next) => {
  if (!req.headers["x-api-key"]) {
    return res.status(401).json({
      status: "failed",
      code: "401",
      error: {
        type: "APIKeyMissing",
        // fetch only message from each error
        details: {
          message: "API Key Is Missing."
        }
      }
    });
  }
  if (req.headers["x-api-key"] === global.gConfig.accessApiKey) {
    next();
  } else {
    return res.status(401).json({
      status: "failed",
      code: "401",
      error: {
        type: "InValidAPIKey",
        // fetch only message from each error
        details: {
          message: "API Key Is Invalid."
        }
      }
    });
  }
};

const GenerateToken = async user => {
  const token = jwt.sign(
    {
      id: user.username
    },
    global.gConfig.secret,
    {
      expiresIn: "5d"
    }
  );

  return token;
};

const GenerateAccountVerificationToken = async () => {
  return Math.floor(Math.random() * new Date());
}



module.exports = {
  Authenticate,
  AuthenticateApiAccess,
  GenerateToken,
  GenerateAccountVerificationToken
};
