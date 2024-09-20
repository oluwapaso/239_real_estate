"use client"

import React from 'react'

export default function Loading() {

    return (
        <div className='w-full'>
            <div className='w-full flex font-bold text-lg justify-between'>
                <span>All Agents</span>
                <div className='flex items-center'>
                    <div className='bg-primary text-white flex items-center justify-center ml-2 py-1 h-10 px-4 text-sm font-medium 
                    hover:drop-shadow-xl w-28'>
                    </div>
                </div>
            </div>

            <div className='w-full grid grid-cols-2 gap-4'>
                {
                    [1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => {
                        return (
                            <div key={index} className='w-full flex min-h-40 float-left my-6 bg-white border border-gray-200 px-5 py-5'>
                                <div className='block min-w-[230px] max-w-[230px] overflow-hidden bg-gray-200 animate-pulse'>
                                </div>
                                <div className='flex-grow flex flex-col pl-6'>
                                    <h2 className='font-play-fair-display text-3xl mb-2 bg-gray-200 animate-pulse h-5 w-[50%]'><span></span></h2>
                                    <h2 className='font-play-fair- text-lg mb-1  bg-gray-200 animate-pulse h-5 w-[30%]'></h2>
                                    <h2 className='font-play-fair- text-lg mb-1 flex items-center cursor-pointer  bg-gray-200 animate-pulse h-5 w-[40%]'>
                                    </h2>

                                    <h2 className='font-play-fair- text-lg mb-2 flex items-center cursor-pointer  bg-gray-200 animate-pulse h-5 w-[50%]'>
                                    </h2>

                                    <div className='flex *:mr-2 *:cursor-pointer  bg-gray-200 animate-pulse h-5 w-[20%]'></div>

                                    <div className='w-full flex *:cursor-pointer mt-4'>
                                        <div className='hover:scale-110 transition-all duration-500 mr-3'>
                                            <div className='flex items-center bg-primary text-white py-5 w-32 rounded-md animate-pulse'>
                                            </div>
                                        </div>
                                        <div className='hover:scale-110 transition-all duration-500'>
                                            <div className='flex items-center bg-red-600 text-white py-5 w-32 px-4 rounded-md animate-pulse'>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}