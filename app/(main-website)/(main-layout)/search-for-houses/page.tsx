"use client"

import Link from 'next/link'
import React from 'react'
import SimpleHeader from '@/components/SimpleHeader'
import CommunityFilter from '@/components/CommunityFilter/CommunityFilter'
import PropertyLists from '@/components/PropertyLists'
import { useSearchParams } from 'next/navigation'
import QuickPriceRange from '@/components/QuickPriceRange'
import CustomLinkMain from '@/components/CustomLinkMain'

const SearchForHouses = () => {

    const searchParams = useSearchParams();
    const price_range = searchParams?.get("price-range") as string;
    const pagination_path = "/search-for-houses";

    return (
        <>
            <SimpleHeader page="Search For Houses" />
            <section className='w-full bg-white pt-10 md:pt-20 pb-20'>
                <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left'>
                    <div className='w-full font-normal'>
                        <CustomLinkMain href="/">Home</CustomLinkMain> / <CustomLinkMain href="/search-for-houses?page=1">Search for Houses</CustomLinkMain>
                    </div>

                    <h3 className='w-full font-play-fair-display text-4xl font-normal'>Search Wisconsin Houses</h3>
                </div>

                <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left mt-9'>
                    <QuickPriceRange price_range={price_range} pagination_path={pagination_path} />
                    <CommunityFilter />
                    <PropertyLists list_type="Houses" pagination_path={pagination_path} />
                </div>

            </section>

        </>
    )
}

export default SearchForHouses