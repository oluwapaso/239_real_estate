"use client"

import { Helpers } from '@/_lib/helpers'
import { APIResponseProps } from '@/components/types'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { toast } from 'react-toastify'

const helpers = new Helpers();
const ResetPassword = () => {

    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const account_email = searchParams?.get("email") as string;
    const token = searchParams?.get("token") as string;

    const [password, setPassword] = useState("");
    const [confirm_password, setConfPass] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {

        if (!helpers.validateEmail(account_email) || token == "") {
            toast.error("Account email or token is missing", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        let error_msg: string = ""
        if (password.length < 5) {
            error_msg = "Password can't be less that 5 characters"
        } else if (password != confirm_password) {
            error_msg = "Password must match"
        }

        if (error_msg != "") {
            toast.error(error_msg, {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const payload = {
            account_email: account_email,
            token: token,
            password: password
        }

        setIsSubmitting(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/(auths)/update-password`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            if (data.message == "Password successfully updated.") {

                setPassword("");
                setConfPass("");

                toast.success("Password successfully updated.", {
                    position: "top-center",
                    theme: "colored"
                });

            } else {

                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

            }

        }).catch((err: string) => {
            toast.error(`${err}`, {
                position: "top-center",
                theme: "colored"
            });
        })
    }


    if (session?.user) {
        window.location.href = "/";
    } else {

        return (
            <section className='w-full h-svh bg-primary py-20 flex justify-center items-center font-poppins'>
                <div className='container mx-auto max-w-[480px] text-left'>

                    <div className='w-full text-white text-center font-normal text-2xl mb-4'>Update Password</div>
                    <div className='w-full max-w-[95%] mx-auto bg-white drop-shadow-xl px-4 xs:px-7 py-8 xs:py-10 rounded xs:rounded-xl'>

                        <div className='w-full flex flex-col mt-3'>

                            <div className='w-full'>
                                <input type='password' className='w-full py-2 px-3 border border-gray-600 outline-0 h-[50px] rounded-md' placeholder='Password'
                                    value={password} name='password' onChange={(e) => setPassword(e.target.value)} />
                            </div>

                            <div className='w-full mt-4'>
                                <input type='password' className='w-full py-2 px-3 border border-gray-600 outline-0 h-[50px] rounded-md' placeholder='Confirm Password'
                                    value={confirm_password} name='confirm_password' onChange={(e) => setConfPass(e.target.value)} />
                            </div>

                            <div className='w-full mt-4'>
                                {!isSubmitting ?
                                    <button className='w-full bg-primary hover:bg-primary/80 text-white text-center py-3 px-4 rounded-md'
                                        onClick={handleSubmit}>Update Password</button> :
                                    <button className='w-full bg-primary/80 py-3 px-4 text-white flex justify-center items-center 
                                    cursor-not-allowed' disabled>
                                        <span>Please Wait</span> <AiOutlineLoading3Quarters size={16} className='animate-spin ml-2' />
                                    </button>
                                }
                            </div>

                            <div className='w-full mt-4'>
                                Done reseting your password?  <Link href='/login' className='text-sky-600'>Click here</Link> to login
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        )
    }
}

export default ResetPassword