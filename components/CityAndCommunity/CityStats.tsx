"use client"

import React, { useEffect, useState } from 'react'
import { APIResponseProps } from '../types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import numeral from 'numeral';

const helpers = new Helpers();
function CityStats({ city_slug, community_slug }: { city_slug?: string, community_slug?: string }) {

    const [stats_fetched, setStatsFetched] = useState(false);
    const [city_stats, setCityStats] = useState<any>({});

    useEffect(() => {

        const FetchCityStats = async () => {

            const statsPromise: Promise<APIResponseProps> = helpers.GetCityStats(city_slug!);
            const postResp = await statsPromise;
            const stats = postResp.data.city_stats.data;
            setStatsFetched(true);
            setCityStats(stats);
        }

        const FetchCommunityStats = async () => {

            const statsPromise: Promise<APIResponseProps> = helpers.GetCommunityStats(community_slug!);
            const postResp = await statsPromise;
            const stats = postResp.data.community_stats.data;
            setStatsFetched(true);
            setCityStats(stats);
        }

        if (city_slug && city_slug != "") {
            FetchCityStats();
        } else if (community_slug && community_slug != "") {
            FetchCommunityStats();
        }

    }, [city_slug, community_slug]);

    if (stats_fetched) {


        return (
            <div className='w-full mt-6'>
                <div className='w-full font-bold text-2xl'>Property Stats</div>
                <div className='w-full mt-1 grid grid-cols-3 gap-6 *:bg-gray-50 *:border *:border-gray-200 *:shadowlg *:p-6 *:flex *:flex-col 
                    *:items-center *:justify-center *:cursor-pointer'>
                    <div className=''>
                        <div className=' text-4xl'>{numeral(city_stats?.Total_Listings).format("0,0")}</div>
                        <div className=' font-bold text-lg'>Total Listings</div>
                    </div>

                    <div className=''>
                        <div className=' text-4xl'>{numeral(city_stats?.Residentials).format("0,0")}</div>
                        <div className=' font-bold text-lg'>Residential</div>
                    </div>

                    <div className=''>
                        <div className=' text-4xl'>{numeral(city_stats?.Residential_Income).format("0,0")}</div>
                        <div className=' font-bold text-lg'>Residential Income</div>
                    </div>

                    <div className=''>
                        <div className=' text-4xl'>{numeral(city_stats?.Commercial_Sale).format("0,0")}</div>
                        <div className=' font-bold text-lg'>Commercial Sale</div>
                    </div>

                    <div className=''>
                        <div className=' text-4xl'>{numeral(city_stats?.Lands).format("0,0")}</div>
                        <div className=' font-bold text-lg'>Lands</div>
                    </div>

                    <div className=''>
                        <div className=' text-4xl'>{numeral(city_stats?.Docks).format("0,0")}</div>
                        <div className=' font-bold text-lg'>Docks</div>
                    </div>
                </div>

                <div className='w-full grid grid-cols-2 mt-6 gap-6 *:bg-gray-50 *:border *:border-gray-200 *:shadowlg *:p-6 *:flex *:flex-col 
                    *:items-center *:justify-center *:cursor-pointer'>
                    <div>
                        <span className='text-4xl'>{numeral(city_stats?.Highest_Price).format("$0,0")}</span>
                        <strong className='font-bold text-lg'>Highest Price</strong>
                    </div>
                    <div>
                        <span className='text-4xl'>{numeral(city_stats?.AVG_Price).format("$0,0")}</span>
                        <strong className='font-bold text-lg'>Avegrage Price</strong>
                    </div>
                    <div>
                        <span className='text-4xl'>{numeral(city_stats?.Lowest_Price).format("$0,0")}</span>
                        <strong className='font-bold text-lg'>Lowest Price</strong>
                    </div>

                    <div>
                        <span className='text-4xl'>{numeral(city_stats?.AVG_Price_Per_SqFt).format("$0,0")}</span>
                        <strong className='font-bold text-lg'>Avegrage Price Per/SqFt</strong>
                    </div>
                </div>
            </div>
        )
    } else {
        return <div className='w-full h-52 flex items-center justify-center'>
            <AiOutlineLoading3Quarters size={35} className='mr-2 animate-spin' />
        </div>
    }

}

export default CityStats
