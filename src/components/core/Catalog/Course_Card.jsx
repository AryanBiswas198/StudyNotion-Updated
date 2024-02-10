import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GetAvgRating from "../../../utils/avgRating";
import RatingStars from "../../common/RatingStars";

const Course_Card = ({course, Height}) => {


    const [avgReviewCount, setAvgRatingCount] = useState(0);

    console.log("Printing Course Details -> ", course);



    useEffect(() => {
        const count = GetAvgRating(course.ratingAndReviews);
        setAvgRatingCount(count);
    }, [course]);

    return(
        <div>
            <Link to={`/courses/${course?._id}`}>
                <div>
                    <div className="rounded-lg">
                        <img 
                            src={course?.thumbnail}
                            alt="Course ka thumbnail"
                            className={`${Height} w-full rounded-xl object-cover`}
                        />
                    </div>

                    <div className="flex flex-col gap-2 px-1 py-3">
                        <p className="text-xl text-richblack-5">
                            {course?.courseName}
                        </p>

                        <p className="text-sm text-richblack-50">
                            {course?.instructor?.firstName} {course?.instructor?.lastName}
                        </p>

                        <div className="flex items-center gap-2">
                            <span className="text-yellow-5">
                                {avgReviewCount || 0}
                            </span>

                            <RatingStars Review_Count={avgReviewCount} />

                            <span className="text-richblack-400">
                                {course?.ratingAndReviews?.length} Ratings
                            </span>
                        </div>

                        <p className="text-xl text-richblack-5">
                            {course?.price}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default Course_Card;