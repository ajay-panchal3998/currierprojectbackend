// const multer = require("multer");
// const path = require('path');

// const multerfunc = () => {
//     try {
//         const storage = multer.diskStorage({
//             destination: (req, file, callback) => callback(null, "./uploads"),
//             filename: (req, file, callback) => {
//                 const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e8)}${path.extname(file.originalname)}`;
//                 callback(null, uniqueName);
//             }
//         });

//         let upload = multer({
//             storage,
//             limit: {
//                 fileSize: 1000000 * 100,
//             },
//         });
//         return upload
//     } catch (error) {
//         console.log(error, 'multer error')
//     }
// }

// module.exports = multerfunc;



const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 1. Cloudinary Config (Ye details aapko Cloudinary Dashboard se milengi)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const multerfunc = () => {
    try {
        // 2. Cloudinary Storage Setup
        const storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: "courier_documents", // Cloudinary mein folder ka naam
                allowed_formats: ["jpg", "png", "jpeg", "pdf"],
                public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
            },
        });

        // 3. Multer with Cloudinary Storage
        let upload = multer({
            storage: storage,
            limits: {
                fileSize: 1024 * 1024 * 10, // 10MB limit (Cloudinary free tier ke liye kaafi hai)
            },
        });

        return upload;
    } catch (error) {
        console.log(error, 'multer error');
    }
}

module.exports = multerfunc;