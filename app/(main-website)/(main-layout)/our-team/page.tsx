"use client"

import SimpleHeader from '@/components/SimpleHeader'
import { AgentsType } from '@/components/types'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaArrowLeftLong, FaArrowRightLong, FaSquareFacebook, FaXTwitter } from 'react-icons/fa6'
import { HiOutlineMail } from 'react-icons/hi'
import { IoLogoInstagram } from 'react-icons/io5'
import { SlCallOut } from 'react-icons/sl'
import { toast } from 'react-toastify'

const OurTeam = async () => {

    const page_size = 15
    let total_page = 1
    const searchParams = useSearchParams();
    const curr_page = parseInt(searchParams?.get("page") as string) || 1
    const [agents, setAgents] = useState<AgentsType[]>([])

    const payload = {
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchAgets = async () => {
            const agentsPromise: Promise<AgentsType[]> = getAgents(payload)
            const agentsResp = await agentsPromise
            setAgents(agentsResp);
        }

        fetchAgets();

    }, [curr_page]);

    let all_agents: React.JSX.Element[] = []

    if (Array.isArray(agents)) {

        if (agents.length > 0) {

            if (!agents.length) {
                throw new Error("No agents found.")
            }

            const total_records = agents[0].total_records
            const total_returned = agents.length
            total_page = Math.ceil(total_records / page_size)

            if (total_records > 0 && total_returned > 0) {

                all_agents = agents.map((agent) => {
                    return (
                        <div key={agent.agent_id} className='w-full flex flex-col md:flex-row min-h-40 float-left my-4 bg-gray-50 border 
                        border-gray-200 rounded-lg px-5 py-5 shadow hover:shadow-xl cursor-pointer'>
                            <div className='flex min-w-[100%] max-w-[100%] md:min-w-[230px] md:max-w-[230px] overflow-hidden max-h-[230px] items-end justify-center'>
                                <img src={`${agent.image?.image_loc ? agent.image?.image_loc : "/agent_ph.png"}`} className='block w-auto h-auto max-h-[230px]' alt='' />
                            </div>
                            <div className='w-full md:w-[calc(100%-230px)] flex flex-col pl-0 md:pl-6 mt-3 md:mt-0'>
                                <h2 className='text-lg mb-2 !break-all'><span>{agent.name}</span> - <span className='italic'>{agent.role}</span></h2>
                                <h2 className='font-play-fair- text-lg mb-1'>{agent.license_number}</h2>
                                <h2 className='font-play-fair- text-lg mb-1 flex items-center cursor-pointer'>
                                    <span className='flex items-center'> <HiOutlineMail size={16} /> <span className='ml-1'>Email:</span></span>
                                    <span className='text-lg ml-1'>{agent.email}</span>
                                </h2>

                                <h2 className='font-play-fair- text-lg mb-2 flex items-center cursor-pointer'>
                                    <span className='flex items-center'> <SlCallOut size={16} /> <span className='ml-1'>Phone:</span></span>
                                    <span className='text-lg ml-1'>{agent.phone}</span>
                                </h2>

                                <div className='w-full flex *:mr-2 *:cursor-pointer'>
                                    {agent.facebook && (<Link href={agent.facebook} className='hover:scale-150 transition-all duration-500'><FaSquareFacebook size={25} /></Link>)}
                                    {agent.instagram && (<Link href={agent.instagram} className='hover:scale-150 transition-all duration-500'><IoLogoInstagram size={25} /></Link>)}
                                    {agent.twitter && (<Link href={agent.twitter} className='hover:scale-150 transition-all duration-500'><FaXTwitter size={25} /></Link>)}
                                </div>

                                <div className='w-full text-md mt-3'>{agent.bio}</div>

                                <div className='w-full flex *:cursor-pointer mt-4'>
                                    <div className='hover:scale-110 transition-all duration-500 mr-3'>
                                        <Link href={`mailto:${agent.email}`} className='flex items-center bg-primary text-white py-2 px-4 rounded-md'>
                                            <HiOutlineMail size={16} /> <span className='font-normal ml-1'>Send Email</span>
                                        </Link>
                                    </div>
                                    <div className='hover:scale-110 transition-all duration-500'>
                                        <Link href={`tel:${agent.phone}`} className='flex items-center bg-sky-600 text-white py-2 px-4 rounded-md'>
                                            <SlCallOut size={16} /> <span className='font-normal ml-1'>Call</span>
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )
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
                <div className='container mx-auto max-w-[850px] px-3 xl:px-0 text-left'>
                    <div className='w-full font-normal'>
                        <Link href="/">Home</Link> / <Link href="/our-team?page=1">Meet The Team</Link>
                    </div>

                    <h3 className='w-full font-play-fair-display text-3xl md:text-4xl lg:text-5xl mt-2'>Meet The Team</h3>

                    <div className='w-full mx-auto max-w-[500px] md:max-w-[100%] flex flex-col mt-4'>{all_agents}</div>

                    <Pagination totalPage={total_page} curr_page={curr_page} />
                </div>
            </section>
        </>

    )
}

const Pagination = ({ totalPage, curr_page }: { totalPage: number, curr_page: number }) => {

    const active_link = '!bg-red-400 text-white rounded-full drop-shadow-xl hover:rounded-none'
    const prev_class = 'cursor-pointer mr-2 border-2 border-white hover:border-primary p-1'
    const next_class = 'cursor-pointer ml-2 border-2 border-white hover:border-primary p-1'

    return (
        <div className='w-full text-cent flex justify-end items-center'>
            {curr_page > 1 ? (<Link href={`/our-team?page=${curr_page - 1}`} className={prev_class}><FaArrowLeftLong size={25} /></Link>) :
                <div className={`${prev_class} !cursor-not-allowed !opacity-50`}><FaArrowLeftLong size={25} /></div>}

            {[...Array(totalPage)].map((_elem, index) => {
                return (
                    <Link key={index} href={`/our-team?page=${index + 1}`} className={`size-10 flex items-center justify-center 
                    font-medium bg-slate-200 cursor-pointer hover:bg-sky-400 hover:drop-shadow-xl mx-1 hover:scale-125 transition-all
                    duration-300 ${curr_page == index + 1 ? active_link : null}`}>{index + 1}
                    </Link>
                )
            })}
            {curr_page < totalPage ? (<Link href={`/our-team?page=${curr_page + 1}`} className={next_class}><FaArrowRightLong size={25} /></Link>) :
                <div className={`${next_class} !cursor-not-allowed !opacity-50`}><FaArrowRightLong size={25} /></div>}
        </div>
    )

}

const getAgents = (payload: {
    page: string | number | string[];
    limit: number;
}) => {

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

    return fetch(`${apiBaseUrl}/api/(agents)/agents`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then((resp): Promise<AgentsType[]> => {
        if (!resp.ok) {
            throw new Error("Unable to fetch agents.")
        }

        return resp.json();
    }).then(data => {
        return data

    }).catch((err) => {
        return []
    })
}

export default OurTeam