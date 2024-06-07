"use client"

import React, { useEffect, useState } from 'react'
import { APIResponseProps } from '../types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Link from 'next/link';
import CityStats from './CityStats';
import PageHeader from './PageHeader';
import Filters from './Filters';
import Listings from './Listings';
import { useSearchParams } from 'next/navigation';

const helpers = new Helpers();
function CommunityComponent(params: any) {

    const searchParams = useSearchParams();
    const { city_name, city_slug, community_slug, community_params, slugs, page_number, path } = params;
    const [community_fetched, setCommunityityFetched] = useState(false);
    const [community_found, setCommunityFound] = useState(true);
    const [comm_data, setCityData] = useState<any>();
    let sort_by = searchParams?.get("sort-by");
    if (!sort_by) {
        sort_by = "Date-DESC";
    }
    const pagination_path = `${path}?`;//?sort-by=${sort_by}

    useEffect(() => {

        const CityInfo = async () => {

            const postPromise: Promise<APIResponseProps> = helpers.LoadSingleCommunity(community_slug, "Slug");
            const postResp = await postPromise;
            const data_info = postResp.data.city_info;
            setCommunityityFetched(true);

            if (!data_info || data_info == null) {
                setCommunityFound(false);
            }

            setCityData(data_info);
        }

        CityInfo();

    }, []);

    if (community_fetched && !community_found) {
        return <div className='w-full bg-red-300 h-20 flex items-center justify-center'>Invalid community info provided.</div>
    } else if (community_fetched && community_found) {

        const crumb = <><Link href="/">Home</Link> / <Link href={`/${city_slug}`} className=''>{city_name}</Link> /&nbsp;
            <Link href={`/${city_slug}/communities`} className=''>Communities</Link> / <Link href={`/${city_slug}/${community_slug}`} className=''>{comm_data.friendly_name}</Link></>

        return (

            <section className='w-full bg-white'>
                <PageHeader bg_image={`${comm_data.header_image?.image_loc ? comm_data.header_image?.image_loc : ""}`}
                    crumb={crumb} max_width={1100} title={comm_data.friendly_name} />

                <div className='container mx-auto max-w-[1100px] px-3 xl:px-0 text-left py-10 md:py-20'>

                    <div className='w-full' dangerouslySetInnerHTML={{ __html: comm_data.post_body }} />

                    <CityStats community_slug={community_slug} />
                    <Filters page_slug={`${city_slug}/${community_slug}`} city_params={community_params} city_name={comm_data.friendly_name}
                        mls_name={comm_data.mls_name} save_via='Community' path={path} />
                    <Listings city_slug={city_slug} community_slug={community_slug} city_params={community_params} city_name={comm_data.friendly_name}
                        mls_name={comm_data.mls_name} pagination_path={pagination_path} type="Community" />

                </div>
            </section>
        )
    } else {
        return <div className='w-full h-52 flex items-center justify-center'>
            <AiOutlineLoading3Quarters size={35} className='mr-2 animate-spin' />
        </div>
    }

}

export default CommunityComponent