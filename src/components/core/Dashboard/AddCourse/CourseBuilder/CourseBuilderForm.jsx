import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Iconbtn from "../../../../common/Iconbtn";
import { GrAddCircle } from "react-icons/gr";
import { useSelector } from "react-redux";
import { BiRightArrow } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { setCourse, setEditCourse, setStep } from "../../../../../slices/courseSlice";
import { toast } from "react-hot-toast";
import { createSection, updateSection } from "../../../../../services/operations/courseDetailsAPI";
import NestedView from "./NestedView";


const CourseBuilderForm = () => {

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [editSectionName, setEditSectionName] = useState(null);
    const { course, editCourse } = useSelector((state) => state.course);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { token } = useSelector((state) => state.auth);
    
    useEffect(() => {
        console.log("rendering course builder form");
    }, []);

    const onSubmit = async (data) => {

        console.log("Function Called");
        

        setLoading(true);
        let result;

        if (editSectionName) {
            // We are editing the section name
            console.log("INside editSection if");
            result = await updateSection(
                {
                    sectionName: data.sectionName,
                    sectionId: editSectionName,
                    courseId: course._id,
                }, token
            );
        }
        else {
            console.log("Inside else");
            const finalResult = await createSection(
                {
                    sectionName: data.sectionName,
                    courseId: course._id,
                }, token
            );
            console.log("Printing Final Result -> ", finalResult);
            // dispatch(setCourse(result));
            // setEditSectionName(null);
            // setValue("sectionName", "");
        }

        console.log("Printing result --> ", result);


        // Update Values
        if (result) {
            dispatch(setCourse(result));
            setEditSectionName(null);
            setValue("sectionName", "");
        }
        else {
            console.error("Unexpected result from the backend:", result);
        }

        // SetLoading -> False
        setLoading(false);
    }


    const cancelEdit = () => {
        setEditSectionName(null);
        setValue("sectionName", "");
    }

    const goBack = () => {
        dispatch(setStep(1));
        dispatch(setEditCourse(true));
    }

    const goToNext = () => {
        if (course?.courseContent?.length === 0) {
            toast.error("Please add atleast one section");
            return;
        }

        if (course.courseContent.some((section) => section.subSection.length === 0)) {
            toast.error("Please add atleast one lecture in each section");
            return;
        }

        // If everything is good
        dispatch(setStep(3));
    }



    const handleChangeEditSectionName = (sectionId, sectionName) => {

        if (editSectionName === sectionId) {
            cancelEdit();
            return;
        }
        setEditSectionName(sectionId);
        setValue("sectionName", sectionName);
    }



    return (
        <div className="text-white">
            <p>Course Builder</p>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="sectionName">Section name<sup>*</sup></label>
                    <input
                        id="sectionName"
                        placeholder="Add Section Name"
                        {...register("sectionName", { required: true })}
                        className="w-full"
                    />
                    {
                        errors.sectionName && (
                            <span>Section Name is Required</span>
                        )
                    }
                </div>

                <div className="mt-10 flex w-full">
                    <Iconbtn
                        type="Submit"
                        text={editSectionName ? "Edit Section Name" : "Create Section"}
                        outline={true}
                        customClasses={"text-white"}
                    >
                        <GrAddCircle className="text-yellow-50" />
                    </Iconbtn>

                    {
                        editSectionName && (
                            <button type="button" onClick={cancelEdit}
                                className="text-sm text-richblack-300 underline ml-10"
                            >
                                Cancel Edit
                            </button>
                        )
                    }
                </div>
            </form>


            {/* <NestedView handleChangeEditSectionName={handleChangeEditSectionName} /> */}

            {/* <h1>{course?.courseContent?.length}</h1>
            {JSON.stringify(course)} */}

            {
                course.courseContent.length > 0 && (
                    <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
                )
            }


            <div className="flex justify-end gap-x-3">
                <button onClick={goBack} className="rounded-md cursor-pointer flex items-center ">
                    Back
                </button>

                <Iconbtn text={"Next"} onClick={goToNext}>
                    <BiRightArrow />
                </Iconbtn>
            </div>

        </div>
    );
}


export default CourseBuilderForm;