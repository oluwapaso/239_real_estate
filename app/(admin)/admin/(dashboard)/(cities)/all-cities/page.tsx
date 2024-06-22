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
import { BiEdit, BiEditAlt, BiTrash } from 'react-icons/bi'
import { useSearchParams } from 'next/navigation'
import CustomLink from '@/components/CustomLink'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const helpers = new Helpers();
const Cities = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    const [cities, setCities] = useState<any[]>([]);
    const [cities_fetched, setCitiesFetched] = useState(false);

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
                setCitiesFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchCities();

    }, [curr_page]);


    if (Array.isArray(cities)) {
        if (cities.length > 0) {
            const total_records = cities[0].total_records
            total_page = Math.ceil(total_records / page_size)
        }
    }

    return (
        <div className='w-full flex flex-col'>
            <PageTitle text="Cities" show_back={false} />
            <div className='!w-full !max-w-[100%] h-auto relative box-border pb-5'>

                <div className="w-full mt-3 border border-gray-200 rounded-md overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className=" bg-gray-100 grid grid-cols-[repeat(3,1fr)_minmax(130px,130px)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                        <div className="cell-header">MLS Name</div>
                        <div className="cell-header">Friendly Name</div>
                        <div className="cell-header">Status</div>
                        <div className="cell-header">Actions</div>
                    </div>

                    <div className='w-full divide-y divide-gray-200'>
                        {/* Loader */}
                        {!cities_fetched && <div className=' col-span-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}

                        {/* Rows */}
                        {
                            cities_fetched && (
                                (cities.length && cities.length > 0)
                                    ? (cities.map((city) => {

                                        let dirty_icon;
                                        if (city.is_dirty == "Yes") {
                                            dirty_icon = <BiEditAlt size={17} className='ml-1 text-orange-500' />
                                        }

                                        return (<div key={city.city_id} className="bg-white grid grid-cols-[repeat(3,1fr)_minmax(130px,130px)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
                                            <div>
                                                <CustomLink href={`/admin/edit-city?city_id=/${city.city_id}`}>{city.mls_name}</CustomLink>
                                            </div>
                                            <div>{city.friendly_name}</div>
                                            <div>
                                                {
                                                    city.is_published == "Yes" ? <div className='!text-green-600 font-medium flex items-center'>
                                                        <span>Published</span> {dirty_icon}
                                                    </div> : <div className='!text-red-500'>Draft</div>
                                                }
                                            </div>
                                            <div className='flex justify-end'>
                                                <CustomLink href={`/admin/edit-city?city_id=${city.city_id}`} className='font-normal px-6 
                                                py-2 bg-primary text-white rounded'>Edit</CustomLink>

                                            </div>
                                        </div>)
                                    }))
                                    : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                        No cities added yet.
                                    </div>)
                        }
                    </div>
                </div>

            </div>

            <div className='w-full h-[90px]'>
                {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/all-cities?' /> : null}
            </div>
            <ToastContainer />
        </div>
    )

}

export default Cities