const { generate } = require("otp-generator");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");


// ResetPasswordToken

exports.resetPasswordToken = async(req, res) => {

    // get email from req.body
    // check user for this email, email validation
    // Generate Token
    // update user by adding token and expiration time
    // create url
    // send mail containing the url
    // return response

    try{
        // Get email frm req.body
        const email = req.body.email;

        // Validate Email
        const user = await User.findOne({email});
        if(!user){
            return res.json({
                success: false,
                message: "Your email is not registered with us."
            });
        }


        // generate Token
        const token = crypto.randomUUID();

        // Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            {email:email}, 
            {
                token: token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
            {new: true});

        // Create URL
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing the url
        await mailSender(email, 
            "Password Reset Link", 
            `Password Reset Link : ${url}`);

        
        // Return response
        return res.json({
            success: true,
            message: "Email sent successfully. Please check email and change password"
        });
    }
    catch(err){
        comsole.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending reset password mail"
        });
    }
}


// ResetPassword
exports.resetPassword = async(req, res) => {

    // Data fetch
    // validation
    // Get user details from db using token
    // If no entry - invalid token
    // token time check
    // Hash Password
    // Update password -> return response


    try{
        
        // Fetch data
        const {password, confirmPassword, token} = req.body;

        // Validation
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password does not match."
            });
        }


        // Get user details using token
        const userDetails = await User.findOne({token});

        // check if invalid token
        if(!userDetails){
            return res.status(401).json({
                success: false,
                message: "Token is InValid"
            });
        }


        // Token time change
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(400).json({
                success: false,
                message: "Token is Expired. Please Re-generate your token."
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Update in db
        await User.findOneAndUpdate(
            {token: token}, 
            {password: hashedPassword},
            {new: true});



        // return res
        return res.status(200).json({
            success: true,
            message: "Password Reset Successfully"
        });
    }   
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reset password."
        })
    }
}