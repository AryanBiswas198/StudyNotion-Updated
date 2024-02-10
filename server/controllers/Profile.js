const Profile = require("../models/Profile");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const mongoose = require("mongoose");

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
        const {
            firstName = "",
            lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
        } = req.body;

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

        const user = await User.findByIdAndUpdate(id, {
            firstName,
            lastName,
        });

        await user.save();

        // Update profile -> using save method
        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();


        // Find the updated user details
        const updatedUserDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec();

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            updatedUserDetails,
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
        await Profile.findByIdAndDelete({ _id: new mongoose.Types.ObjectId(userDetails.additionalDetails) });

        // TODO HW: unenroll user from all enrolled courses
        for (const courseId of userDetails.courses) {
            await Course.findByIdAndUpdate(
              courseId,
              { $pull: { studentsEnrolled: id } },
              { new: true }
            )
          }

        // Delete User

        await User.findByIdAndDelete({ _id: id });

        await CourseProgress.deleteMany({ userId: id })

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
        let userDetails = await User.findOne(
            { _id: userId })
            .populate({
                path:"courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            })
            .exec();

            // console.log("Printing userDetails -> ", userDetails);

        userDetails = userDetails.toObject();

        var SubsectionLength = 0;
        for (var i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0;
            SubsectionLength = 0;
            for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                    j
                ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                SubsectionLength +=
                    userDetails.courses[i].courseContent[j].subSection.length
            }

            let courseProgressCount = await CourseProgress.findOne({
                courseId: userDetails.courses[i]._id,
                userId: userId,
            })

            courseProgressCount = courseProgressCount?.completedVideos.length
            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100;
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2);
                userDetails.courses[i].progressPercentage =
                    Math.round(
                        (courseProgressCount / SubsectionLength) * 100 * multiplier
                    ) / multiplier
            }
        }



        // Validate
        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: `Could not find user with Id ${userDetails}`,
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


exports.instructorDashboard = async(req, res) => {
    try{
        const courseDetails = await Course.find({instructor: req.user.id});

        const courseData = courseDetails.map((course) => {

            const totalStudentsEnrolled = course.studentsEnrolled.length;
            const totalAmountGenerated = totalStudentsEnrolled * course.price;

            // Create a new object with the additional Fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                totalStudentsEnrolled,
                totalAmountGenerated,
            };

            return courseDataWithStats;
        })

        return res.status(200).json({
            success: true,
            courses: courseData,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}