const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).json({
            error: "Access Denied"
        })
    }

    const token = req.header("Authorization").replace(/^Bearer /,"");
    try {
         const data = jwt.verify(token, process.env.SECRET_KEY);
         req.ctxVerifiedUserData = data;
    } catch {
        return next(new Error("Invalid Token"));
    }
    next();
}

module.exports = verifyToken;