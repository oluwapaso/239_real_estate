"use client"

import { Helpers } from '@/_lib/helpers'
import { APIResponseProps, Automations } from '@/components/types'
import React, { useEffect, useState } from 'react'
import { FaCheck, FaChevronDown, FaPlus } from 'react-icons/fa6'
import Swal from 'sweetalert2'
import AccordionItem from './AccordionComponent'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { MdOutlinePlayArrow } from 'react-icons/md'

const helpers = new Helpers();
function UserAutomations({ handleAutomationModal, user_id, refresh_automations, setRefreshAutomations }:
    {
        handleAutomationModal: () => void, user_id: number, refresh_automations: boolean,
        setRefreshAutomations: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [automations, setAutomations] = useState<Automations[]>([]);
    const [automation_fetched, setAutomationFetched] = useState(false);

    useEffect(() => {

        const fetchAutomations = async () => {

            try {

                const automPromise: Promise<Automations[]> = helpers.LoadUserAutomations(user_id as unknown as number);
                const appsResp = await automPromise;

                setAutomations(appsResp);
                setAutomationFetched(true);
                setRefreshAutomations(false);

            } catch (e: any) {
                console.log(e.message);
                setRefreshAutomations(false);
            }

        }

        if (refresh_automations) {
            fetchAutomations();
        }

    }, [user_id, refresh_automations]);

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
                setAutomations([]);
                setAutomationFetched(false);
                setRefreshAutomations(true);

            } catch (e: any) {
                console.log(e.message);
            }

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    const doneCount = automations.filter((app: any) => {
        const the_automation = app.automations;
        let drip;
        if (Array.isArray(the_automation)) {
            drip = the_automation.find((val: any) => {
                return val.automation_id == app.automation_id;
            });
        }
        return drip?.status == "Done";
    }).length;

    const updateDripStatus = async (type: string, automation_id: any) => {

        let title = "";
        let text = "";
        if (type == "Pause") {
            title = "Are you sure you want to pause this drip campaign?";
            text = "You can resume this later";
        } else if (type == "Cancel") {
            title = "Are you sure you want to cancel and delete this drip campaign?";
            text = "This can not be undone";
        } else if (type == "Resume") {
            title = "Click 'Yes, Continue' to resume this campaign."
        }

        const result = await Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Continue',
        });

        if (result.isConfirmed) {

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/(automations)/manage-campaign`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id, automation_id, "status": type }),
            }).then((resp): Promise<APIResponseProps> => {
                if (!resp.ok) {
                    throw new Error("Unable to update automation status.")
                }

                return resp.json();

            }).then(data => {
                console.log("data", data)
                setRefreshAutomations(true);
            });

        } else {
            // Handle cancel action
            console.log('Canceled');
        }
    }

    return (
        <div className='w-full bg-white rounded-md mt-5'>
            <div className='w-full py-3 px-4 flex items-center justify-between border-b border-gray-200'>
                <div className='flex items-center font-semibold'>
                    <MdOutlinePlayArrow size={22} /> <span className='ml-1'>Automations ({automations.length - doneCount})</span>
                </div>

                <div className='size-7 rounded-full bg-sky-600 text-white cursor-pointer flex items-center justify-center 
                hover:shadow-lg' onClick={handleAutomationModal}>
                    <FaPlus size={16} />
                </div>
            </div>

            <div className='w-full *:border-b *:border-gray-200'>

                {
                    !automation_fetched && <div className='w-full h-[150px] flex items-center justify-center'>
                        <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                    </div>
                }

                {
                    automation_fetched && automations && automations.length > 0 && (
                        automations.map((app: any) => {

                            const the_automation = app.automations;
                            let drip;
                            if (Array.isArray(the_automation)) {
                                drip = the_automation.find((val: any) => {
                                    return val.automation_id == app.automation_id;
                                });
                            }

                            return (drip && (drip.status == "Running" || drip.status == "Paused")) && (
                                <div key={app.automation_id} className='w-full flex items-center justify-between p-4'>
                                    <div className='font-normal text-ellipsis flex-grow mr-auto'>{app.name}</div>
                                    <div className=''>
                                        <div className={`py-1 px-4 rounded-full text-white text-sm font-medium cursor-pointer 
                                            hover:shadow-lg group relative ${drip.status == "Running" ? "bg-sky-700" : "bg-pink-600"}`}>
                                            <div className=' flex items-center justify-center'>
                                                <span className='mr-1'>{drip.status}</span> <FaChevronDown size={13} />
                                            </div>
                                            <div className='absolute bottom-full right-0 hidden group-hover:block bg-white shadow-2xl z-30
                                            text-primary w-[150px] rounded-md *:px-4 *:py-4 *:font-medium *:cursor-pointer *:w-full divide-y
                                            divide-gray-200 overflow-hidden'>
                                                {drip.status == "Running"
                                                    ? (<>
                                                        <div className='hover:bg-gray-100' onClick={() => updateDripStatus("Pause", app.automation_id)}>Pause</div>
                                                        <div className='hover:bg-gray-100' onClick={() => updateDripStatus("Cancel", app.automation_id)}>Cancel</div>
                                                    </>)
                                                    : <div className='hover:bg-gray-100' onClick={() => updateDripStatus("Resume", app.automation_id)}>Resume</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )

                        })
                    )
                }

                {(automation_fetched && automations && automations.length > 0) && <div className='w-full'>
                    <AccordionItem title={`Completed Automations (${doneCount})`}>
                        {
                            automations.map((app: any) => {
                                const the_automation = app.automations;
                                let drip;
                                if (Array.isArray(the_automation)) {
                                    drip = the_automation.find((val: any) => {
                                        return val.automation_id == app.automation_id;
                                    });
                                }

                                return (drip && drip.status == "Done") && (
                                    <div key={app.automation_id} className='w-full flex items-center justify-between p-4'>
                                        <div className='font-normal text-ellipsis flex-grow mr-auto'>{app.name}</div>
                                        <div className=''>
                                            <div className='py-1 px-4 rounded-full text-white bg-green-600 flex items-center justify-center 
                                        text-sm font-medium cursor-pointer hover:shadow-lg'>
                                                <span className='mr-1'>Done</span> <FaCheck size={13} />
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
                    automation_fetched && (!automations || !automations.length) && <div className='w-full h-[150px] flex items-center justify-center'>
                        No automation added.
                    </div>
                }
            </div>

        </div>
    )
}

export default UserAutomations