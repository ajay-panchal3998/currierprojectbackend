const timestamp = () => {
    const time = Math.floor(Date.now() / 1000);
    return time
}

const generateRandomId = async (length) => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).slice(2);
    return (timestamp + randomStr).slice(0, length).padEnd(length, '0');
}
const removeSpaces = (inputString) => inputString.replace(/\s/g, '');

function isEmpty(value) {
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
}

module.exports = {
    timestamp,
    generateRandomId,
    removeSpaces,
    isEmpty
};