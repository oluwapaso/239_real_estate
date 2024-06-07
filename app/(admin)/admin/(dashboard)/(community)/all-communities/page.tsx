"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { APIResponseProps, CommunityInfo } from '@/components/types'
import React, { useEffect, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { useDispatch } from 'react-redux'
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice'
import Swal from 'sweetalert2'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link'
import { BiAddToQueue, BiEditAlt } from 'react-icons/bi'
import MoreCommunityActions from '../../../_components/MoreComActions'
import { useSearchParams } from 'next/navigation'
import CustomLink from '@/components/CustomLink'

const helpers = new Helpers();
const Communities = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    const [communities, setCommunities] = useState<any[]>([]);
    const [post_fetched, setPostFetched] = useState(false);

    const page_size = 20;
    let total_page = 0;
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    let all_comms: React.JSX.Element[] = [];

    const payload = {
        paginated: true,
        post_type: "Draft",
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchCommunities = async () => {

            try {

                const postPromise: Promise<CommunityInfo[]> = helpers.LoadCommunities(payload)
                const postResp = await postPromise
                setCommunities(postResp);
                setPostFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchCommunities();

    }, [curr_page]);

    const handleDelete = async (draft_id: number) => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this community?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete It',
        });

        if (result.isConfirmed) {

            dispatch(showPageLoader());

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            await fetch(`${apiBaseUrl}/api/(communities)/delete-community`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "draft_id": draft_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    const item = document.getElementById(`community_${draft_id}`)
                    item?.classList.add("scale-0");

                    const rm_to = setTimeout(() => {
                        item?.remove();
                        window.clearTimeout(rm_to);
                    }, 450);

                    toast.success(data.message, {
                        position: "top-center",
                        theme: "colored"
                    });

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

    const no_comm_added = <tr>
        <td colSpan={4} className='bg-white text-red-600'>

            <div className='my-10 flex flex-col justify-center items-center min-h-6'>
                <div className='w-full text-center'>No community added yet</div>
                <CustomLink href={`/admin/add-new-community`} className='bg-primary py-3 px-6 mt-2 hover:shadow-lg text-white flex items-center 
                    justify-center font-normal text-base cursor-pointer hover:drop-shadow-xl'>
                    <BiAddToQueue className='mr-1 !text-xl' /> <span>Add New Community</span>
                </CustomLink>
            </div>

        </td>
    </tr>

    if (Array.isArray(communities)) {

        if (communities.length > 0) {

            const total_records = communities[0].total_records
            const total_returned = communities.length
            total_page = Math.ceil(total_records / page_size)

            if (total_records > 0 && total_returned > 0) {

                all_comms = communities.map((comm, index) => {

                    let dirty_icon;
                    if (comm.is_dirty == "Yes") {
                        dirty_icon = <BiEditAlt size={17} className='ml-1 text-orange-500' />
                    }

                    let is_last = false;
                    if (total_returned > 2) {
                        if (total_returned - index <= 2) {
                            is_last = true;
                        }
                    }

                    return (
                        <tr key={comm.draft_id} id={`community_${comm.draft_id}`} className='transition-all duration-500'>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500'>
                                <CustomLink href={`/admin/edit-community?draft_id=${comm.draft_id}`} className='font-medium text-sky-800'>{comm.mls_name}</CustomLink>
                            </td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500'>{comm.city_slug}</td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500'>{comm.friendly_name}</td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500 text-center'>
                                {
                                    comm.published == "Yes" ? <div className='!text-green-600 font-medium flex items-center justify-center'>
                                        <span>Published</span> {dirty_icon}
                                    </div> : <div className='!text-red-500'>Draft</div>
                                }
                            </td>
                            <td className='border-b border-slate-100 p-4 pl-8 w-[130px]'>
                                <div className='flex justify-end'>
                                    <MoreCommunityActions community_id={comm.post_id} draft_id={comm.draft_id} slug={comm.slug}
                                        published={comm.published} handleDelete={() => handleDelete(comm.draft_id)} is_last={is_last} />
                                </div>
                            </td>
                        </tr>
                    )
                })

            } else {
                all_comms[0] = no_comm_added
            }

        } else {

            //Making sure request has been sent
            if (post_fetched) {
                all_comms[0] = no_comm_added
            }

        }

    }

    const add_new_comp = <CustomLink href={`/admin/add-new-community`} className='bg-primary text-white flex items-center justify-center ml-2 py-1 
        h-10 px-4 text-sm font-medium cursor-pointer hover:drop-shadow-xl'>
        <BiAddToQueue className='mr-1 !text-xl' /> <span>Add New <span className='hidden xs:inline-block'>Community</span></span>
    </CustomLink>

    return (
        <div className='w-full flex flex-col'>
            <PageTitle text="Communities" show_back={false} right_component={add_new_comp} />
            <div className='!w-full !max-w-[100%] h-[auto] relative overflow-x-auto !overflow-y-visible box-border pb-10'>
                <table className="shadow-xl !table-fixed w-[900px] lg:w-full text-sm mt-8 bg-slate-200 rounded-md border 
                border-slate-300 mb-10">
                    <thead className='w-full'>
                        <tr className='w-full'>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left'>MLS Name</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left'>City Slug</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left'>Friendly Name</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-center w-[150px]'>Status</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left w-[130px]'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='bg-white dark:bg-slate-800 relative'>
                        {all_comms}
                    </tbody>
                    <tfoot className='bg-white'></tfoot>
                </table>

                <div className='w-full h-[90px]'>
                    {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/all-communities?' /> : null}
                </div>
            </div>
            <ToastContainer />
        </div>
    )

}

export default Communities