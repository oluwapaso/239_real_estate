"use client"

import { Helpers } from '@/_lib/helpers'
import HeroHeader from '@/components/HeroHeader'
import { APIResponseProps, CommunityDraftsInfo } from '@/components/types'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import "../../../../../CkEditor/content-styles.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import CommunitySearch from '@/components/Home/CommunitySearch'
import numeral from 'numeral'

const helpers = new Helpers();
ChartJS.register(ArcElement, Tooltip, Legend);

const CommunityDetails = () => {

    const searchParams = useSearchParams();
    const params = useParams();
    const slug = params?.slug as string;
    const [req_resp, setReqResp] = useState<any>();
    const [community_info, setCommunityInfo] = useState<CommunityDraftsInfo>();
    const [comm_fetched, setCommFetched] = useState(false);
    const [comm_data, setCommData] = useState<any>();

    useEffect(() => {

        const fetchcommunityInfo = async () => {
            try {

                const commPromise: Promise<APIResponseProps> = helpers.LoadSingleCommunity(slug, "Slug");
                const commResp = await commPromise;

                setReqResp(commResp);
                setCommunityInfo(commResp?.data?.draft_info);
                setCommFetched(true);

                if (!commResp.success) {
                    console.log(commResp.message);
                    return false;
                }

            } catch (e: any) {
                console.log(e.message);
            }
        }
        fetchcommunityInfo();

    }, [slug]);

    useEffect(() => {

        const fetchCommData = async () => {

            const payload = {
                "community": community_info?.mls_name,
            }

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/(communities)/community-data`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }).then((resp): Promise<APIResponseProps> => {
                return resp.json();
            }).then(data => {

                if (data.success) {
                    setCommData(data.data);
                }

            });

        }

        fetchCommData();

    }, [searchParams, community_info?.mls_name]);

    const crumb = <><Link href="/"> Home</Link> <span>/</span> <Link href="/our-communities?page=1">Communities</Link>
        <span>/</span> <Link href={`/community/${slug}`}>{community_info?.friendly_name}</Link></>

    let data = [
        {
            label: "Lands",
            value: comm_data?.Lands,
            color: "rgba(0, 43, 73, 1)",
        },
        {
            label: "Residentials",
            value: comm_data?.Residentials,
            color: "rgba(0, 103, 160, 1)",
        },
        {
            label: "Commercial Sale",
            value: comm_data?.Commercial_Sale,
            color: "rgba(83, 217, 217, 1)",
        }, ,
        {
            label: "Residential_Income",
            value: comm_data?.Residential_Income,
            color: "rgba(255, 50, 192, 1)",
        },
    ]

    const options: any = {
        maintainAspectRatio: false,
        plugins: {
            responsive: true,
            legend: {
                display: false,
            },
            textInside: {
                text: "Active Listings",
                color: 'green',
                fontSize: 20
            },
            doughnutCenterText: {
                text: 'Center Text',
                color: '#000000', // Text color
                font: {
                    size: 16, // Font size
                    weight: 'bold', // Font weight
                },
            },
        },
        cutout: '80%',
    };

    ChartJS.register({
        id: 'textInside',
        afterDatasetsDraw: function (chart, _) {
            const ctx = chart.ctx;
            const width = chart.width;
            const height = chart.height;
            const fontSize = options.plugins.textInside.fontSize;
            ctx.font = fontSize + 'px Arial';
            ctx.fillStyle = options.plugins.textInside.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const text = options.plugins.textInside.text;
            const textX = Math.round(width / 2);
            const textY = Math.round(height / 2);
            ctx.fillText(text, textX, textY);
        }
    });

    const finalData = {
        labels: data.map((item) => item?.label),
        datasets: [
            {
                data: data.map((item) => Math.round(item?.value)),
                backgroundColor: data.map((item) => item?.color),
                borderColor: data.map((item) => item?.color),
                borderWidth: 1,
                dataVisibility: new Array(data.length).fill(true),
            },
        ],
    };

    return (
        <>
            <HeroHeader page="Has Hero" bg_image={community_info?.header_image?.image_loc} crumb={crumb} max_width={1000} />
            <section className='w-full bg-white pt-10 md:pt-20'>
                <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left'>
                    <h3 className='w-full font-play-fair-display text-5xl font-normal'>{community_info?.friendly_name}</h3>

                    <div className='w-full mt-4 box-border overflow-hidden'>
                        {
                            comm_fetched ? (
                                (req_resp.success && community_info) ? (
                                    <div className='w-full break-words box-border'>
                                        <div className='w-full ck-content box-border p-0' dangerouslySetInnerHTML={{ __html: community_info?.post_body }} />
                                    </div>
                                ) : ""
                            ) : <div className='w-full flex justify-center items-center min-h-60'>
                                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                            </div>
                        }
                    </div>

                </div>

                <div className='w-full bg-gray-100 py-20 mt-20'>
                    <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left'>
                        <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-5'>

                            <div className='col-span-1 py-14'>
                                <h2 className='w-full font-play-fair-display text-3xl'>Real Estate Statistics</h2>
                                <div className='w-full mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4'>

                                    <div className='flex justify-between items-center py-3 px-1 border-b border-gray-200'>
                                        <div className='font-semibold'>Average Price</div>
                                        <div className='font-normal'>{numeral(comm_data?.AVG_Price).format("$0,0.00")}</div>
                                    </div>

                                    <div className='flex justify-between items-center py-3 px-1 border-b border-gray-200'>
                                        <div className='font-semibold'>Lowest Price</div>
                                        <div className='font-normal'>{numeral(comm_data?.Lowest_Price).format("$0,0")}</div>
                                    </div>

                                    <div className='flex justify-between items-center py-3 px-1 border-b border-gray-200'>
                                        <div className='font-semibold'>Highest Price</div>
                                        <div className='font-normal'>{numeral(comm_data?.Highest_Price).format("$0,0")}</div>
                                    </div>

                                    <div className='flex justify-between items-center py-3 px-1 border-b border-gray-200'>
                                        <div className='font-semibold'>Total Listings</div>
                                        <div className='font-normal'>{numeral(comm_data?.Total_Listings).format("0,0")}</div>
                                    </div>

                                    <div className='justify-between items-center py-3 px-1 border-b border-gray-200 hidden'>
                                        <div className='font-semibold'>Avg. Days On Market</div>
                                        <div className='font-normal'>90</div>
                                    </div>

                                    <div className='flex justify-between items-center py-3 px-1 border-b border-gray-200'>
                                        <div className='font-semibold'>Avg. Price/SQFT</div>
                                        <div className='font-normal'>{numeral(comm_data?.AVG_Price_Per_SqFt).format("$0,0.00")}</div>
                                    </div>

                                </div>
                            </div>

                            <div className='col-span-1 flex justify-center items-start'>
                                <Doughnut data={finalData} options={options} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='container mx-auto max-w-[1000px] text-left'>
                    {
                        comm_fetched ? (
                            (req_resp.success && community_info) ? (
                                <CommunitySearch page="Communities Page" title={`${community_info?.friendly_name} Homes for Sale`}
                                    mls_name={community_info?.mls_name} slug={community_info?.slug} friendly_name={community_info?.friendly_name} />
                            ) : null
                        ) : <div className='w-full flex justify-center items-center min-h-60'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>
                    }
                </div>

                <div className='w-ful py-20 mt-20 relative' style={{ backgroundImage: `url(../home-hero.jpg)`, backgroundPosition: "center", }}>
                    <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left z-10 relative'>
                        <div className='w-full flex flex-col text-white'>

                            <h3 className='w-full font-play-fair-display text-4xl font-normal'>START SEARCHING FOR YOUR DREAM HOME NOW.</h3>
                            <div className='mt-4 leading-8 font-normal'>
                                Our website offers unmatched convenience, whether you're at home or on the move. It seamlessly adapts to
                                various devices, ensuring you can access the information you need effortlessly.
                            </div>

                            <div className='mt-6'>
                                <Link href="/search">
                                    <div className='px-8 py-3 bg-white text-primary uppercase max-w-[200px] flex justify-center
                                    border border-primary hover:bg-gray-100 hover:shadow-xl'>Start Search</div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className='absolute bg-black/40 h-full w-full top-0 z-0'></div>
                </div>

            </section>

        </>
    )
}

export default CommunityDetails