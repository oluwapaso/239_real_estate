"use client"

import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'
import React from 'react'
import { RootState } from '../GlobalRedux/store'
import { useSelector } from 'react-redux'
import "../../../../CkEditor/content-styles.css";
import CustomLinkMain from '@/components/CustomLinkMain'

const PrivacyPolicy = () => {

    const comp_info = useSelector((state: RootState) => state.app)

    return (
        <>
            <SimpleHeader page="Privacy Policy" />
            <section className='w-full bg-gray-50 py-10 md:py-20'>
                <div className='container mx-auto max-w-[1200px] px-3 sm:px-4 md:px-6 xl:px-0 text-left'>
                    <div className='w-full font-normal'>
                        <CustomLinkMain href="/">Home</CustomLinkMain> / <CustomLinkMain href="/privacy-policy">Privacy Policy</CustomLinkMain>
                    </div>

                    <div className='w-full mt-5 font-normal p-4 sm:p-6 md:p-10 bg-white shadow-md ck-content'
                        dangerouslySetInnerHTML={{ __html: comp_info.privacy_policy }} />

                </div>
            </section >
        </>
    )
}

export default PrivacyPolicy