const Profile = require("../models/Profile");
const User = require("../models/User");
const {uploadImageToCloudinary} = require('../utils/imageUploader');

exports.updateProfile = async(req, res) => {
    try{
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        const id = req.user.id;

        const user = await User.findById(id);
        const profile = await Profile.findById(user.additionalDetails);


        

        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber;
        profile.gender = gender;

        await profile.save();
        return res.status(200).json({
            success:true,
            message:'Profile Update SuccessFully',
            profileDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Profile Update SuccessFully',
            profileDetails,
        });
    }
};

exports.deleteAccount = async (req, res) => {
    try{
      const id = req.user.id;

      const userDetails = await User.findById(id);
      if(!userDetails) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
      }

      await Profile.findByIdAndDelete({_id:userDetails.additionDetails});
      //todo: HW unenroll user form all enrolled courses

      await User.findByIdAndDelete({_id:id});

      return res.status(200).json({
        success: true,
        message: 'User Deleted Successfully',
      })
    }
    catch(error){
        return res.status(500).json({
            success: true,
            message: 'User cannot be Deleted Successfully',
          })
    }
};

exports.getAllUserDetails = async(req, res) => {
    try{
       const id = req.user.id;

       const userDetails = await User.findById(id).populate("additonalDetails").exec();
       console.log(userDetails);
       return res.status(200).json({
        success: true,
        message: 'User Details',
        data: userDetails,
      });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: ' user details not  found',
          })
    }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
      const displayPicture = req.files.displayPicture;
      const userId = req.user.id;
      const image = await uploadImageToCloudinary(
          displayPicture,
          process.env.FOLDER_NAME,
          1000,
          1000
      )
      console.log(image);
      const updatedProfile = await User.findByIdAndUpdate(
          {_id: userId},
          {image: image.secure_url},
          {new: true}
      )
      res.send ({
          success: true,
          message: `Image Updated Successfully`,
          data: updatedProfile,
      });

  } catch (error) {
      return res.status(500).json({
          success: false,
          message: error.message,
      });
  }
};
exports.getEnrolledCourses = async (req, res) => {
  try {
      const userId = req.user.id;
      const userDetails = await User.findOne({
          _id: userId,
      })
      .populate('courses')
      .exec()

      if(!userDetails) {
          return res.status(400).json({
              success: false,
              message: `Could Not Find User With Id: ${userDetails}`,
          });
      }
      return res.status(200).json({
          success: true,
          data: userDetails.courses,
      })
  } catch (error) {
      return res.status(500).json({
          success: false,
          message: error.message,
      });
  }
};