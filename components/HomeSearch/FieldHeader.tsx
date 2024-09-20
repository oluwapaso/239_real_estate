import React from 'react'

const FieldHeader = ({ text }: { text: string }) => {
    return (
        <div className='field-header w-full flex items-center'>
            <strong className='uppercase'>{text}</strong>
            <div className='field0-header-line flex-grow border border-gray-300 ml-3'></div>
        </div>
    )
}

export default FieldHeader