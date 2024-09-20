"use client"

import Link from 'next/link'
import React from 'react'
import CommunityFilter from '../CommunityFilter/CommunityFilter'
import { useSearchParams } from 'next/navigation'
import CommunityListings from './CommunityListings'
import QuickPriceRange from '../QuickPriceRange'

//http://localhost:3000/?price-range=60000-58585885&beds-range=1-4&baths-range=1-4&sort-by=Price&sort-dir=ASC&page=1
const CommunitySearch = ({ page, title, mls_name, slug, friendly_name }:
    { page: string, title: string, mls_name?: string, slug?: string, friendly_name?: string }) => {

    const searchParams = useSearchParams();
    const price_range = searchParams?.get("price-range") as string;

    let pagination_path = "/";
    if (page == "Communities Page") {
        pagination_path = `/community/${slug}`;
    }

    // Convert searchParams to object
    // const paramsObject = Object.fromEntries(searchParams?.entries() ?? []);
    // console.log("paramsObject:", paramsObject);

    return (
        <section className='w-full bg-white py-8 md:py-10 lg:py-14'>
            <div className='container mx-auto max-w-[1200px] px-3 xl:px-0 text-left'>
                <h3 className='w-full font-play-fair-display text-2xl md:text-3xl lg:text-4xl'>{title}</h3>

                {/** <QuickPriceRange price_range={price_range} pagination_path={pagination_path} />
                <CommunityFilter city={friendly_name} /> */}
                <CommunityListings mls_name={mls_name} pagination_path={pagination_path} />

            </div>

        </section>
    )
}

export default CommunitySearch