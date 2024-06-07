import React from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const loading = () => {
    return (
        <div className={`w-full h-full flex justify-center items-center`}>
            <div className=' size-28 bg-white drop-shadow-2xl rounded flex items-center justify-center'>
                <AiOutlineLoading3Quarters size={45} className='animate-spin' />
            </div>
        </div>
    )
}

export default loading