"use client"

import { useSearchParams } from 'next/navigation';
import React from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import PropertyCard from './PropertyCard';
import Pagination from './pagination';
import useFetchListings from '@/_hooks/useFetchProperties';

const PropertyLists = ({ list_type, pagination_path }: { list_type: string, pagination_path: string }) => {

    const searchParams = useSearchParams();
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    const page_size = 12;
    let pagination_params = "";

    const { listings, props_loaded, total_page, isLoading } = useFetchListings(searchParams, list_type, curr_page, page_size);

    searchParams?.forEach((val, key) => {
        if (key != "page") {
            pagination_params += `${key}=${val}&`
        }
    });

    return (
        <>
            <div className='w-full grid grid-cols-1 xs:grid-cols-2 tab:grid-cols-3 xs:gap-x-2 gap-x-4 gap-y-8 relative z-0' id='community-lists'>
                {isLoading && (<div className='w-full flex justify-center items-center min-h-60 col-span-3'>
                    <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                </div>)}

                {
                    props_loaded ?
                        listings.length > 0 ? (
                            listings.map((prop) => {
                                return <PropertyCard prop={prop} />
                            })
                        )
                            : (<div className='w-full flex justify-center items-center min-h-60 col-span-3'>
                                No results found.
                            </div>)
                        : ""
                }
            </div>

            <div className='w-full mt-8'>
                {
                    props_loaded ?
                        total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`${pagination_path}/?${pagination_params}`} scroll_to='community-lists' /> : null
                        : null
                }
            </div>
        </>
    )
}

export default PropertyLists