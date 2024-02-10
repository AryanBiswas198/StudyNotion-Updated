const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSectionModal = require("../models/SubSection");

// create 
exports.createSection = async(req, res) => {

    // Data fetch
    // Data Validate
    // Create Section
    // Update section objectid in course schema
    // return res

    try{
        // Fetch data

        const {sectionName, courseId} = req.body;

        // console.log(sectionName, courseId);


        // Validate
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: "Please enter all input fields"
            });
        }

        // Create section
        const newSection = await Section.create({sectionName});

        // update in course schema the section objectid
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push: {
                                                    courseContent: newSection._id,
                                                },
                                            },
                                            {new: true}
                                    )
                                    .populate({
                                        path: "courseContent",
                                        populate: {
                                            path: "subSection",
                                        },
                                    })
                                    .exec();


        const mainCourse = await Course.findById(courseId);
        const sectionLength = mainCourse.courseContent.length;

        // HW: use populate to replace both section/sub-section in the updatedCourseDetails

        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourseDetails,
            sectionLength,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}


// Update section
exports.updateSection = async(req, res) => {

    // Data Input
    // validation
    // Update data
    // return res

    try{
        // Fetch Updated Data
        const {sectionName, sectionId, courseId} = req.body;


        // Update on the basis of id
        const section = await Section.findByIdAndUpdate(
                            sectionId, 
                            {sectionName},
                            {new: true},
        );

        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: section,
            data: course,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}


// Delete Section
exports.deleteSection = async(req, res) => {
    try{
        // Fetch Data -- assuming we are sending id from params
        const {sectionId, courseId} = req.body;

        await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})

        // Delete Section
        const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

        //delete sub section
		await SubSectionModal.deleteMany({_id: {$in: section.subSection}});

        await Section.findByIdAndDelete(sectionId);

        // TODO: do we need to delete the entry from the course schema?? [Testing]

        //find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            data: course,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}