"use client"

import { Helpers } from '@/_lib/helpers'
import { Appointment } from '@/components/types'
import React, { useEffect, useState } from 'react'
import { BsClock } from 'react-icons/bs'
import { FaCheck, FaPlus } from 'react-icons/fa6'
import { ImCalendar } from 'react-icons/im'
import { TbMapPin } from 'react-icons/tb'
import Swal from 'sweetalert2'
import AccordionItem from './AccordionComponent'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import moment from 'moment'
import { GoClock } from 'react-icons/go'
import { PiMapPinLineThin } from 'react-icons/pi'
import { LiaComment } from 'react-icons/lia'

const helpers = new Helpers();
function UserAppointments({ handleAppointmentModal, user_id, refresh_appointments, setRefreshAppointments }:
    {
        handleAppointmentModal: () => void, user_id: number, refresh_appointments: boolean,
        setRefreshAppointments: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointments_fetched, setAppointmentsFetched] = useState(false);
    const [completed_appointments, setCompAppointments] = useState(0);
    const [pending_appointments, setPendingAppointments] = useState(0);

    useEffect(() => {

        const fetchAppointments = async () => {

            try {

                const appsPromise: Promise<Appointment[]> = helpers.LoadUserAppointments(user_id as unknown as number);
                const appsResp = await appsPromise;

                setAppointments(appsResp);
                setAppointmentsFetched(true);
                setCompAppointments(appsResp[0].completed_appointments);
                setPendingAppointments(appsResp[0].pending_appointments);
                setRefreshAppointments(false);

            } catch (e: any) {
                console.log(e.message);
                setRefreshAppointments(false);
            }

        }

        if (refresh_appointments) {
            fetchAppointments();
        }

    }, [user_id, refresh_appointments]);

    const MarkAsDone = async (appointment_id: number) => {
        const result = await Swal.fire({
            title: "Are you sure you want to mark this appointment as done?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, It\'s Completed',
        });

        if (result.isConfirmed) {

            try {

                await helpers.MarkAppointmentsAsDone(appointment_id);
                setAppointments([]);
                setAppointmentsFetched(false);
                setCompAppointments(0);
                setPendingAppointments(0);
                setRefreshAppointments(true);

            } catch (e: any) {
                console.log(e.message);
            }

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    return (
        <div className='w-full bg-white rounded-md mt-5'>
            <div className='w-full py-3 px-4 flex items-center justify-between border-b border-gray-200'>
                <div className='flex items-center font-semibold'>
                    <ImCalendar size={16} /> <span className='ml-1'>Appointments ({pending_appointments})</span>
                </div>

                <div className='size-7 rounded-full bg-sky-600 text-white cursor-pointer flex items-center justify-center 
                hover:shadow-lg' onClick={handleAppointmentModal}>
                    <FaPlus size={16} />
                </div>
            </div>

            <div className='w-full *:border-b *:border-gray-200'>

                {
                    !appointments_fetched && <div className='w-full h-[150px] flex items-center justify-center'>
                        <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                    </div>
                }

                {
                    appointments_fetched && appointments && appointments.length > 0 && (
                        appointments.map((app) => {

                            let app_date = <>{moment(app.date).format("MMMM Do, YYYY")}</>
                            if (moment(app.date).isSame(moment(), 'day')) {
                                app_date = <span className=' text-green-700 font-semibold'>Today</span>
                            }

                            return app.status == "Pending" && (
                                <div key={app.appointment_id} className='w-full flex items-center p-4'>
                                    <div className='flex flex-col flex-grow'>
                                        <div className='w-full font-medium'>{app.title}</div>
                                        <div className='w-full text-gray-500 italic text-sm flex items-center mt-1'>
                                            <GoClock size={14} /> <span className='ml-1'>{app.start_time} - {app.end_time} {app_date}</span>
                                        </div>
                                        <div className='w-full text-gray-500 italic text-sm flex items-center mt-1'>
                                            <PiMapPinLineThin size={14} /> <span className='ml-1'>{app.location}</span>
                                        </div>
                                        <div className='w-full text-gray-500 italic text-sm flex items-start mt-1'>
                                            <LiaComment size={14} /> <span className='ml-1'>{app.notes}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='py-1 px-2 rounded text-white bg-green-700 flex items-center justify-center 
                                        text-sm font-medium cursor-pointer hover:shadow-lg' onClick={() => MarkAsDone(app.appointment_id)}>
                                            <FaCheck size={13} /> <span className='ml-1'>Done</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )
                }

                {(appointments_fetched && appointments && appointments.length > 0 && completed_appointments > 0) && <div className='w-full'>
                    <AccordionItem title={`Completed Appointments (${completed_appointments})`}>
                        {
                            appointments.map((app) => {

                                let app_date = <>{moment(app.date).format("MMMM Do, YYYY")}</>
                                if (moment(app.date).isSame(moment(), 'day')) {
                                    app_date = <span className=' text-green-700 font-semibold'>Today</span>
                                }

                                return app.status == "Done" && (
                                    <div key={app.appointment_id} className='w-full flex items-center p-4 border-t border-gray-200'>
                                        <div className='flex flex-col flex-grow'>
                                            <div className='w-full font-medium line-through'>{app.title}</div>
                                            <div className='w-full text-gray-500 italic text-sm flex items-center mt-1 line-through'>
                                                <GoClock size={14} /> <span className='ml-1'>{app.start_time} - {app.end_time} {app_date}</span>
                                            </div>
                                            <div className='w-full text-gray-500 italic text-sm flex items-center mt-1 line-through'>
                                                <PiMapPinLineThin size={14} /> <span className='ml-1'>{app.location}</span>
                                            </div>
                                            <div className='w-full text-gray-500 italic text-sm flex items-start mt-1 line-through'>
                                                <LiaComment size={14} /> <span className='ml-1'>{app.notes}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </AccordionItem>
                </div>
                }

                {
                    appointments_fetched && (!appointments || !appointments.length) && <div className='w-full h-[150px] flex items-center justify-center'>
                        No appointments added yet.
                    </div>
                }
            </div>

        </div>
    )
}

export default UserAppointments