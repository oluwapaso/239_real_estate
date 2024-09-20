"use client"

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import Pagination from './pagination';
import { APIResponseProps } from './types';
import { useSession } from 'next-auth/react';
import moment from 'moment';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import DeleteSearch from './DeleteSearch';
import CustomLinkMain from './CustomLinkMain';

const SavedSearches = () => {

    const { data: session } = useSession();
    const user = { ...session?.user } as any;

    const [searches, setSearches] = useState<any>({});
    const [srch_loaded, setSrchLoaded] = useState(false);
    const searchParams = useSearchParams();
    const curr_page = parseInt(searchParams?.get("page") as string) || 1
    const pagination_path = `/my-dashboard?tab=Searches&`;
    const [total_page, setTotalPage] = useState(0);
    const page_size = 20;

    useEffect(() => {

        const fetchListings = async () => {

            setTotalPage(0);

            const payload = {
                "page": curr_page,
                "limit": page_size,
                "user_id": user.user_id
            }

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/(searches)/load-saved-searches`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }).then((resp): Promise<APIResponseProps> => {
                return resp.json();
            }).then(data => {
                if (data.success) {

                    const searches = data.data?.searches;
                    if (searches && searches.length > 0) {
                        const total_records = searches[0].total_records;
                        setTotalPage(Math.ceil(total_records / page_size));
                    }

                    setSearches(data.data?.searches);
                    setSrchLoaded(true);
                }
            });

        }

        fetchListings();

    }, [searchParams]);

    return (
        <div className='container mx-auto max-w-[1260px] text-left'>
            <h2 className='w-full text-2xl md:text-3xl lg:text-4xl mb-2'>MY SAVED SEARCHES</h2>
            <div className='w-full mb-6 hidden'>
                <div className='w-[200px] p-1 border border-primary grid grid-cols-2 *:py-2 *:px-5 *:flex *:items-center *:justify-center
                *:cursor-pointer'>
                    <CustomLinkMain href={`/my-dashboard?tab=Favorites&status=Active&page=1`} className={`hover:bg-primary/80 hover:text-white ${status == "Active" ? 'text-white bg-primary' : null}`}>Active</CustomLinkMain>
                    <CustomLinkMain href={`/my-dashboard?tab=Favorites&status=Sold&page=1`} className={`hover:bg-primary/80 hover:text-white ${status == "Sold" ? 'text-white bg-primary' : null}`}>Sold</CustomLinkMain>
                </div>
            </div>



            {
                srch_loaded ?
                    searches.length > 0 ? (
                        searches.map((srch: any) => {

                            let link = "";
                            if (srch.query_type == "search") {
                                link = `/search?search_by=Map&${srch.query_link}`;
                            } else {
                                link = srch.query_link;
                            }

                            return <div key={srch.search_id} id={`search_id_${srch.search_id}`} className='w-full py-4 px-4 mt-3 mb-4 border border-gray-200 bg-white'>
                                <div className='w-full flex flex-col'>
                                    <CustomLinkMain href={link} className='w-full text-lg sm:text-xl md:text-2xl hover:underline'>{srch.search_title}</CustomLinkMain>
                                    <div className='w-full flex mt-1 text-[15px]'>
                                        <div className='mr-2 font-medium'>SEARCH SAVED:</div> <div className='uppercase font-normal'>
                                            {moment(srch.date_saved).format("dddd, MMMM Do, YYYY [AT] h:mma")}
                                        </div>
                                    </div>

                                    <div className='w-full flex mt-1 text-[15px]'>
                                        <div className='mr-2 font-medium'>EMAIL UPDATES:</div> <div className='uppercase font-normal'>
                                            {srch.email_frequency}
                                        </div>
                                    </div>

                                    {
                                        (srch.search_title && srch.started == "Yes") && <div className='w-full flex mt-1 text-[15px]'>
                                            <div className='mr-2 font-medium'>LAST UPDATE:</div> <div className='uppercase font-normal'>
                                                {moment(srch.last_alert).format("dddd, MMMM Do, YYYY [AT] h:mma")}
                                            </div>
                                        </div>
                                    }

                                    <div className='w-full mt-5 grid grid-cols-2 text-center xs:flex *:cursor-pointer'>
                                        <CustomLinkMain href={link} className='py-3 px-3 xs:px-10 bg-primary 
                                        text-white font-light text-base hover:drop-shadow-xl text-center'>
                                            Run Search
                                        </CustomLinkMain>

                                        <DeleteSearch search_id={srch.search_id} user_id={user.user_id} />
                                    </div>
                                </div>
                            </div>
                        })
                    )
                        : (<div className='w-full flex justify-center items-center min-h-60 col-span-3'>
                            No results found.
                        </div>)
                    : <div className='w-full h-[200px] flex items-center justify-center'><AiOutlineLoading3Quarters size={35} className='animate-spin' /></div>
            }

            <div className='w-full mt-8'>
                {
                    srch_loaded ?
                        total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`${pagination_path}`} scroll_to='community-lists' /> : null
                        : null
                }
            </div>
        </div>
    )
}

export default SavedSearches