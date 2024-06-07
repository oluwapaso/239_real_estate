import React from 'react'
import { IoCall, IoMailSharp } from 'react-icons/io5';
import { HiOutlineHomeModern } from 'react-icons/hi2';
import { FaCircleInfo, FaUsersGear } from 'react-icons/fa6';
import Link from 'next/link';
import { BsTelephonePlus } from 'react-icons/bs';
import { User } from '@/components/types';
import moment from 'moment';

function UserInfo({ info }: { info: User }) {
    return (
        <div className='w-full sticky top-0'>
            <div className='w-full border-b border-gray-200 p-4 flex items-center'>
                <div className='size-14 rounded-full bg-gray-100 text-gray-600 font-semibold text-xl flex items-center justify-center'>
                    {info.firstname ? info.firstname[0] : "."}</div>
                <div className='flex-grow font-normal text-lg ml-3'>
                    <div className='w-full font-semibold'>{info.firstname} {info.lastname}</div>
                    <div className='w-full text-sm font-medium text-zinc-800'>{info.lead_stage}</div>
                </div>
            </div>

            <div className='w-full p-4 flex flex-col border-b border-gray-200 *:w-full *:flex *:items-center *:mb-4'>
                <div className=''>
                    <div className='font-bold mr-2'><IoCall size={15} /></div>
                    <div className='text-sky-600 font-normal'>
                        <Link target='_blank' href={`tel:${info.phone_1}`}>{info.phone_1}</Link>
                    </div>
                </div>
                {info.phone_2 &&
                    <div className=''>
                        <div className='font-bold mr-2'><BsTelephonePlus size={15} /></div>
                        <div className='text-sky-600 font-normal'>
                            <Link target='_blank' href={`tel:${info.phone_2}`}>{info.phone_2}</Link>
                        </div>
                    </div>
                }
                <div className=''>
                    <div className='font-bold mr-2'><IoMailSharp size={15} /></div>
                    <div className='text-sky-600 font-normal'>
                        <Link target='_blank' href={`tel:${info.email}`}>{info.email}</Link>
                    </div>
                </div>
                {info.phone_2 &&
                    <div className=''>
                        <div className='font-bold mr-2'><IoMailSharp size={15} /></div>
                        <div className='text-sky-600 font-normal'>
                            <Link target='_blank' href={`tel:${info.email}`}>{info.secondary_email}</Link>
                        </div>
                    </div>
                }
                <div className=''>
                    <div className='font-bold mr-2'><HiOutlineHomeModern size={15} /></div>
                    <div className='font-normal'>{info.street_address}{info.city && `, ${info.city}`}{info.state && `, ${info.state}`}{info.zip && `, ${info.zip}`} </div>
                </div>
                <div className=''>
                    <div className='font-semibold mr-2'>Price Range</div>
                    <div className='font-normal'>{info.price_range}</div>
                </div>
                <div className=''>
                    <div className='font-semibold mr-2'>Spouse Name</div>
                    <div className='font-normal'>{info.spouse_name}</div>
                </div>
                <div className=''>
                    <div className='font-semibold mr-2'>Birthday</div>
                    <div className='font-normal'>{moment(info.birthday).format("MM/DD/YYYY")}</div>
                </div>
                <div className=''>
                    <div className='font-semibold mr-2'>Source</div>
                    <div className='font-normal'>{info.source}, {moment(info.date_added).fromNow()}</div>
                </div>
                <div className=''>
                    <div className='font-semibold mr-2'>Profession</div>
                    <div className='font-normal'>Doctor</div>
                </div>
            </div>

            <div className='w-full p-4 flex flex-col border-b border-gray-200 *:w-full *:flex *:items-center *:mb-4'>
                <div className=''>
                    <div className='font-bold mr-2'><FaUsersGear size={20} /></div>
                    <div className='font-semibold'>Social Profile</div>
                </div>
                <div className=''>
                    <div className='font-bold mr-2'>Facebook</div>
                    <div className='text-sky-600 font-normal break-all'>
                        <Link target='_blank' href={info.facebook || ""}>{info.facebook}</Link>
                    </div>
                </div>
                <div className=''>
                    <div className='font-bold mr-2'>LinkedIn</div>
                    <div className='text-sky-600 font-normal break-all'>
                        <Link target='_blank' href={info.linkedin || ""}>{info.linkedin}</Link>
                    </div>
                </div>
                <div className=''>
                    <div className='font-bold mr-2'>X/Twitter</div>
                    <div className='text-sky-600 font-normal break-all'>
                        <Link target='_blank' href={info.twitter || ""}>{info.twitter}</Link>
                    </div>
                </div>
                <div className=''>
                    <div className='font-bold mr-2'>Tic Toc</div>
                    <div className='text-sky-600 font-normal break-all'>
                        <Link target='_blank' href={info.tictoc || ""}>{info.tictoc}</Link>
                    </div>
                </div>
                <div className=''>
                    <div className='font-bold mr-2'>Whatsapp</div>
                    <div className='text-sky-600 font-normal break-all'>
                        <Link target='_blank' href={info.whatsapp || ""}>{info.whatsapp}</Link>
                    </div>
                </div>
            </div>

            <div className='w-full p-4 flex flex-col border-b border-gray-200 *:w-full *:flex *:items-center *:mb-4'>
                <div className=''>
                    <div className='font-bold mr-2'><FaCircleInfo size={20} /></div>
                    <div className='font-semibold'>Background</div>
                </div>
                <div className=''>
                    <div className='font-normal'>{info.background}</div>
                </div>
            </div>
        </div>
    )
}

export default UserInfo