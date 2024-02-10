import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Iconbtn from "../../common/Iconbtn";
import { IoIosArrowBack } from "react-icons/io";
import { BsChevronDown } from "react-icons/bs";

const VideoDetailsSidebar = ({ setReviewModal }) => {


    const [activeStatus, setActiveStatus] = useState("");
    const [videoBarActive, setVideoBarActive] = useState("");
    const navigate = useNavigate();
    const { sectionId, subSectionId } = useParams();
    const location = useLocation();

    const {
        courseSectionData,
        courseEntireData,
        completedLectures,
        totalNoOfLectures,
    } = useSelector((state) => state.viewCourse);


    useEffect(() => {
        // Another way of writing useEffect without the need of calling the function
        // ;(() => {
        // Code to be written
        // })()

        const setActiveFlags = () => {
            console.log("Printing course section data -> ", courseSectionData);
            if (!courseSectionData.length) {
                return;
            }

            const currentSectionIndex = courseSectionData.findIndex(
                (data) => data._id === sectionId
            );

            const currentSubSectionIndex = courseSectionData?.[currentSectionIndex]?.subSection.findIndex(
                (data) => data._id === subSectionId
            );

            const activeSubSectionId = courseSectionData?.[currentSectionIndex]?.subSection?.[currentSubSectionIndex]?._id;

            // Set current section here
            setActiveStatus(courseSectionData?.[currentSectionIndex]?._id);

            // Set Current subSection here
            setVideoBarActive(activeSubSectionId);
        }
        setActiveFlags();
    }, [courseSectionData, courseEntireData, location.pathname]);


    return (
        <>
            <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
                {/* For buttons and heading */}
                <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
                    {/* For buttons */}
                    <div className="flex w-full items-center justify-between ">
                        {/* HW: Add back icon */}
                        <div onClick={() =>
                            navigate("/dashboard/enrolled-courses")}
                            className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90"
                            title="back"
                        >
                            <IoIosArrowBack size={30} />
                        </div>

                        <Iconbtn
                            text="Add Review"
                            customClasses="ml-auto"
                            onClick={() => setReviewModal(true)}
                        />
                    </div>


                    {/* For heading or title */}
                    <div className="flex flex-col">
                        <p>{courseEntireData?.courseName}</p>
                        <p className="text-sm font-semibold text-richblack-500">
                            {completedLectures?.length} / {totalNoOfLectures}
                        </p>
                    </div>
                </div>

                {/* For sections and subSections */}
                <div className="h-[calc(100vh - 5rem)] overflow-y-auto">
                    {
                        courseSectionData.map((section, index) => (
                            <div
                                className="mt-2 cursor-pointer text-sm text-richblack-5"
                                onClick={() => setActiveStatus(section?._id)}
                                key={index}

                            >
                                {/* section */}
                                <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                                    <div className="w-[70%] font-semibold">
                                        {section?.sectionName}
                                    </div>

                                    {/* HW: Add Arrow icon here and handle rotate 180 logic */}

                                    <div className="flex items-center gap-3">
                                        {/* <span className="text-[12px] font-medium">
                    Lession {course?.subSection.length}
                  </span> */}
                                        <span
                                            className={`${activeStatus === section?.sectionName
                                                ? "rotate-0"
                                                : "rotate-180"
                                                } transition-all duration-500`}
                                        >
                                            <BsChevronDown />
                                        </span>
                                    </div>
                                </div>

                                {/* Sub Sections */}
                                {
                                    activeStatus === section?._id && (
                                        <div className="transition-[height] duration-500 ease-in-out">
                                            {
                                                section.subSection.map((topic, index) => (
                                                    <div key={index}
                                                        className={`flex gap-3 px-5 py-2 ${videoBarActive === topic._id
                                                            ? "bg-yellow-200 font-semibold text-richblack-800"
                                                            : "hover:bg-richblack-900"
                                                            }`}
                                                        onClick={() => {
                                                            navigate(`/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`);

                                                            setVideoBarActive(topic?._id);
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={completedLectures.includes(topic?._id)}
                                                            onChange={() => { }}
                                                        />
                                                        {topic.title}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}

export default VideoDetailsSidebar;