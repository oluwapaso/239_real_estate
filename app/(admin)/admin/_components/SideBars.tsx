"use client"

import Link from 'next/link'
import React, { useState } from 'react'
import { BiAddToQueue } from 'react-icons/bi'
import { BsArrowLeftShort, BsChevronDown } from 'react-icons/bs'
import { FaWordpressSimple } from 'react-icons/fa'
import { IoConstructOutline, IoLocationOutline, IoSettings } from 'react-icons/io5'
import { MdChatBubbleOutline, MdDashboard, MdDashboardCustomize, MdOutlineSupportAgent } from 'react-icons/md'
import { PiUserList, PiUserPlus } from 'react-icons/pi'
import { TbCategoryPlus, TbListSearch, TbLogout2, TbTemplate } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../GlobalRedux/store'
import { menu_toggled } from '../GlobalRedux/app/appSlice'
import { logout, showPageLoader } from '../GlobalRedux/user/userSlice'
import { useRouter } from 'next/navigation'
import { FaCity, FaRobot, FaUsers } from 'react-icons/fa6'
import useCurrentBreakpoint from '@/_hooks/useMediaQuery'
import { HiChatBubbleLeftEllipsis } from 'react-icons/hi2'
import { CiViewList } from 'react-icons/ci'

const list_class = "flex items-center text-gray-300 rounded-md text-sm cursor-pointer gap-x-4 hover:bg-slate-800 mt-2 p-2"
export type MainMenuType = {
    title: string
    icon: React.JSX.Element
    subMenu?: undefined
    link: string
}

export type SubMenuType = {
    title: string;
    icon: React.JSX.Element;
    link: string;
    subMenu: {
        title: string;
        icon: React.JSX.Element;
        link: string
    }[];
}

export type MenuType = MainMenuType | SubMenuType

const SideBars = () => {

    //const [menuOpen, setMenuOpen] = useState(true);
    const menuOpen = useSelector((state: RootState) => state.app_settings.menu_opened);
    const dispatch = useDispatch();
    const router = useRouter();

    const menuList: MenuType[] = [
        { "title": "Dashboard", "link": "/admin/dashboard", "icon": <MdDashboardCustomize /> },
        { "title": "Users", "link": "/admin/all-users?stage=Any&page=1", "icon": <FaUsers /> },
        { "title": "Settings", "link": "/admin/settings", "icon": <IoSettings /> },
        { "title": "Cities", "link": "/admin/all-cities", "icon": <FaCity /> },
        {
            "title": "Communities", "link": "", "icon": <IoLocationOutline />,
            "subMenu": [
                { "title": "All Communities", "link": "/admin/all-communities?page=1", "icon": <TbListSearch /> },
                { "title": "New Community", "link": "/admin/add-new-community", "icon": <BiAddToQueue /> },
            ],
        },
        {
            "title": "Blog", "link": "", "icon": <FaWordpressSimple />,
            "subMenu": [
                { "title": "Blog Posts", "link": "/admin/blog-posts?page=1", "icon": <TbListSearch /> },
                { "title": "Categories", "link": "/admin/blog-categories?page=1", "icon": <TbCategoryPlus /> },
                { "title": "New Post", "link": "/admin/add-new-post", "icon": <BiAddToQueue /> },
            ],
        },
        {
            "title": "Agents", "link": "", "icon": <MdOutlineSupportAgent />,
            "subMenu": [
                { "title": "All Agents", "link": "/admin/all-agents?page=1", "icon": <PiUserList /> },
                { "title": "New Agent", "link": "/admin/add-new-agent", "icon": <PiUserPlus /> },
            ],
        },
        {
            "title": "Services", "link": "", "icon": <IoConstructOutline />,
            "subMenu": [
                { "title": "All Services", "link": "/admin/all-services?page=1", "icon": <TbListSearch /> },
                { "title": "New Service", "link": "/admin/add-new-service", "icon": <BiAddToQueue /> },
            ],
        },
        {
            "title": "Testimonials", "link": "", "icon": <HiChatBubbleLeftEllipsis />,
            "subMenu": [
                { "title": "All Testimonials", "link": "/admin/all-testimonials?page=1", "icon": <HiChatBubbleLeftEllipsis /> },
                { "title": "New Testimonial", "link": "/admin/add-new-testimonial", "icon": <BiAddToQueue /> },
            ],
        },
        {
            "title": "Templates", "link": "", "icon": <TbTemplate />,
            "subMenu": [
                { "title": "All Templates", "link": "/admin/all-templates?page=1", "icon": <CiViewList /> },
                { "title": "New Template", "link": "/admin/add-new-template", "icon": <BiAddToQueue /> },
            ],
        },
        { "title": "Auto Responders", "link": "/admin/auto-responders", "icon": <FaRobot /> },
    ]

    const LogOut = () => {
        if (dispatch(logout())) {
            dispatch(showPageLoader());
            router.push("/admin/login");
        }
    }

    const closeMenu = () => {
        //setMenuOpen(!menuOpen);
        dispatch(menu_toggled(!menuOpen));
    }

    return (
        <div className={`bg-gray-900 flex fixed flex-col h-screen pt-8 duration-300 text-white z-[25] 
        ${menuOpen ? "w-72 p-5" : "w-0 md:w-20 p-0 md:p-5 -left-5 md:left-0"}`}>
            <BsArrowLeftShort className={`text-gray-900 bg-white text-3xl rounded-full absolute -right-3 top-8
            border border-gray-900 cursor-pointer ${!menuOpen && "rotate-180"}`} onClick={closeMenu} />

            <div className='inline-flex items-center h-[30px] w-full overflow-x-hidden overflow-y-hidden'>
                <MdDashboard className={`min-w-[30px] text-3xl bg-amber-300 rounded block cursor-pointer float-left text-black p-1 mr-3
                ${menuOpen && "rotate-[360deg]"} duration-300`} />
                <h2 className={`font-medium text-white text-md origin-left duration-300 ${!menuOpen && "scale-0"}`}>Tic Toc Group</h2>
            </div>

            <ul className='pt-2 w-full overflow-x-hidden'>
                {menuList.map((menu, index) => (
                    <MenuItem key={index} menu={menu} menuOpen={menuOpen} closeMenu={closeMenu} />
                ))}
            </ul>

            <div className='w-full self-end mt-auto border-t border-gray-600'>
                <li className={`${list_class} w-full text-left select-none`}>
                    <span className='text-xl block float-left'><TbLogout2 /></span>
                    <span className={`flex-1 text-base font-normal origin-left duration-300 ${!menuOpen && "scale-0"}`}
                        onClick={LogOut}>Logout</span>
                </li>
            </div>
        </div>
    )
}

