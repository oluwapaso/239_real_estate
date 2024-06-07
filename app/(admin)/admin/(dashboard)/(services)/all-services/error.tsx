"use client"

import React from 'react'

const Error = ({ error }: { error: Error }) => {
    return (
        <div className='w-full bg-red-100 text-red-600 mt-10 flex justify-center items-center min-h-60'>
            {error.message}
        </div>
    )
}

export default Error