"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import PageTitle from '../../../_components/PageTitle';
import { BiAddToQueue } from 'react-icons/bi';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '@/components/pagination';
import { useSearchParams } from 'next/navigation';
import { Automations } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Modal from '@/components/Modal';
import AddAutomationModal from '../../../_components/AddAutomation';
import { HiOutlineViewGridAdd } from 'react-icons/hi';
import AutomationListCard from '@/components/AutomationListCard';

const helpers = new Helpers();
const AllAutomations = () => {

    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;

    const [automations, setAutomations] = useState<Automations[]>([]);
    const [drip_fetched, setDripFetched] = useState(false);
    const [total_page, setTotalPage] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modal_children, setModalChildren] = useState({} as React.ReactNode);
    const [refresh_page, setRefreshPage] = useState(false);
    const page_size = 20;

    const closeModal = () => {
        setShowModal(false);
    }

    const payload = {
        paginated: true,
        search_type: "Automation Lists",
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchAutomations = async () => {

            try {

                const dripPromise: Promise<Automations[]> = helpers.LoadAutomations(payload);
                const dripResp = await dripPromise;

                if (dripResp && dripResp.length) {
                    const total_records = dripResp[0].total_records;
                    if (total_records) {
                        setTotalPage(Math.ceil(total_records / page_size));
                    }
                }

                setAutomations(dripResp);
                setDripFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchAutomations();

    }, [curr_page, drip_fetched]);

    const handleAdd = () => {
        setModalChildren(<AddAutomationModal closeModal={closeModal} refresh_page={refresh_page} setRefreshPage={setRefreshPage} />);
        setShowModal(true);
    }

    const add_new_comp = <div className='bg-primary text-white flex items-center justify-center ml-2 py-1 h-10 px-4 text-sm font-medium 
        cursor-pointer hover:drop-shadow-xl rounded-md shadow-lg hover:shadow-2xl' onClick={handleAdd}>
        <BiAddToQueue className='mr-1 !text-xl' /> <span>Add New <span className='hidden xs:inline-block'>Automation</span></span>
    </div>

    return (
        <div className='w-full flex flex-col'>
            <PageTitle text="Automations" show_back={false} right_component={add_new_comp} />
            <div className='!w-full !max-w-[100%] h-[auto] relative box-border pb-10 mt-4'>

                <div className="w-full mt-3 border border-gray-200 rounded-md overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className=" bg-gray-100 grid grid-cols-[repeat(4,1fr)_minmax(100px,100px)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                        <div className="cell-header">Name</div>
                        <div className="cell-header">Status</div>
                        <div className="cell-header">Published</div>
                        <div className="cell-header">Version</div>
                        <div className="cell-header">Actions</div>
                    </div>

                    <div className='w-full divide-y divide-gray-200'>
                        {/* Loader */}
                        {!drip_fetched && <div className=' col-span-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}
                        {/* Rows */}
                        {
                            drip_fetched && (
                                (automations.length && automations.length > 0)
                                    ? (automations.map((automations) => {
                                        return (<AutomationListCard key={automations.automation_id} prop={automations} />)
                                    }))
                                    : <div className='col-span-full h-[250px] bg-white flex flex-col items-center justify-center'>
                                        <div className='w-full text-center'>No automation added yet</div>
                                        <div className='bg-primary py-2 px-6 mt-2 hover:shadow-lg text-white flex items-center 
                                            justify-center font-normal text-base cursor-pointer hover:drop-shadow-xl rounded-md'
                                            onClick={handleAdd}>
                                            <HiOutlineViewGridAdd className='mr-1 !text-xl' /> <span>Add New Automation</span>
                                        </div>
                                    </div>)
                        }

                    </div>
                </div>

                <div className='w-full h-[90px]'>
                    {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/automations?' /> : null}
                </div>
            </div>
            <ToastContainer />
            <Modal show={showModal} children={modal_children} width={550} closeModal={closeModal} title={<>Add New Automation</>} />
        </div>
    )
}

export default AllAutomations