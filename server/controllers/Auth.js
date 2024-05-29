const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const  mailSender = require("../utils/mailSender");
const { passwordUpdated } = require('../mail/templates/passwordUpdate');
require("dotenv").config();

exports.sendotp = async(req, res) => {

    try{
        const {email} = req.body;
    const checkUserPresent = await User.findOne({email});

    if(checkUserPresent) {
        return res.status(401).json({
            success: false,
            message: 'User already registered',
        })
    }

    var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    console.log("OTP generator: ", otp);

    const result = await OTP.findOne({otp: otp});
        console.log('OTP Generated : ', otp);
        console.log('Result : ', result);
        //if not unique
        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlpahbets: false,
            });
        }

    const otpPayload = {email, otp};

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
        success: true,
        message: 'OTP Sent Successfully',
        otp,
    })

    }catch(error){
         console.log(error);
         return res.status(500).json({
            success: false,
            message: error.message,
         })
    }
};

exports.signup = async (req, res) => {
   try{
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    } = req.body;

    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success: false,
            message: "All fields are required",
        })
    }

    if(password != confirmPassword){
        return res.status(400).json({
            success: false,
            message:'Password and ConfirmPassword Value does not match, Please try again'
        });
    }
    const  existingUser = await User.findOne({email});
    if(existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User is already registered',
        });
    }

    const response = (await OTP.find({email}).sort({createdAt: -1})).limit(1);
    console.log(recentOtp);

    if(response.length == 0){
        return res.status(400).json({
            success: false,
            message: 'OTPP  not found',
        })
    }else if(otp !== response[0].otp) {
        return res.status(400).json({
            success:false,
            message: "Invalid OTP",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType,
        additionDetails: profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

   return res.status(200).json({
    success: true,
    message:'User is registered SuccessFully',
    user,
   });

   }
   catch(error){
    console.log(error);
    return res.status(500).json({
        success: false,
        message:"User cannot be registered. Please  try again",
    })

   }
};


exports.login = async(req, res) => {
    try {
        const {email, password} = req.body;
        
        if(!email || !password) {
            return res.status(200).json({
                success: false,
                message: 'All fields are required, please try again',
            });
        }

        const user = await User.findOne({email}).populate("additionalDetails");

        if(!user){
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first",
            });
        }

        if((await bcrypt.compare(password, user.password))) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expriresIn: "2h",
            });

            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged in successfully',
            })
        }

        else{
            return res.status(401).json({
                success:false,
                message:'password is incorrect',
            });
        }
    }
    catch(error){
      console.log(error);
      return res.status (500).json({
        success: false,
        message: 'Login Failure, please try again',
      });
    }
};

exports.changePassword = async(req, res) => {
    try {
        const userDetails = await User.findById(req.user.id);

        const {oldPassword, newPassword} = req.body;

        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);

        if(!isPasswordMatch){
            return res
            .status(401).json({
                success: false,
                message: 'The Password is Incorrect',
            });
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword},
            {new: true}
        );

        try{
           const emailResponse = await mailSender(
            updatedUserDetails.email,
            `Password Updated Successfully for  ${updatedUserDetails.firstName} ${updatedUserDetails}`,
            passwordUpdated(
                updatedUserDetails.email,
                updatedUserDetails.firstName,
            )
           )

           console.log('Email sent successfully.........', emailResponse);
        }
        catch(error){
             console.log('Error Occured While Sending Email:', error);
             return res.status(500).json({
                success: false,
                message:'Error Occured While Sending Email',
                error: error.message,
             });
        }

        return res.status(200).json({success: true, message: 'Password Updated Successfully'});
    }
    catch(error){
       console.error('Error Occured While UPdating Password', error);
       return res.status(500).json({
        success: false,
        message: 'Error Occured While Updating Password',
        error: error.message,
       });
    }

};
