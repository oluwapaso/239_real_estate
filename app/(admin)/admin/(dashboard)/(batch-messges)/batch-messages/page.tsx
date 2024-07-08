"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import PageTitle from '../../../_components/PageTitle';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '@/components/pagination';
import { useSearchParams } from 'next/navigation';
import { BatchMessages } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import MessagesListCard from '@/components/MessgesListCard';

const helpers = new Helpers();
const AllBatchMessages = () => {

    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const params_type = searchParams?.get("type") as string || "Email";
    const initialPage = parseInt(searchParams?.get("page") as string) || 1;

    const [messages, setMessages] = useState<BatchMessages[]>([]);
    const [messages_fetched, setMessagesFetched] = useState(false);
    const [can_load, setCanLoad] = useState(true);
    const [total_page, setTotalPage] = useState(0);
    const [curr_page, setCurrPage] = React.useState<number>(initialPage);
    const [type, setType] = React.useState<string>(params_type);
    const page_size = 20;

    useEffect(() => {
        setType(params_type);
        setCanLoad(true);
    }, [params_type]);

    useEffect(() => {

        const fetchMessages = async () => {

            try {

                const payload = {
                    paginated: true,
                    message_type: type,
                    page: initialPage,
                    limit: page_size
                }

                const messagesPromise: Promise<BatchMessages[]> = helpers.LoadBatchMessages(payload);
                const messagesResp = await messagesPromise;

                if (messagesResp && messagesResp.length) {
                    const total_records = messagesResp[0].total_records;
                    if (total_records) {
                        setTotalPage(Math.ceil(total_records / page_size));
                    }
                }

                setMessages(messagesResp);
                setMessagesFetched(true);
                setCanLoad(false);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        if (can_load) {
            dispatch(showPageLoader());
            fetchMessages();
        }

    }, [initialPage, type, can_load]);

    const DoSearch = (new_type?: string) => {
        let messageType = type;
        if (new_type && new_type != "") {
            messageType = new_type;
        }

        let link = `/admin/batch-messages?type=${messageType}&page=1`;

        setMessagesFetched(false);
        setCanLoad(true);
        setCurrPage(1); // Update the curr_page state to trigger useEffect
        window.history.pushState({}, '', link); // Use pushState to change URL without reloading
    }

    const TriggerStage = (new_type: string) => {
        if (new_type != type) {
            setType(() => new_type);
            DoSearch(new_type);
        }
    }

    return (
        <div className='w-full flex flex-col'>
            <PageTitle text="Batch Messages" show_back={false} />
            <div className='!w-full !max-w-[100%] h-[auto] relative box-border pb-10'>
                <div className='w-full mt-8 flex justify-between'>
                    <div className="relative">Batch {type}</div>

                    <div className='ml-auto flex items-center'>
                        <div className='flex items-center group px-3 bg-white border border-zinc-900 cursor-pointer h-[45px] rounded 
                            min-w-[100px] hover:shadow-xl *:font-semibold relative'>
                            <div className='flex justify-between w-full items-center'>
                                <span>Message Type: {type}</span>
                                <span className='group-hover:rotate-180 transition-all duration-300'>
                                    <MdOutlineKeyboardArrowDown size={20} />
                                </span>
                            </div>

                            <div className='w-[240px] hidden group-hover:block absolute top-[104%] right-0 shadow-2xl rounded-md bg-white z-10'>
                                <div className='w-full flex flex-col max-h-[400px] overflow-y-auto font-medium'>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "Email" && "bg-gray-50"}`} onClick={() => TriggerStage("Email")}>Email</div>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "SMS" && "bg-gray-50"}`} onClick={() => TriggerStage("SMS")}>SMS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-3 border border-gray-200 rounded-md overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className=" bg-gray-100 grid grid-cols-[3fr_repeat(7,1fr)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                        <div className="cell-header">Template</div>
                        <div className="cell-header">Date</div>
                        <div className="cell-header">Status</div>
                        <div className="cell-header">Total</div>
                        <div className="cell-header">Queued</div>
                        <div className="cell-header">Processed</div>
                        <div className="cell-header">Unsubscribed</div>
                        <div className="cell-header">Errored</div>
                    </div>

                    <div className='w-full divide-y divide-gray-200'>
                        {/* Loader */}
                        {!messages_fetched && <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}
                        {/* Rows */}
                        {
                            messages_fetched && (
                                (messages.length && messages.length > 0)
                                    ? (messages.map((message, index) => {
                                        return (<MessagesListCard key={`${message.batch_id}-${index}`} prop={message} />)
                                    }))
                                    : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                        No batch message found on this page.
                                    </div>)
                        }
                    </div>
                </div>

                <div className='w-full h-[90px]'>
                    {total_page > 0 ? <Pagination totalPage={total_page} curr_page={initialPage} url_path={`/admin/batch-messages?type=${type}&`} /> : null}
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default AllBatchMessages