const MenuItem = ({ menu, menuOpen, closeMenu }: { menu: MenuType, menuOpen: boolean, closeMenu: () => void }) => {

    const [subMenuOpen, setSubMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const { is1Xm, is2Xm, isXs, isSm } = useCurrentBreakpoint();

    const showLoader = () => {
        const pathname = window.location.href.split("admin/")[1];
        const link = menu.link.split("admin/")[1];
        if (pathname != link) {
            return dispatch(showPageLoader());
        }
    }

    return (
        <>
            <Link href={`${menu.link ? menu.link : ""}`} onClick={() => {
                (menu.link && menu.link != "") ? showLoader() : undefined;
                (menu.link && menu.link != "" && (is1Xm || is2Xm || isXs || isSm)) ? closeMenu() : undefined;
            }
            }>
                <li className={`${list_class} w-full text-left select-none`} onClick={() => setSubMenuOpen(!subMenuOpen)}>
                    <span className='text-xl block float-left'>{menu.icon}</span>
                    <span className={`flex-1 text-base font-normal origin-left ${!menuOpen && "scale-0 duration-300"}`}>{menu.title}</span>
                    {menu.subMenu && menuOpen && (<BsChevronDown className={`${subMenuOpen && "rotate-180"}`} />)}
                </li>
            </Link>

            {menu.subMenu && menu.subMenu && subMenuOpen && menuOpen && (
                <ul className='select-none'>
                    {menu.subMenu.map((sub_menu, i) => (
                        <Link href={`${sub_menu.link ? sub_menu.link : ""}`} onClick={() => {
                            const pathname = window.location.href.split("admin/")[1];
                            const link = sub_menu.link.split("admin/")[1];
                            if (pathname != link) {
                                dispatch(showPageLoader());
                            }
                            (is1Xm || is2Xm || isXs || isSm) ? closeMenu() : undefined;
                        }}>
                            <li key={i} className={`${list_class} !pl-10`}>
                                <span className='text-xl block float-left'>{sub_menu.icon}</span>
                                <span className={`flex-1 text-base font-normal origin-left ${!subMenuOpen && "scale-0 duration-300"}`}>{sub_menu.title}</span>
                            </li>
                        </Link>
                    ))}
                </ul>
            )}
        </>
    )
}

export default SideBars