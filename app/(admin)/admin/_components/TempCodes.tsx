import React from 'react'
import { BsInfoCircle } from 'react-icons/bs'
import { FaArrowRight, FaCircleInfo } from 'react-icons/fa6'

function TempCodes({ code, insertTextAtCaret }: { code: any, insertTextAtCaret: (text: string) => void }) {
    return (
        <div className='w-full flex items-center bg-white px-4 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200'
            onClick={() => insertTextAtCaret(code.code)}>
            <div className='font-semibold'>{code.code}</div>
            <div className='ml-2 flex items-center flex-grow'>
                <span className='group relative self-end ml-auto'>
                    <span className='flex items-center justify-center'><BsInfoCircle size={24} /></span>
                    <span className='hidden absolute right-0 z-10 group-hover:block w-[250px] bg-white p-4 rounded shadow-xl
                    border border-gray-200'>{code.description}</span>
                </span>
                <span className='size-6 rounded-full bg-sky-600 text-white flex items-center justify-center self-end ml-2'>
                    <FaArrowRight size={16} />
                </span>
            </div>
        </div>
    )
}

export default TempCodes
