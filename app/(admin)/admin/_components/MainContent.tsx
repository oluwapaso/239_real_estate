"use client"

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../GlobalRedux/store'
import { menu_toggled } from '../GlobalRedux/app/appSlice'
import { BiMenu } from 'react-icons/bi'

const MainContent = ({ children }: { children: React.ReactNode }) => {

    const menuOpen = useSelector((state: RootState) => state.app_settings.menu_opened);
    const dispatch = useDispatch();

    return (
        <div className={`bg-gray-50 flex-grow max-w-[100%] duration-300 min-h-screen ml-0
        ${menuOpen ? "md:ml-72" : "md:ml-20"} `}>
            <div className='w-full bg-white h-16 px-4 flex items-center drop-shadow fixed z-20 md:hidden'>
                <div onClick={() => dispatch(menu_toggled(!menuOpen))}><BiMenu size={28} /></div>
                <div className=' flex-grow flex items-center justify-center font-bold'>CRM Dashboard</div>
            </div>
            <div className='pt-20 md:pt-6 pb-6 px-3 2xs:px-5 md:px-10 z-10'>{children}</div>
        </div>
    )

}

export default MainContent