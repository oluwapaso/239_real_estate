"use client"

import React, { useState } from 'react'
import GetValueButton from './GetValueButton'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { APIResponseProps } from '../types';
import { Helpers } from '@/_lib/helpers';
import { useSession } from 'next-auth/react';

const helper = new Helpers();
const SellTab = () => {

    const { data: session } = useSession();
    const user = session?.user as any;

    const init_payload = {
        user_id: user?.user_id || 0,
        home_address: "",
        email_address: "",
        mailer: "Sendgrid",
        message_type: "Selling Request",
    }

    const [payload, setPayload] = useState(init_payload);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPayload((prev_payload) => {
            return {
                ...prev_payload,
                [e.target.name]: e.target.value,
            }
        })
    }

    const handleCLick = () => {

        if (!helper.validateEmail(payload.email_address)) {
            toast.error("Provide a valid email address.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        if (payload.email_address == "" || payload.home_address == "") {

            toast.error("All fields are required.", {
                position: "top-center",
                theme: "colored"
            });

            return false;

        }

        setIsSubmitting(true);

        fetch("/api/(emails)/selling-request", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            if (data.message == "Email sent!") {

                toast.success("Message successfully sent, we will get back to you as soon as possible.", {
                    position: "top-center",
                    theme: "colored"
                });

                setPayload(init_payload);

            } else {

                toast.error("Unable to send your message, please try again later " + data.message, {
                    position: "top-center",
                    theme: "colored"
                });

                console.log(data.message);

            }

        });

    }

    return (
        <>
            <div className='w-full px-4 lg:px-0 flex flex-col *:text-white *:font-play-fair-display *:text-shadow-primary select-none'>
                <h2 className='italic font-normal text-2xl md:text-3xl'>Whats your Home Worth?</h2>
                <h1 className='font-normal text-4xl md:text-6xl mt-1'>ENTER YOUR ADDRESS</h1>
            </div>

            <div className='w-full px-4 lg:px-0 my-6'>
                <div className='w-full bg-white py-2 flex flex-wrap items-center px-2 relative'>
                    <div className='flex-grow  mr-auto h-full'>
                        <input type='text' placeholder='Your home address' name='home_address' onChange={(e) => handleChange(e)} value={payload.home_address}
                            className='w-full h-full border border-transparent focus:border-sky-500 focus:shadow-xl focus:outline-none px-3 py-2' />
                    </div>
                    <div className='vertical-divider mx-2 h-7 border border-gray-300 hidden sm:block'></div>
                    <div className='hr-divider my-2 w-full border-b border-gray-300 block sm:hidden'></div>
                    <div className='flex-grow  mr-0 sm:mr-2 h-full'>
                        <input type='text' placeholder='Your email address' name='email_address' onChange={(e) => handleChange(e)} value={payload.email_address}
                            className='w-full h-full border border-transparent focus:border-sky-500 focus:shadow-xl focus:outline-none px-3 py-2' />
                    </div>
                    <div className='hr-divider my-2 w-full border-b border-gray-300 block sm:hidden'></div>
                    <GetValueButton handleClick={handleCLick} isSubmitting={isSubmitting} />
                </div>
            </div>
        </>
    )
}

export default SellTab