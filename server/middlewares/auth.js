const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.auth = async(req, res, next) => {
    try{
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer", "");

        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'token is missing',
            });
        }

      try{
          const decode = await jwt.verify(token, process.env.JWT_SECRET);
          console.log(decode);
          req.user = decode;
      }
      catch(error){
         return res.status(401).json({
            success: false,
            message: 'token is invalid',
         });
      }

      next();

    }
    catch(error){
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while validating the token',
        })
    }
}

exports.isStudent = async(req, res, next) => {
    try{
        if(req.user.accountType != "Student"){
            return res.status(401).json({
                success: false,
                message: "This is protected route for Student Only",

            })
        }

        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        })
    }
}


exports.isInstructor = async(req, res, next) => {
    try{
        if(req.user.accountType != "Instructor"){
            return res.status(401).json({
                success: false,
                message: "This is protected route for Student Only",

            })
        }

        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        })
    }
}

exports.isAdmin = async(req, res, next) => {
    try{
        if(req.user.accountType != "Admin"){
            return res.status(401).json({
                success: false,
                message: "This is protected route for Student Only",

            })
        }

        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        })
    }
}



