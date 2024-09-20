"use client"
import React, { useState } from 'react'
import { CheckedItems, Task } from './types'
import moment from 'moment'
import Swal from 'sweetalert2'
import { FaCheck } from 'react-icons/fa6'
import { Helpers } from '@/_lib/helpers'
import CustomLink from './CustomLink'
import { useDispatch } from 'react-redux'
import { showPageLoader } from '@/app/(admin)/admin/GlobalRedux/user/userSlice'

const helpers = new Helpers();
const TaskListCard = ({ prop, key, setCanLoad, checkedItems, handleCheckboxChange }:
    {
        prop: Task, key: any, setCanLoad: React.Dispatch<React.SetStateAction<boolean>>, checkedItems: CheckedItems,
        handleCheckboxChange: (id: number) => void
    }) => {

    const dispatch = useDispatch();
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
                dispatch(showPageLoader());
                setCanLoad(true);
            } catch (e: any) {
                console.log(e.message);
            }

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    return (
        <div key={key} className="bg-white grid grid-cols-[minmax(50px,50px)_repeat(4,1fr)_minmax(180px,180px)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div className='flex items-center select-none'>
                <input type="checkbox" className='styled-checkbox z-20' checked={checkedItems[prop.task_id] || false} onChange={() => handleCheckboxChange(prop.task_id)} />
                <label className='z-10 -left-4'></label>
            </div>
            <div>{prop.title}</div>
            <div>
                <CustomLink href={`/admin/user-details/${prop.user_id}`} className="text-sky-700 font-medium">
                    {prop.firstname} {prop.lastname}
                    {(!prop.lastname && !prop.lastname) && <span className='text-red-500'>No name</span>}
                </CustomLink>
            </div>
            <div>{moment(prop.date).format("MMMM DD, YYYY")} {prop.time}</div>
            <div>{prop.status == "Pending" ? <span className='text-orange-600'>Pending</span> : <span className=' text-green-600'>Completed</span>}</div>
            <div className='flex px-0 *:p-2 *:cursor-pointer *:rounded *:flex-grow *:flex *:justify-center *:items-center'>
                {prop.status == "Pending" ? <div className='py-1 px-2 rounded text-white bg-primary flex items-center justify-center text-sm font-medium 
                cursor-pointer hover:shadow-lg' onClick={() => MarkAsDone(prop.task_id)}>
                    <FaCheck size={13} /> <span className='ml-1'>Mark As Done</span>
                </div> : <div className='py-1 px-2 text-green-700 flex items-center justify-center text-sm font-medium'>
                    <FaCheck size={13} /> <span className='ml-1'>Done</span>
                </div>}

            </div>
        </div>
    )
}

export default TaskListCard
