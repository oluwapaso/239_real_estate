"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import PageTitle from '../../../_components/PageTitle';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '@/components/pagination';
import { useSearchParams } from 'next/navigation';
import { BatchMessages, BatchMessageStats, PendingBatchEmail, SentBatchEmail, UnsubscribedBatchEmail } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaArrowLeftLong } from 'react-icons/fa6';
import CustomLink from '@/components/CustomLink';
import moment from 'moment';
import BatchMsgPendingLists from '@/components/BatchMsgPendingLists';
import SentMsgBatchList from '@/components/SentMsgBatchList';
import UnsubscribedMsgBatchList from '@/components/UnsubscribeBatchMsgList';

const helpers = new Helpers();
const BatchMessageDetails = () => {

    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const batch_id = searchParams?.get("batch_id") as string;
    const params_type = searchParams?.get("type") as string || "Pending";
    const initialPage = parseInt(searchParams?.get("page") as string) || 1;

    const [batchMsg, setBatchMessage] = useState<BatchMessages>({} as BatchMessages);
    const [batch_fetched, setBatchMessageFetched] = useState(false);

    type BatchEmailUnion = BatchMessageStats | PendingBatchEmail | SentBatchEmail | UnsubscribedBatchEmail;

    const [messages, setMessages] = useState<BatchEmailUnion[]>([]);
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

        const fetchBatchInfo = async () => {

            try {

                const batchPromise: Promise<BatchMessages> = helpers.LoadSingleBatchMessage({ batch_id });
                const batchResp = await batchPromise;

                setBatchMessage(batchResp);
                setBatchMessageFetched(true);

            } catch (e: any) {
                console.log(e.message)
            }

        }

        const fetchMessages = async () => {

            try {

                const payload = {
                    paginated: true,
                    message_type: type,
                    batch_id: batch_id,
                    page: initialPage,
                    limit: page_size
                }

                const messagesPromise: Promise<BatchEmailUnion[]> = helpers.LoadBatchMessageStats(payload);
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
            fetchBatchInfo();
            fetchMessages();
        }

    }, [initialPage, type, can_load]);

    const DoSearch = (new_type?: string) => {
        let messageType = type;
        if (new_type && new_type != "") {
            messageType = new_type;
        }

        let link = `/admin/batch-message-details?batch_id=${batch_id}&type=${messageType}&page=1`;

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
            <PageTitle text="Batch Message Details" show_back={false} />
            <div className='!w-full !max-w-[100%] h-[auto] relative box-border pb-10'>

                <div className='w-full mt-0 space-y-1'>
                    <div className='w-full flex'>
                        <span className='font-semibold'>Type:</span> <span className='ml-2'>{batchMsg.message_type}</span>
                    </div>
                    <div className='w-full flex'>
                        <span className='font-semibold'>Status:</span> <span className='ml-2'>{batchMsg.status}</span>
                    </div>
                    <div className='w-full flex'>
                        <span className='font-semibold'>Total Message:</span> <span className='ml-2'>{batchMsg.total_messages}</span>
                    </div>
                    <div className='w-full flex'>
                        <span className='font-semibold'>Template/Subject:</span> <span className='ml-2'>{batchMsg.template_name}</span>
                    </div>
                    <div className='w-full flex'>
                        <span className='font-semibold'>Date sent:</span> <span className='ml-2'>{moment(batchMsg.date_sent).format("MMMM DD, YYYY")}</span>
                    </div>
                </div>

                <div className='w-full mt-4 flex items-center space-x-2'>
                    <CustomLink href={`/admin/batch-messages?type=${batchMsg.message_type}&page=1`} className='flex items-center px-3 bg-red-600 text-white border border-red-600 cursor-pointer h-[45px] 
                        rounded hover:shadow-xl relative'>
                        <FaArrowLeftLong size={14} className='mr-2' />
                        <span>Back</span>
                    </CustomLink>

                    <div className={`flex items-center px-3 bg-white border border-zinc-900 cursor-pointer h-[45px] 
                        rounded hover:shadow-xl relative ${params_type == "Pending" && "!bg-sky-700 text-white"}`} onClick={() => TriggerStage("Pending")}>
                        <span>Pending {batchMsg.queued}</span>
                    </div>

                    <div className={`flex items-center px-3 bg-white border border-zinc-900 cursor-pointer h-[45px] 
                        rounded hover:shadow-xl relative ${params_type == "Sent" && "!bg-sky-700 text-white"}`} onClick={() => TriggerStage("Sent")}>
                        <span>Sent {batchMsg.total_sent}</span>
                    </div>

                    <div className={`flex items-center px-3 bg-white border border-zinc-900 cursor-pointer h-[45px] 
                        rounded hover:shadow-xl relative ${params_type == "Errored" && "!bg-sky-700 text-white"}`} onClick={() => TriggerStage("Errored")}>
                        <span>Errored {batchMsg.total_errored}</span>
                    </div>

                    <div className={`flex items-center px-3 bg-white border border-zinc-900 cursor-pointer h-[45px] 
                        rounded hover:shadow-xl relative ${params_type == "Unsubscribed" && "!bg-sky-700 text-white"}`} onClick={() => TriggerStage("Unsubscribed")}>
                        <span>Unsubscribed {batchMsg.unsubscribed}</span>
                    </div>
                </div>

                <div className="w-full mt-3 border border-gray-200 rounded-md overflow-hidden shadow-xl">
                    {/* Header */}
                    {
                        (type == "Pending" || type == "Sent" || type == "Unsubscribed") && (<div className=" bg-gray-100 grid grid-cols-[2fr_repeat(2,1fr)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                            <div className="cell-header">User</div>
                            <div className="cell-header">{batchMsg.message_type == "Email" ? "Email Address" : "Phone number"}</div>
                            <div className="cell-header">
                                Date {type == "Pending" && "Queued"} {(type == "Sent" || type == "Unsubscribed") && "Sent"}
                            </div>
                        </div>)
                    }

                    <div className='w-full divide-y divide-gray-200'>
                        {/* Loader */}
                        {!messages_fetched && <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}
                        {/* Rows */}
                        {
                            messages_fetched && (
                                (messages && messages.length && messages.length > 0)
                                    ? (messages.map((message, index) => {
                                        if (type == "Pending") {
                                            message = message as PendingBatchEmail;
                                            return (<BatchMsgPendingLists key={`${message.queue_id}-${index}`} prop={message} />)
                                        } else if (type == "Sent") {
                                            message = message as SentBatchEmail;
                                            return (<SentMsgBatchList key={`${message.message_id}-${index}`} prop={message} />)
                                        } else if (type == "Unsubscribed") {
                                            message = message as UnsubscribedBatchEmail;
                                            return (<UnsubscribedMsgBatchList key={`${message.error_id}-${index}`} prop={message} />)
                                        } else {
                                            return (<></>) //<MessagesListCard key={`${message.batch_id}-${index}`} prop={message} />
                                        }
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

export default BatchMessageDetails