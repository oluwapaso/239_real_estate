"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/user/userSlice';
import PageTitle from '../../_components/PageTitle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '@/components/pagination';
import { useSearchParams } from 'next/navigation';
import { CheckedItems, Appointment, User } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import AppointmentListCard from '@/components/AppointmentListCard';
import Swal from 'sweetalert2';

const helpers = new Helpers();
const AllAppointments = () => {

    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const params_type = searchParams?.get("type") as string || "Upcoming Appointments";
    const initialPage = parseInt(searchParams?.get("page") as string) || 1;

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointments_fetched, setAppointmentsFetched] = useState(false);
    const [can_load, setCanLoad] = useState(true);
    const [total_page, setTotalPage] = useState(0);
    const [curr_page, setCurrPage] = React.useState<number>(initialPage);
    const [type, setType] = React.useState<string>(params_type);
    const page_size = 20;

    const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
    const [isCheckAll, setIsCheckAll] = useState<boolean>(false);
    const [uncheckAll, setUncheckAll] = useState<boolean>(false);

    const payload = {
        paginated: true,
        search_type: "Appointments Lists",
        appointment_type: type,
        page: initialPage,
        limit: page_size
    }

    useEffect(() => {

        const fetchAppointments = async () => {

            try {

                const appointmentsPromise: Promise<Appointment[]> = helpers.LoadAppointments(payload);
                const appointmentsResp = await appointmentsPromise;

                if (appointmentsResp && appointmentsResp.length) {
                    const total_records = appointmentsResp[0].total_records;
                    if (total_records) {
                        setTotalPage(Math.ceil(total_records / page_size));
                    }
                }

                setAppointments(appointmentsResp);
                setAppointmentsFetched(true);
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
            fetchAppointments();
        }

    }, [initialPage, type, can_load]); //lead_stage

    const DoSearch = (new_type?: string) => {
        let appointmentType = type;
        if (new_type && new_type != "") {
            appointmentType = new_type;
        }

        let link = `/admin/appointments?type=${appointmentType}&page=1`;

        setAppointmentsFetched(false);
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

    // Handle "Check All" checkbox change
    const handleCheckAllChange = (uncheck_all?: string) => {

        let newCheckAll: boolean | null = null;
        if (uncheck_all && uncheck_all == "Yes") {
            newCheckAll = false;
        } else {
            newCheckAll = !isCheckAll;
        }

        setIsCheckAll(newCheckAll);
        const newCheckedItems: CheckedItems = appointments.reduce((acc, appointment) => {
            acc[appointment.appointment_id] = newCheckAll;
            return acc;
        }, {} as CheckedItems);
        setCheckedItems(newCheckedItems);
    };

    // Handle individual checkbox change
    const handleCheckboxChange = (id: number) => {
        setCheckedItems((prev) => {
            const newCheckedItems = { ...prev, [id]: !prev[id] };
            setIsCheckAll(Object.keys(newCheckedItems).length === appointments.length && Object.values(newCheckedItems).every(Boolean));
            return newCheckedItems;
        });
    };


    const MarkMultipleAsDone = async () => {

        const values = Object.entries(checkedItems);
        const trueKeys = values.filter(([key, value]) => value).map(([key]) => key);

        const num_items = trueKeys.length;

        toast.dismiss();
        if (num_items < 1) {
            toast.error("Select at least one appointment to update", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const result = await Swal.fire({
            title: "Are you sure you want to mark selected appointments as done?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, It\'s Completed',
        });

        if (result.isConfirmed) {

            try {
                dispatch(showPageLoader());
                await helpers.MarkMultipleAppointmentsAsDone(trueKeys);
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
                setAppointments([]);
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
                            params_type != "Completed Appointments" ? <div className='flex items-center px-5 bg-zinc-900 text-white border 
                            border-zinc-900 cursor-pointer h-[45px] rounded hover:shadow-xl *:font-semibold relative'
                                onClick={MarkMultipleAsDone}>
                                Mark As Done
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
                                <span>Appointments Type: {type.replace("Appointments", "")}</span>
                                <span className='group-hover:rotate-180 transition-all duration-300'>
                                    <MdOutlineKeyboardArrowDown size={20} />
                                </span>
                            </div>

                            <div className='w-[240px] hidden group-hover:block absolute top-[104%] right-0 shadow-2xl rounded-md bg-white z-10'>
                                <div className='w-full flex flex-col max-h-[400px] overflow-y-auto font-medium'>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "Upcoming Appointments" && "bg-gray-50"}`} onClick={() => TriggerStage("Upcoming Appointments")}>Upcoming Appointments</div>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "Overdue Appointments" && "bg-gray-50"}`} onClick={() => TriggerStage("Overdue Appointments")}>Overdue Appointments</div>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${type == "Completed Appointments" && "bg-gray-50"}`} onClick={() => TriggerStage("Completed Appointments")}>Completed Appointments</div>
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
                        <div className="cell-header">Title/Location</div>
                        <div className="cell-header">User</div>
                        <div className="cell-header">Date</div>
                        <div className="cell-header">Status</div>
                        <div className="cell-header">Actions</div>
                    </div>

                    <div className='w-full divide-y divide-gray-200'>
                        {/* Loader */}
                        {!appointments_fetched && <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}
                        {/* Rows */}
                        {
                            appointments_fetched && (
                                (appointments.length && appointments.length > 0)
                                    ? (appointments.map((appointment, index) => {
                                        return (<AppointmentListCard key={`${appointment.appointment_id}-${index}`} prop={appointment}
                                            setCanLoad={setCanLoad} checkedItems={checkedItems} handleCheckboxChange={handleCheckboxChange} />)
                                    }))
                                    : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                        No appointments found on this page.
                                    </div>)
                        }
                    </div>
                </div>

                <div className='w-full h-[90px]'>
                    {total_page > 0 ? <Pagination totalPage={total_page} curr_page={initialPage} url_path={`/admin/appointments?type=${type}&`} /> : null}
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default AllAppointments