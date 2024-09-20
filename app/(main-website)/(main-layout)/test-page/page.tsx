"use client"

import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'
import React from 'react'
import { RootState } from '../GlobalRedux/store'
import { useSelector } from 'react-redux'
import "../../../../CkEditor/content-styles.css";

const TOS = () => {

    const comp_info = useSelector((state: RootState) => state.app)

    return (
        <>
            <SimpleHeader page="Terms of Service" />
            <section className='w-full bg-gray-50 py-20'>
                <div className='container mx-auto max-w-[600px] text-left'>

                </div>
            </section >
        </>
    )
}

export default TOS