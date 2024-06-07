"use client"

import Link from 'next/link'
import React from 'react'
import SimpleHeader from '@/components/SimpleHeader'
import CommunityFilter from '@/components/CommunityFilter/CommunityFilter'
import PropertyLists from '@/components/PropertyLists'
import { useSearchParams } from 'next/navigation'
import QuickPriceRange from '@/components/QuickPriceRange'

const SoldByUs = () => {

    const searchParams = useSearchParams();
    const price_range = searchParams?.get("price-range") as string;
    const pagination_path = "/homes-sold-by-us";

    return (
        <>
            <SimpleHeader page="Homes We've Sold" />
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left'>
                    <div className='w-full font-normal'>
                        <Link href="/">Home</Link> / <Link href="/search-for-houses?page=1">Homes We've Sold</Link>
                    </div>

                    <h3 className='w-full font-play-fair-display text-3xl md:text-4xl font-normal'>Recent Homes Sold By Us</h3>
                </div>

                <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left mt-9'>
                    <PropertyLists list_type="SoldByUs" pagination_path={pagination_path} />
                </div>

            </section>

        </>
    )
}

export default SoldByUs