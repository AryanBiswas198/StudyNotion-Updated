const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

require("dotenv").config();

// Create Sub Section
exports.createSubSection = async(req, res) => {
    
    // Data fetch
    // Extract URL
    // validate
    // Upload video to cloudinary -> secure_url
    // Create a sub section
    // Update sub section ki id in the section schema
    // return res

    try{
        // Data fetch
        const {title, timeDuration, description, sectionId} = req.body;

        // Extract URL
        const video = req.files.videoFile;

        // Validate
        if(!title || !timeDuration || !description || !video || !sectionId){
            return res.status(404).json({
                success: false,
                message: "Input field are incomplete. Please fill all the details."
            });
        }

        // Upload to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // Create Sub Section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });

        // update subsection in section schema
        const updatedSection = await Section.findByIdAndUpdate(
                                            {_id: sectionId},
                                            {
                                                $push: {
                                                    subSection: subSectionDetails._id,
                                                }
                                            },
                                            {new:true},
                                        ).populate("subSection")

        return res.status(200).json({
            success: true,
            message: "Sub Section created successfully",
            data: updatedSection,
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


//HW Update sub section 
exports.updateSubSection = async(req, res) => {

    // Data Fetch
    // Url fetch
    // Validate
    // check if url sub section is updated, if yes, upload to uploadImageToCloudinary
    // update sub section and return res

    try{
        const {sectionId, title, description} = req.body;
        const subSection = await SubSection.findById(sectionId);

        if(!subSection){
            return res.status(400).json({
                success: false,
                message: "SubSection not found",
            });
        }

        if(title !== undefined){
            subSection.title = title;
        }

        if(description !== undefined){
            subSection.description = description;
        }

        if(req.files && req.files.video !== undefined){
            const video = req.files.video;
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
        }

        await subSection.save();

        return res.status(200).json({
            success: true,
            message: "Sub Section updated successfully",
        });
    }   
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "Error aara hai",
        });
    }
}


//HW delete sub section
exports.deleteSubSection = async(req, res) => {
    try{
        // Fetch subSection Id
        const {subSectionId, sectionId} = req.body;

        // Delete from section first
        await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $pull: {
                    subSection: subSectionId,
                }
            },
        );

        // Delete from schema
        const subSection = await SubSection.findByIdAndDelete({_id: subSectionId});

        if(!subSection){
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Sub Section deleted successfully",
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