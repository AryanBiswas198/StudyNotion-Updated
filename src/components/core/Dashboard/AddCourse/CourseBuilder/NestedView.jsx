import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {RxDropdownMenu} from "react-icons/rx";


const NestedView = ({handleChangeEditSectionName}) => {


    const {course} = useSelector((state) => state.course);
    const {token} = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("Rendering in nestedView");
    }, []);

    const [addSubSection, setAddSubSection] = useState(null);
    const [viewSubSection, setViewSubSection] = useState(null);
    const [editSubSection, setEditSubSection] = useState(null);

    const [confirmationModal, setconfirmationModal] = useState(null);

    return(
        <div>
            <div>
                {
                    course.courseContent?.map((section) => (

                        <details key={section._id} open>

                            <summary className="flex items-center justify-between gap-x-3 border-b-2">
                                <div>
                                    <RxDropdownMenu />
                                    <p>{section.sectionName}</p>
                                </div>
                            </summary>
                        </details>
                    ))
                }
            </div>
        </div>
    );
}

export default NestedView;