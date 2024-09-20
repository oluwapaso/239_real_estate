"use client"

import { Helpers } from '@/_lib/helpers'
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FaAsterisk } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { APIResponseProps } from './types'

const helper = new Helpers();
const CommentBox = ({ draft_id, setFetchComments }: { draft_id: number, setFetchComments: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const initialVal = {
        fullname: "",
        email: "",
        comments: "",
        draft_id: draft_id,
    }

    const [values, setValues] = useState(initialVal);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        setValues((prevVals) => {
            return {
                ...prevVals,
                [e.target.name]: e.target.value,
            }
        });
    }

    const handleSubmit = () => {

        toast.dismiss();

        if (!helper.validateEmail(values.email)) {

            toast.error("Provide a valid email address", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        if (!values.fullname || !values.comments) {

            toast.error("All fields are required.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        setSubmitting(true);

        fetch("/api/(blogs)/add-blog-comments", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        }).then((resp): Promise<APIResponseProps> => {
            setSubmitting(false);
            return resp.json();
        }).then(data => {

            if (data.message == "Comments added") {

                toast.success("Comments successfully added.", {
                    position: "top-center",
                    theme: "colored"
                });

                setValues(initialVal);
                setFetchComments(true);

            } else {

                toast.error("Unable to add your comments, please try again later", {
                    position: "top-center",
                    theme: "colored"
                });

                console.log(data.message)

            }

        });

    }

    return (
        <div className='w-full mt-6 bg-gray-100 border border-gray-200 p-5'>

            <div className=''>
                <label className='w-full flex items-center font-semibold' htmlFor='fullname'>
                    <span>Full Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                </label>
                <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal focus:shadow-md'
                    placeholder='Full Name' value={values.fullname} name='fullname' onChange={(e) => handleChange(e)} />
            </div>

            <div className='mt-5'>
                <label className='w-full flex items-center font-semibold' htmlFor='email'>
                    <span>Email</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                </label>
                <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal focus:shadow-md'
                    type='email' placeholder='Email' value={values.email} name='email' onChange={(e) => handleChange(e)} />
                <small className='w-full mt-1 text-red-600'>Note: your email is secure and we will never share your email with any third party.</small>
            </div>

            <div className='mt-5'>
                <label className='w-full flex items-center font-semibold' htmlFor='Comments'>
                    <span>Comments</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                </label>
                <textarea className='w-full border border-gray-300 p-2 outline-0 hover:border-sky-600 font-normal focus:shadow-md
                h-64 resize-none' placeholder='Comments' value={values.comments} name='comments' onChange={(e) => handleChange(e)} />
            </div>

            <div className='my-5 flex justify-end'>
                {
                    !submitting ? (
                        <button className='bg-primary font-normal text-white px-6 py-3' onClick={handleSubmit}>
                            Add Comment
                        </button>
                    ) : <button className='bg-primary/50 font-normal text-white px-6 py-3 flex items-center cursor-not-allowed'>
                        <AiOutlineLoading3Quarters size={14} className='animate-spin' />  <span className='ml-2'>Please wait...</span>
                    </button>
                }

            </div>

            {/** <ToastContainer /> **/}
        </div>
    )
}

export default CommentBox