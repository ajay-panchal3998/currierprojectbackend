const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).json({ message: 'Unauthorize request' });
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decode;
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" })
    }
    return next();
}
module.exports = verifyToken;
