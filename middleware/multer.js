const multer = require("multer");
const path = require('path');

const multerfunc = () => {
    try {
        const storage = multer.diskStorage({
            destination: (req, file, callback) => callback(null, "./uploads"),
            filename: (req, file, callback) => {
                const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e8)}${path.extname(file.originalname)}`;
                callback(null, uniqueName);
            }
        });

        let upload = multer({
            storage,
            limit: {
                fileSize: 1000000 * 100,
            },
        });
        return upload
    } catch (error) {
        console.log(error, 'multer error')
    }
}

module.exports = multerfunc;
