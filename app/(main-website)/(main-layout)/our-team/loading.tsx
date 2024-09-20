import CustomLinkMain from '@/components/CustomLinkMain'
import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'
import React from 'react'

const Loading = () => {
    return (
        <>
            <SimpleHeader page="Meet The Team" />
            <section className='w-full bg-white py-20'>
                <div className='container mx-auto max-w-[850px] text-left'>
                    <div className='w-full font-normal'>
                        <CustomLinkMain href="/">Home</CustomLinkMain> / <CustomLinkMain href="/our-team?page=1">Meet The Team</CustomLinkMain>
                    </div>

                    <h3 className='w-full font-play-fair-display text-5xl mt-2'>Meet The Team</h3>

                    <div className='w-full flex flex-col mt-4'>
                        {
                            [1, 2, 3, 4].map((elem, index) => {
                                return (
                                    <div key={index} className='w-full flex min-h-40 float-left my-6 bg-gray-50 border border-gray-200 px-5 py-5'>
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

                                            <div className='w-full text-md mt-3 bg-gray-200 animate-pulse h-20'>
                                            </div>

                                            <div className='w-full flex *:cursor-pointer mt-4'>
                                                <div className='hover:scale-110 transition-all duration-500 mr-3'>
                                                    <div className='flex items-center bg-primary text-white py-5 w-32 rounded-md animate-pulse'>
                                                    </div>
                                                </div>
                                                <div className='hover:scale-110 transition-all duration-500'>
                                                    <div className='flex items-center bg-sky-600 text-white py-5 w-32 px-4 rounded-md animate-pulse'>
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
            </section>
        </>
    )
}

export default Loading