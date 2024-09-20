"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { BlogPostInfoParams, CommunityInfo } from '@/components/types'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import BlogPostCard from '@/components/BlogPostCard'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import SimpleHeader from '@/components/SimpleHeader'
import CommunityCard from '@/components/Home/CommunityCard'
import CustomLinkMain from '@/components/CustomLinkMain'

const helpers = new Helpers();
const BlogPosts = () => {

    const searchParams = useSearchParams();

    const [communities, setCommunities] = useState<any[]>([]);
    const [communities_fetched, setCommunitiesFetched] = useState(false);
    let all_comms: React.JSX.Element[] = [];

    const page_size = 24;
    let total_page = 0;
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;

    const payload = {
        paginated: true,
        post_type: "Published",
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchCommunities = async () => {

            try {

                const postPromise: Promise<CommunityInfo[]> = helpers.LoadCommunities(payload);
                const postResp = await postPromise;

                if (postResp.length > 0) {

                    setCommunities(postResp);
                    setCommunitiesFetched(true);

                } else {
                    throw new Error("Unable to load communities");
                }

            } catch (e: any) {
                console.log(e.message)
            }

        }

        fetchCommunities();

    }, [curr_page]);


    const no_post_added = <div className='w-full bg-red-100 text-red-600 flex justify-center items-center min-h-60 col-span-3'>
        No communities added yet
    </div>

    if (Array.isArray(communities)) {

        if (communities.length > 0) {

            const total_records = communities[0].total_records;
            const total_returned = communities.length;
            total_page = Math.ceil(total_records / page_size);

            if (total_records > 0 && total_returned > 0) {

                all_comms = communities.map((comm) => {
                    return <CommunityCard key={comm.comment_id} community={comm} city_slug='' />
                })

            } else {
                all_comms[0] = no_post_added
            }

        } else {

            //Making sure request has been sent
            if (communities_fetched) {
                all_comms[0] = no_post_added
            } else {
                all_comms[0] = <div className='w-full flex justify-center items-center min-h-60 col-span-3'>
                    <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                </div>
            }

        }

    } else {
        //Making sure request has been sent
        if (communities_fetched) {
            all_comms[0] = no_post_added
        } else {
            all_comms[0] = <div className='w-full flex justify-center items-center min-h-60 col-span-3'>
                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
            </div>
        }
    }

    return (
        <>
            <SimpleHeader page="Communities" />
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[1200px] px-3 xl:px-0 text-left'>

                    <div className='w-full font-normal'>
                        <CustomLinkMain href="/"> Home</CustomLinkMain> <span>/</span> <CustomLinkMain href="/our-communities?page=1">Our Communities</CustomLinkMain>
                    </div>

                    <h3 className='w-full font-play-fair-display text-2xl sm:text-3xl md:text-4xl'>Some Of Our Favorite Communities</h3>

                    <div className='w-full grid grid-cols-1 xs:grid-cols-2 tab:grid-cols-3 xs:gap-x-2 gap-4 mt-6'>{all_comms}</div>

                    <div className='w-full mt-3'>
                        {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path='/our-communities?' /> : null}
                    </div>
                </div>
            </section>
        </>
    )

}

export default BlogPosts