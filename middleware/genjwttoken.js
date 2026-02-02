const jwt = require('jsonwebtoken');

const genJwtToken = (userid, email) => {
    const payload = {
        userid,
        email,
        exp: Math.floor(Date.now() / 1000) + parseFloat(process.env.USER_JWT_EXPIRES_IN) * 3600
    };
    return jwt.sign(payload, process.env.JWT_SECRET_KEY);
};
module.exports = genJwtToken;