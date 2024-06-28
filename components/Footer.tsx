"use client"

import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import { FaFacebookSquare } from 'react-icons/fa'
import { BsInstagram } from 'react-icons/bs'
import { FaXTwitter } from 'react-icons/fa6'
import { IoLogoYoutube } from 'react-icons/io5'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/(main-website)/(main-layout)/GlobalRedux/store'
import CustomLinkMain from './CustomLinkMain'

const Footer = ({ page }: { page?: string }) => {

    const comp_info = useSelector((state: RootState) => state.app);
    const menus_list = useSelector((state: RootState) => state.menu);
    const city_lists = useSelector((state: RootState) => state.cities);

    return (
        <section className='w-full py-8 md:py-14 bg-primary text-white' id='footer'>
            <div className='container mx-auto max-w-[1200px] px-3 xl:px-0 text-left'>
                {/** Broker's company and state MLS info  */}
                <div className={`w-full grid grid-cols-1 ${page == "Search" ? "xl:grid-cols-1" : "xl:grid-cols-3"} gap-5`}>
                    <div className='col-span-1'>
                        <div>
                            <Image src={comp_info.primary_logo?.image_loc} width={200} height={100} alt='' />
                        </div>
                        <address className='mt-3'>
                            <p>{comp_info.company_name}</p>
                            <p>{comp_info.address_1}</p>
                            <p>{comp_info.address_2}</p>
                            <p>{comp_info.default_email}</p>
                            <p>{comp_info.phone_number}</p>
                        </address>
                    </div>
                    <div className='col-span-1 lg:col-span-2'>
                        <div>
                            <Image src={comp_info.mls_logo?.image_loc} width={200} height={150} alt='' />
                        </div>
                        <div className='uppercase text-sm mt-3'>{comp_info.mls_disclaimer}</div>
                    </div>
                </div>

                {/** Useful Links */}
                <div className={`w-full grid grid-cols-1
                ${page == "Search" ? "xs:grid-cols-2" : "xs:grid-cols-2"} 
                ${page == "Search" ? "tab:grid-cols-1" : "tab:grid-cols-2"} 
                ${page == "Search" ? "lg:grid-cols-1" : "lg:grid-cols-3"} 
                ${page == "Search" ? "xl:grid-cols-2" : "xl:grid-cols-4"} gap-5 mt-12`}>

                    <div className='w-full flex flex-col'>
                        <h3 className='w-100 font-play-fair-display text-2xl uppercase'>Top Cities</h3>
                        {
                            (city_lists.cities && city_lists.cities.length) && (
                                city_lists.cities.map((city, index) => (
                                    <div key={index} className='w-full mt-2 font-light text-base'>
                                        <CustomLinkMain href={`/${city.slug}`} className='border-b-2 border-transparent 
                                        hover:border-white uppercase text-sm'>{city.friendly_name}</CustomLinkMain>
                                    </div>
                                ))
                            )
                        }
                    </div>

                    <div className='w-full flex flex-col transition-all duration-500'>
                        <h3 className='w-100 font-play-fair-display text-2xl uppercase'>Buyers</h3>
                        <div className='w-full mt-2 font-light text-sm'>
                            <CustomLinkMain href={`/search`} className='border-b-2 border-transparent hover:border-white uppercase'>Search Listings</CustomLinkMain>
                        </div>
                        <div className='w-full mt-2 font-light text-sm'>
                            <CustomLinkMain href={`/buying`} className='border-b-2 border-transparent hover:border-white uppercase'>Ready To Buy?</CustomLinkMain>
                        </div>
                        <div className='w-full mt-2 font-light text-sm'>
                            <CustomLinkMain href={`/mortgage-calculator`} className='border-b-2 border-transparent hover:border-white uppercase'>Mortgage Calculator</CustomLinkMain>
                        </div>
                        {
                            (menus_list && menus_list.menus.length) && (
                                menus_list.menus.map((menu, index) => (
                                    menu.show_on_menus.buyer_menu == "Yes" ? (
                                        <div key={index} className='w-full mt-2 font-light text-sm'>
                                            <CustomLinkMain href={`/read-post/${menu.slug}`} className='border-b-2 border-transparent hover:border-white uppercase'>{menu.post_title}</CustomLinkMain>
                                        </div>
                                    ) : ""
                                ))
                            )
                        }
                    </div>

                    <div className='w-full flex flex-col transition-all duration-500'>
                        <h3 className='w-100 font-play-fair-display text-2xl uppercase'>Sellers</h3>
                        {
                            (menus_list && menus_list.menus.length) && (
                                menus_list.menus.map((menu, index) => (
                                    menu.show_on_menus.seller_menu == "Yes" ? (
                                        <div key={index} className='w-full mt-2 font-light text-sm'>
                                            <CustomLinkMain href={`/read-post/${menu.slug}`} className='border-b-2 border-transparent hover:border-white uppercase'>{menu.post_title}</CustomLinkMain>
                                        </div>
                                    ) : ""
                                ))
                            )
                        }
                    </div>

                    <div className='w-full flex flex-col'>
                        <h3 className='w-100 font-play-fair-display text-2xl uppercase'>Our Company</h3>
                        <div className='w-full mt-2 font-light text-sm'>
                            <CustomLinkMain href='/' className='border-b-2 border-transparent hover:border-white uppercase'>Home Page</CustomLinkMain>
                        </div>
                        <div className='w-full mt-2 font-light text-sm'>
                            <CustomLinkMain href='/about-us' className='border-b-2 border-transparent hover:border-white uppercase'>About Us</CustomLinkMain>
                        </div>
                        <div className='w-full mt-2 font-light text-sm'>
                            <CustomLinkMain href={`/blog-posts?page=1`} className='border-b-2 border-transparent hover:border-white uppercase'>Latest From Blog</CustomLinkMain>
                        </div>
                        <div className='w-full mt-2 font-light text-sm'>
                            <CustomLinkMain href={`/our-team?page=1`} className='border-b-2 border-transparent hover:border-white uppercase'>Meet The Team</CustomLinkMain>
                        </div>
                        <div className='w-full mt-2 font-light text-sm'>
                            <CustomLinkMain href={`/our-services?page=1`} className='border-b-2 border-transparent hover:border-white uppercase'>Our Services</CustomLinkMain>
                        </div>
                        <div className='w-full mt-2 font-light text-sm hover:border-white'>
                            <CustomLinkMain href={`/contact-us`} className='border-b-2 border-transparent hover:border-white uppercase'>Contact Us</CustomLinkMain>
                        </div>
                        <div className='w-full mt-2 font-light text-sm hover:border-white'>
                            <CustomLinkMain href={`/privacy-policy`} className='border-b-2 border-transparent hover:border-white uppercase'>Privacy Policy</CustomLinkMain>
                        </div>
                        <div className='w-full mt-2 font-light text-sm hover:border-white'>
                            <CustomLinkMain href={`/terms-of-service`} className='border-b-2 border-transparent hover:border-white uppercase'>Terms Of Service</CustomLinkMain>
                        </div>

                        <div className='w-full mt-2 font-light text-lg flex *:mr-3'>
                            <CustomLinkMain href={`${comp_info.facebook}`} target='_blank' className=''><FaFacebookSquare size={23} /></CustomLinkMain>
                            <CustomLinkMain href={`${comp_info.instagram}`} target='_blank' className=''><BsInstagram size={23} /></CustomLinkMain>
                            <CustomLinkMain href={`${comp_info.twitter}`} target='_blank' className=''><FaXTwitter size={23} /></CustomLinkMain>
                            <CustomLinkMain href={`${comp_info.youtube}`} target='_blank' className='!mr-0'><IoLogoYoutube size={23} /></CustomLinkMain>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default React.memo(Footer);