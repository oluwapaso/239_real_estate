"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/user/userSlice';
import PageTitle from '../../_components/PageTitle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '@/components/pagination';
import { useSearchParams } from 'next/navigation';
import { CheckedItems, ProperyRequests, User } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import RequestListCard from '@/components/RequestsListCard';
import Swal from 'sweetalert2';

const helpers = new Helpers();
const AllRequests = () => {

    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const params_type = searchParams?.get("type") as string || "Upcoming Requests";
    const initialPage = parseInt(searchParams?.get("page") as string) || 1;

    const [requests, setRequests] = useState<ProperyRequests[]>([]);
    const [requests_fetched, setRequestsFetched] = useState(false);
    const [can_load, setCanLoad] = useState(true);
    const [total_page, setTotalPage] = useState(0);
    const [curr_page, setCurrPage] = React.useState<number>(initialPage);
    const [type, setType] = React.useState<string>(params_type);
    const page_size = 20;

    const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
    const [isCheckAll, setIsCheckAll] = useState<boolean>(false);
    const [uncheckAll, setUncheckAll] = useState<boolean>(false);

    useEffect(() => {
        setType(params_type);
        setCanLoad(true);
    }, [params_type]);

    useEffect(() => {

        const fetchRequests = async () => {

            try {

                const payload = {
                    paginated: true,
                    search_type: "Requests Lists",
                    request_type: type,
                    page: initialPage,
                    limit: page_size
                }

                const requestsPromise: Promise<ProperyRequests[]> = helpers.LoadPropertyRequests(payload);
                const requestsResp = await requestsPromise;

                if (requestsResp && requestsResp.length) {
                    const total_records = requestsResp[0].total_records;
                    if (total_records) {
                        setTotalPage(Math.ceil(total_records / page_size));
                    }
                }

                setRequests(requestsResp);
                setRequestsFetched(true);
                setCanLoad(false);
                setUncheckAll(false);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        if (can_load) {
            dispatch(showPageLoader());
            fetchRequests();
        }

    }, [initialPage, type, can_load]);

    const DoSearch = (new_type?: string) => {
        let requestType = type;
        if (new_type && new_type != "") {
            requestType = new_type;
        }

        let link = `/admin/requests?type=${requestType}&page=1`;

        setRequestsFetched(false);
        setCanLoad(true);
        setCurrPage(1); // Update the curr_page state to trigger useEffect
        window.history.pushState({}, '', link); // Use pushState to change URL without reloading
    }

    const TriggerStage = (new_type: string) => {
        handleCheckAllChange("Yes");
        if (new_type != type) {
            setType(() => new_type);
            DoSearch(new_type);
        }
    }

    //Handle "Check All" checkbox change
    const handleCheckAllChange = (uncheck_all?: string) => {

        let newCheckAll: boolean | null = null;
        if (uncheck_all && uncheck_all == "Yes") {
            newCheckAll = false;
        } else {
            newCheckAll = !isCheckAll;
        }

        setIsCheckAll(newCheckAll);
        const newCheckedItems: CheckedItems = requests.reduce((acc, request) => {
            acc[request.request_id] = newCheckAll;
            return acc;
        }, {} as CheckedItems);
        setCheckedItems(newCheckedItems);
    };

    // Handle individual checkbox change
    const handleCheckboxChange = (id: number) => {
        setCheckedItems((prev) => {
            const newCheckedItems = { ...prev, [id]: !prev[id] };
            setIsCheckAll(Object.keys(newCheckedItems).length === requests.length && Object.values(newCheckedItems).every(Boolean));
            return newCheckedItems;
        });
    };

    const AcknowledgeAll = async () => {

        const values = Object.entries(checkedItems);
        const trueKeys = values.filter(([key, value]) => value).map(([key]) => key);

        const num_items = trueKeys.length;

        toast.dismiss();
        if (num_items < 1) {
            toast.error("Select at least one request to update", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const result = await Swal.fire({
            title: "Are you sure you want to acknowledge selected requests?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Continue',
        });

        if (result.isConfirmed) {

            try {
                dispatch(showPageLoader());
                const response = await helpers.AcknowledgeMultiRequest(trueKeys);
                if (!response.success) {
                    toast.error(`${response.message}`, {
                        position: "top-center",
                        theme: "colored"
                    });
                    dispatch(hidePageLoader());
                    return false;
                }
                setUncheckAll(true);
            } catch (e: any) {
                console.log(e.message);
            }

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    useEffect(() => {
        if (uncheckAll) {
            const timer = setTimeout(() => {
                handleCheckAllChange("Yes");
                setCheckedItems({});
                setIsCheckAll(false);
                setRequests([]);
                setUncheckAll(false);
                setCanLoad(true);
                dispatch(hidePageLoader());
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [uncheckAll]);

    return (
        <div className='w-full flex flex-col'>
            <PageTitle text={type} show_back={false} />
            <div className='!w-full !max-w-[100%] h-[auto] relative box-border pb-10'>
                <div className='w-full mt-8 flex justify-between'>
                    <div className="relative">

                        {
                            params_type != "Completed Requests" ? <div className='flex items-center px-5 bg-zinc-900 text-white border 
                            border-zinc-900 cursor-pointer h-[45px] rounded hover:shadow-xl *:font-semibold relative'
                                onClick={AcknowledgeAll}>
                                Acknowledge All
                            </div> : <div className='flex items-center px-5 bg-gray-200 text-zinc-900 border cursor-not-allowed 
                            border-gray-200 h-[45px] rounded hover:shadow-xl *:font-semibold relative'>
                                ......
                            </div>
                        }

                    </div>

                    <div className='ml-auto flex items-center'>
                        <div className='flex items-center group px-3 bg-white border border-zinc-900 cursor-pointer h-[45px] rounded 
                            min-w-[100px] hover:shadow-xl *:font-semibold relative'>
                            <div className='flex justify-between w-full items-center'>
                                <span>Request Type: {type.replace("Requests", "")}</span>
                                <span className='group-hover:rotate-180 transition-all duration-300'>
                                    <MdOutlineKeyboardArrowDown size={20} />
                                </span>
                            </div>

                            <div className='w-[240px] hidden group-hover:block absolute top-[104%] right-0 shadow-2xl rounded-md bg-white z-10'>
                                <div className='w-full flex flex-col max-h-[400px] overflow-y-auto font-medium'>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "Info Requests" && "bg-gray-50"}`} onClick={() => TriggerStage("Info Requests")}>Info Requests</div>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "Buying Requests" && "bg-gray-50"}`} onClick={() => TriggerStage("Buying Requests")}>Buying Requests</div>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "Selling Requests" && "bg-gray-50"}`} onClick={() => TriggerStage("Selling Requests")}>Selling Requests</div>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "Tour Requests" && "bg-gray-50"}`} onClick={() => TriggerStage("Tour Requests")}>Tour Requests</div>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "Showing Requests" && "bg-gray-50"}`} onClick={() => TriggerStage("Showing Requests")}>Showing Requests</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-3 border border-gray-200 rounded-md overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className=" bg-gray-100 grid grid-cols-[minmax(50px,50px)_repeat(4,1fr)_minmax(180px,180px)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                        <div className="cell-header flex items-center select-none">
                            <input type="checkbox" className='styled-checkbox z-20' checked={isCheckAll} onChange={() => handleCheckAllChange()} />
                            <label className='z-10 -left-4'></label>
                        </div>
                        <div className="cell-header">User</div>
                        <div className="cell-header">Type</div>
                        <div className="cell-header">Date</div>
                        <div className="cell-header">Status</div>
                        <div className="cell-header">Actions</div>
                    </div>

                    <div className='w-full divide-y divide-gray-200'>
                        {/* Loader */}
                        {!requests_fetched && <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}
                        {/* Rows */}
                        {
                            requests_fetched && (
                                (requests.length && requests.length > 0)
                                    ? (requests.map((request, index) => {
                                        return (<RequestListCard key={`${request.request_id}-${index}`} prop={request} setCanLoad={setCanLoad}
                                            checkedItems={checkedItems} handleCheckboxChange={handleCheckboxChange} />)
                                    }))
                                    : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                        No requests found on this page.
                                    </div>)
                        }
                    </div>
                </div>

                <div className='w-full h-[90px]'>
                    {total_page > 0 ? <Pagination totalPage={total_page} curr_page={initialPage} url_path={`/admin/requests?type=${type}&`} /> : null}
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default AllRequests