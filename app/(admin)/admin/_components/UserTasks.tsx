"use client"

import { Helpers } from '@/_lib/helpers';
import { Task } from '@/components/types';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaTasks } from 'react-icons/fa'
import { FaCheck, FaPlus } from 'react-icons/fa6'
import Swal from 'sweetalert2'
import AccordionItem from './AccordionComponent';
import { GoClock } from 'react-icons/go';

const helpers = new Helpers();
function UserTasks({ handleTaskModal, user_id, refresh_tasks, setRefreshTasks }:
    {
        handleTaskModal: () => void, user_id: number, refresh_tasks: boolean,
        setRefreshTasks: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [tasks, setTasks] = useState<Task[]>([]);
    const [task_fetched, setTasksFetched] = useState(false);
    const [completed_tasks, setCompTasks] = useState(0);
    const [pending_tasks, setPendingTasks] = useState(0);

    useEffect(() => {

        const fetchTasks = async () => {

            try {

                const tasksPromise: Promise<Task[]> = helpers.LoadUserTasks(user_id as unknown as number);
                const tasksResp = await tasksPromise;

                setTasks(tasksResp);
                setTasksFetched(true);
                setCompTasks(tasksResp[0].completed_tasks);
                setPendingTasks(tasksResp[0].pending_tasks);
                setRefreshTasks(false);

            } catch (e: any) {
                console.log(e.message);
                setRefreshTasks(false);
            }

        }

        if (refresh_tasks) {
            fetchTasks();
        }

    }, [user_id, refresh_tasks]);

    const MarkAsDone = async (task_id: number) => {
        const result = await Swal.fire({
            title: "Are you sure you want to mark this task as done?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, It\'s Completed',
        });

        if (result.isConfirmed) {

            try {
                await helpers.MarkTaskAsDone(task_id);
                setTasks([]);
                setTasksFetched(false);
                setCompTasks(0);
                setPendingTasks(0);
                setRefreshTasks(true);
            } catch (e: any) {
                console.log(e.message);
            }

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    return (
        <div className='w-full bg-white rounded-md'>
            <div className='w-full py-3 px-4 flex items-center justify-between border-b border-gray-200'>
                <div className='flex items-center font-semibold'>
                    <FaTasks size={16} /> <span className='ml-1'>Tasks ({pending_tasks})</span>
                </div>

                <div className='size-7 rounded-full bg-sky-600 text-white cursor-pointer flex items-center justify-center 
                hover:shadow-lg' onClick={handleTaskModal}>
                    <FaPlus size={16} />
                </div>
            </div>

            <div className='w-full *:border-b *:border-gray-200'>

                {
                    !task_fetched && <div className='w-full h-[150px] flex items-center justify-center'>
                        <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                    </div>
                }

                {
                    task_fetched && tasks && tasks.length > 0 && (
                        tasks.map((task) => {

                            let task_date = <>{moment(task.date).format("MMMM Do, YYYY")}</>
                            if (moment(task.date).isSame(moment(), 'day')) {
                                task_date = <span className=' text-green-700 font-semibold'>Today</span>
                            }

                            return task.status == "Pending" && (
                                <div key={task.task_id} className='w-full flex items-center p-4'>
                                    <div className='flex flex-col flex-grow'>
                                        <div className='w-full font-medium'>{task.title}</div>
                                        <div className='w-full text-gray-500 italic text-sm flex items-center'>
                                            <GoClock size={14} /> <span className='ml-1'>{task_date} at {task.time} </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='py-1 px-2 rounded text-white bg-green-700 flex items-center justify-center 
                                        text-sm font-medium cursor-pointer hover:shadow-lg' onClick={() => MarkAsDone(task.task_id)}>
                                            <FaCheck size={13} /> <span className='ml-1'>Done</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )
                }

                {(task_fetched && tasks && tasks.length > 0 && completed_tasks > 0) && <div className='w-full'>
                    <AccordionItem title={`Completed Tasks (${completed_tasks})`}>
                        {
                            tasks.map((task) => {

                                let task_date = <>{moment(task.date).format("MMMM Do, YYYY")}</>
                                if (moment(task.date).isSame(moment(), 'day')) {
                                    task_date = <span className=' text-green-700 font-semibold'>Today</span>
                                }

                                return task.status == "Done" && (
                                    <div key={task.task_id} className='w-full flex items-center p-4 border-t border-gray-200'>
                                        <div className='flex flex-col flex-grow'>
                                            <div className='w-full font-medium line-through'>{task.title}</div>
                                            <div className='w-full text-gray-500 italic text-sm flex items-center line-through'>
                                                <GoClock size={14} /> <span className='ml-1'>{task_date} at {task.time} </span>
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
                    task_fetched && (!tasks || !tasks.length) && <div className='w-full h-[150px] flex items-center justify-center'>
                        No task added yet.
                    </div>
                }
            </div>

        </div>
    )
}

export default UserTasks