import React from 'react'
import { BatchMessages } from './types'
import moment from 'moment'
import CustomLink from './CustomLink'

const MessagesListCard = ({ prop, key }: { prop: BatchMessages, key: any }) => {

    return (
        <div key={key} className="bg-white grid grid-cols-[3fr_repeat(7,1fr)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div>
                <CustomLink href={`/admin/batch-message-details?batch_id=${prop.batch_id}&type=Pending&page=1`} className="text-sky-700 font-medium">
                    {prop.template_name}
                </CustomLink>
            </div>
            <div>{moment(prop.date_sent).format("MMMM DD, YYYY")}</div>
            <div>{prop.status == "Pending" ? <span className='text-orange-600'>Pending</span> : <span className=' text-green-600'>Sent</span>}</div>
            <div>{prop.total_messages}</div>
            <div>{prop.queued}</div>
            <div>{prop.total_sent}</div>
            <div>{prop.unsubscribed}</div>
            <div>{prop.total_errored}</div>
        </div>
    )
}

export default MessagesListCard
