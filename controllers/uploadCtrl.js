const fs = require('fs').promises;

const { cloudinaryDeleteImg, cloudinaryUploadImg } = require('../utils/cloudinary');
const Item = require('../models/item')

const uploadImages = async (req, res) => {
    try {
      
      const uploader = (path) => cloudinaryUploadImg(path, "images");
      let url_picture;
      const files = req.files;
      
      for (const file of files) {
        const { path } = file;
        const newpath = await uploader(path);
        url_picture = newpath.secure_url;
       
       await fs.unlink(path);
      }
      const newItem = new Item({
        name : req.body.name,
        picture : url_picture,
        price : req.body.price,
        quantity : req.body.quantity,
      })
     
      await newItem.save();
      res.json({msg:"Successfuly created new Item"});
    } catch (error) {
        console.log(error.message);
      //throw new Error(error);
    }
  };
  const deleteImages = async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = cloudinaryDeleteImg(id, "images");
      res.json({ message: "Deleted" });
    } catch (error) {
      throw new Error(error);
    }
  };
  
  module.exports = {
    uploadImages,
    deleteImages,
  };