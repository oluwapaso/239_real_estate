"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { CityInfo } from '@/components/types'
import React, { useEffect, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { useDispatch } from 'react-redux'
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BiEditAlt } from 'react-icons/bi'
import { useSearchParams } from 'next/navigation'
import CustomLink from '@/components/CustomLink'

const helpers = new Helpers();
const Cities = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    const [cities, setCities] = useState<any[]>([]);
    const [post_fetched, setPostFetched] = useState(false);

    const page_size = 20;
    let total_page = 0;
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    let all_comms: React.JSX.Element[] = [];

    const payload = {
        paginated: true,
        post_type: "Published",
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchCities = async () => {

            try {

                const cityPromise: Promise<CityInfo[]> = helpers.LoadCities(payload)
                const cityResp = await cityPromise;
                setCities(cityResp);
                setPostFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchCities();

    }, [curr_page]);

    const no_comm_added = <tr>
        <td colSpan={4} className='bg-white text-red-600'>

            <div className='my-10 flex flex-col justify-center items-center min-h-6'>
                <div className='w-full text-center'>No city added yet</div>
            </div>

        </td>
    </tr>

    if (Array.isArray(cities)) {

        if (cities.length > 0) {

            const total_records = cities[0].total_records
            const total_returned = cities.length
            total_page = Math.ceil(total_records / page_size)

            if (total_records > 0 && total_returned > 0) {

                all_comms = cities.map((comm) => {

                    let dirty_icon;
                    if (comm.is_dirty == "Yes") {
                        dirty_icon = <BiEditAlt size={17} className='ml-1 text-orange-500' />
                    }

                    return (
                        <tr key={comm.city_id} id={`city_${comm.city_id}`} className='transition-all duration-500'>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500'>
                                <CustomLink href={`/admin/edit-city?city_id=${comm.city_id}`} className='font-medium text-sky-800'>{comm.mls_name}</CustomLink>
                            </td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500'>{comm.friendly_name}</td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500 text-center'>
                                {
                                    comm.is_published == "Yes" ? <div className='!text-green-600 font-medium flex items-center justify-center'>
                                        <span>Published</span> {dirty_icon}
                                    </div> : <div className='!text-red-500'>Draft</div>
                                }
                            </td>
                            <td className='border-b border-slate-100 p-4 pl-8 w-[130px]'>
                                <div className='flex justify-end'>
                                    <CustomLink href={`/admin/edit-city?city_id=${comm.city_id}`}
                                        className='font-medium px-6 py-2 bg-primary text-white rounded'>Edit</CustomLink>
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

    return (
        <div className='w-full flex flex-col'>
            <PageTitle text="Cities" show_back={false} />
            <div className='!w-full !max-w-[100%] relative overflow-x-auto overflow-y-visible box-border'>
                <table className="shadow-xl table-fixed w-[900px] lg:w-full text-sm mt-8 bg-slate-200 rounded-md border border-slate-300">
                    <thead className='w-full'>
                        <tr className='w-full'>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left'>MLS Name</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left'>Friendly Name</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-center w-[150px]'>Status</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left w-[130px]'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='bg-white dark:bg-slate-800'>
                        {all_comms}
                    </tbody>
                    <tfoot className='bg-white'></tfoot>
                </table>
            </div>
            {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/all-cities?' /> : null}
            <ToastContainer />
        </div>
    )

}

export default Cities