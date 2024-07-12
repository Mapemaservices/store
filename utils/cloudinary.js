const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});
const cloudinaryUploadImg = async (fileToUploads) => {
 
  const result = await cloudinary.uploader.upload(fileToUploads,{
    folder : 'store'
  });
  return result;
};
const cloudinaryDeleteImg = async (fileToDelete) => {
    await cloudinary.uploader.destroy(fileToDelete);
};
module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg };