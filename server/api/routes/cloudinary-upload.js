const express = require('express');
const router = express.Router();
const fileUploader = require('../utils/cloudinary');

router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    // Create new user
    let user = new User({
      name: req.body.name,
      profile_img: result.secure_url,
      cloudinary_id: result.public_id,
    });
    // save user details in mongodb
    await user.save();
    res.status(200)
      .send({
        user
      });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;