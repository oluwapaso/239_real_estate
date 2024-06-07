"use client"
import React, { useState } from 'react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'

function StatusComponent({ status, setStatus }: { status: string, setStatus: React.Dispatch<React.SetStateAction<string>> }) {

    const [isShown, setIsShown] = useState(false)
    const active_classes = " bg-gray-200"

    const handleShow = () => {
        setIsShown(!isShown)
    }

    const handleClick = (value: string) => {
        setStatus(value);
        setIsShown(!isShown)
    }

    return (
        <div className='w-[100px] relative hidden xs:block'>
            <button className='flex items-center justify-between transition-all duration-500 px-3 py-2 hover:bg-primary hover:text-white cursor-pointer' onClick={handleShow}>
                <span className='w-[55px] text-left'>{status}</span>
                <span className={`${isShown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={24} /></span>
            </button>
            <div className={`status-lists w-[100px] -left-2 absolute bg-transparent pt-2 ${isShown ? "block" : "hidden"}`}>
                <ul className='bg-white m-0 mt-1 *:py-3 *:px-3 *:cursor-pointer text-primary *:font-normal'>
                    <li className={`hover:bg-gray-200 hover:text-primary ${status == "Active" ? active_classes : null}`} onClick={() => handleClick("Active")}>Active</li>
                    <li className={`hover:bg-gray-200 hover:text-primary ${status == "Sold" ? active_classes : null}`} onClick={() => handleClick("Sold")}>Sold</li>
                </ul>
            </div>
        </div>
    )
}

export default StatusComponent