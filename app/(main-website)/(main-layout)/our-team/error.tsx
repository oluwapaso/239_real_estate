"use client"

import CustomLinkMain from '@/components/CustomLinkMain'
import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'
import React from 'react'

const Error = ({ error }: { error: Error }) => {
    return (
        <>
            <SimpleHeader page="Meet The Team" />
            <section className='w-full bg-white py-20'>
                <div className='container mx-auto max-w-[850px] text-left'>
                    <div className='w-full font-normal'>
                        <CustomLinkMain href="/">Home</CustomLinkMain> / <CustomLinkMain href="/our-team?page=1">Meet The Team</CustomLinkMain>
                    </div>

                    <h3 className='w-full font-play-fair-display text-5xl mt-2'>Meet The Team</h3>

                    <div className='w-full bg-red-100 text-red-600 mt-10 flex justify-center items-center min-h-60'>
                        {error.message}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Error