const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const User = require("../models/User");

// Create Rating and review
exports.createRating = async (req, res) => {
    try {
        // Fetch User id and data
        const userId = req.user.id;
        const { rating, review, courseId } = req.body;

        // Validate
        if (!rating || !review || !userId || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Please enter all input fields.',
            });
        }


        let course = await Course.findById({ _id: courseId });
        if (!course) {
            return res.status(400).json({
                success: false,
                message: "course not found",
            });
        }

        // check if User is enrolled or not
        const uid = new mongoose.Types.ObjectId(userId);
        const cid = new mongoose.Types.ObjectId(courseId);

        if (!course.studentsEnrolled.includes(uid)) {
            return res.status(400).json({
                success: false,
                message: "User is not enrolled in this course",
            });
        }

        // Check if user has already reviewed the course or not
        if (course.ratingAndReviews.includes(uid) || course.ratingAndReviews.includes(cid)) {
            return res.status(403).json({
                success: false,
                message: "User has already reviewed this particular course",
            });
        }

        // Create rating and review
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course: courseId,
            user: userId,
        });

        // Update course with this rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            { _id: courseId },
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            { new: true },
        );

        console.log(updatedCourseDetails);

        // Return response
        return res.status(200).json({
            success: true,
            message: "Rating and Review Created Successfully",
            ratingReview,
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


// Get average rating
exports.getAverageRating = async (req, res) => {
    // Get course id
    // Calculate average rating
    // return avg rating and res
    try {
        // Get course Id
        const courseId = req.body.courseId;

        // Calc Average Rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                }
            }
        ]);

        // After this operation, the result contains a single answer in the form of an array, stored in the zeroTh index.

        // Return rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }

        // if no rating or review exists
        return res.status(200).json({
            success: true,
            message: `Average rating is 0, no ratings given till now`,
            averageRating: 0,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


// Get all rating and reviews
exports.getAllRatingReview = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName",
            })
            .exec();


        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
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


// HW: Get all ratings and reviews based upon a specific course or it's courseId
exports.getSpecificRating = async (req, res) => {
    try {
        const { courseId } = req.body;

        const specificReviews = await RatingAndReview.findById({ _id: courseId })
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName",
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: `All reviews of this course fetched successfully`,
            data: specificReviews,
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