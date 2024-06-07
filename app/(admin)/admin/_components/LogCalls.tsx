"use client"

import { APIResponseProps } from '@/components/types';
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'react-toastify';

function LogCalls({ user_id, setRefreshActivities, phone_number }:
    { user_id: number, setRefreshActivities: React.Dispatch<React.SetStateAction<boolean>>, phone_number: string }) {

    const [notes, setNotes] = useState("");
    const [number_called, setNumberCalled] = useState(phone_number);
    const [is_adding_log, setIsAddingLog] = useState(false);

    const handleSubmit = () => {

        toast.dismiss();
        if (!notes || !number_called) {
            toast.error("All fields are required", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        setIsAddingLog(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(notes)/manage-notes`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id, notes, number_called, notes_type: "Call Log" }),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to add new note.")
            }
            setIsAddingLog(false);
            return resp.json();

        }).then(data => {
            console.log("data:", data)
            if (data.success) {

                toast.success("Call log successfully added", {
                    position: "top-center",
                    theme: "colored"
                });

                setNumberCalled("");
                setNotes("");
                setIsAddingLog(false);
                setRefreshActivities(true);

            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                });
            }

        }).catch((e: any) => {
            toast.error(`${e.message}`, {
                position: "top-center",
                theme: "colored"
            });
        });

    }

    return (
        <div className='w-full bg-white'>
            <div className='full flex border-b border-gray-200 py-3 px-3'>
                <div className='font-semibold mr-2'>Number Called:</div>
                <div className='flex-grow'><input type='text' value={number_called} name='number_called' className='border-0 focus:outline-none w-full'
                    onChange={(e) => setNumberCalled(e.target.value)} placeholder='744 838 8830' /></div>
            </div>
            <div className='w-full border border-gray-200 border-r-0 border-l-0'>
                <textarea value={notes} name='notes' className='w-full h-[180px] resize-none border-0 px-5 py-4 focus:outline-none'
                    onChange={(e) => setNotes(e.target.value)} placeholder='Add call notes...' />
            </div>
            <div className='w-full py-5 px-4 flex justify-end items-center'>
                {!is_adding_log && <div className='px-6 py-2 rounded flex items-center justify-center bg-sky-700 text-white cursor-pointer' onClick={handleSubmit}>
                    Log Call
                </div>}

                {is_adding_log && <div className='px-6 py-2 rounded flex items-center justify-center bg-sky-700/50 text-white cursor-not-allowed'>
                    <AiOutlineLoading3Quarters className='animate-spin mr-2' />  <span>Please Wait...</span>
                </div>}
            </div>
        </div>
    )

}

export default LogCalls
