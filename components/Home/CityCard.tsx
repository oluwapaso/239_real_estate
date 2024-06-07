import React from 'react'
import Link from 'next/link'
import { Helpers } from '@/_lib/helpers'

const helper = new Helpers();
const CityCard = ({ city }: { city: any }) => {
    return (
        <>
            <div className='border border-primary/30 grid grid-cols-5 shadow-md hover:shadow-xl hover:scale-[1.03] duration-300 
                cursor-pointer rounded-md overflow-hidden bg-white h-52'>
                <div className='col-span-2 !bg-cover !bg-center' style={{ background: `url(${city?.header_image?.image_loc})` }}>

                </div>
                <div className='col-span-3 py-3 px-4 flex flex-col text-primary'>
                    <div className='w-full font-medium text-lg'>{helper.ucwords(city.friendly_name)}</div>
                    <div className='w-full font-normal text-base mt-1'>{city.excerpt}</div>
                    <div className='w-full flex justify-end justify-self-end mt-auto'>
                        <Link href={`/${city.slug}`} className='bg-primary text-white py-2 px-4 hover:shadow-lg cursor-pointer rounded
                    font-normal text-sm'>Read more...</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CityCard