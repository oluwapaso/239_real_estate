import React, { useEffect, useState } from 'react'
import { APIResponseProps, ServiceLists, Testimonials } from '../types';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Helpers } from '@/_lib/helpers';
import ServiceCard from './ServiceCard';
import Link from 'next/link';
import Slider from 'react-slick';

const helpers = new Helpers();
const AllTestimonials = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [testi_loaded, setTestiLoaded] = useState(false);

    useEffect(() => {

        const fetchTestimonials = async () => {
            const payload = {
                paginated: false,
            }

            setIsLoading(true);
            const testiPromise: Promise<any> = helpers.LoadTestimonials(payload);
            const testiResp = await testiPromise;
            setTestimonials(testiResp.data);
            setTestiLoaded(true);
            setIsLoading(false);
        }

        fetchTestimonials();

    }, []);

    const settings = {
        dots: true,
        arrows: true,
        speed: 2500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        focusOnSelect: true,
        infinite: true
    };

    return (
        <section className={`w-full bg-white py-8 md:py-10 lg:py-14 ${(testi_loaded && testimonials.length < 1) && `hidden`}`}>
            <div className='container mx-auto max-w-[850px] px-3 xl:px-0 text-left'>
                <h3 className='w-full font-play-fair-display text-2xl md:text-3xl lg:text-4xl flex flex-col justify-center items-center'>
                    <div className='w-f'>From Our Happy Customers</div>
                    <div className='w-fu mt-1'>
                        <div className='w-[130px] h-[6px] bg-primary'></div>
                    </div>
                </h3>

                <div className='w-full mt-10'>
                    <div className='w-full relative z-0' id='community-lists'>
                        {isLoading && (<div className='w-full flex justify-center items-center min-h-60'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>)}
                        <div className='testimonial-slick-body'>
                            <Slider {...settings}>
                                {
                                    testi_loaded ?
                                        Array.isArray(testimonials) &&
                                        testimonials.length > 0 && (
                                            testimonials.map((testi, index) => {
                                                return <>
                                                    <div key={index} className='w-full text-center font-normal text-xl italic'>
                                                        "{testi.testimonial}"
                                                    </div>
                                                    <div className='w-full mt-2 font-bold text-lg'>
                                                        {testi.fullname}
                                                        <span className='font-normal text-slate-800 text-base ml-1 italic'>
                                                            ({testi.account_type})
                                                        </span>
                                                    </div>
                                                </>
                                            }))
                                        : ""
                                }
                            </Slider>
                        </div>

                    </div>
                </div>
            </div>

        </section>
    )
}

export default AllTestimonials