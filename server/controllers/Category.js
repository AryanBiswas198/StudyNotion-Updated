const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

exports.createCategory = async (req, res) => {
    try {
        // Fetch Data
        const { name, description } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                mesage: "All fields are required."
            });
        }

        // Create entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description,
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
        const allCategories = await Category.find({});

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

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Category ID",
            });
        }

        // Get courses for specified category id
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "course",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            })
            .exec();

        // Validate
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category Not Found",
            });
        }

        // Handle the case when there are no courses
        // if (selectedCategory.course.length === 0) {
        //     console.log("No courses found for the selected category.");
        //     return res.status(404).json({
        //         success: false,
        //         message: "No courses found for the selected category.",
        //     });
        // }

        // get courses for diff category
        const categoriesExceptSelected = await Category.find(
            { _id: { $ne: categoryId } },
        )

        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
                ._id
        )
            .populate({
                path: "course",
                match: { status: "Published" },
            })
            .exec()

        // HW: Get top selling courses
        const allCategories = await Category.find()
            .populate({
                path: "course",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                },
            })
            .exec();

        console.log("All Categories Data -> ", allCategories);

        const allCourses = allCategories.flatMap((category) => category.course);

        console.log("AllCourses Data -> ", allCourses);

        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        console.log("Most Selling Courses data -> ", mostSellingCourses);



        // return res
        return res.status(200).json({
            success: true,
            message: "categories fetched",
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses
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