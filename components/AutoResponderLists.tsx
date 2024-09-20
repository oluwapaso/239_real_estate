import React from 'react'
import { AutoResponderLists } from './types'
import { BiEdit, BiTrash } from 'react-icons/bi'
import CustomLink from './CustomLink'

const AutoResponderListsCard = ({ prop }: { prop: AutoResponderLists }) => {

    return (
        <div className="bg-white grid grid-cols-[1fr_minmax(150px,150px)_minmax(150px,150px)_minmax(100px,100px)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div>
                <CustomLink href={`/admin/edit-auto-responder?auto_responder_id=${prop.auto_responder_id}`}>{prop.name}</CustomLink>
            </div>
            <div>{prop.type}</div>
            <div>
                <div className={`!py-1 !px-2 flex items-center justify-center text-white w-[50px] rounded-full text-sm font-medium 
                ${prop.send_ar == "Yes" ? "bg-green-600" : " bg-red-600"}`}>{prop.send_ar}</div>
            </div>
            <div className='flex *:bg-gray-50 px-0 *:p-2 *:cursor-pointer *:border *:border-gray-400 *:flex-grow *:flex *:justify-center 
            *:items-center'>
                <CustomLink href={`/admin/edit-auto-responder?auto_responder_id=${prop.auto_responder_id}`}>
                    <div className='hover:shadow-lg'><BiEdit size={18} /></div>
                </CustomLink>
            </div>
        </div>
    )
}

export default AutoResponderListsCard
