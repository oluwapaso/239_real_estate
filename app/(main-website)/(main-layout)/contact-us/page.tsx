"use client"

import SimpleHeader from '@/components/SimpleHeader'
import { APIResponseProps, form_dataProps } from '@/components/types'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FaAsterisk } from 'react-icons/fa'
import { RiMailSendLine } from 'react-icons/ri'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContactUs = () => {

    const { data: session } = useSession();
    const user = session?.user as any;

    const empty_form_data: form_dataProps = {
        user_id: user?.user_id || 0,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        mailer: "Sendgrid",
        message_type: "Contact Us"
    }

    const [formData, setFormData] = useState(empty_form_data);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData((prev_data) => {
            return {
                ...prev_data,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleSubmit = () => {

        toast.dismiss();

        if (formData.first_name == "" || formData.last_name == "" || formData.email == "" || formData.message == "") {

            toast.error("Fields marked with asterisks are required.", {
                position: "top-center",
                theme: "colored"
            });

            return false;

        }

        setIsSubmitting(true);

        fetch("/api/(emails)/send-contact-us-email", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            if (data.message == "Email sent!") {

                toast.success("Message successfully sent, we will get back to you as soon as possible.", {
                    position: "top-center",
                    theme: "colored"
                });

                setFormData(empty_form_data)

            } else {

                toast.error("Unable to send your message, please try again later " + data.message, {
                    position: "top-center",
                    theme: "colored"
                });

                console.log(data.message)

            }

        });

    }

    return (
        <>
            <SimpleHeader page="Contact Us" />
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[850px] px-3 xl:px-0 text-left'>
                    <div className='w-full font-normal'>
                        <Link href="/">Home</Link> / <Link href="/contact-us">Contact Us</Link>
                    </div>

                    <h3 className='w-full font-play-fair-display text-3xl mt-2'>Ready to Start Your Real Estate Journey? Contact Us</h3>

                    <div className='w-full mt-5'>
                        <div className='w-full grid grid-cols-1 2xs:grid-cols-2 gap-y-5 gap-x-2 sm:gap-x-5'>
                            <div className=''>
                                <label className='w-full flex items-center font-semibold' htmlFor='first_name'>
                                    <span>First Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                </label>
                                <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' placeholder='First Name' value={formData.first_name} name='first_name' onChange={(e) => handleChange(e)} />
                            </div>

                            <div className=''>
                                <label className='w-full flex items-center font-semibold' htmlFor='last_name'>
                                    <span>Last Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                </label>
                                <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' placeholder='Last Name' value={formData.last_name} name='last_name' onChange={(e) => handleChange(e)} />
                            </div>

                            <div className=''>
                                <label className='w-full flex items-center font-semibold' htmlFor='email'>
                                    <span>Email Address</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                </label>
                                <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' type='email' placeholder='Email Address' value={formData.email} name='email' onChange={(e) => handleChange(e)} />
                                <small className='w-full text-red-600'>*Your email will never be shared with any third party.</small>
                            </div>

                            <div className=''>
                                <label className='w-full flex items-center font-semibold' htmlFor='phone'>
                                    <span>Phone Number</span>
                                </label>
                                <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' type='tel' placeholder='Phone Number' value={formData.phone} name='phone' onChange={(e) => handleChange(e)} />
                            </div>

                            <div className='2xs:col-span-2'>
                                <label className='w-full flex items-center font-semibold' htmlFor='subject'>
                                    <span>Subject</span>
                                </label>
                                <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' type='tel' placeholder='Subject' value={formData.subject} name='subject' onChange={(e) => handleChange(e)} />
                            </div>

                            <div className='2xs:col-span-2'>
                                <label className='w-full flex items-center font-semibold' htmlFor='message'>
                                    <span>Message</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                </label>
                                <textarea className='w-full border border-gray-300 p-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md h-44 resize-none' placeholder='Message' value={formData.message} name='message' onChange={(e) => handleChange(e)} />
                            </div>

                            <div className='2xs:col-span-2 flex justify-end'>
                                {!isSubmitting ?
                                    <button className='bg-primary py-3 px-6 text-white font-light text-sm uppercase flex items-center' onClick={handleSubmit}>
                                        <span>Submit Form</span> <RiMailSendLine size={16} className='ml-2' />
                                    </button> :
                                    <button className='bg-primary/80 py-3 px-6 text-white font-light text-sm uppercase flex items-center 
                                     cursor-not-allowed' disabled>
                                        <span>Please Wait</span> <AiOutlineLoading3Quarters size={16} className='animate-spin ml-2' />
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/** <ToastContainer /> **/}
        </>
    )
}

export default ContactUs