const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const mailSender = require("../utils/mailSender");
require("dotenv").config();


// Send Otp Handler

exports.sendOtp = async (req, res) => {
    try {
        // Fetch email from req body
        const { email } = req.body;

        // Check if user already exists
        const checkUserPresent = await User.findOne({ email });

        // If User already exists, return response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User ALready Registered",
            });
        }

        // Generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowercaseAlphabets: false,
            specialChars: false,
        });

        console.log("OTP Generated : ", otp);


        // Check unique OTP or not
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }


        const otpPayload = { email, otp };

        // Create an entry in DB for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);


        // Return Response
        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}


// signup Handler

exports.signup = async (req, res) => {
    // Data fetch from req body
    // Validate karo
    // 2 password match karwao
    // check user already exists

    // find most recent otp stored for the user
    // Validate Otp

    // Hash Password
    // entry create krdi in db

    // res return
    try {
        // Fetch Data from req body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;


        // Validate Data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are incomplete"
            });
        }

        // Check if password matches or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password doesn't match. Please Try Again !!"
            });
        }

        // Check if user Exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Already exists"
            })
        }


        // findmost recent otp stored
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        // Validate OTP
        if (recentOtp.length === 0) {
            // OTP Not found
            return res.status(400).json({
                success: false,
                message: "OTPP not found",
            });
        }
        else if (otp !== recentOtp[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }


        // Hash Pass
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Entry in db
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNo: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // return res
        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            user,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(502).json({
            success: false,
            message: "User cannot be registered. Please try again",
        });
    }
}



// login
exports.login = async (req, res) => {

    // Get data from req body
    // validate data
    // user exists or not
    // generate JWT after password matching
    // Create cookie and send response
    try {
        // Get Data
        const { email, password } = req.body;

        // Validate Data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All Fields are required. Please Try Again"
            });
        }

        // User exists or not
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered. Please SignUp First"
            });
        }

        // Match password and generate token
        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });

            user.token = token;
            user.password = undefined;

            // Create Cookie and send response

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged In Successfully",
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is Incorrect",
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Login Failure. Please Try again",
        });
    }
}



// change pass
// TODO HOMEWORK
exports.changePassword = async (req, res) => {

    // Get data from req body
    // get oldpass, new pass and confirm new pass
    // validation

    // Update pass in db
    // sendMail - password updated
    // return response


    try {

        // Get data frm req body
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const userDetails = await User.findById(req.user.id);

        // Validate
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(403).json({
                success: false,
                message: "Input fields incomplete, Please enter all the fields."
            });
        }

        // Compare Pass
        if (await bcrypt.compare(currentPassword, userDetails.password)) {

            if (newPassword !== confirmNewPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password and confirm password does not match",
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatedUserDetails = await User.findByIdAndUpdate(req.user.id,
                { password: hashedPassword },
                { new: true });


            // Send Email to user
            try {
                const mailResponse = await mailSender(updatedUserDetails.email,
                    passwordUpdated(updatedUserDetails.email,
                        `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`));
                console.log(mailResponse.response);
            }
            catch (err) {
                console.log("Error occured while sending email: ", err);
                return res.status(500).json({
                    success: false,
                    message: "Error occured while sending email", 
                    error: err.message,
                });
            }

            // Return res
            return res.status(200).json({
                success: true,
                message: "Password Updated Successfully"
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Current Password does not match."
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went Wrong, Please Try Again"
        });
    }
}