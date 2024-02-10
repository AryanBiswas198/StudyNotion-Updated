const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");

exports.updateCourseProgress = async(req, res) => {

    const {courseId, subSectionId} = req.body;
    const userId = req.user.id;

    try{
        // Check if the subsection is Valid
        const subSection = await SubSection.findById(subSectionId);

        if(!subSection){
            return res.status(404).json({
                error: "Invalid SubSection",
            })
        }

        // Check for Old Entry
        let courseProgress = await CourseProgress.findOne({
            courseId: courseId,
            userId: userId,
        });

        if(!courseProgress){
            return res.status(404).json({
                success: false,
                message: "Course Progress does not exists",
            });
        }
        else{
            // Check for re-completed videos/subsection
            if(courseProgress.completedVideos.includes(subSectionId)){
                return res.status(400).json({
                    error: "SubSection Already Completed",
                });
            }

            // Push into completed Videos
            courseProgress.completedVideos.push(subSectionId);
        }
        await courseProgress.save();

        return res.status(200).json({
            success: true,
            message: "SubSection Marked as Complete !!",
            // data: courseProgress,
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
}