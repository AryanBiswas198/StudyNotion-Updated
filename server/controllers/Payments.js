const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const crypto = require("crypto");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const mongoose = require("mongoose");
const CourseProgress = require("../models/CourseProgress");


// Initiate the razorpay order
exports.capturePayment = async(req, res) => {

    const {courses} = req.body;
    const userId = req.user.id;

    if(courses.length === 0){
        return res.json({
            success: false,
            message: "Please Provide Course ID",
        });
    }

    let totalAmount = 0;

    for(const course_id of courses){
        let course;
        try{
            // console.log("Printing Course ID -> ", course_id);
            course = await Course.findById(course_id);
            if(!course){
                return res.status(400).json({
                    success: false,
                    message: "Could not find the course",
                });
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(401).json({
                    success: false,
                    message: "Student is already enrolled",
                });
            }

            totalAmount += course.price;
        }   
        catch(err){
            console.log(err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

    const options = {
        amount: totalAmount*100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),
    }

    try{
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success: true,
            message: paymentResponse,
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



// Verify the payment
exports.verifyPayment = async(req, res) => {

    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;

    const courses = req.body?.courses;
    const userId = req.user.id;


    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId){
        return res.status(401).json({
            success: false,
            message: "Payment failed",
        });
    }


    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");


    if(expectedSignature === razorpay_signature){

        // Enroll karwao student ko
        await enrollStudents(courses, userId, res);


        // return res
        return res.status(200).json({
            success: true,
            message: "Payment verified",
        });
    }

    return res.status(400).json({
        success: false,
        message: "Payment Failed",
    });
}


const enrollStudents = async(courses, userId, res) => {
    
    if(!courses || !userId){
        return res.status(400).json({
            success: false,
            message: "Please Provide data for Courses or UserId",
        });
    }

    
    for(const courseId of courses){
        try{
            // Find the course and enroll the student
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {
                    $push: {
                        studentsEnrolled: userId,
                    },
                },
                {new: true},
            );

            if(!enrolledCourse){
                return res.status(400).json({
                    success: false,
                    message: "Course Not Found",
                });
            }


            const courseProgress = await CourseProgress.create({
                courseId: courseId,
                userId: userId,
                completedVideos: [],
            })

        
            // Find the Student and add the course to their list of enrolledCourses
            const enrolledStudent = await User.findByIdAndUpdate(userId,
                {
                    $push: {
                        courses: courseId,
                        courseProgress: courseProgress._id,
                    },
                },
                {new:true},
            );

            // Send mail to the student
            const emailResponse = await mailSender(enrollStudents.email, 
                `Successfully enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName} ${enrolledStudent.lastName} `)    
            );

            // console.log("Email sent successfully ", emailResponse.response);
        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
}


exports.sendPaymentSuccessEmail = async(req, res) => {

    const {orderId, paymentId, amount} = req.body;
    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId){
        return res.status(400).json({
            success: false,
            message: "Please provide all the details!",
        });
    }

    try{
        //Student ko dhundho
        const enrolledStudent = await User.findById(userId);

        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(`${enrolledStudent.firstName} ${enrolledStudent.lastName}`, amount/100, orderId, paymentId),
        );
    }
    catch(err){
        console.log("Error in sending Mail");
        return res.status(500).json({
            success: false,
            message: "Could not send Email",
        });
    }
}






// // capture the payment and initiate the razorpay order
// exports.capturePayment = async(req, res) => {
    
//     // Get both course id and user id
//     const userId = req.user.id;
//     const {courseId} = req.body;

//     // Validate #Note: Since user will already be logged in, no need to validate user
//     // valid course id 
//     if(!courseId){
//         return res.status(400).json({
//             success: false,
//             message: "Please provide valid Course Id",
//         });
//     }
    

//     // valid course details
//     let course;
//     try{
//         course = await Course.findById(courseId);
//         if(!course){
//             return res.json({
//                 success: false,
//                 message: "Could not find the course",
//             });
//         }

//         // User already paid for the same course or not
//         const uid = new mongoose.Types.ObjectId(userId);
//         if(course.studentsEnrolled.includes(uid)){
//             return res.status(400).json({
//                 success: false,
//                 message: "Student is already enrolled",
//             });
//         }
//     }
//     catch(err){
//         console.log(err);
//         return res.status(500).json({
//             success: true,
//             message: err.message,
//         });
//     }


//     // create order
//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//         amount: amount*100,
//         currency,
//         receipt: Math.random(Date.now()).toString(),
//         notes: {
//             courseId,
//             userId,
//         }
//     };
    

//     try{
//         // initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);

//         return res.status(200).json({
//             success: true,
//             courseName: course.courseName,
//             courseDescription: course.courseDescription,
//             courseThumbnail: course.thumbnail,
//             orderId: paymentResponse.id,
//             amount: paymentResponse.amount,
//             currency: paymentResponse.currency,
//         });
//     }
//     catch(err){
//         console.log(err);
//         return res.status(500).json({
//             success: false,
//             message: "Could not initiate order",
//         });
//     } 
// };


// // Verify Signature of razorpay and server
// exports.verifySignature = async(req, res) => {
    
//     const webhookSecret = "12345678";
//     const signature = req.headers["x-razorpay-signature"];

//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature === digest){
//         console.log("Payment is authorized");

//         const {userId, courseId} = req.body.payload.payment.entity.notes;

//         try{
//             // fulfill the action

//             // Find the course and enroll the student in it
//             const enrolledCourse = await Course.findByIdAndUpdate(
//                                     {_id: courseId},
//                                     {
//                                         $push: {
//                                             studentsEnrolled: userId,
//                                         }
//                                     },
//                                     {new: true},
//             );

//             if(!enrolledCourse){
//                 return res.status(500).json({
//                     success: false,
//                     message: "Course not found"
//                 });
//             }

//             console.log(enrolledCourse);

//             // Find the student and enroll the course in it
//             const enrolledStudent = await User.findByIdAndUpdate(
//                                     {_id: userId},
//                                     {
//                                         $push:{
//                                             courses: courseId,
//                                         }
//                                     },
//                                     {new: true},
//             );

//             if(!enrolledStudent){
//                 return res.status(500).json({
//                     success: false,
//                     message: "User not found",
//                 });
//             }

//             console.log(enrolledStudent);


//             // Mail send krdo confirmation wala
//             const emailResponse = await mailSender(
//                                     enrolledStudent.email,
//                                     "Congratulations, from StudyNotion",
//                                     "Congratulations, you are onboarded into new StudyNotion Course",
//             );

//             return res.status(200).json({
//                 success: true,
//                 message: "Signature verified and course added",
//             });
//         }
//         catch(err){
//             console.log(err);
//             return res.status(500).json({
//                 success: false,
//                 message: err.message,
//             });
//         }
//     }
//     else{
//         return res.status(400).json({
//             success: false,
//             message: "Invalid request",
//         });
//     }
// }