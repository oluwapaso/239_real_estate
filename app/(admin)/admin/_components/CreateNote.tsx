"use client"

import { APIResponseProps } from '@/components/types';
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'react-toastify';

function CreateNote({ user_id, setRefreshActivities }:
    { user_id: number, setRefreshActivities: React.Dispatch<React.SetStateAction<boolean>> }) {

    const [notes, setNotes] = useState("");
    const [is_adding_note, setIsAddingNote] = useState(false);
    const handleSubmit = () => {

        toast.dismiss();
        if (!notes) {
            toast.error("Provide a valid note to add", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        setIsAddingNote(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(notes)/manage-notes`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id, notes, notes_type: "Notes" }),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to add new note.")
            }
            setIsAddingNote(false);
            return resp.json();

        }).then(data => {
            console.log("data:", data)
            if (data.success) {

                toast.success("New notes successfully added", {
                    position: "top-center",
                    theme: "colored"
                });

                setNotes("");
                setIsAddingNote(false);
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
            <div className='w-full border border-gray-100 border-r-0 border-l-0'>
                <textarea value={notes} name='notes' className='w-full h-[180px] resize-none border-0 px-5 py-4 focus:outline-none'
                    placeholder='Add a note...' onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className='w-full py-5 px-4 flex justify-end items-center'>
                {!is_adding_note && <div className='px-6 py-2 rounded flex items-center justify-center bg-sky-700 text-white cursor-pointer' onClick={handleSubmit}>
                    Create Note
                </div>}

                {is_adding_note && <div className='px-6 py-2 rounded flex items-center justify-center bg-sky-700/50 text-white cursor-not-allowed'>
                    <AiOutlineLoading3Quarters className='animate-spin mr-2' />  <span>Please Wait...</span>
                </div>}
            </div>
        </div>
    )
}

export default CreateNote
