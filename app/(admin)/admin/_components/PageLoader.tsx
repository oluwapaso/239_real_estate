"use client"

import React from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { useSelector } from 'react-redux'
import { RootState } from '../GlobalRedux/store'

const PageLoader = () => {

    const showPageLoader = useSelector((state: RootState) => state.user.showPageLoader)
    return (
        <div className={`${showPageLoader ? "block" : "hidden"} w-full h-screen fixed top-0 flex justify-center items-center z-30 backdrop-blur-sm bg-opacity-25 bg-black`}>
            <div className=' size-28 bg-white drop-shadow-2xl rounded flex items-center justify-center'>
                <AiOutlineLoading3Quarters size={45} className='animate-spin' />
            </div>
        </div>
    )
}

export default PageLoader