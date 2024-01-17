import React from "react";

const HighlightText = ({text}) => {

    return(
        // HW : Add gradient color
        <span className="font-bold text-blue-100">
            {" "}
            {text}
        </span>
    );
}

export default HighlightText;