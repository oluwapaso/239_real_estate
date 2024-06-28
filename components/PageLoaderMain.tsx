"use client"

import React from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { useSelector } from 'react-redux'
import { RootState } from '../app/(main-website)/(main-layout)/GlobalRedux/store'

const PageLoaderMain = () => {

    const showPageLoader = useSelector((state: RootState) => state.app.showPageLoader)
    return (
        <div className={`${showPageLoader ? "block" : "hidden"} w-full h-screen fixed top-0 flex justify-center items-center z-[500] backdrop-blur-sm bg-opacity-25 bg-black`}>
            <div className=' size-28 bg-white drop-shadow-2xl rounded flex items-center justify-center'>
                <AiOutlineLoading3Quarters size={45} className='animate-spin' />
            </div>
        </div>
    )
}

export default PageLoaderMain