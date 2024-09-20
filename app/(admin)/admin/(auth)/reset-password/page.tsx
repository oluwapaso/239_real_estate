"use client"

import { Helpers } from '@/_lib/helpers'
import { APIResponseProps } from '@/components/types'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { PiPassword } from 'react-icons/pi'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { RootState } from '../../GlobalRedux/store'
import useCurrentBreakpoint from '@/_hooks/useMediaQuery'
import CustomLink from '@/components/CustomLink'
import { hidePageLoader } from '../../GlobalRedux/user/userSlice'

const helpers = new Helpers()

const ResetPassword = () => {

    const searchParams = useSearchParams();
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    const { is1Xm, is2Xm } = useCurrentBreakpoint();
    let icon_size = 40;
    if (is1Xm || is2Xm) {
        icon_size = 30;
    }

    const account_email = searchParams?.get("email") as string;
    const token = searchParams?.get("token") as string;

    const [password, setPassword] = useState("")
    const [confirm_password, setConfPass] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        fetch(`${apiBaseUrl}/api/update-admin-password`, {
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

    useEffect(() => {
        dispatch(hidePageLoader());
    }, []);

    if (user.isLogged) {
        const router = useRouter();
        router.push("/admin/dashboard")
    } else {


        return (
            <>
                <section className='w-full h-svh bg-gradient-to-br from-sky-600 to-red-500 py-20 flex justify-center items-center font-poppins'>
                    <div className='container mx-auto max-w-[95%] xs:max-w-[480px] text-left'>

                        <div className='w-full text-white text-center font-normal text-xl xs:text-2xl mb-4'>Update Password</div>
                        <div className='bg-white drop-shadow-xl border border-slate-400 px-4 xs:px-7 py-10'>
                            <div className='w-full flex items-center justify-center'>
                                <div className='size-[65px] xs:size-[90px] rounded-full bg-red-400 flex items-center justify-center'>
                                    <PiPassword size={icon_size} className='text-white' />
                                </div>
                            </div>

                            <div className='w-full flex flex-col mt-7'>

                                <div className='w-full'>
                                    <input type='password' className='w-full py-2 border-b border-slate-400 outline-0' placeholder='Password'
                                        value={password} name='password' onChange={(e) => setPassword(e.target.value)} />
                                </div>

                                <div className='w-full mt-4'>
                                    <input type='password' className='w-full py-2 border-b border-slate-400 outline-0' placeholder='Confirm Password'
                                        value={confirm_password} name='confirm_password' onChange={(e) => setConfPass(e.target.value)} />
                                </div>

                                <div className='w-full mt-8'>
                                    {!isSubmitting ?
                                        <button className='w-full bg-sky-800 text-white text-center py-3 px-4' onClick={handleSubmit}>Update Password</button> :
                                        <button className='w-full bg-sky-800/80 py-3 px-4 text-white flex justify-center items-center 
                                    cursor-not-allowed' disabled>
                                            <span>Please Wait</span> <AiOutlineLoading3Quarters size={16} className='animate-spin ml-2' />
                                        </button>
                                    }
                                </div>

                                <div className='w-full mt-4'>
                                    Done reseting your password? <CustomLink href='/admin/login' className='text-sky-600'>Click here</CustomLink> to login
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
                <ToastContainer />
            </>
        )
    }
}

export default ResetPassword