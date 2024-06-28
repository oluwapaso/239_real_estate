"use client"

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { NavProps } from './types';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { FetchCompInfo, menu_toggled } from '@/app/(main-website)/(main-layout)/GlobalRedux/app/appSlice';
import { AppDispatch, RootState } from '@/app/(main-website)/(main-layout)/GlobalRedux/store';
import { FetchMenus } from '@/app/(main-website)/(main-layout)/GlobalRedux/menus/menuSlice';
import { signOut, useSession } from 'next-auth/react'
import { useModal } from '@/app/contexts/ModalContext';
import { BiMenu, BiSearch } from 'react-icons/bi';
import { FaTimes } from 'react-icons/fa';
import { FetchCities } from '@/app/(main-website)/(main-layout)/GlobalRedux/cities/citySlice';
import { useLastSeen } from '@/_hooks/useActivities';
import CustomLinkMain from './CustomLinkMain';

function NavBar({ page }: NavProps) {

    const { data: session } = useSession();
    const logged_user = session?.user as any;
    const last_seen = useLastSeen(logged_user?.user_id);

    const [hasScrolled, setHasScrolled] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const comp_info = useSelector((state: RootState) => state.app);
    const menuOpen = comp_info.menu_opened;
    const menus_list = useSelector((state: RootState) => state.menu);
    const city_lists = useSelector((state: RootState) => state.cities);

    useEffect(() => {

        const handleScroll = () => {
            if (window.scrollY > 150) {
                setHasScrolled(true);
            } else {
                setHasScrolled(false);
            }
        }

        window.addEventListener('scroll', handleScroll);

        const fetch_info = async () => {
            await dispatch(FetchCompInfo());
        }
        fetch_info();

        const fetch_menu = async () => {
            await dispatch(FetchMenus());
        }
        fetch_menu();

        const fetch_cities = async () => {
            await dispatch(FetchCities());
        }
        fetch_cities();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        }

    }, []);

    let nav_filter = ""
    let signup_brdr = "border-white"
    let nav_color = "text-white"
    let nav_gradient = "bg-gradient-to-b from-black/30 to-transparent"
    let text_shadow = "*:text-shadow-primary"
    let logo_loc: any;
    let btn_hover = "hover:border-white hover:bg-black hover:text-white";

    if (page == "Home" || page == "Has Hero") {

        nav_filter = "fixed z-[200] ";
        logo_loc = comp_info.primary_logo?.image_loc;
        if (hasScrolled) {
            nav_filter += "backdrop-blur bg-black bg-opacity-35 shadow-md"
            signup_brdr = "border-primary"
            //nav_color = "text-primary"
            nav_gradient = ""
            text_shadow = ""
            logo_loc = comp_info.secondary_logo?.image_loc;
        }

    } else if (page == "Search" || page == "Property Details") {
        if (hasScrolled) {
            nav_filter = "relative z-[200]"
        }
        nav_gradient = "bg-primary"
        logo_loc = comp_info.primary_logo?.image_loc;
        btn_hover = "hover:border-white hover:bg-white hover:text-primary";
    } else {
        if (hasScrolled) {
            nav_filter = "fixed z-[200]"
        }
        nav_gradient = "bg-primary"
        logo_loc = comp_info.primary_logo?.image_loc;
        btn_hover = "hover:border-white hover:bg-white hover:text-primary";
    }

    const { handleLoginModal } = useModal();

    const openMenu = () => {
        dispatch(menu_toggled(true));
        document.body.style.overflowY = 'hidden';
    }

    const closeMenu = () => {
        dispatch(menu_toggled(false));
        document.body.style.overflowY = 'auto';
    }

    return (
        <nav className={`nav w-full px-4 md:px-16 flex justify-between items-center transition duration-500 py-4 mx-auto ${nav_filter} ${nav_gradient}`}>
            <div className='logo-container'>
                <CustomLinkMain href="/">
                    <Image src={logo_loc} alt='Logo image' width={120} height={48} className='w-[auto] h-[38px] xs:h-[48px]' />
                </CustomLinkMain>
            </div>

            <div className={`nav-menu-container hidden tab:flex justify-end items-center select-none flex-wrap ${nav_color}`}>
                <div className='menu-container mr-5'>
                    <ul className={`flex flex-row justify-end items-center space-x-5 cursor-pointer *:py-3 *:font-normal`}>
                        <li>
                            <CustomLinkMain href={`/search`}>
                                <div className='flex flex-row items-center'>
                                    <BiSearch size={16} className='mr-1' /> <span className='uppercase text-sm mr-1'>MLS Search</span>
                                </div>
                            </CustomLinkMain>
                        </li>
                        <li className='group'>
                            <div className='flex flex-row items-center'>
                                <span className='mr-1 uppercase text-sm'>Top Cities</span>
                                <span className='group-hover:rotate-180 transition-all duration-300'><MdOutlineKeyboardArrowDown size={20} /></span>
                            </div>
                            <div className='absolute hidden w-[270px] max-w-[100%] z-[200] bg-transparent group-hover:block pt-[30px]'>
                                <ul className='nav-menu'>
                                    {
                                        (city_lists.cities && city_lists.cities.length) && (
                                            city_lists.cities.map((city, index) => (
                                                <CustomLinkMain key={index} href={`/${city.slug}`} className='nav-menu-item'>
                                                    <div className='flex items-center px-4'>{city.friendly_name}</div>
                                                </CustomLinkMain>
                                            ))
                                        )
                                    }
                                </ul>
                            </div>
                        </li>
                        <li className='group'>
                            <div className='flex flex-row items-center'>
                                <span className='mr-1 uppercase text-sm'>Buyers</span>
                                <span className='group-hover:rotate-180 transition-all duration-300'><MdOutlineKeyboardArrowDown size={20} /></span>
                            </div>
                            <div className='absolute hidden w-[350px] max-w-[100%] z-[200] bg-transparent group-hover:block pt-[30px]'>
                                <ul className='nav-menu'>
                                    <CustomLinkMain href="/search" className='nav-menu-item'>
                                        <div className='flex items-center px-4'>Search Listings</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href="/buying" className='nav-menu-item'>
                                        <div className='flex items-center px-4'>Ready To Buy?</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href="/mortgage-calculator" className='nav-menu-item'>
                                        <div className='flex items-center px-4'>Mortgage Calculator</div>
                                    </CustomLinkMain>
                                    {
                                        (menus_list && menus_list.menus.length) && (
                                            menus_list.menus.map((menu, index) => (
                                                menu.show_on_menus.buyer_menu == "Yes" ? (
                                                    <CustomLinkMain href={`/read-post/${menu.slug}`} className='nav-menu-item'>
                                                        <div className='flex items-center px-4'>{menu.post_title}</div>
                                                    </CustomLinkMain>
                                                ) : ""
                                            ))
                                        )
                                    }
                                </ul>
                            </div>
                        </li>
                        <li className='group relative'>
                            <div className='flex flex-row items-center'>
                                <span className='mr-1 text-sm uppercase'>Sellers</span>
                                <span className='group-hover:rotate-180 transition-all duration-300'><MdOutlineKeyboardArrowDown size={20} /></span>
                            </div>

                            <div className='absolute hidden w-[300px] left-[-150px] xl:left-0 max-w-[300px] z-[200] bg-transparent group-hover:block pt-[30px]'>
                                <ul className='nav-menu'>
                                    {
                                        (menus_list.menus && menus_list.menus.length) && (
                                            menus_list.menus.map((menu, index) => {

                                                return (
                                                    menu.show_on_menus.seller_menu == "Yes" ? (
                                                        <CustomLinkMain href={`/read-post/${menu.slug}`} className='nav-menu-item'>
                                                            <div className='flex items-center px-4'>{menu.post_title}</div>
                                                        </CustomLinkMain>
                                                    ) : ""
                                                )
                                            })
                                        )
                                    }
                                </ul>
                            </div>
                        </li>
                        <li className='group hidden xl:list-item'>
                            <div className='flex flex-row items-center'>
                                <span className='mr-1 text-sm uppercase'>About Us</span>
                                <span className='group-hover:rotate-180 transition-all duration-300'><MdOutlineKeyboardArrowDown size={20} /></span>
                            </div>
                            <div className='absolute hidden w-[270px] max-w-[100%] z-[200] bg-transparent group-hover:block pt-[30px]'>
                                <ul className='nav-menu'>
                                    <CustomLinkMain href='/about-us' className='nav-menu-item'>
                                        <div className='flex items-center px-4'>About {comp_info.company_name}</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href='/our-team?page=1' className='nav-menu-item'>
                                        <div className='flex items-center px-4'>Meet The Team</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href='/our-services?page=1' className='nav-menu-item'>
                                        <div className='flex items-center px-4'>Our Services</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href='/homes-sold-by-us?page=1' className='nav-menu-item'>
                                        <div className='flex items-center px-4'>Homes We've Sold</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href='/contact-us' className='nav-menu-item'>
                                        <div className='flex items-center px-4'>Contact Us</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href='/blog-posts?page=1' className='nav-menu-item'>
                                        <div className='flex items-center px-4'>Blog</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href='/terms-of-service' className='nav-menu-item'>
                                        <div className='flex items-center px-4'>Terms of Use</div>
                                    </CustomLinkMain>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>

                {
                    session?.user ? <div className='mr-5 group relative'>
                        <div className='auth-container flex flex-row items-center'>
                            <button className={`border-2 border-white ${signup_brdr} px-6 py-1 transition duration-300 text-sm uppercase ${btn_hover}`}>
                                My Dashboard
                            </button>
                        </div>

                        <div className='absolute hidden w-[220px] z-[200] bg-transparent group-hover:block pt-[24px] right-0'>
                            <ul className='nav-menu'>
                                <CustomLinkMain href='/my-dashboard?tab=Favorites&status=Active&page=1' className='nav-menu-item'>
                                    <div className=' flex items-center px-4'>My Dashboard</div>
                                </CustomLinkMain>
                                <CustomLinkMain href='/my-dashboard?tab=Favorites&status=Active&page=1' className='nav-menu-item'>
                                    <div className=' flex items-center px-4'>Favorites {`(${logged_user?.favorites ? logged_user?.favorites.length : "0"})`}</div>
                                </CustomLinkMain>
                                <CustomLinkMain href='/my-dashboard?tab=Searches&page=1' className='nav-menu-item'>
                                    <div className=' flex items-center px-4'>Saved Searches</div>
                                </CustomLinkMain>
                                <CustomLinkMain href='/my-dashboard?tab=Preferences' className='nav-menu-item'>
                                    <div className=' flex items-center px-4'>Preferences</div>
                                </CustomLinkMain>
                                <li className='nav-menu-item' onClick={() => signOut()}>
                                    <div className='flex items-center px-4'>Sign Out</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                        : <div className='auth-container mr-5'>
                            <button className={`border-2 border-white ${signup_brdr} px-6 py-1 transition duration-300 ${btn_hover}`}
                                onClick={handleLoginModal}>Sign In</button>
                        </div>
                }

                <div className='phone-container cursor-pointer hidden xl:block'>
                    <CustomLinkMain href={`tel:${comp_info.phone_number};`} shallow className='text-base'>{comp_info.phone_number}</CustomLinkMain>
                </div>
            </div>

            <div className={`w-full ${menuOpen ? "block backdrop-blur bg-black bg-opacity-35" : "hidden"} absolute z-[150] h-[100vh] bottom-0 right-0 top-0 left-0`}>
                <div id='mobile_menu' className='bg-primary h-[100vh] flex absolute right-0 top-0 w-[100%] max-w-[350px]'>
                    <div className='w-full h-full *:text-white *:font-play-fair-display relative'>
                        <div className='flex justify-between items-center p-4 border-b border-white'>
                            <span className='text-2xl'>Menu</span> <FaTimes size={28} onClick={closeMenu} />
                        </div>
                        <div className='w-full flex flex-col p-3  *:px-4 *:py-4 h-[calc(100%-64px)] 
                        overflow-x-hidden overflow-y-auto font-normal *:bg-gray-800 *:rounded-md space-y-3' onClick={closeMenu}>
                            <CustomLinkMain href={`/search`}>
                                <div>Main Search</div>
                            </CustomLinkMain>
                            <CustomLinkMain href={`/our-communities?page=1`} className='hidden'>
                                <div>Top Cities</div>
                            </CustomLinkMain>
                            {
                                (city_lists.cities && city_lists.cities.length) && (
                                    city_lists.cities.map((city, index) => (
                                        <CustomLinkMain key={index} href={`/${city.slug}`}>
                                            <div>{city.friendly_name}</div>
                                        </CustomLinkMain>
                                    ))
                                )
                            }
                            <CustomLinkMain href={`/buying`}>
                                <div>Ready To Buy?</div>
                            </CustomLinkMain>
                            <CustomLinkMain href={`/mortgage-calculator`}>
                                <div>Mortgage Calculator</div>
                            </CustomLinkMain>
                            {
                                (menus_list && menus_list.menus.length) && (
                                    menus_list.menus.map((menu, index) => (
                                        menu.show_on_menus.buyer_menu == "Yes" ? (
                                            <CustomLinkMain key={index} href={`/read-post/${menu.slug}`}>
                                                <div>{menu.post_title}</div>
                                            </CustomLinkMain>
                                        ) : ""
                                    ))
                                )
                            }
                            {
                                (menus_list && menus_list.menus.length) && (
                                    menus_list.menus.map((menu, index) => (
                                        menu.show_on_menus.seller_menu == "Yes" ? (
                                            <CustomLinkMain key={index} href={`/read-post/${menu.slug}`}>
                                                <div>{menu.post_title}</div>
                                            </CustomLinkMain>
                                        ) : ""
                                    ))
                                )
                            }

                            <CustomLinkMain href='/about-us'>
                                <div>About {comp_info.company_name}</div>
                            </CustomLinkMain>
                            <CustomLinkMain href={`/our-team?page=1`}>
                                <div>Meet The Team</div>
                            </CustomLinkMain>
                            <CustomLinkMain href={`/our-services?page=1`}>
                                <div>Our Services</div>
                            </CustomLinkMain>
                            <CustomLinkMain href={`/homes-sold-by-us?page=1`}>
                                <div>Homes We've Sold</div>
                            </CustomLinkMain>

                            {
                                session?.user && <>
                                    <CustomLinkMain href={`/my-dashboard?tab=Favorites&status=Active&page=1`}>
                                        <div>Favorites {`(${logged_user?.favorites ? logged_user?.favorites.length : "0"})`}</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href={`/my-dashboard?tab=Searches&page=1`}>
                                        <div>Saved Searches</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href={`/my-dashboard?tab=Preferences`}>
                                        <div>Preferences</div>
                                    </CustomLinkMain>
                                </>
                            }
                            <CustomLinkMain href={`/contact-us`}>
                                <div>Contact Us</div>
                            </CustomLinkMain>
                            <CustomLinkMain href={`/blog-posts?page=1`}>
                                <div>Blog</div>
                            </CustomLinkMain>
                            <CustomLinkMain href={`/terms-of-service`}>
                                <div>Terms of Use</div>
                            </CustomLinkMain>

                            {
                                session?.user ? <div onClick={() => signOut()}>Sign Out</div> : <div onClick={handleLoginModal}>Sign In</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex tab:hidden items-center justify-center text-white' onClick={openMenu}>
                <BiMenu size={28} />
            </div>
        </nav>
    )
}

export default NavBar