"use client"

import React, { useEffect, useState } from 'react'
import { APIResponseProps } from '../types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import numeral from 'numeral';
import { BiMath } from 'react-icons/bi';
import { HiArrowTrendingDown, HiOutlineBuildingOffice2, HiOutlineHomeModern } from 'react-icons/hi2';
import { TbHomeDollar, TbHomePlus } from 'react-icons/tb';
import { GiHarborDock, GiIsland } from 'react-icons/gi';
import { BsGraphDownArrow, BsGraphUpArrow } from 'react-icons/bs';
import { MdOutlineEqualizer } from 'react-icons/md';

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
                <div className='w-full mt-1 grid grid-cols-3 gap-6 *:bg-white *:border *:border-gray-200 *:shadow-lg *:p-6 *:flex
                    *:items-center *:justify-between *:cursor-pointer *:rounded-md'>
                    <div className=''>
                        <div>
                            <BiMath size={45} className=' text-red-600' />
                        </div>
                        <div className='flex flex-col'>
                            <div className=' text-2xl'>{numeral(city_stats?.Total_Listings).format("0,0")}</div>
                            <div className=' font-normal text-lg'>Total Listings</div>
                        </div>
                    </div>

                    <div className=''>
                        <div>
                            <HiOutlineHomeModern size={45} className=' text-green-600' />
                        </div>
                        <div className='flex flex-col'>
                            <div className=' text-2xl'>{numeral(city_stats?.Residentials).format("0,0")}</div>
                            <div className=' font-normal text-lg'>Residential</div>
                        </div>
                    </div>

                    <div className=''>
                        <div>
                            <TbHomePlus size={45} className=' text-orange-600' />
                        </div>
                        <div className='flex flex-col'>
                            <div className=' text-2xl'>{numeral(city_stats?.Residential_Income).format("0,0")}</div>
                            <div className=' font-normal text-lg'>Residential Income</div>
                        </div>
                    </div>

                    <div className=''>
                        <div className='flex flex-col'>
                            <div className=' text-2xl'>{numeral(city_stats?.Commercial_Sale).format("0,0")}</div>
                            <div className=' font-normal text-lg'>Commercial Sale</div>
                        </div>
                        <div>
                            <HiOutlineBuildingOffice2 size={45} className=' text-pink-600' />
                        </div>
                    </div>

                    <div className=''>
                        <div className='flex flex-col'>
                            <div className=' text-2xl'>{numeral(city_stats?.Lands).format("0,0")}</div>
                            <div className=' font-normal text-lg'>Lands</div>
                        </div>
                        <div>
                            <GiIsland size={45} className=' text-sky-600' />
                        </div>
                    </div>

                    <div className=''>
                        <div className='flex flex-col'>
                            <div className=' text-2xl'>{numeral(city_stats?.Docks).format("0,0")}</div>
                            <div className=' font-normal text-lg'>Docks</div>
                        </div>
                        <div>
                            <GiHarborDock size={45} className=' text-rose-600' />
                        </div>
                    </div>
                </div>

                <div className='w-full grid grid-cols-2 mt-6 gap-6 *:bg-white *:border *:border-gray-200 *:shadow-lg *:p-6 *:flex 
                    *:items-center *:justify-between *:cursor-pointer *:rounded-md'>
                    <div>
                        <div>
                            <BsGraphUpArrow size={45} className=' text-green-600' />
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-2xl'>{numeral(city_stats?.Highest_Price).format("$0,0")}</span>
                            <strong className='font-normal text-lg'>Highest Price</strong>
                        </div>
                    </div>
                    <div>
                        <div>
                            <MdOutlineEqualizer size={45} className=' text-blue-600' />
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-2xl'>{numeral(city_stats?.AVG_Price).format("$0,0")}</span>
                            <strong className='font-normal text-lg'>Avegrage Price</strong>
                        </div>
                    </div>
                    <div>
                        <div className='flex flex-col'>
                            <span className='text-2xl'>{numeral(city_stats?.Lowest_Price).format("$0,0")}</span>
                            <strong className='font-normal text-lg'>Lowest Price</strong>
                        </div>
                        <div>
                            <BsGraphDownArrow size={45} className=' text-red-600' />
                        </div>
                    </div>

                    <div>
                        <div className='flex flex-col'>
                            <span className='text-2xl'>{numeral(city_stats?.AVG_Price_Per_SqFt).format("$0,0")}</span>
                            <strong className='font-normal text-lg'>Avegrage Price Per/SqFt</strong>
                        </div>
                        <div>
                            <TbHomeDollar size={45} className=' text-pink-600' />
                        </div>
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
