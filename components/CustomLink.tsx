"use client"

import { showPageLoader } from '@/app/(admin)/admin/GlobalRedux/user/userSlice'
import Link from 'next/link'
import React from 'react'
import { useDispatch } from 'react-redux'

const CustomLink = (params: any) => {

    const dispatch = useDispatch();

    return (
        <Link {...params} onClick={() => {
            dispatch(showPageLoader());
        }}>{params.children}</Link>
    )

}

export default CustomLink