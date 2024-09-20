import React, { useState } from 'react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'

const FilterBy = ({ filterBy, setFilterBy }: { filterBy: string, setFilterBy: React.Dispatch<React.SetStateAction<string>> }) => {

    const [isShown, setIsShown] = useState(false)
    const active_classes = " bg-gray-200"

    const handleShow = () => {
        setIsShown(!isShown)
    }

    const handleClick = (value: string) => {
        setFilterBy(value);
        setIsShown(!isShown)
    }

    let filter_by = ""
    if (filterBy == "Price-DESC") {
        filter_by = "Price, high to low"
    } else if (filterBy == "Price-ASC") {
        filter_by = "Price, low to high"
    } else if (filterBy == "Date-DESC") {
        filter_by = "Newest Firsts"
    } else if (filterBy == "Date-ASC") {
        filter_by = "Oldest Firsts"
    }

    return (
        <div className='flex items-center relative mt-3 tab:mt-0 min-w-[200px] ml-0 lg:ml-3'>
            <span className='font-normal mr-2'>Sort By:</span>
            <button className='flex items-center justify-between transition-all duration-500 px-3 py-2 hover:bg-primary
             hover:text-white cursor-pointer text-sm border border-sky-400 bg-white' onClick={handleShow}>
                <span className='text-left mr-2 relative'>{filter_by}</span>
                <span className={`${isShown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={18} /></span>
            </button>
            <div className={`status-lists w-[200px] top-[45px] drop-shadow-lg absolute bg-transparent pt-2 ${isShown ? "block" : "hidden"}`}>
                <ul className='bg-white m-0 mt-1 *:py-3 *:px-3 *:cursor-pointer text-primary *:font-normal'>
                    <li className={`hover:bg-gray-200 hover:text-primary ${filterBy == "Price-DESC" ? active_classes : null}`} onClick={() => handleClick("Price-DESC")}>Price, high to low</li>
                    <li className={`hover:bg-gray-200 hover:text-primary ${filterBy == "Price-ASC" ? active_classes : null}`} onClick={() => handleClick("Price-ASC")}>Price, low to high</li>
                    <li className={`hover:bg-gray-200 hover:text-primary ${filterBy == "Date-DESC" ? active_classes : null}`} onClick={() => handleClick("Date-DESC")}>Newest First</li>
                    <li className={`hover:bg-gray-200 hover:text-primary ${filterBy == "Date-ASC" ? active_classes : null}`} onClick={() => handleClick("Date-ASC")}>Oldest First</li>
                </ul>
            </div>
        </div>
    )
}

export default FilterBy