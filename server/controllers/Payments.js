const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const crypto = require("crypto");


// capture the payment and initiate the razorpay order
exports.capturePayment = async(req, res) => {
    
    // Get both course id and user id
    const userId = req.user.id;
    const {courseId} = req.body;

    // Validate #Note: Since user will already be logged in, no need to validate user
    // valid course id 
    if(!courseId){
        return res.status(400).json({
            success: false,
            message: "Please provide valid Course Id",
        });
    }
    

    // valid course details
    let course;
    try{
        course = await Course.findById(courseId);
        if(!course){
            return res.json({
                success: false,
                message: "Could not find the course",
            });
        }

        // User already paid for the same course or not
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(400).json({
                success: false,
                message: "Student is already enrolled",
            });
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: true,
            message: err.message,
        });
    }


    // create order
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId,
            userId,
        }
    };
    

    try{
        // initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            courseThumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            amount: paymentResponse.amount,
            currency: paymentResponse.currency,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Could not initiate order",
        });
    } 
};


// Verify Signature of razorpay and server
exports.verifySignature = async(req, res) => {
    
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment is authorized");

        const {userId, courseId} = req.body.payload.payment.entity.notes;

        try{
            // fulfill the action

            // Find the course and enroll the student in it
            const enrolledCourse = await Course.findByIdAndUpdate(
                                    {_id: courseId},
                                    {
                                        $push: {
                                            studentsEnrolled: userId,
                                        }
                                    },
                                    {new: true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message: "Course not found"
                });
            }

            console.log(enrolledCourse);

            // Find the student and enroll the course in it
            const enrolledStudent = await User.findByIdAndUpdate(
                                    {_id: userId},
                                    {
                                        $push:{
                                            courses: courseId,
                                        }
                                    },
                                    {new: true},
            );

            if(!enrolledStudent){
                return res.status(500).json({
                    success: false,
                    message: "User not found",
                });
            }

            console.log(enrolledStudent);


            // Mail send krdo confirmation wala
            const emailResponse = await mailSender(
                                    enrolledStudent.email,
                                    "Congratulations, from StudyNotion",
                                    "Congratulations, you are onboarded into new StudyNotion Course",
            );

            return res.status(200).json({
                success: true,
                message: "Signature verified and course added",
            });
        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
    else{
        return res.status(400).json({
            success: false,
            message: "Invalid request",
        });
    }
}