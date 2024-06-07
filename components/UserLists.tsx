import React from 'react'
import { User } from './types'
import moment from 'moment'
import { BiEdit, BiTrash } from 'react-icons/bi'
import CustomLink from './CustomLink'

const UserListCard = ({ prop }: { prop: User }) => {

    return (
        <div className="bg-white grid grid-cols-[repeat(4,1fr)_minmax(100px,100px)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div>
                <CustomLink href={`/admin/user-details/${prop.user_id}`}>
                    {(prop.firstname && prop.lastname) ? `${prop.firstname} ${prop.lastname}` : <span className=' text-red-600'>No name</span>}
                </CustomLink>
            </div>
            <div>{prop.email ? prop.email : <span className=' text-red-600'>No email</span>}</div>
            <div>{prop.phone_1 ? prop.phone_1 : <span className=' text-red-600'>No primary phone</span>}</div>
            <div>{prop.last_seen ? moment(prop.last_seen).fromNow() : <span className=' text-red-600'>Never</span>}</div>
            <div className='flex *:bg-gray-50 px-0 *:p-2 *:cursor-pointer *:border *:border-gray-400 *:flex-grow *:flex *:justify-center 
            *:items-center'>
                <CustomLink href={`/admin/user-details/${prop.user_id}`}>
                    <div className='hover:shadow-lg'><BiEdit size={18} /></div>
                </CustomLink>
                <div className='hover:shadow-lg !hidden'><BiTrash size={18} /></div>
            </div>
        </div>
    )
}

export default UserListCard
