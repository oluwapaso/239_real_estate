"use client"

import { showPageLoader } from '@/app/(main-website)/(main-layout)/GlobalRedux/app/appSlice'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useDispatch } from 'react-redux'

const CustomLinkMain = (params: any) => {

    const dispatch = useDispatch();
    const path = usePathname()
    //console.log("usepath", usepath)
    return (
        <Link {...params} onClick={() => {
            if (params.href != path) {
                dispatch(showPageLoader());
            }
        }}>{params.children}</Link>
    )

}

export default CustomLinkMain