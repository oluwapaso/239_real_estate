"use client"

import React, { useState } from 'react'

function ComposeSMS({ phone_number }: { phone_number: string }) {
    const [to_number, setToNumber] = useState(phone_number);
    const [sms_body, setSMSBody] = useState("");

    return (
        <div className='w-full bg-white'>
            <div className='full flex border-b border-gray-200 py-3 px-3'>
                <div className='font-semibold mr-2'>To:</div>
                <div className='flex-grow'><input type='text' value={to_number} name='to_number' className='w-full border-0 focus:outline-none'
                    onChange={(e) => setToNumber(e.target.value)} placeholder='744 838 8830' /></div>
            </div>
            <div className='w-full border border-gray-200 border-r-0 border-l-0'>
                <textarea value={sms_body} name='sms_body' className='w-full h-[180px] resize-none border-0 px-5 py-4 focus:outline-none'
                    onChange={(e) => setSMSBody(e.target.value)} placeholder='Write your text...' />
            </div>
            <div className='w-full py-5 px-4 flex justify-end items-center'>
                <div className='px-6 py-2 rounded flex items-center justify-center bg-sky-700 text-white cursor-pointer'>
                    Send Text
                </div>
            </div>
        </div>
    )

}

export default ComposeSMS