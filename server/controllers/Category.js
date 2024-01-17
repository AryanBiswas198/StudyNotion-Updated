const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
    try {
        // Fetch Data
        const { name, description } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                mesage: "All fields are required."
            });
        }

        // Create entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description
        });

        console.log(categoryDetails);

        return res.status(200).json({
            success: true,
            message: "Category Created Successfully"
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


// Get All categories
exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: true, description: true });

        res.status(200).json({
            success: true,
            message: "All categories returned successfully",
            data: allCategories,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: true,
            message: err.message
        });
    }
}

// Category Page Details
exports.categoryPageDetails = async (req, res) => {
    try {
        // Get Category ID
        const { categoryId } = req.body;

        // Get courses for specified category id
        const selectedCategory = await Category.findById({ _id: categoryId })
            .populate("course")
            .exec();

        // Validate
        if (!selectedCategory) {
            return res.status(400).json({
                success: false,
                message: "Data Not Found",
            });
        }

        // get courses for diff category
        const differentCategories = await Category.find(
            { _id: { $ne: categoryId } },
        )
            .populate("course")
            .exec();

        // HW: Get top selling courses



        // return res
        return res.status(200).json({
            success: true,
            message: "categories fetched",
            data: {
                selectedCategory,
                differentCategories,
            },
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