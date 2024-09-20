import React from 'react'
import { TemplateLists } from './types'
import { BiEdit, BiTrash } from 'react-icons/bi'
import CustomLink from './CustomLink'

const TemplateListsCard = ({ prop }: { prop: TemplateLists }) => {

    return (
        <div className="bg-white grid grid-cols-[1fr_minmax(150px,150px)_minmax(100px,100px)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div>
                <CustomLink href={`/admin/edit-template?template_id=${prop.template_id}`}>{prop.template_name}</CustomLink>
            </div>
            <div>{prop.template_type}</div>
            <div className='flex *:bg-gray-50 px-0 *:p-2 *:cursor-pointer *:border *:border-gray-400 *:flex-grow *:flex *:justify-center 
            *:items-center'>
                <CustomLink href={`/admin/edit-template?template_id=${prop.template_id}`}>
                    <div className='hover:shadow-lg'><BiEdit size={18} /></div>
                </CustomLink>
                <div className='hover:shadow-lg'><BiTrash size={18} /></div>
            </div>
        </div>
    )
}

export default TemplateListsCard
