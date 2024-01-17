const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

require("dotenv").config();


// Create Course
exports.createCourse = async (req, res) => {

    // Data Fetch
    // File Fetch
    // Validation
    // Instructor Validation
    // Tag Validation
    // Upload image to cloudinary
    // create course entry in db
    // add course entry in user schema
    // add course entry in tag schema 
    // return res

    try {

        const userId = req.user.id;

        // Fetch Data
        let { 
            courseName, 
            courseDescription, 
            whatYouWillLearn, 
            price, 
            category, 
            // tag, 
            status, 
            instructions } = req.body;

        // get thumbnail
        // const thumbnail = req.files.thumbnailImage;

        // Validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are mandatory"
            });
        }

        if(!status || status === undefined){
            status = "Draft";
        }


        // Check for instructor

        const instructorDetails = await User.findById(userId, {
			accountType: "Instructor",
		});
        console.log("Instructor Details: ", instructorDetails);

        // TODO: verify that user id and instructor id are same or not

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not found"
            });
        }


        // Check for Tag validation
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found"
            });
        }


        // Upload Image to cloudinary
        // const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // console.log(thumbnailImage);


        // Create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: "abcd",
            // thumbnail: thumbnailImage.secure_url,
            category: categoryDetails._id,
            status: status,
            instructions: instructions,
        });


        // Add new course to user schema of instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );


        // add new course to category schema 
        // TODO Hw
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );


        // Return response
        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            data: newCourse,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: err.message,
        });
    }
};



// Get all course
exports.getAllCourses = async (req, res) => {
    try {

        // **
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnrolled: true,
        }).populate("instructor").exec();


        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data",
            error: err.message,
        });
    }
}


// HW: Get course Details 
exports.getCourseDetails = async (req, res) => {

    // Fetch ID from req body and validate
    // find all course details using populate 
    // return res
    try {
        const { courseId } = req.body;

        // Find course detail
        const courseDetails = await Course.find(
            { _id: courseId })
            .populate(
                {
                    path: "instructor",
                    populate: {
                        path: "additionalDetails",
                    },
                }
            )
            .populate("category")
            .populate("ratingAndReviews")
            .populate(
                {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                }
            )
            .exec();


        // Validate
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with course id ${courseId}`,
            });
        }

        // return res
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails,
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