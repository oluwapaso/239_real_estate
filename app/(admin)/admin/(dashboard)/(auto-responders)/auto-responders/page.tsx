"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import PageTitle from '../../../_components/PageTitle';
import { ToastContainer } from 'react-toastify';
import { AutoResponderLists } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import UserListCard from '@/components/UserLists';
import AutoResponderListsCard from '@/components/AutoResponderLists';

const helpers = new Helpers();
const AllAutoResponders = () => {

    const dispatch = useDispatch();
    const [auto_responders, setAutoResponders] = useState<AutoResponderLists[]>([]);
    const [ar_fetched, setARFetched] = useState(false);

    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const arPromise: Promise<AutoResponderLists[]> = helpers.LoadAutoResponders();
                const arResp = await arPromise;

                setAutoResponders(arResp);
                setARFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchUsers();

    }, []);

    return (
        <div className='w-full flex flex-col'>
            <div className='w-full container mx-auto max-w-[1000px]'>
                <PageTitle text="Auto Responders" show_back={false} />
                <div className='!w-full !max-w-[100%] h-[auto] relative box-border pb-10'>

                    <div className="w-fullborder border-gray-200 rounded-md overflow-hidden shadow-xl">
                        {/* Header */}
                        <div className=" bg-gray-100 grid grid-cols-[1fr_minmax(150px,150px)_minmax(150px,150px)_minmax(100px,100px)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                            <div className="cell-header">Name</div>
                            <div className="cell-header">Type</div>
                            <div className="cell-header">Send AR</div>
                            <div className="cell-header">Actions</div>
                        </div>

                        <div className='w-full divide-y divide-gray-200'>
                            {/* Loader */}
                            {!ar_fetched && <div className=' col-span-full h-[250px] bg-white flex items-center justify-center'>
                                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                            </div>}
                            {/* Rows */}
                            {
                                ar_fetched && (
                                    (auto_responders.length && auto_responders.length > 0)
                                        ? (auto_responders.map((ar) => {
                                            return (<AutoResponderListsCard key={ar.auto_responder_id} prop={ar} />)
                                        }))
                                        : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                            No auto responder found.
                                        </div>)
                            }

                        </div>
                    </div>

                </div>
                <ToastContainer />
            </div>
        </div>
    )
}

export default AllAutoResponders