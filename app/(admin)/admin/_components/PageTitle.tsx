import { useRouter } from 'next/navigation'
import React from 'react'
import { BsArrowLeftShort } from 'react-icons/bs'

const PageTitle = ({ text, show_back, right_component }: { text: string, show_back?: boolean, right_component?: React.ReactNode }) => {

    const router = useRouter()

    return (
        <div className='w-full flex font-bold text-lg justify-between'>
            <span>{text}</span>
            <div className='flex items-center'>
                {
                    show_back && (
                        <span><button className='bg-red-600 text-white flex items-center justify-center py-1 px-4 h-10 text-sm font-medium 
                    hover:drop-shadow-xl' onClick={() => router.back()}>
                            <BsArrowLeftShort className='mr-1 !text-2xl' /> <span>Back</span></button>
                        </span>
                    )
                }

                {
                    right_component && (right_component)
                }
            </div>
        </div>
    )
}

export default PageTitle