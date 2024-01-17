import React from "react";
import { Link } from "react-router-dom";

const Button = ({children, active, linkto}) => {
    return(
        <Link to={linkto}>
            {/* HW: Add box-shadow - DONE */}
            <div style={{boxShadow: '-2px -2px 0px 0px rgba(255, 255, 255, 0.51) inset'}} className={`text-center text-[13px] px-6 py-3 rounded-md font-bold ${active ? "bg-yellow-50 text-black" : "bg-richblack-800"}
            hover:scale-95 transition-all duration-200 `}>
                {children}
            </div>        
        </Link>
    );
}

export default Button;