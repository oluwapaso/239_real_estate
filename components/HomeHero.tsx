"use client"

import React from 'react'
import HomeSearchBox from './HomeSearch/HomeSearchBox'
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(main-website)/(main-layout)/GlobalRedux/store';

function HomeHero() {

    const comp_info = useSelector((state: RootState) => state.app);
    return (
        <div className='w-full h-[85vh] md:h-[750px] flex flex-col justify-end items-center bg-cover bg-center pb-20'
            style={{ backgroundImage: `url(${comp_info.home_header?.image_loc ? comp_info.home_header?.image_loc : "../home-hero.jpg"})` }}>
            <HomeSearchBox />
        </div>
    )
}

export default HomeHero