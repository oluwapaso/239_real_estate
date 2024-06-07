import React from 'react'

const ErrorComponent = ({ children }: { children?: React.ReactNode }) => {
    return (
        <div className='text-red-600 font-normal text-sm'>{children}</div>
    )
}

export default ErrorComponent