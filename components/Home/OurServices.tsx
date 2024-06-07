import React, { useEffect, useState } from 'react'
import { APIResponseProps, ServiceLists } from '../types';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Helpers } from '@/_lib/helpers';
import ServiceCard from './ServiceCard';
import Link from 'next/link';

const helpers = new Helpers();
const OurServices = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [services, setServices] = useState<any[]>([]);
    const [srvc_loaded, setSrvcLoaded] = useState(false);

    useEffect(() => {

        const fetchServices = async () => {
            const payload = {
                paginated: false,
                "post_type": "Featured Services",
            }

            setIsLoading(true);
            const srvcPromise: Promise<ServiceLists[]> = helpers.LoadServices(payload);
            const srvcResp = await srvcPromise;
            setServices(srvcResp);
            setSrvcLoaded(true);
            setIsLoading(false);
        }

        fetchServices();

    }, []);

    return (
        <section className={`w-full bg-white py-8 md:py-10 lg:py-14 ${(srvc_loaded && services.length < 1) && `hidden`}`}>
            <div className='container mx-auto max-w-[1200px] px-3 xl:px-0 text-left'>
                <h3 className='w-full font-play-fair-display text-2xl md:text-3xl lg:text-4xl'>
                    <div className='w-full'>Our Services</div>
                    <div className='w-full mt-1'>
                        <div className='w-[130px] h-[6px] bg-primary'></div>
                    </div>
                </h3>

                <div className='w-full mt-5'>
                    <div className='w-full grid grid-cols-1 xs:grid-cols-2 gap-x-2 xs:gap-x-4 gap-y-8 relative z-0' id='community-lists'>
                        {isLoading && (<div className='w-full flex justify-center items-center min-h-60 col-span-full'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>)}

                        {
                            srvc_loaded ?
                                Array.isArray(services) ?
                                    services.length > 0 ? (
                                        <>
                                            {services.map((srvc, index) => {
                                                return <ServiceCard key={index} item={srvc} />
                                            })}

                                            <Link href={`/our-services?page=1`} className='w-full mt-5 flex items-center justify-center col-span-full'>
                                                <div className=' bg-primary text-white py-3 px-8 hover:shadow-lg cursor-pointer 
                                                rounded font-normal'>Sell All Services</div>
                                            </Link>
                                        </>
                                    ) : (<div className='w-full flex justify-center items-center min-h-60 col-span-full'>
                                        No results found.
                                    </div>)
                                    : ""
                                : ""
                        }
                    </div>
                </div>
            </div>

        </section>
    )
}

export default OurServices