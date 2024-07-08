"use client"

import { Helpers } from '@/_lib/helpers';
import moment from 'moment'
import Link from 'next/link';
import React from 'react'
import { BsInfoCircle } from 'react-icons/bs';
import { FaCheck, FaHandHoldingDollar } from 'react-icons/fa6';
import { IoWalkSharp } from 'react-icons/io5';
import { LiaBinocularsSolid } from 'react-icons/lia';
import { TbHomeDollar } from 'react-icons/tb';
import Swal from 'sweetalert2';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const helpers = new Helpers();
const PropertyRequestActivity = ({ activity, index, activities_len }: { activity: any, index: number, activities_len: number }) => {

    let icon = <></>;
    let color = "bg-sky-600";
    let description = activity.description;
    let desc: any = {};
    let req_body: React.JSX.Element = <></>

    const AcknowledgeLoader = () => {
        return <div className='py-1 px-2 rounded text-white bg-primary/50 flex items-center justify-center text-sm font-medium 
                cursor-pointer hover:shadow-lg'>
            <AiOutlineLoading3Quarters size={14} className='animate-spin mr-2' /> <span>Please wait...</span>
        </div>
    }

    const Acknowledged = () => {
        return <div className='py-1 px-2 text-green-700 flex items-center justify-center text-sm font-medium'>
            <FaCheck size={13} /> <span className='ml-1'>Acknowledged</span>
        </div>
    }

    const AcknowledgeRequest = async (request_id: number) => {
        const result = await Swal.fire({
            title: "Are you sure you this request has been acknowledged?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes Continue',
        });

        if (result.isConfirmed) {

            try {
                const act_btn_cont = document.getElementById("act_btn_cont_" + request_id) as HTMLElement;
                if (act_btn_cont) {
                    const root = createRoot(act_btn_cont);
                    root.render(<AcknowledgeLoader />);
                    await helpers.AcknowledgeRequest(request_id);
                    root.render(<Acknowledged />);
                }
            } catch (e: any) {
                console.log(e.message);
            }

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    let ack_btn = <></>
    if (activity.field_1 == "Pending") {
        ack_btn = <div className='py-1 px-2 rounded text-white bg-primary flex items-center justify-center text-sm font-medium 
                cursor-pointer hover:shadow-lg' onClick={() => AcknowledgeRequest(activity.activity_id)}>
            <FaCheck size={13} /> <span className='ml-1'>Acknowledge</span>
        </div>
    } else {
        ack_btn = <div className='py-1 px-2 text-green-700 flex items-center justify-center text-sm font-medium'>
            <FaCheck size={13} /> <span className='ml-1'>Acknowledged</span>
        </div>
    }

    if (description && description != "" && typeof description == "string") {
        desc = JSON.parse(description);
    }

    let req_type = activity.type;
    if (activity.type == "Buying Request") {

        req_type = "Buying Request";
        icon = <FaHandHoldingDollar size={22} />
        color = "bg-pink-600";
        req_body = <div className='w-full'>
            <div className="text-base w-full font-semibold">Request Details</div>
            <div className="text-base w-full flex flex-col mt-1">
                <div className="text-base mb-1"><span className='font-medium'>Fullname:</span> <span>{desc.first_name} {desc.last_name}</span></div>
                <div className="text-base"><span className='font-medium'>Email Address:</span> <span>{desc.email}</span></div>
                <div className="text-base"><span className='font-medium'>Primary Phone:</span> <span>{desc.primary_phone}</span></div>
                <div className="text-base"><span className='font-medium'>Secondary Phone:</span> <span>{desc.secondary_phone}</span></div>
                <div className="text-base"><span className='font-medium'>Fax:</span> <span>{desc.fax}</span></div>
                <div className="text-base"><span className='font-medium'>Address:</span> <span>{desc.address}</span></div>
                <div className="text-base"><span className='font-medium'>Location:</span> <span>{desc.city}, {desc.state}, {desc.zip_code}</span></div>
                <div className="text-base"><span className='font-medium'>Number of beds:</span> <span>{desc.num_of_beds}</span></div>
                <div className="text-base"><span className='font-medium'>Number of baths:</span> <span>{desc.num_of_baths}</span></div>
                <div className="text-base"><span className='font-medium'>Square feet:</span> <span>{desc.square_feet}</span></div>
                <div className="text-base"><span className='font-medium'>Mode of contact:</span> <span>{desc.mode_of_contact}</span></div>
                <div className="text-base"><span className='font-medium'>Price range:</span> <span>{desc.price_range}</span></div>
                <div className="text-base"><span className='font-medium'>Move on:</span> <span>{desc.move_on}</span></div>
                <div className="text-base"><span className='font-medium'>Started looking in:</span> <span>{desc.started_looking_in}</span></div>
                <div className="text-base"><span className='font-medium'>Own in:</span> <span>{desc.own_in}</span></div>
                <div className="text-base"><span className='font-medium'>With an agent:</span> <span>{desc.with_an_agent}</span></div>
                <div className="text-base"><span className='font-medium'>Home description:</span> <span>{desc.home_description}</span></div>
            </div>
        </div>

    } else if (activity.type == "Selling Request") {

        req_type = "Selling Request";
        icon = <TbHomeDollar size={22} />
        color = "bg-pink-600";
        req_body = <div className='w-full'>
            <div className="text-base w-full font-semibold">Request Details</div>
            <div className="text-base w-full flex flex-col mt-1">
                <div className="text-base mb-1"><span className='font-medium'>Email:</span> <span>{desc.email_address}</span></div>
                <div className="text-base"><span className='font-medium'>Home Address:</span> <span>{desc.home_address}</span></div>
            </div>
        </div>

    } else if (activity.type == "Info Request") {

        req_type = "Property Information Request";
        icon = <BsInfoCircle size={22} />
        color = "bg-pink-600";
        req_body = <div className='w-full'>
            <div className="text-base w-full font-semibold">Request Details</div>
            <div className="text-base w-full flex flex-col mt-1">
                <div className="text-base mb-1"><span className='font-medium'>Fullname:</span> <span>{desc.first_name} {desc.last_name}</span></div>
                <div className="text-base"><span className='font-medium'>Phone Number:</span> <span>{desc.phone_number}</span></div>
                <div className="text-base"><span className='font-medium'>Email Address:</span> <span>{desc.email}</span></div>
                <div className="text-base"><span className='font-medium'>Comments:</span> <span>{desc.comments}</span></div>
            </div>
        </div>
    } else if (activity.type == "Tour Request") {

        req_type = "Property Tour Request";
        icon = <IoWalkSharp size={22} />
        color = "bg-pink-600";
        req_body = <div className='w-full'>
            <div className="text-base w-full font-semibold">Request Details</div>
            <div className="text-base w-full flex flex-col mt-1">
                <div className="text-base mb-1"><span className='font-medium'>Fullname:</span> <span>{desc.first_name} {desc.last_name}</span></div>
                <div className="text-base"><span className='font-medium'>Phone Number:</span> <span>{desc.phone_number}</span></div>
                <div className="text-base"><span className='font-medium'>Email Address:</span> <span>{desc.email}</span></div>
                <div className="text-base"><span className='font-medium'>Tour Type:</span> <span>{desc.tour_type}</span></div>
                <div className="text-base"><span className='font-medium'>Comments:</span> <span>{desc.comments}</span></div>
            </div>
        </div>
    } else if (activity.type == "Showing Request") {

        req_type = "Showing Request";
        icon = <LiaBinocularsSolid size={22} />
        color = "bg-pink-600";
        req_body = <div className='w-full'>
            <div className="text-base w-full font-semibold">Request Details</div>
            <div className="text-base w-full flex flex-col mt-1">
                <div className="text-base mb-1"><span className='font-medium'>Fullname:</span> <span>{desc.fullname}</span></div>
                <div className="text-base"><span className='font-medium'>Phone Number:</span> <span>{desc.phone_number}</span></div>
                <div className="text-base"><span className='font-medium'>Email Address:</span> <span>{desc.email}</span></div>
                <div className="text-base"><span className='font-medium'>Prefer Date:</span> <span>{desc.prefer_date}</span></div>
                {
                    desc.prefer_date == "Exact Day" && <div className="text-base">
                        <span className='font-medium'>Eate Date:</span> <span>{moment(desc.exact_date).format("MMMM Do, YYYY")}</span></div>
                }

                {
                    desc.prop_url &&
                    <div className="text-base"><span className='font-medium'>Property Link:</span>
                        <span><Link href={desc.prop_url} target='_blank' className='text-sky-800'>View Property</Link></span>
                    </div>
                }
            </div>
        </div>

    }


    return (
        <li className="rounded-lg cursor-pointer">
            <div className="flex flex-row">
                <div className="items-center flex flex-col justify-around relative">
                    <div className="">
                        <div className={`${color} size-12 rounded-full flex justify-center items-center *:text-white`}>
                            {icon}
                        </div>
                    </div>
                    <div className={`border-l h-full ${index == (activities_len - 1) ? "border-transparent" : "border-gray-400"}`}></div>
                </div>
                <div className="flex flex-col group-hover:bg-gray-50 ml-4 pb-10 flex-grow">
                    <div className='w-full pb-1 border-b border-gray-400 flex flex-col mb-3'>
                        <div className='w-full text-lg font-medium'>
                            <span>{moment(activity.date).fromNow()}</span>
                            <span className='ml-1 text-sm text-gray-500'>({moment(activity.date).format("MMMM Do, YYYY h:m:s A")})</span>
                        </div>
                        <div className='w-full text-base font-medium text-sky-800 flex items-center'>
                            <div className='mr-1'>{activity.type}</div>
                            <div className='text-[14px]'>
                                {activity.field_1 == "Pending" ? <span className='text-orange-600'>(Not yet acknowledged)</span> : <span className=' text-green-600'>(Acknowledged)</span>}</div>
                        </div>
                    </div>
                    {req_body}
                    <div className='flex mt-2' id={`act_btn_cont_${activity.activity_id}`}>{ack_btn}</div>
                </div>
            </div>
        </li>
    )
}

export default PropertyRequestActivity
