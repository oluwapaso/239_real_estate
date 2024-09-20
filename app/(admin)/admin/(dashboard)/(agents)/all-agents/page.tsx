"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { APIResponseProps, AgentsType } from '@/components/types'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { FaEdit } from 'react-icons/fa'
import { FaSquareFacebook, FaXTwitter } from 'react-icons/fa6'
import { HiOutlineMail } from 'react-icons/hi'
import { IoLogoInstagram } from 'react-icons/io5'
import { PiTrashThin } from 'react-icons/pi'
import { SlCallOut } from 'react-icons/sl'
import PageTitle from '../../../_components/PageTitle'
import { TbUserPlus } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice'
import Swal from 'sweetalert2'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'next/navigation'

const helpers = new Helpers();
const AllAgents = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    const [agents, setAgents] = useState<AgentsType[]>([])
    const page_size = 20;
    let total_page = 1;
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;

    const payload = {
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchAgents = async () => {
            const agentsPromise: Promise<AgentsType[]> = helpers.GetAgents(payload)
            const agentsResp = await agentsPromise
            setAgents(agentsResp);
            dispatch(hidePageLoader())
        }

        dispatch(showPageLoader())
        fetchAgents();

    }, [curr_page]);

    const handleDelete = async (agent_id: number, dp_image: string) => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this agent?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Continue',
        });

        if (result.isConfirmed) {

            dispatch(showPageLoader());

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            await fetch(`${apiBaseUrl}/api/(agents)/update-agent-info`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "agent_id": agent_id, "dp_image": dp_image }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    const item = document.getElementById(`agent_${agent_id}`)
                    item?.classList.add("scale-0")

                    toast.success(data.message, {
                        position: "top-center",
                        theme: "colored"
                    })
                } else {
                    toast.error(data.message, {
                        position: "top-center",
                        theme: "colored"
                    })
                }

            });

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    let all_agents: React.JSX.Element[] = []
    if (Array.isArray(agents)) {

        if (agents.length > 0) {

            const total_records = agents[0].total_records
            const total_returned = agents.length
            total_page = Math.ceil(total_records / page_size)

            if (total_records > 0 && total_returned > 0) {

                all_agents = agents.map((agent) => {
                    return (
                        <div key={agent.agent_id} id={`agent_${agent.agent_id}`} className='w-full transition-all duration-500 max-w-full 
                        flex flex-col xl:flex-row min-h-40 float-left bg-white border border-gray-200 px-5 py-5'>
                            <div className='flex min-w-[100%] max-w-[100%] xl:min-w-[230px] xl:max-w-[230px] overflow-hidden max-h-[230px] items-end justify-center'>
                                <img src={`${agent.image ? agent.image.image_loc : "/agent_ph.png"}`} className='block w-auto h-auto max-h-[230px]' alt='' />
                            </div>
                            <div className='w-full xl:w-[calc(100%-230px)] flex flex-col pl-0 xl:pl-6 mt-3 xl:mt-0'>
                                <h2 className='text-base !break-all font-medium'>
                                    <span>{agent.name}</span>
                                </h2>
                                <h2 className='text-base !break-all'>
                                    <span className='italic'>{agent.role}</span>
                                </h2>
                                <h2 className='text-base'>{agent.license_number}</h2>
                                <h2 className='text-base w-full max-w-full flex items-center cursor-pointer overflow-hidden'>
                                    <div className='flex items-center w-[70px]'>
                                        <HiOutlineMail size={16} /> <span className='ml-1'>Email:</span>
                                    </div>
                                    <div className='text-base overflow-hidden whitespace-nowrap text-ellipsis break-all'>
                                        {agent.email}
                                    </div>
                                </h2>

                                <h2 className='text-base mb-2 flex items-center cursor-pointer'>
                                    <span className='flex items-center'> <SlCallOut size={16} /> <span className='ml-1'>Phone:</span></span>
                                    <span className='text-base ml-1'>{agent.phone}</span>
                                </h2>

                                <div className='w-full flex *:mr-2 *:cursor-pointer'>
                                    <Link href={agent.facebook || ""} className='hover:scale-150 transition-all duration-500'><FaSquareFacebook size={25} /></Link>
                                    <Link href={agent.instagram || ""} className='hover:scale-150 transition-all duration-500'><IoLogoInstagram size={25} /></Link>
                                    <Link href={agent.twitter || ""} className='hover:scale-150 transition-all duration-500'><FaXTwitter size={25} /></Link>
                                </div>

                                <div className='w-full text-md mt-3 hidden'>{agent.bio}</div>

                                <div className='w-full flex *:cursor-pointer mt-4'>
                                    <div className='hover:scale-110 transition-all duration-500 mr-3'>
                                        <Link href={`/admin/edit-agent?agent_id=${agent.agent_id}`} className='flex items-center bg-primary text-white py-2 px-4 rounded-md'>
                                            <FaEdit size={16} /> <span className='font-normal ml-1'>Edit</span>
                                        </Link>
                                    </div>
                                    <div className='hover:scale-110 transition-all duration-500'>
                                        <button className='flex items-center bg-red-600 text-white py-2 px-4 rounded-md'
                                            onClick={() => handleDelete(agent.agent_id, agent.image)}>
                                            <PiTrashThin size={16} /> <span className='font-normal ml-1'>Delete</span>
                                        </button>
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

    }

    const add_new_comp = <Link href="/admin/add-new-agent" className='bg-primary text-white flex items-center justify-center ml-2 py-1 h-10 px-4 text-sm font-medium hover:drop-shadow-xl'>
        <TbUserPlus className='mr-1 !text-xl' /> <span>Add New Agent</span>
    </Link>

    return (
        <div className='w-full'>
            <PageTitle text="Agents" show_back={false} right_component={add_new_comp} />
            <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-4'>
                {all_agents}
            </div>
            <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/all-agents?' />
            <ToastContainer />
        </div>
    )

}

export default AllAgents