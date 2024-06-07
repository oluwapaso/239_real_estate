import Link from 'next/link'
import React from 'react'

const ServiceCard = ({ item }: { item: any }) => {
    return (
        <div className='border border-primary/30 grid grid-cols-5 shadow-md hover:shadow-xl hover:scale-[1.03] duration-300 cursor-pointer
        rounded-md overflow-hidden bg-white'>
            <div className='col-span-2 !bg-cover !bg-center' style={{ background: `url(${item.header_image.image_loc})` }}>

            </div>
            <div className='col-span-3 py-3 px-4 flex flex-col'>
                <div className='w-full font-medium text-lg'>{item.friendly_name}</div>
                <div className='w-full font-normal text-base mt-1'>{item.excerpt}</div>
                <div className='w-full flex mt-2 justify-end'>
                    <Link href={`/services/${item.slug}`} className='bg-primary text-white py-2 px-4 hover:shadow-lg cursor-pointer rounded
                    font-normal text-sm'>Read more...</Link>
                </div>
            </div>
        </div>
    )
}

export default ServiceCard
