import React from 'react'
import { BiBuildingHouse } from 'react-icons/bi'
import { BsBuildings } from 'react-icons/bs'
import { FaRegBuilding } from 'react-icons/fa'
import { GiForestCamp, GiIsland } from 'react-icons/gi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { IoHomeOutline } from 'react-icons/io5'
import { MdHouseboat } from 'react-icons/md'

const PropertyTypes = ({ payload, handlePropertyType }: { payload: any, handlePropertyType: (type: string) => void }) => {
    return (
        <div className='w-full bg-white m-0 mt-1 lgScrn:shadow-xl rounded-lg'>
            <div className='lgScrn:bg-gray-100 pb-1 lgScrn:pb-0 lgScrn:py-3 lgScrn:px-3'>Property Type</div>
            <div className='w-full lgScrn:py-4 lgScrn:px-4 grid grid-cols-2 2xs:grid-cols-3 gap-2 *:cursor-pointer'>

                <div className={`p-4 border border-gray-500 flex justify-center items-center hover:bg-gray-800
                                        hover:text-white rounded-md ${payload.home_type.Any == "Yes" && "bg-gray-800 text-white"}`} onClick={() => handlePropertyType("Any")}>
                    <div className='w-full flex flex-col justify-center items-center'>
                        <BiBuildingHouse size={25} />
                        <div className='mt-1 font-normal text-sm'>Any</div>
                    </div>
                </div>

                <div className={`p-4 border border-gray-500 flex justify-center items-center hover:bg-gray-800
                                        hover:text-white rounded-md ${payload.home_type.House == "Yes" && "bg-gray-800 text-white"}`} onClick={() => handlePropertyType("House")}>
                    <div className='w-full flex flex-col justify-center items-center'>
                        <IoHomeOutline size={25} />
                        <div className='mt-1 font-normal text-sm'>House</div>
                    </div>
                </div>

                <div className={`p-4 border border-gray-500 flex justify-center items-center hover:bg-gray-800
                                        hover:text-white rounded-md ${payload.home_type.Condo == "Yes" && "bg-gray-800 text-white"}`} onClick={() => handlePropertyType("Condo")}>
                    <div className='w-full flex flex-col justify-center items-center'>
                        <HiOutlineBuildingOffice2 size={25} />
                        <div className='mt-1 font-normal text-sm'>Condo</div>
                    </div>
                </div>

                <div className={`p-4 border border-gray-500 flex justify-center items-center hover:bg-gray-800
                                        hover:text-white rounded-md ${payload.home_type.Townhouse == "Yes" && "bg-gray-800 text-white"}`} onClick={() => handlePropertyType("Townhouse")}>
                    <div className='w-full flex flex-col justify-center items-center'>
                        <FaRegBuilding size={25} />
                        <div className='mt-1 font-normal text-sm'>Townhouse</div>
                    </div>
                </div>

                <div className={`p-4 border border-gray-500 flex justify-center items-center hover:bg-gray-800
                                        hover:text-white rounded-md ${payload.home_type.MultiFamily == "Yes" && "bg-gray-800 text-white"}`} onClick={() => handlePropertyType("MultiFamily")}>
                    <div className='w-full flex flex-col justify-center items-center'>
                        <BsBuildings size={25} />
                        <div className='mt-1 font-normal text-sm'>Multi Family</div>
                    </div>
                </div>

                <div className={`p-4 border border-gray-500 flex justify-center items-center hover:bg-gray-800
                                        hover:text-white rounded-md ${payload.home_type.Mobile == "Yes" && "bg-gray-800 text-white"}`} onClick={() => handlePropertyType("Mobile")}>
                    <div className='w-full flex flex-col justify-center items-center'>
                        <MdHouseboat size={25} />
                        <div className='mt-1 font-normal text-sm'>Mobile</div>
                    </div>
                </div>

                <div className={`p-4 border border-gray-500 flex justify-center items-center hover:bg-gray-800
                                        hover:text-white rounded-md ${payload.home_type.Farm == "Yes" && "bg-gray-800 text-white"}`} onClick={() => handlePropertyType("Farm")}>
                    <div className='w-full flex flex-col justify-center items-center'>
                        <GiIsland size={25} />
                        <div className='mt-1 font-normal text-sm'>Farm</div>
                    </div>
                </div>

                <div className={`p-4 border border-gray-500 flex justify-center items-center hover:bg-gray-800
                                        hover:text-white rounded-md ${payload.home_type.Land == "Yes" && "bg-gray-800 text-white"}`} onClick={() => handlePropertyType("Land")}>
                    <div className='w-full flex flex-col justify-center items-center'>
                        <GiForestCamp size={25} />
                        <div className='mt-1 font-normal text-sm'>Land</div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default PropertyTypes