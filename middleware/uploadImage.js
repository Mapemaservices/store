const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path')
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, "../public/images/"));
    },
    filename: (_req, file, cb) => {
        const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
    }
});

const multerFilter = (_req, file, cb) => {
    
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  };
  
  const uploadPhoto = multer({
    storage: storage,
    fileFilter: multerFilter,
    limits: { fileSize: 1000000 },
  });
  
  const productImgResize = async (req, _res, next) => {
    try {
        //console.log("images: ", req.files);
        if (!req.files) return next();
        await Promise.all(
          req.files.map(async (file) => {
            await sharp(file.path)
              .resize(600, 600)
              .toFormat("jpeg")
              .jpeg({ quality: 90 })
              .toFile(`public/images/products/${file.filename}`);
            fs.removeSync(`public/images/products/${file.filename}`);
          })
        );
        next();
        
    } catch (error) {
      console.log(error.message);
    }

  };
  
  module.exports = { uploadPhoto, productImgResize };