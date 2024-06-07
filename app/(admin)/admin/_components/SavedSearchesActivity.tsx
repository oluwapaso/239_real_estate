import moment from 'moment'
import React from 'react'
import { RiHeartAdd2Line } from 'react-icons/ri';
import { TfiSave } from 'react-icons/tfi';

const SavedSearchesActivity = ({ activity, index, activities_len }: { activity: any, index: number, activities_len: number }) => {

    return (
        <li className="rounded-lg cursor-pointer">
            <div className="flex flex-row">
                <div className="items-center flex flex-col justify-around relative">
                    <div className="">
                        <div className={`bg-teal-600 size-12 rounded-full flex justify-center items-center *:text-white`}>
                            <TfiSave size={18} />
                        </div>
                    </div>
                    <div className={`border-l h-full ${index == (activities_len - 1) ? "border-transparent" : "border-gray-400"}`}></div>
                </div>
                <div className="flex flex-col group-hover:bg-gray-50 ml-4 pb-10 flex-grow">
                    <div className='w-full pb-1 border-b border-gray-400 flex flex-col mb-5'>
                        <div className='w-full text-lg font-medium'>
                            <span>{moment(activity.date_saved).fromNow()}</span>
                            <span className='ml-1 text-sm text-gray-500'>({moment(activity.date_saved).format("MMMM Do, YYYY h:m:s A")})</span>
                        </div>
                    </div>

                    <div className='w-full text-base font-medium text-sky-800'>
                        <div className='w-full flex flex-col'>
                            <div className='font-medium'>{activity.search_title}</div>
                            <div className='font-normal text-zinc-900'><span className='font-semibold'>Interval: </span>{activity.email_frequency}</div>
                            <div className='font-normal text-zinc-900'><span className='font-semibold'>Started: </span>{activity.started}</div>
                            {
                                activity.started == "Yes" && <div className='font-normal text-zinc-900'><span className='font-semibold'>Last Alert: </span>
                                    {moment(activity.last_alert).format("MMMM Do, YYYY h:m:s A")}</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </li>
    )
}

export default SavedSearchesActivity
