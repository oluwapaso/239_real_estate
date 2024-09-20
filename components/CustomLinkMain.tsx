"use client"

import { showPageLoader } from '@/app/(main-website)/(main-layout)/GlobalRedux/app/appSlice'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useDispatch } from 'react-redux'

const CustomLinkMain = (params: any) => {

    const dispatch = useDispatch();
    const path = usePathname();

    //console.log("usepath", usepath)
    return (
        <Link {...params} onClick={() => {
            const host = `${window.location.protocol}//${window.location.host}`;
            const curr_href = window.location.href;
            let curr_path = curr_href.replace(host, "")
            curr_path = decodeURIComponent(curr_path);

            console.log("params.href", params.href, "path", path, "curr_href", curr_href, "curr_path", curr_path, "host", host)
            if (params.href != path && params.href != curr_path) {
                dispatch(showPageLoader());
            }
        }}>{params.children}</Link>
    )

}

export default CustomLinkMain