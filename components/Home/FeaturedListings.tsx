"use client"

import { RootState } from '@/app/(main-website)/(main-layout)/GlobalRedux/store';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { APIResponseProps } from '../types';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import PropertyCard from '../PropertyCard';

const FeaturedListings = () => {

    let fls = useSelector((state: RootState) => state.app.featured_listings);
    const curr_page = 1;
    const [isLoading, setIsLoading] = useState(true);
    const [listings, setListings] = useState<any[]>([]);
    const [props_loaded, setPropsLoaded] = useState(false);

    useEffect(() => {

        const fetchListings = async () => {

            let page_size = fls.limits || 12;
            let location = fls.location || "";
            let sort_by = fls.sort_by || "";
            let min_price = fls.min_price || "";
            let max_price = fls.max_price || "";
            let min_beds = fls.min_beds || "";
            let max_beds = fls.max_beds || "";
            let min_baths = fls.min_baths || "";
            let max_baths = fls.max_baths || "";

            const prop_type: any = {}
            if (fls.commercial && fls.commercial.length && fls.commercial[0] == "Commercial") {
                prop_type["Commercial"] = "Yes";
            } else {
                prop_type["Commercial"] = "No";
            }

            if (fls.residential && fls.residential.length && fls.residential[0] == "Residential") {
                prop_type["Residential"] = "Yes";
            } else {
                prop_type["Residential"] = "No";
            }

            if (fls.land_and_lot && fls.land_and_lot.length && fls.land_and_lot[0] == "Lot & Land") {
                prop_type["Land"] = "Yes";
            } else {
                prop_type["Land"] = "No";
            }

            if (fls.residential_income && fls.residential_income.length && fls.residential_income[0] == "Residential Income") {
                prop_type["Residential"] = "Yes";
            } else {
                prop_type["Residential"] = "No";
            }

            if (fls.boat_dock && fls.boat_dock.length && fls.boat_dock[0] == "Boat Dock") {
                prop_type["Dock"] = "Yes";
            } else {
                prop_type["Dock"] = "No";
            }

            const payload = {
                "search_by": "Featured Listings",
                "location": location,
                "home_type": prop_type,
                "min_bed": min_beds,
                "max_bed": max_beds,
                "min_bath": min_baths,
                "max_bath": max_baths,
                "min_price": min_price,
                "max_price": max_price,
                "sort_by": sort_by,
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
                    setListings(data.data?.properties);
                    setPropsLoaded(true);
                }
            });

        }

        fetchListings();

    }, []);

    return (
        <section className='w-full bg-white py-8 md:py-10 lg:py-14'>
            <div className='container mx-auto max-w-[1200px] px-3 xl:px-0 text-left'>
                <h3 className='w-full text-2xl md:text-3xl lg:text-4xl'>
                    <div className='w-full'>Featured Listings</div>
                    <div className='w-full mt-1'>
                        <div className='w-[130px] h-[6px] bg-primary'></div>
                    </div>
                </h3>

                <div className='w-full mt-5'>
                    <div className='w-full grid grid-cols-1 xs:grid-cols-2 tab:grid-cols-3 gap-x-2 xs:gap-x-4 gap-y-8 relative z-0' id='community-lists'>
                        {isLoading && (<div className='w-full flex justify-center items-center min-h-60 col-span-3'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>)}

                        {
                            props_loaded ?
                                listings.length > 0 ? (
                                    listings.map((prop) => {
                                        return <PropertyCard prop={prop} page='Featured' />
                                    })
                                ) : (<div className='w-full flex justify-center items-center min-h-60 col-span-3'>
                                    No results found.
                                </div>)
                                : ""
                        }
                    </div>
                </div>
            </div>

        </section>
    )
}

export default FeaturedListings