import React from 'react'
import { Automations } from './types'
import moment from 'moment'
import { BiEdit, BiTrash } from 'react-icons/bi'
import CustomLink from './CustomLink'

const AutomationListCard = ({ prop }: { prop: Automations }) => {

    return (
        <div className="bg-white grid grid-cols-[repeat(4,1fr)_minmax(100px,100px)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div>
                <CustomLink href={`/admin/edit-automation?automation_id=${prop.automation_id}`} className="text-sky-600 font-normal">{prop.name}</CustomLink>
            </div>
            <div className={`${prop.status == "Active" ? "text-green-600" : "text-red-600"}`}>{prop.status}</div>
            <div className={`${prop.published_version == "Yes" ? "text-green-600" : "text-red-600"}`}>{prop.published_version}</div>
            <div>{prop.version_number}</div>
            <div className='flex *:bg-gray-50 px-0 *:p-2 *:cursor-pointer *:border *:border-gray-400 *:flex-grow *:flex *:justify-center 
            *:items-center'>
                <CustomLink href={`/admin/edit-automation?automation_id=${prop.automation_id}`}>
                    <div className='hover:shadow-lg'><BiEdit size={18} /></div>
                </CustomLink>
                <div className='hover:shadow-lg !hidden'><BiTrash size={18} /></div>
            </div>
        </div>
    )
}

export default AutomationListCard
