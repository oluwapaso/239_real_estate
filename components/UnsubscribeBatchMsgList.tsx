import React from 'react'
import { UnsubscribedBatchEmail } from './types'
import moment from 'moment'
import CustomLink from './CustomLink'

const UnsubscribedMsgBatchList = ({ prop, key }: { prop: UnsubscribedBatchEmail, key: any }) => {

    return (
        <div key={key} className="bg-white grid grid-cols-[2fr_repeat(2,1fr)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div>
                <CustomLink href={`/admin/user-details/${prop.user_id}`} className="text-sky-700 font-medium">
                    {prop.firstname} {prop.lastname}
                </CustomLink>
            </div>
            <div>{prop.to_email || prop.to_phone}</div>
            <div>{moment(prop.date_added).format("MMMM DD, YYYY")}</div>
        </div>
    )
}

export default UnsubscribedMsgBatchList
