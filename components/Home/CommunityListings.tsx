"use client"

import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { APIResponseProps } from '../types';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Pagination from '../pagination';
import { Helpers } from '@/_lib/helpers';
import PropertyCard from '../PropertyCard';

const helper = new Helpers();
const CommunityListings = ({ mls_name, pagination_path = "" }: { mls_name?: string, pagination_path?: string }) => {

    const searchParams = useSearchParams();
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    const page_size = 12;
    const [isLoading, setIsLoading] = useState(true);
    const [listings, setListings] = useState<any[]>([]);
    const [props_loaded, setPropsLoaded] = useState(false);
    const [total_page, setTotalPage] = useState(0);
    let pagination_params = "";

    useEffect(() => {

        const fetchListings = async () => {

            setPropsLoaded(false);
            setTotalPage(0);

            const price_range = searchParams?.get("price-range");
            let min_price = "";
            let max_price = "";

            if (price_range && price_range != "") {

                min_price = price_range.split("-")[0];
                max_price = price_range.split("-")[1];

                //under-1,000,000
                if (min_price == "under") {
                    min_price = "";
                }

                //over-1,000,000
                if (min_price == "over") {
                    min_price = max_price;
                    max_price = "";
                }

            } else {
                min_price = searchParams?.get("min-price") as string || "";
                max_price = searchParams?.get("max-price") as string || "";
            }

            const payload = {
                "search_by": "Community List",
                "mls_name": mls_name,
                "min_bed": searchParams?.get("min-bed") || "",
                "max_bed": searchParams?.get("max-bed") || "",
                "min_bath": searchParams?.get("min-bath") || "",
                "max_bath": searchParams?.get("max-bath") || "",
                "min_price": min_price,
                "max_price": max_price,
                "sort_by": searchParams?.get("sort-by") || "",
                "page": curr_page,
                "limit": page_size
            }

            setIsLoading(true);

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/(listings)/load-properties`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }).then((resp): Promise<APIResponseProps> => {
                setIsLoading(false);
                return resp.json();
            }).then(data => {
                if (data.success) {

                    const properties = data.data?.properties;
                    if (properties && properties.length > 0) {
                        const total_records = properties[0].total_records;
                        setTotalPage(Math.ceil(total_records / page_size));
                    }

                    setListings(data.data?.properties);
                    setPropsLoaded(true);
                }
            });

        }

        fetchListings();

    }, [searchParams]);

    searchParams?.forEach((val, key) => {
        if (key != "page") {
            pagination_params += `${key}=${val}&`
        }
    });
    //pagination_params = helper.rTrim(pagination_params, "&");

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

export default CommunityListings