import React, { useEffect, useState } from "react";
import { Link, matchPath } from "react-router-dom";
import logo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import ProfileDropDown from "../core/Auth/ProfileDropDown";
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/apis";
import { FaAngleDown } from "react-icons/fa6";


const subLinks = [
    {
        title: "Python",
        link: "/catalog/python",
    },
    {
        title: "Web dev",
        link: "/catalog/web-development",
    },
]


const Navbar = () => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const { totalItems } = useSelector((state) => state.cart);

    // const [subLinks, setSubLinks] = useState([]);

    // const fetchSublinks = async() => {
    //     try {
    //         const result = await apiConnector("GET", categories.CATEGORIES_API);
    //         console.log("Printing sub link result", result);
    //         setSubLinks(result.data.data);
    //     }
    //     catch (err) {
    //         console.log("Couldn't fetch the categories list");
    //     }
    // }

    // useEffect(() => {
    //     fetchSublinks();
    // }, []);


    const location = useLocation();
    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname);
    }

    return (
        <div className="flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700">
            <div className="flex w-11/12 max-w-maxContent items-center justify-between">

                <Link to={'/'}>
                    <img src={logo} alt="" width={160} height={42} loading="lazy"/>
                </Link>


                {/* Nav links */}
                <nav>
                    <ul className="flex gap-x-6 text-richblack-25">
                        {
                            NavbarLinks.map((link, index) => {
                                return (
                                    <li key={index}>
                                        {
                                            link.title === 'Catalog' ? (
                                                <div className="relative flex flex-row items-center gap-2 group">
                                                    <p>{link.title}</p>
                                                    <FaAngleDown />

                                                    <div className="invisible absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[80%] flex flex-col rounded-md bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 lg:w-[300px]">
                                                        {/* For triangluar bg */}
                                                        <div className="absolute left-[50%] top-0 translate-x-[80%] translate-y-[-45%] h-6 w-6 rotate-45 rounded bg-richblack-5"> </div>

                                                        {
                                                            subLinks.length ? (
                                                                subLinks.map((subLink, index) => {
                                                                    return (
                                                                        <Link to={`${subLink.link}`} key={index}> 
                                                                            <p>{subLink.title}</p>
                                                                        </Link>
                                                                    );
                                                                })
                                                            ) : (<div></div>)
                                                        }

                                                    </div>
                                                </div>
                                            ) :
                                                (
                                                    <Link to={link?.path}>
                                                        <p className={`${matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}`}>
                                                            {link.title}
                                                        </p>
                                                    </Link>
                                                )
                                        }
                                    </li>
                                );
                            })
                        }
                    </ul>
                </nav>



                {/* Login/Signup/Dashboard */}
                <div className="flex gap-x-4 items-center">
                    {
                        user && user?.accountType != "Instructor" && (
                            <Link to={"/dashboard/cart"} className="relative">
                                {/* HW: ADD Styling below */}
                                <AiOutlineShoppingCart />
                                {
                                    totalItems > 0 && (
                                        <span>
                                            {totalItems}
                                        </span>
                                    )
                                }
                            </Link>
                        )
                    }

                    {
                        token === null && (
                            <Link to={"/login"}>
                                <button className="border border-richblack-700 bg-richblack-800 px-[12px] py-[12px] text-richblack-100 rounded">
                                    Log in
                                </button>
                            </Link>
                        )
                    }

                    {
                        token === null && (
                            <Link to={"/signup"}>
                                <button className="border border-richblack-700 bg-richblack-800 px-[12px] py-[12px] text-richblack-100 rounded">
                                    Sign up
                                </button>
                            </Link>
                        )
                    }

                    {
                        token !== null && <ProfileDropDown />
                    }
                </div>


            </div>
        </div>
    );
}

export default Navbar;