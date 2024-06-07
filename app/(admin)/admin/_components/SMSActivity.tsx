import moment from 'moment'
import React from 'react'
import { FaCommentSms } from 'react-icons/fa6';

const SMSActivity = ({ activity, index, activities_len }: { activity: any, index: number, activities_len: number }) => {

    let msg_type = activity.type;
    if (msg_type == "CRM Message") {
        msg_type = "You contacted user";
    }

    return (
        <li className="rounded-lg cursor-pointer">
            <div className="flex flex-row">
                <div className="items-center flex flex-col justify-around relative">
                    <div className="">
                        <div className=' bg-slate-600 size-12 rounded-full flex justify-center items-center'>
                            <FaCommentSms size={25} className='text-white' />
                        </div>
                    </div>
                    <div className={`border-l h-full ${index == (activities_len - 1) ? "border-transparent" : "border-gray-400"}`}></div>
                </div>
                <div className="flex flex-col group-hover:bg-gray-50 ml-4 pb-10 flex-grow w-full box-border">
                    <div className='w-full pb-1 border-b border-gray-400 flex flex-col mb-3'>
                        <div className='w-full text-lg font-medium'>
                            <span>{moment(activity.date).fromNow()}</span>
                            <span className='ml-1 text-sm text-gray-500'>({moment(activity.date).format("MMMM Do, YYYY h:m:s A")})</span>
                        </div>
                        <div className='w-full text-base font-medium text-sky-800'>{msg_type}</div>
                    </div>
                    <div className="text-base"><span className='font-medium'>From:</span> <span>{activity.field_3}</span></div>
                    <div className="text-base"><span className='font-medium'>To:</span> <span>{activity.field_4}</span></div>

                    <div className='p-3 border border-gray-300 mt-3 shadow-md rounded w-full !max-w-[100%] overflow-x-auto'
                        dangerouslySetInnerHTML={{ __html: activity.description }} />
                </div>
            </div>
        </li>
    )
}

export default SMSActivity
