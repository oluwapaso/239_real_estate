"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation';
import React from 'react'
import CustomLinkMain from './CustomLinkMain';

const QuickPriceRange = ({ price_range, pagination_path }: { price_range: string, pagination_path: string }) => {

    const searchParams = useSearchParams();

    return (
        <div className='w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 mt-4 *:font-normal *:py-3 *:border-t *:border-gray-300 transition duration-500'>
            <CustomLinkMain href={pagination_path} className={`hover:font-medium ${(searchParams?.size == 0) ? "!font-bold" : ""}`} passHref>All Listings</CustomLinkMain>
            <CustomLinkMain href={`?price-range=under-100000`}
                className={`hover:font-medium ${price_range == "under-100000" ? "!font-bold" : ""}`} passHref>Under $100,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "100000-200000" } }}
                className={`hover:font-medium ${price_range == "100000-200000" ? "!font-bold" : ""}`} passHref>$100,000 - $200,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "200000-300000" } }}
                className={`hover:font-medium ${price_range == "200000-300000" ? "!font-bold" : ""}`} passHref>$200,000 - $300,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "300000-400000" } }}
                className={`hover:font-medium ${price_range == "300000-400000" ? "!font-bold" : ""}`} passHref>$300,000 - $400,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "400000-500000" } }}
                className={`hover:font-medium ${price_range == "400000-500000" ? "!font-bold" : ""}`} passHref>$400,000 - $500,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "500000-600000" } }}
                className={`hover:font-medium ${price_range == "500000-600000" ? "!font-bold" : ""}`} passHref>$500,000 - $600,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "600000-700000" } }}
                className={`hover:font-medium ${price_range == "600000-700000" ? "!font-bold" : ""}`} passHref>$600,000 - $700,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "700000-800000" } }}
                className={`hover:font-medium ${price_range == "700000-800000" ? "!font-bold" : ""}`} passHref>$700,000 - $800,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "800000-900000" } }}
                className={`hover:font-medium ${price_range == "800000-900000" ? "!font-bold" : ""}`} passHref>$800,000 - $900,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "900000-1000000" } }}
                className={`hover:font-medium ${price_range == "900000-1000000" ? "!font-bold" : ""}`} passHref>$900,000 - $1,000,000</CustomLinkMain>
            <CustomLinkMain href={{ query: { "price-range": "over-1000000" } }}
                className={`hover:font-medium ${price_range == "over-1000000" ? "!font-bold" : ""}`} passHref>Over $1,000,000</CustomLinkMain>
        </div>
    )
}

export default QuickPriceRange