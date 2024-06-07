"use client"

import Link from 'next/link'
import React, { useEffect } from 'react'
import { FcDisclaimer } from 'react-icons/fc'
import { GoChecklist } from 'react-icons/go'
import { IoBusinessOutline } from 'react-icons/io5'
import { MdOutlinePrivacyTip } from 'react-icons/md'
import { Helpers } from '@/_lib/helpers'
import { AiOutlineApi } from 'react-icons/ai'
import PageTitle from '../../_components/PageTitle'
import { GiPencilBrush, GiProgression } from 'react-icons/gi'
import { TfiLayoutTabWindow } from 'react-icons/tfi'
import useCurrentBreakpoint from '@/_hooks/useMediaQuery'
import { useDispatch } from 'react-redux'
import { hidePageLoader } from '../../GlobalRedux/user/userSlice'
import CustomLink from '@/components/CustomLink'
import { FaStar } from 'react-icons/fa6'
import { BiInfoCircle } from 'react-icons/bi'

const helpers = new Helpers();
const Dashboard = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const { is1Xm, is2Xm } = useCurrentBreakpoint();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(hidePageLoader());
    }, []);

    return (
        <div className='w-full'>
            <PageTitle text="Settings" show_back={false} />
            <div className='w-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8'>

                <CustomLink href="/admin/company-info">
                    <div className='settings-card'>
                        <IoBusinessOutline className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>Company Info</div>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/about-us-settings">
                    <div className='settings-card'>
                        <BiInfoCircle className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>About Us</div>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/privacy-settings">
                    <div className='settings-card'>
                        <MdOutlinePrivacyTip className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>Privacy Policy</div>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/terms-settings">
                    <div className='settings-card'>
                        <GoChecklist className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>Terms of Service</div>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/mls-disclaimer">
                    <div className='settings-card'>
                        <FcDisclaimer className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>MLS Disclaimer</div>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/api-settings">
                    <div className='settings-card'>
                        <AiOutlineApi className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>API Settings</div>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/featured-listings">
                    <div className='settings-card'>
                        <FaStar className='text-7xl text-orange-500' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>Featured Listings</div>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/logo-settings">
                    <div className='settings-card'>
                        <GiPencilBrush className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>Logo Settings</div>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/page-headers">
                    <div className='settings-card'>
                        <TfiLayoutTabWindow className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>Page Headers</div>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/lead-stages">
                    <div className='settings-card'>
                        <GiProgression className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>Lead Stages</div>
                    </div>
                </CustomLink>

            </div>
        </div>
    )
}

export default Dashboard