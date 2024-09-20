"use client"

import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'
import React from 'react'
import { RootState } from '../GlobalRedux/store'
import { useSelector } from 'react-redux'
import "../../../../CkEditor/content-styles.css";
import CustomLinkMain from '@/components/CustomLinkMain'

const AboutUs = () => {

    const comp_info = useSelector((state: RootState) => state.app)

    return (
        <>
            <SimpleHeader page="About Us" />
            <section className='w-full bg-gray-50 py-10 md:py-20'>
                <div className='container mx-auto max-w-[1200px] px-3 sm:px-4 md:px-6 xl:px-0 text-left'>
                    <div className='w-full font-normal'>
                        <CustomLinkMain href="/">Home</CustomLinkMain> / <CustomLinkMain href="/terms-of-service">About Us</CustomLinkMain>
                    </div>

                    <div className='w-full mt-5 font-normal p-4 sm:p-6 md:p-10 bg-white shadow-md ck-content'
                        dangerouslySetInnerHTML={{ __html: comp_info.about_us }} />

                </div>
            </section >
        </>
    )
}

export default AboutUs