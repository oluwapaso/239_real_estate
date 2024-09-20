"use client"

import { useSearchParams } from 'next/navigation';
import React from 'react'
import PropertyLists from './PropertyLists';
import Link from 'next/link';
import CustomLinkMain from './CustomLinkMain';

const MyFavorites = () => {

    const searchParams = useSearchParams();
    const status = searchParams?.get("status") as string;
    const page = searchParams?.get("page") as string;
    const pagination_path = `/my-dashboard`;
    const list_type = `Favorites-${status}`;

    return (
        <div className='container mx-auto max-w-[1260px] text-left'>
            <h2 className='w-full font-play-fair-display text-2xl md:text-3xl lg:text-4xl mb-2'>MY FAVORITE LISTINGS</h2>
            <div className='w-full mb-6'>
                <div className='w-[200px] p-1 border border-primary grid grid-cols-2 *:py-2 *:px-5 *:flex *:items-center *:justify-center
                *:cursor-pointer'>
                    <Link href={`/my-dashboard?tab=Favorites&status=Active&page=1`} className={`hover:bg-primary/80 hover:text-white ${status == "Active" ? 'text-white bg-primary' : null}`}>Active</Link>
                    <Link href={`/my-dashboard?tab=Favorites&status=Sold&page=1`} className={`hover:bg-primary/80 hover:text-white ${status == "Sold" ? 'text-white bg-primary' : null}`}>Sold</Link>
                </div>
            </div>
            <PropertyLists list_type={list_type} pagination_path={pagination_path} />
        </div>
    )
}

export default MyFavorites