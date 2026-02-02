const bcrypt = require('bcrypt');

const encryptPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        return hash;
    } catch (err) {
        throw new Error(err);
    }
}

const decryptPassword = async (password, confirmPassword) => {
    try {
        return await bcrypt.compare(password, confirmPassword)
    } catch (err) {
        return false;
    }
}

module.exports = {
    encryptPassword,
    decryptPassword
}