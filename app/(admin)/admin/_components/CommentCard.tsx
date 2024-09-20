"use client"

import moment from 'moment'
import React from 'react'
import { ImReply } from 'react-icons/im'
import { RiAdminLine } from 'react-icons/ri'

const CommentCard = ({ comm, handleReply }:
    { comm: any, handleReply: (draft_id: number, comment_id: number, comment_parent: string) => void }) => {

    return (
        <div key={comm.comment_id} id={`post_id_${comm.comment_id}`}
            className='w-full p-4 border border-gray-200 bg-white mb-6 mt-2'>
            <div className='w-full flex justify-between items-center mb-2'>
                <div className=' font-bold text-base flex flex-col'>
                    {
                        comm.reply_by == "Admin" ? (
                            <>
                                <span className='flex text-red-600 items-center'>
                                    <RiAdminLine size={20} /> <span className='ml-1'>Admin</span>
                                </span>
                            </>
                        ) : (<span>{comm.name}</span>)
                    }

                </div>
                <div className='hidden'>
                    <button className='bg-sky-700 text-white rounded flex items-center justify-center py-2 px-4 hover:drop-shadow-xl'>
                        <ImReply size={15} /> <span className='text-sm ml-1'>Reply</span>
                    </button>
                </div>
            </div>

            <div className='w-full'>
                <div className='w-full font-normal'>{comm.comment_body}</div>
                {
                    (comm.comment_parent && comm.comment_parent != "") && (
                        <div className='w-full mt-2 bg-gray-50 p-4 border border-gray-200 font-normal italic'>
                            {comm.comment_parent}
                        </div>
                    )
                }
            </div>

            <div className='w-full mt-2 flex justify-end'>
                <span className=' text-gray-500 text-sm font-medium'>{moment(comm.date_added).format("MMMM D, YYYY h:m:s A")}</span>
            </div>
        </div>
    )
}

export default CommentCard