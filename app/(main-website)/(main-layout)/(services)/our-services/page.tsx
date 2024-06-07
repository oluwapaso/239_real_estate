"use client"

import { Helpers } from '@/_lib/helpers'
import ServiceCard from '@/components/Home/ServiceCard'
import SimpleHeader from '@/components/SimpleHeader'
import Pagination from '@/components/pagination'
import { ServiceLists } from '@/components/types'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const helpers = new Helpers();
const OurServices = () => {

    const page_size = 20;
    let total_page = 0;
    const searchParams = useSearchParams();
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    const [isLoading, setIsLoading] = useState(true);
    const [services, setServices] = useState<any[]>([]);
    const [srvc_loaded, setSrvcLoaded] = useState(false);

    const payload = {
        paginated: true,
        "post_type": "Published",
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchAgets = async () => {
            const srvcPromise: Promise<ServiceLists[]> = helpers.LoadServices(payload);
            const srvcResp = await srvcPromise
            setServices(srvcResp);
            setSrvcLoaded(true);
            setIsLoading(false);
        }

        fetchAgets();

    }, [curr_page]);

    let all_services: React.JSX.Element[] = []

    if (Array.isArray(services)) {

        if (services.length > 0) {

            if (!services.length) {
                throw new Error("No services found.")
            }

            const total_records = services[0].total_records
            const total_returned = services.length
            total_page = Math.ceil(total_records / page_size)

            if (total_records > 0 && total_returned > 0) {

                all_services = services.map((service, index) => {
                    return <ServiceCard key={index} item={service} />
                })

            } else {
                throw new Error("No agents found.")
            }

        }

    } else {
        throw new Error("No agents found.")
    }

    return (
        <>
            <SimpleHeader page="Meet The Team" />
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[1100px] px-3 xl:px-0 text-left'>
                    <div className='w-full font-normal'>
                        <Link href="/">Home</Link> / <Link href="/our-services?page=1">Our Services</Link>
                    </div>

                    <h3 className='w-full font-play-fair-display text-2xl md:text-3xl lg:text-4xl mt-2'>Our Services</h3>

                    <div className='w-full mx-auto max-w-[500px] md:max-w-[100%] mt-4 grid grid-cols-1 xs:grid-cols-2 gap-x-2 
                    xs:gap-x-4 gap-y-8 mb-6'>
                        {isLoading && (<div className='w-full flex justify-center items-center min-h-60 col-span-full'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>)}

                        {srvc_loaded && (all_services)}
                    </div>

                    {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`/our-services?`} /> : null}
                </div>
            </section>
        </>

    )
}

export default OurServices