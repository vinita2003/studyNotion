const User = require("../models/User");
const  mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

exports.resetPasswordToken = async (req, res) => {
    try{
        const email = req.body.email;

        const user = await User.findOne({email: email});
        if(!user) {
            return res.json({success: false,
            message: `This Email: ${email} is not registered with us, Please enter a valid Email`
            });
        }
    
        const token = crypto.randomBytes(20).toString('hex');
    
        const updatedDetails = await User.findOneAndUpdate(
            {email: email},
            {
                token: token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
        {new: true});
        console.log('DETAILS: ', updatedDetails);
        const url = `http://localhost:3000/update-password/${token}`
    
        await mailSender(email, "Password Reset Link",
        `Your link for email verification is ${url}. Please click this url to reset your password.`
                         );
    
              return res.json({
                success: true,
                message:'Email sent successfully, please check email and change pwd',
    
              });          
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong reset pwd mail'
        })
    }
    }


    exports.resetPassword = async(req, res) => {
        try{
            const {password, confirmPassword, token} = req.body;

        if(password !== confirmPassword) {
            return res.json({
                success: false,
                message: 'Password not matching',
            })
        }

        const userDetails = await User.findOne({token: token});

        if(!userDetails) {
            return res.json({
                success: false,
                message: 'Token is invalid',
            })
        }

        if(userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: 'Token is expired, please regenerate your token'
            })
        }

        const encryptedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate(
            {token:token},
            {password:encryptedPassword},
            {new:true},
        );

        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        })

        }catch(error){
            console.log(error);
        return res.status(500).json({
            success: false,
            message: `Error occurred while updating password`
        });
        }
        

    }
