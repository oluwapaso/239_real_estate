"use client"

import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { APIResponseProps } from '../types';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Pagination from '../pagination';
import { Helpers } from '@/_lib/helpers';
import PropertyCard from '../PropertyCard';

const helper = new Helpers();
const Listings = ({ city_slug, community_slug, city_params, city_name, mls_name, pagination_path = "", type }:
    {
        city_slug?: string, community_slug?: string, city_params?: any, city_name?: string, mls_name?: string, pagination_path?: string,
        type?: string
    }) => {

    const searchParams = useSearchParams();
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    const page_size = 12;
    const [isLoading, setIsLoading] = useState(true);
    const [listings, setListings] = useState<any[]>([]);
    const [props_loaded, setPropsLoaded] = useState(false);
    const [total_page, setTotalPage] = useState(0);
    const [total_props, setTotalProps] = useState(0);
    let pagination_params = "";

    useEffect(() => {

        const fetchListings = async () => {

            setPropsLoaded(false);
            setTotalPage(0);

            let min_bed = "";
            let max_bed = "";
            let min_bath = "";
            let max_bath = "";
            let min_price = "";
            let max_price = "";

            if (city_params && city_params.slug && city_params.slug.length) {
                city_params.slug.forEach((params: string) => {
                    if (params && params != "") {
                        if (params.includes("listings")) {

                            /** all-listings, 100000-2000000-listings, listings-over-2000, listings-under-2000 */
                            if (params != "all-listings") {
                                if (params.includes("-over-")) {
                                    min_price = params.split("-over-")[1];
                                } else if (params.includes("-under-")) {
                                    max_price = params.split("-under-")[1];
                                } else {
                                    min_price = params.split("-")[0];
                                    max_price = params.split("-")[1];
                                }
                            }

                        } else if (params.includes("beds")) {

                            /** 2-3-beds, 4-beds, 2-beds-plus */
                            if (params.includes("-beds-plus")) {
                                min_bed = params.split("-beds-plus")[1];
                            } else {
                                min_bed = params.split("-")[0];
                                max_bed = params.split("-")[1];
                                if (max_bed == "beds") { //4 - beds
                                    max_bed = "";
                                }
                            }

                        } else if (params.includes("baths")) {

                            /** 2-3-baths, 4-baths, 2-baths-plus */
                            if (params.includes("-baths-plus")) {
                                min_bath = params.split("-baths-plus")[1];
                            } else {
                                min_bath = params.split("-")[0];
                                max_bath = params.split("-")[1];
                                if (max_bath == "baths") { //4 - baths
                                    max_bath = "";
                                }
                            }

                        }
                    }
                });
            }

            interface Payload {
                search_by: string;
                min_bed: string;
                max_bed: string;
                min_bath: string;
                max_bath: string;
                min_price: string;
                max_price: string;
                sort_by: string;
                page: number;
                limit: number;
                mls_name?: string; // Make mls_name optional
                mls_county_name?: string; // Make mls_county_name optional
            }

            const payload: Payload = {
                "search_by": "List",
                //"mls_name": mls_name,
                "min_bed": min_bed || "",
                "max_bed": max_bed || "",
                "min_bath": min_bath || "",
                "max_bath": max_bath || "",
                "min_price": min_price,
                "max_price": max_price,
                "sort_by": searchParams?.get("sort-by") || "",
                "page": curr_page,
                "limit": page_size
            }

            if (type == "City") {
                payload.mls_name = mls_name;
            } else if (type == "Community") {
                payload.mls_county_name = mls_name;
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
                        setTotalProps(total_records);
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
            <div className='w-full mt-10 mb-2 text-2xl font-bold'>{total_props} Properties for sale in {city_name}</div>
            <div className='w-full grid grid-cols-1 xs:grid-cols-2 tab:grid-cols-3 gap-x-2 xs:gap-x-4 gap-y-8 relative z-0' id='community-lists'>
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
                        total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`${pagination_path}${pagination_params}`} scroll_to='community-lists' /> : null
                        : null
                }
            </div>
        </>
    )
}

export default Listings