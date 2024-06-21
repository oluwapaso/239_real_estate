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
import { useModal } from '@/app/contexts/ModalContext';

const helpers = new Helpers();
function CityComponent(params: any) {

    const searchParams = useSearchParams();
    const { city_name, city_slug, city_params, slugs, page_number, path } = params;
    const [city_fetched, setCityFetched] = useState(false);
    const [city_found, setCityFound] = useState(true);
    const [city_data, setCityData] = useState<any>();
    const { closeModal: close_auth_modal } = useModal();
    let sort_by = searchParams?.get("sort-by");
    if (!sort_by) {
        sort_by = "Date-DESC";
    }
    const pagination_path = `${path}?`; //sort-by=${sort_by}

    //Close modal if it's opened, this usually happen after returning from property details page without signing in
    useEffect(() => {
        if (close_auth_modal) {
            close_auth_modal();
        }
    }, [])

    useEffect(() => {

        const CityInfo = async () => {

            const postPromise: Promise<APIResponseProps> = helpers.GetCityInfo(city_slug, "Slug");
            const postResp = await postPromise;
            const data_info = postResp.data.city_info;
            setCityFetched(true);

            if (!data_info || data_info == null) {
                setCityFound(false);
            }

            setCityData(data_info);
        }

        CityInfo();

    }, []);

    if (city_fetched && !city_found) {
        return <div className='w-full bg-red-300 h-20 flex items-center justify-center'>Invalid city info provided.</div>
    } else if (city_fetched && city_found) {

        const crumb = <><Link href="/">Home</Link> / <Link href={path} className=''>{city_name}</Link></>

        return (

            <section className='w-full bg-white'>
                <PageHeader bg_image={`${city_data.header_image?.image_loc ? city_data.header_image?.image_loc : ""}`}
                    crumb={crumb} max_width={1100} title={city_data.friendly_name} />

                <div className='container mx-auto max-w-[1100px] px-3 xl:px-0 text-left py-10 md:py-20'>

                    <div className='w-full' dangerouslySetInnerHTML={{ __html: city_data.published_content }} />

                    <CityStats city_slug={city_slug} />
                    <Filters page_slug={city_slug} city_params={city_params} city_name={city_data.friendly_name} mls_name={city_data.mls_name}
                        save_via='City' path={path} />
                    <Listings city_slug={city_slug} city_params={city_params} city_name={city_data.friendly_name}
                        mls_name={city_data.mls_name} pagination_path={pagination_path} type="City" />

                </div>

                <div className='w-ful py-20 mt-20 relative' style={{ backgroundImage: `url(../home-hero.jpg)`, backgroundPosition: "center", }}>
                    <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left z-10 relative'>
                        <div className='w-full flex flex-col text-white'>

                            <h3 className='w-full font-play-fair-display text-4xl font-normal uppercase'>
                                EXPLORE COMMUNITIES IN {city_data.friendly_name}.</h3>
                            <div className='mt-4 leading-8 font-normal'>
                                Our website offers unmatched convenience, whether you're at home or on the move. It seamlessly adapts to
                                various devices, ensuring you can access the information you need effortlessly.
                            </div>

                            <div className='mt-6'>
                                <Link href={`/${city_slug}/communities`}>
                                    <div className='px-4 py-3 bg-white text-primary uppercase max-w-[220px] flex justify-center
                                    border border-primary hover:bg-gray-100 hover:shadow-xl'>Start Exploring</div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className='absolute bg-black/40 h-full w-full top-0 z-0'></div>
                </div>
            </section>
        )
    } else {
        return <div className='w-full h-52 flex items-center justify-center'>
            <AiOutlineLoading3Quarters size={35} className='mr-2 animate-spin' />
        </div>
    }

}

export default CityComponent