import React from 'react'
import { CheckedItems, User } from './types'
import moment from 'moment'
import { BiEdit, BiTrash } from 'react-icons/bi'
import CustomLink from './CustomLink'

const UserListCard = ({ prop, checkedItems, handleCheckboxChange }: {
    prop: User, checkedItems: CheckedItems, handleCheckboxChange: (id: number) => void
}) => {

    return (
        <div className="bg-white grid grid-cols-[minmax(50px,50px)_repeat(4,1fr)_minmax(100px,100px)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div className='flex items-center select-none'>
                <input type="checkbox" className='styled-checkbox z-20' checked={checkedItems[prop.user_id] || false} onChange={() => handleCheckboxChange(prop.user_id)} />
                <label className='z-10 -left-4'></label>
            </div>
            <div>
                <CustomLink href={`/admin/user-details/${prop.user_id}`} className="text-sky-700 font-medium">
                    {(prop.firstname && prop.lastname) ? `${prop.firstname} ${prop.lastname}` : <span className=' text-red-600'>No name</span>}
                </CustomLink>
            </div>
            <div>{prop.email ? prop.email : <span className=' text-red-600'>No email</span>}</div>
            <div>{prop.phone_1 ? prop.phone_1 : <span className=' text-red-600'>No primary phone</span>}</div>
            <div>{prop.last_seen ? moment(prop.last_seen).fromNow() : <span className=' text-red-600'>Never</span>}</div>
            <div className='flex *:bg-primary px-0 *:p-2 *:cursor-pointer *:rounded *:hover:shadow-md *:flex-grow *:flex *:justify-center 
            *:items-center *:text-white'>
                <CustomLink href={`/admin/edit-user?user_id=${prop.user_id}`}>
                    <div className='hover:shadow-lg'><BiEdit size={18} /></div>
                </CustomLink>
                <div className='hover:shadow-lg !hidden'><BiTrash size={18} /></div>
            </div>
        </div>
    )
}

export default UserListCard
