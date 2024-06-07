import React from 'react'
import { IoSearchSharp } from 'react-icons/io5'

const SearchButton = ({ handleSearch }: { handleSearch: () => void }) => {
    return (
        <button className='bg-primary text-white flex justify-center items-center uppercase tracking-widest font-normal h-[43px] px-4 py-3 
        text-sm hover:bg-primary/80' onClick={handleSearch}>
            <IoSearchSharp /> <span className='ml-2 hidden md:block'>Start Search</span>
        </button>
    )
}

export default SearchButton