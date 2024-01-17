import React from "react";
import { useSelector } from "react-redux";

import Iconbtn from "../../../common/Iconbtn";

const RenderTotalAmount = () => {

    const {cart, total} = useSelector((state) => state.cart);

    const handleByCourse = () => {
        const courses = cart.map((course) => course._id);
        console.log("Bought these courses : ", courses);

        // TODO: In future -> API integrate ->  payment gateway tak leke jaaygi
    }

    return(
        <div className="min-w-[280px] rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
            <p className="mb-1 text-sm font-medium text-richblack-300">Total: </p>
            <p className="mb-6 text-3xl font-medium text-yellow-100">Rs {total}</p>

            <Iconbtn 
                text={"Buy Now"}
                onClick={handleByCourse}
                customClasses={"w-full justify-center "}

            />
        </div>
    );
}

export default RenderTotalAmount;