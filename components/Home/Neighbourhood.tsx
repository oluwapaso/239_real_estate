"use client"

import React, { useEffect, useState } from 'react'
import { FaArrowRightLong } from 'react-icons/fa6'
import { Helpers } from '@/_lib/helpers'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { RootState } from '@/app/(main-website)/(main-layout)/GlobalRedux/store'
import { useSelector } from 'react-redux'
import CityCard from './CityCard'

const Neighbourhood = () => {

    let all_comms: React.JSX.Element[] = [];
    const cities = useSelector((state: RootState) => state.cities.cities);
    if (Array.isArray(cities)) {

        if (cities.length > 0) {

            all_comms = cities.map((city) => {
                return <CityCard key={city.city_id} city={city} />
            })

        } else {
            all_comms[0] = <div className='text-white flex flex-col justify-center items-center min-h-6 col-span-full p-5'>
                <div className='w-full text-center'>No featured cities added.</div>
            </div>
        }

    }

    return (
        <section className='w-full bg-white py-8 md:py-10 lg:py-14'>
            <div className='container mx-auto max-w-[1200px] px-3 xl:px-0 text-white text-left'>

                {/* Neibgourhood Header */}
                <div className='w-full flex justify-between items-center'>
                    <h2 className='text-2xl md:text-3xl lg:text-4xl font-normal font-play-fair-display'>
                        <div className='w-full capitalize text-primary'>Top Cities</div>
                        <div className='w-full mt-1'>
                            <div className='w-[100px] h-[6px] bg-primary'></div>
                        </div>
                    </h2>
                    <Link href={`/our-communities?page=1`} className='flex-- items-center justify-between border-2 border-white 
                            px-2 md:px-4 py-3 font-light w-[130px] md:w-[170px] hover:bg-white hover:text-primary md:hover:w-[185px] 
                            transition-all duration-500 hidden'>
                        <span className='tracking-widest uppercase text-sm md:text-base'>View All</span> <FaArrowRightLong className='ml-4' />
                    </Link>
                </div>

                {/* Neibgourhood Cards */}
                <div className='w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 gap-4 mt-8'>
                    {all_comms.length < 1 && <div className='w-full flex justify-center items-center min-h-60 col-span-full p-5'>
                        <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                    </div>}
                    {all_comms}
                </div>
            </div>
        </section>
    )
}

export default Neighbourhood