"use client"

import React, { useState } from 'react'
import StatusComponent from './StatusComponent'
import LocationComponent from './LocationComponent'
import FIltersComponent from './FIltersComponent'
import SearchButton from './SearchButton'
import { useRouter } from 'next/navigation'
import { FilterValueTypes } from '../types'
import { useDispatch } from 'react-redux'
import { showPageLoader } from '@/app/(main-website)/(main-layout)/GlobalRedux/app/appSlice'

const BuySearchTab = () => {

    const filterValue: Partial<FilterValueTypes> = {
        min_price: 0,
        max_price: 0,
        min_beds: 0,
        max_beds: 0,
        min_baths: 0,
        max_baths: 0,
        home_type: "Any",
        must_have_pool: "No",
        must_have_view: "No",
    }

    const [selectedStatus, setSelectedStatus] = useState("Active");
    const [location, setLocation] = useState("");
    const [filter_values, setFilterValues] = useState(filterValue);

    const router = useRouter();
    const dispatch = useDispatch();

    const handleSearch = () => {
        let sales_type = "For Sale";
        if (selectedStatus == "Sold") {
            sales_type = "Sold";
        }
        dispatch(showPageLoader());

        let home_type = {
            Any: "Yes",
            House: "No",
            Condo: "No",
            SingleFamily: "No",
            CoOp: "No",
            ResIncome: "No",
            Dock: "No",
            Land: "No",
            Commercial: "No",
        }

        if (filter_values.home_type != "Any") {

            let home_key: keyof typeof home_type = "Any"; // Initialize with a valid key
            if (filter_values.home_type == "House") {
                home_key = "House"
            } else if (filter_values.home_type == "Condo") {
                home_key = "Condo"
            } else if (filter_values.home_type == "Single Family") {
                home_key = "SingleFamily"
            } else if (filter_values.home_type == "Commercial") {
                home_key = "Commercial"
            } else if (filter_values.home_type == "Land") {
                home_key = "Land"
            } else if (filter_values.home_type == "Dock") {
                home_key = "Dock"
            }

            home_type[home_key] = "Yes"
            home_type["Any"] = "No"
        }

        //  king_spots=0&home_type={%22House%22:%22No%22,%22Condo%22:%22No%22,%22SingleFamily%22:%22No%22,%22CoOp%22:%22No%22,%22ResIncome%22:%22No%22,%22Dock%22:%22No%22,%22Land%22:%22No%22,%22Commercial%22:%22No%22,%22Any%22:%22Yes%22}&map_bounds={%22north%22:28.138149075447533,%22south%22:27.189447022515672,%22east%22:-80.724737875,%22west%22:-82.306769125}&zoom=10&limit=12&sort_by=Price-DESC&mobile_view=Map&version=1727879673903
        const map_bounds = `{"north":26.760979157255296,"south":25.801786319915113,"east":-81.17107039746094,"west":-82.40840560253906}`
        router.push(`/search?location=${location}&sales_type=${sales_type}&min_bed=${filter_values.min_beds}&max_bed=${filter_values.max_beds}&min_bath=${filter_values.min_baths}&max_bath=${filter_values.max_baths}&min_price=${filter_values.min_price}&max_price=${filter_values.max_price}&pool=${filter_values.must_have_pool}&view=${filter_values.must_have_view}&home_type=${JSON.stringify(home_type)}&map_bounds=${map_bounds}&zoom=7`)
    }

    return (
        <>
            <div className='w-full px-4 lg:px-0 flex flex-col *:text-white *:font-play-fair-display *:text-shadow-primary select-none'>
                <h2 className='italic font-normal text-2xl md:text-3xl'>YOUR NEW HOME IS WAITING</h2>
                <h1 className='font-normal text-4xl md:text-6xl mt-1'>START YOUR SEARCH</h1>
            </div>

            <div className='w-full px-4 lg:px-0 my-6'>
                <div className='w-full bg-white py-2 flex flex-wrap items-center px-2 relative'>
                    <StatusComponent status={selectedStatus} setStatus={setSelectedStatus} />
                    <div className='vertical-divider mx-2 h-7 border border-gray-300 hidden xs:block'></div>
                    <LocationComponent location={location} setLocation={setLocation} />
                    <div className='vertical-divider mx-2 h-7 border border-gray-300 hidden sm:block'></div>
                    <FIltersComponent filter_values={filter_values} setFilterValues={setFilterValues} tab="Buy" />
                    <SearchButton handleSearch={handleSearch} />
                </div>
            </div>
        </>
    )
}

export default BuySearchTab