"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Helpers } from '@/_lib/helpers';
import { useParams, useRouter } from 'next/navigation';
import { InitialActivities, Task, User } from '@/components/types';
import { hidePageLoader, showPageLoader } from '@/app/(admin)/admin/GlobalRedux/user/userSlice';
import { BsArrowLeftShort, BsClock, BsInfoCircle } from 'react-icons/bs';
import UserInfo from '@/app/(admin)/admin/_components/UserInfo';
import { TfiSave, TfiWrite } from 'react-icons/tfi';
import { MdOutlineMail } from 'react-icons/md';
import { LiaBinocularsSolid, LiaSmsSolid } from 'react-icons/lia';
import { BiPhoneCall, BiTrash } from 'react-icons/bi';
import CreateNote from '@/app/(admin)/admin/_components/CreateNote';
import ComposeMail from '@/app/(admin)/admin/_components/ComposeMail';
import ComposeSMS from '@/app/(admin)/admin/_components/ComposeSMS';
import LogCalls from '@/app/(admin)/admin/_components/LogCalls';
import UserTasks from '@/app/(admin)/admin/_components/UserTasks';
import UserAppointments from '@/app/(admin)/admin/_components/UserAppointments';
import NewTaskModal from '@/app/(admin)/admin/_components/NewTaskModal';
import Modal from '@/components/Modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NewAppointmentModal from '@/app/(admin)/admin/_components/NewAppointmentModal';
import CustomLink from '@/components/CustomLink';
import { FaEdit } from 'react-icons/fa';
import { CiCircleList } from 'react-icons/ci';
import { HiHomeModern } from 'react-icons/hi2';
import { TbEyeSearch, TbHomeDollar } from 'react-icons/tb';
import { RiHeartAdd2Line } from 'react-icons/ri';
import AllUsersActivities from '@/app/(admin)/admin/_components/AllUsersActivities';
import NoteActivities from '@/app/(admin)/admin/_components/NoteActivities';
import MessagesActivities from '@/app/(admin)/admin/_components/MessagesActivities';
import { IoWalkSharp } from 'react-icons/io5';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import PropertyActivities from '@/app/(admin)/admin/_components/PropertyActivities';
import FavoritesActivities from '@/app/(admin)/admin/_components/FavoritesActivities';
import SavedSearchesActivities from '@/app/(admin)/admin/_components/SavedSearches';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const helpers = new Helpers();
const UserDetails = () => {

    const dispatch = useDispatch();
    const params = useParams();
    const router = useRouter();

    const init_act_counts: InitialActivities = {
        TotalNotes: 0,
        TotalCallLog: 0,
        TotalFavorites: 0,
        TotalUnfavorites: 0,
        TotalViewed: 0,
        TotalSearches: 0,
        TotalSavedSearches: 0,
        TotalDeletedSearches: 0,
        TotalEmails: 0,
        TotalSMS: 0,
        TotalSellingRequests: 0,
        TotalBuyingRequests: 0,
        TotalInfoRequests: 0,
        TotalTourRequests: 0,
        TotalShowingRequests: 0
    }

    const [user_info, setUserInfo] = useState<User>({} as User);
    const [user_info_fetched, setUserInfoFetched] = useState(false);
    const [active_tab, setActiveTab] = useState("Create Note");
    const [active_activity_tab, setActiveActivityTab] = useState("All");
    const [activity_counts, setActivityCounts] = useState(init_act_counts);
    const user_id = params?.user_id;
    const [refresh_activities, setRefreshActivities] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modal_children, setModalChild] = useState<React.JSX.Element>(<></>)
    const [modal_title, setModalTitle] = useState(<></>)
    const [add_task_resp, setAddTaskResponse] = useState<any>({});
    const [refresh_tasks, setRefreshTasks] = useState(true);
    const [add_appointment_resp, setAddAppointmentResponse] = useState<any>({});
    const [refresh_appointments, setRefreshAppointments] = useState(true);

    const closeModal = () => {
        setShowModal(false);
    }

    const handleTaskModal = () => {
        setShowModal(true);
        setModalChild(<NewTaskModal closeModal={closeModal} user_id={user_info.user_id} setAddTaskResponse={setAddTaskResponse} />);
        setModalTitle(<>Add New Task</>)
    }

    const handleAppointmentModal = () => {
        setShowModal(true);
        setModalChild(<NewAppointmentModal closeModal={closeModal} user_id={user_info.user_id} setAddAppointmentResponse={setAddAppointmentResponse} />);
        setModalTitle(<>Add New Appointment</>)
    }

    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const userPromise: Promise<User> = helpers.LoadSingleUser(user_id as string);
                const userResp = await userPromise;

                setUserInfo(userResp);
                setUserInfoFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchUsers();

    }, [user_id]);

    const handleTab = (type: string) => {
        setActiveTab(type);
    }

    const handleActivityTab = (type: string) => {
        setActiveActivityTab(type);
    }

    useEffect(() => {

        const data = add_task_resp;
        dispatch(hidePageLoader());
        //toast.dismiss();
        if (data.success) {

            toast.success(data.message, {
                position: "top-center",
                theme: "colored"
            });

            setRefreshTasks(true);

        } else {
            toast.error(data.message, {
                position: "top-center",
                theme: "colored"
            })
        }

    }, [add_task_resp]);

    useEffect(() => {

        const data = add_appointment_resp;
        dispatch(hidePageLoader());
        //toast.dismiss();
        if (data.success) {

            toast.success(data.message, {
                position: "top-center",
                theme: "colored"
            });

            setRefreshAppointments(true);

        } else {
            toast.error(data.message, {
                position: "top-center",
                theme: "colored"
            })
        }

    }, [add_appointment_resp]);

    useEffect(() => {

        if (refresh_activities) {
            handleActivityTab("Refresher");
            const to = setTimeout(() => {
                handleActivityTab("All");
                setRefreshActivities(false);
            }, 500);

            return () => clearTimeout(to);
        }

    }, [refresh_activities]);

    return (
        <div className='w-full bg-gray-50 relative'>

            <div className='w-full flex justify-between items-center'>
                <div className='font-semibold text-xl'>User Info</div>
                <div className='flex items-center'>
                    <CustomLink href={`/admin/edit-user?user_id=${user_id}`} className='bg-sky-600 text-white flex items-center 
                    justify-center py-1 px-4 h-10 text-sm font-medium hover:drop-shadow-xl'>
                        <FaEdit className='mr-1 text-base' /> <span>Edit info</span>
                    </CustomLink>
                    <div className='ml-2 bg-red-600 text-white flex items-center justify-center py-1 px-4 h-10 text-sm 
                    font-medium hover:drop-shadow-xl'>
                        <BiTrash className='mr-1 text-base' /> <span>Delete Account</span>
                    </div>
                    <button className='ml-2 bg-red-600 text-white flex items-center justify-center py-1 px-4 h-10 text-sm font-medium 
                    hover:drop-shadow-xl' onClick={() => router.back()}>
                        <BsArrowLeftShort className='mr-1 !text-2xl' /> <span>Back</span>
                    </button>
                </div>
            </div>
            <div className='w-full grid grid-cols-8 gap-3 mt-4 *:rounded-md *:bg-white *:drop-shadow'>

                <div className='col-span-2 relative'>
                    <UserInfo info={user_info} />
                </div>

                <div className='col-span-4 !bg-transparent'>
                    <div className='w-full bg-white rounded-t-md border-b border-gray-200 flex items-center *:p-4 *:flex *:items-center 
                    *:py-2 *:px-4 *:cursor-pointer *:text-gray-400'>
                        <div onClick={() => handleTab("Create Note")} className={`hover:bg-gray-100 hover:text-gray-900 ${active_tab == "Create Note" && "bg-gray-100 !text-gray-900"}`}><TfiWrite size={14} /> <span className='ml-1'>Create Note</span></div>
                        <div onClick={() => handleTab("Send Email")} className={`hover:bg-gray-100 hover:text-gray-900 ${active_tab == "Send Email" && "bg-gray-100 !text-gray-900"}`}><MdOutlineMail size={18} /> <span className='ml-1'>Send Email</span></div>
                        <div onClick={() => handleTab("Text")} className={`hover:bg-gray-100 hover:text-gray-900 ${active_tab == "Text" && "bg-gray-100 !text-gray-900"}`}><LiaSmsSolid size={18} /> <span className='ml-1'>Text</span></div>
                        <div onClick={() => handleTab("Call Log")} className={`hover:bg-gray-100 hover:text-gray-900 ${active_tab == "Call Log" && "bg-gray-100 !text-gray-900"}`}><BiPhoneCall size={18} /> <span className='ml-1'>Call Log</span></div>
                    </div>

                    {active_tab == "Create Note" && <CreateNote user_id={user_id as unknown as number}
                        setRefreshActivities={setRefreshActivities} />}
                    {active_tab == "Send Email" && <ComposeMail user_id={user_id as unknown as number} user_email={user_info.email}
                        setRefreshActivities={setRefreshActivities} />}
                    {active_tab == "Text" && <ComposeSMS phone_number={user_info.phone_1} />}
                    {active_tab == "Call Log" && <LogCalls user_id={user_id as unknown as number} phone_number={user_info.phone_1}
                        setRefreshActivities={setRefreshActivities} />}

                    <div className='w-full bg-white rounded-md mt-5'>
                        <div className='w-full bg-white rounded-t-md border-b border-gray-200 flex flex-wrap 
                            items-center *:p-4 *:flex *:items-center *:py-2 *:px-4 *:cursor-pointer *:text-gray-400'>
                            <div onClick={() => handleActivityTab("All")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "All" && "bg-gray-100 !text-gray-900"}`}>
                                <CiCircleList size={14} /> <span className="ml-1 ">All</span>
                            </div>
                            <div onClick={() => handleActivityTab("Notes")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Notes" && "bg-gray-100 !text-gray-900"}`}>
                                <TfiWrite size={14} />
                                <span className={`ml-1 ${active_activity_tab == "Notes" ? "block" : "hidden"}`}>Notes</span>
                                <span className='ml-1'>{activity_counts.TotalNotes}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Emails")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Emails" && "bg-gray-100 !text-gray-900"}`}>
                                <MdOutlineMail size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Emails" ? "block" : "hidden"}`}>Emails</span>
                                <span className='ml-1'>{activity_counts.TotalEmails}</span>
                            </div>
                            <div onClick={() => handleActivityTab("SMS")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "SMS" && "bg-gray-100 !text-gray-900"}`}>
                                <LiaSmsSolid size={18} />
                                <span className={`ml-1 ${active_activity_tab == "SMS" ? "block" : "hidden"}`}>SMS</span>
                                <span className='ml-1'>{activity_counts.TotalSMS}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Call Logs")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Call Logs" && "bg-gray-100 !text-gray-900"}`}>
                                <BiPhoneCall size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Call Logs" ? "block" : "hidden"}`}>Call Log</span>
                                <span className='ml-1'>{activity_counts.TotalCallLog}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Properties Viewed")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Properties Viewed" && "bg-gray-100 !text-gray-900"}`}>
                                <HiHomeModern size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Properties Viewed" ? "block" : "hidden"}`}>Properties Viewed</span>
                                <span className='ml-1'>{activity_counts.TotalViewed}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Searches")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Searches" && "bg-gray-100 !text-gray-900"}`}>
                                <TbEyeSearch size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Searches" ? "block" : "hidden"}`}>All Searches</span>
                                <span className='ml-1'>{activity_counts.TotalSearches}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Saved Searches")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Saved Searches" && "bg-gray-100 !text-gray-900"}`}>
                                <TfiSave size={13} />
                                <span className={`ml-1 ${active_activity_tab == "Saved Searches" ? "block" : "hidden"}`}>Saved Searches</span>
                                <span className='ml-1'>{activity_counts.TotalSavedSearches}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Favorites")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Favorites" && "bg-gray-100 !text-gray-900"}`}>
                                <RiHeartAdd2Line size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Favorites" ? "block" : "hidden"}`}>Favorites</span>
                                <span className='ml-1'>{activity_counts.TotalFavorites}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Info Requests")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Info Requests" && "bg-gray-100 !text-gray-900"}`}>
                                <BsInfoCircle size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Info Requests" ? "block" : "hidden"}`}>Info Requests</span>
                                <span className='ml-1'>{activity_counts.TotalInfoRequests}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Tour Requests")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Tour Requests" && "bg-gray-100 !text-gray-900"}`}>
                                <IoWalkSharp size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Tour Requests" ? "block" : "hidden"}`}>Tour Requests</span>
                                <span className='ml-1'>{activity_counts.TotalTourRequests}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Buying Requests")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Buying Requests" && "bg-gray-100 !text-gray-900"}`}>
                                <FaHandHoldingDollar size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Buying Requests" ? "block" : "hidden"}`}>Buying Requests</span>
                                <span className='ml-1'>{activity_counts.TotalBuyingRequests}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Selling Requests")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Selling Requests" && "bg-gray-100 !text-gray-900"}`}>
                                <TbHomeDollar size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Selling Requests" ? "block" : "hidden"}`}>Selling Requests</span>
                                <span className='ml-1'>{activity_counts.TotalSellingRequests}</span>
                            </div>
                            <div onClick={() => handleActivityTab("Showing Requests")} className={`hover:bg-gray-200 hover:text-gray-900 
                                ${active_activity_tab == "Showing Requests" && "bg-gray-100 !text-gray-900"}`}>
                                <LiaBinocularsSolid size={18} />
                                <span className={`ml-1 ${active_activity_tab == "Showing Requests" ? "block" : "hidden"}`}>Showing Requests</span>
                                <span className='ml-1'>{activity_counts.TotalShowingRequests}</span>
                            </div>
                        </div>

                    </div>

                    {active_activity_tab == "All" && <AllUsersActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} />}

                    {active_activity_tab == "Emails" && <MessagesActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} message_type='Email' />} {/** Yes it's Email **/}

                    {active_activity_tab == "SMS" && <MessagesActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} message_type='SMS' />}

                    {active_activity_tab == "Notes" && <NoteActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} note_type='Notes' />}

                    {active_activity_tab == "Call Logs" && <NoteActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} note_type='Call Log' />} {/** Yes it's Call Log **/}

                    {active_activity_tab == "Properties Viewed" && <NoteActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} note_type='Viewed a Property' />}

                    {active_activity_tab == "Searches" && <NoteActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} note_type='Search For Listings' />}

                    {active_activity_tab == "Saved Searches" && <SavedSearchesActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} />}

                    {active_activity_tab == "Info Requests" && <PropertyActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} activity_type="Info Requests" />}

                    {active_activity_tab == "Tour Requests" && <PropertyActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} activity_type="Tour Requests" />}

                    {active_activity_tab == "Buying Requests" && <PropertyActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} activity_type="Buying Requests" />}

                    {active_activity_tab == "Selling Requests" && <PropertyActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} activity_type="Selling Requests" />}

                    {active_activity_tab == "Showing Requests" && <PropertyActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} activity_type="Showing Requests" />}

                    {active_activity_tab == "Favorites" && <FavoritesActivities user_id={user_id as unknown as number}
                        setActivityCounts={setActivityCounts} />}

                    {active_activity_tab == "Refresher" && <div className='w-full flex h-[200px] bg-white items-center justify-center'>
                        <AiOutlineLoading3Quarters size={28} className='animate-spin' />
                    </div>}

                </div>

                <div className='col-span-2 !bg-transparent relative'>
                    <div className='w-full sticky top-0'>
                        <UserTasks handleTaskModal={handleTaskModal} user_id={user_id as unknown as number}
                            refresh_tasks={refresh_tasks} setRefreshTasks={setRefreshTasks} />
                        <UserAppointments handleAppointmentModal={handleAppointmentModal} user_id={user_id as unknown as number}
                            refresh_appointments={refresh_appointments} setRefreshAppointments={setRefreshAppointments} />
                    </div>
                </div>

            </div>

            <Modal show={showModal} children={modal_children} width={550} closeModal={closeModal} title={modal_title} />
            <ToastContainer />
        </div>
    )
}

export default UserDetails