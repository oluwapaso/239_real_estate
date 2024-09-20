"use client"

import { Helpers } from '@/_lib/helpers'
import CustomLinkMain from '@/components/CustomLinkMain'
import HeroHeader from '@/components/HeroHeader'
import { APIResponseProps, ServiceDetails } from '@/components/types'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const helpers = new Helpers();
const Service_Details = () => {

    const params = useParams();
    const slug = params?.slug as string;
    const [req_resp, setReqResp] = useState<any>();
    const [service_info, setServiceInfo] = useState<ServiceDetails>();
    const [srvc_fetched, setSrvcFetched] = useState(false);

    useEffect(() => {

        const fetchServiceInfo = async () => {
            try {

                const srvcPromise: Promise<APIResponseProps> = helpers.LoadSingleService(slug, "Slug");
                const srvcResp = await srvcPromise;

                setReqResp(srvcResp);
                setServiceInfo(srvcResp?.data?.service_info);
                setSrvcFetched(true);

                if (!srvcResp.success) {
                    console.log(srvcResp.message);
                    return false;
                }

            } catch (e: any) {
                console.log(e.message);
            }
        }
        fetchServiceInfo();

    }, [slug]);


    const crumb = <><CustomLinkMain href="/"> Home</CustomLinkMain> <span>/</span> <CustomLinkMain href="/our-services?page=1">Our Services</CustomLinkMain>
        <span>/</span> <CustomLinkMain href={`/services/${slug}`}>{service_info?.friendly_name}</CustomLinkMain></>


    return (
        <>
            <HeroHeader page="Has Hero" bg_image={service_info?.header_image?.image_loc} crumb={crumb} max_width={1000} />
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left'>
                    <h3 className='w-full font-play-fair-display text-5xl font-normal'>{service_info?.friendly_name}</h3>

                    <div className='w-full mt-4 box-border overflow-hidden'>
                        {
                            srvc_fetched ? (
                                (req_resp.success && service_info) ? (
                                    <div className='w-full break-words box-border'>
                                        <div className='w-full ck-content box-border p-0' dangerouslySetInnerHTML={{ __html: service_info?.post_body }} />
                                    </div>
                                ) : ""
                            ) : <div className='w-full flex justify-center items-center min-h-60'>
                                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                            </div>
                        }
                    </div>

                </div>

            </section>

        </>
    )
}

export default Service_Details