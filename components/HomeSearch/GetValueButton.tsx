import React from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { IoSearchSharp } from 'react-icons/io5'

const GetValueButton = ({ handleClick, isSubmitting }: { handleClick: () => void, isSubmitting: boolean }) => {
    return (
        <div className='justify-self-end float-right self-end w-full md:w-auto flex justify-end mt-2 md:mt-0'>
            {!isSubmitting ?
                <button className='bg-primary text-white flex justify-center items-center uppercase tracking-widest font-normal h-full px-4 py-3 
                    text-sm hover:bg-primary/80' onClick={handleClick}>
                    <IoSearchSharp /> <span className='ml-2'>Get Value</span>
                </button> :
                <button className='bg-primary/80 py-3 px-6 text-white font-light text-sm uppercase flex items-center 
                                     cursor-not-allowed' disabled>
                    <span>Please Wait</span> <AiOutlineLoading3Quarters size={16} className='animate-spin ml-2' />
                </button>
            }
        </div>
    )
}

export default GetValueButton