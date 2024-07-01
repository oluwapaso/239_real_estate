"use client"

import React, { useState } from 'react'
import LocationComponent from './LocationComponent'
import FIltersComponent from './FIltersComponent'
import SearchButton from './SearchButton'
import { useRouter } from 'next/navigation'
import { FilterValueTypes } from '../types'
import { showPageLoader } from '@/app/(main-website)/(main-layout)/GlobalRedux/app/appSlice'
import { useDispatch } from 'react-redux'

const RentSearchTab = () => {

    const filterValue: Partial<FilterValueTypes> = {
        min_price: 0,
        max_price: 0,
        min_beds: 0,
        max_beds: 0,
        min_baths: 0,
        max_baths: 0,
    }

    //const [selectedStatus, setSelectedStatus] = useState("Active")
    const [location, setLocation] = useState("");
    const [filter_values, setFilterValues] = useState(filterValue);

    const router = useRouter();
    const dispatch = useDispatch();

    const handleSearch = () => {
        dispatch(showPageLoader());
        const map_bounds = `{"north":26.760979157255296,"south":25.801786319915113,"east":-81.17107039746094,"west":-82.40840560253906}`
        router.push(`/search?location=${location}&sales_type=For Rent&min_bed=${filter_values.min_beds}&max_bed=${filter_values.max_beds}&min_bath=${filter_values.min_baths}&max_bath=${filter_values.max_baths}&min_price=${filter_values.min_price}&max_price=${filter_values.max_price}&map_bounds=${map_bounds}&zoom=7`)
    }

    return (
        <>
            <div className='w-full px-4 lg:px-0 flex flex-col *:text-white *:font-play-fair-display *:text-shadow-primary select-none'>
                <h2 className='italic font-normal text-2xl md:text-3xl'>Looking for a Rental?</h2>
                <h1 className='font-normal text-4xl md:text-6xl mt-1'>START SEARCHING</h1>
            </div>

            <div className='w-full px-4 lg:px-0 my-6'>
                <div className='w-full bg-white py-2 flex flex-wrap items-center px-2 relative'>
                    {/** <StatusComponent status={selectedStatus} setStatus={setSelectedStatus} />
                    <div className='vertical-divider mx-2 h-7 border border-gray-300'></div> **/}
                    <LocationComponent location={location} setLocation={setLocation} />
                    <div className='vertical-divider mx-2 h-7 border border-gray-300 hidden xs:block'></div>
                    <FIltersComponent filter_values={filter_values} setFilterValues={setFilterValues} tab='Rent' />
                    <SearchButton handleSearch={handleSearch} />
                </div>
            </div>
        </>
    )
}

export default RentSearchTab