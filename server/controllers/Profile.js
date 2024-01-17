const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// We do not have to create the function 'Create Profile' because we have already created the profile Details in the Auth controller -> Signup function

exports.updateProfile = async (req, res) => {

    // Get data
    // Get User id
    // Validate
    // Find Profile
    // Update Profile because profile already created
    // return res

    try {
        // Fetch Data
        const { gender, dateOfBirth, about, contactNo } = req.body;

        // Get User ID
        const id = req.user.id;

        // Validate
        // if (!gender || !contactNo || !id) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Please Enter the required input fields",
        //     });
        // }

        // Find Profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;

        const profileDetails = await Profile.findById(profileId);

        // Update profile -> using save method
        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNo = contactNo;

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            profileDetails,
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

// Delete Profile
exports.deleteAccount = async (req, res) => {

    // fetch id
    // validation
    // delete Profile
    // Delete user
    // return res
    try {
        // fetch ID
        const id = req.user.id;

        // Validate
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete Profile
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        // TODO HW: unenroll user from all enrolled courses

        // Delete User

        await User.findByIdAndDelete({ _id: id });

        return res.status(200).json({
            success: true,
            message: "Profile Account deleted successfully",
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


exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        console.log(userDetails);

        res.status(200).json({
            success: true,
            message: "User Data Fetched Successfully",
            data: userDetails,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
            userDetails,
        });
    }
};


exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;

        const userId = req.user.id;

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );
        console.log(image);

        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        );

        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        });
    } 
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
        // Get user id
        const userId = req.user.id;

        // Find User details from model
        const userDetails = await User.findOne({ _id: userId }).populate("courses").exec();

        // Validate
        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // return res+data
        return res.status(200).json({
            success: true,
            message: "Course found",
            data: userDetails.courses,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
};