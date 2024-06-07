"use client"

import { Helpers } from '@/_lib/helpers'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import React, { useState } from 'react'
import { FaFacebook, FaGoogle } from 'react-icons/fa6'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { APIResponseProps } from './types'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const helpers = new Helpers();
const SignUpComponent = ({ page, redirect, handleLoginModal }: { page: string, redirect?: string, handleLoginModal?: () => void }) => {

    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isGoogleSigningUp, setIsGoogleSigningUp] = useState(false);
    const [isFBSigningUp, setIsFBSigningUp] = useState(false);

    const ContWithGoogle = async () => {
        setIsGoogleSigningUp(true);
        signIn("google");
    }

    const ContWithFB = () => {
        setIsFBSigningUp(true);
        signIn("facebook");
    }

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>, redirect?: string) => {

        e.preventDefault();
        toast.dismiss();

        const form = e.currentTarget;
        const form_data = new FormData(form);
        setIsSigningUp(true);
        const email = form_data.get("email") as string;
        const password = form_data.get("password") as string;
        const confirm_password = form_data.get("confirm_password") as string;

        if (email && !helpers.validateEmail(email)) {
            toast.error("Please provide a valid account email", {
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
            email: email,
            password: password
        }

        setIsSigningUp(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/(auths)/sign-up`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSigningUp(false);
            return resp.json();
        }).then(data => {

            if (data.message == "Account Created") {

                toast.success("Account successfully created, you can now log in to enjoy the full features", {
                    position: "top-center",
                    theme: "colored"
                });

                // Reset the form
                if (form) {
                    form.reset();
                }

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

    return (
        <div className='w-full'>

            {
                !isGoogleSigningUp ? <div className='w-full mt-4 bg-primary hover:bg-primary/80 py-3 px-3 flex items-center justify-center 
              text-white rounded-md cursor-pointer' onClick={ContWithGoogle}>
                    <FaGoogle size={18} className='mr-2' /> <span className='text-lg font-light'>Continue with Google</span>
                </div>
                    : <div className='w-full mt-4 bg-primary/70 py-3 px-3 flex items-center justify-center 
                text-white rounded-md cursor-pointer' >
                        <AiOutlineLoading3Quarters size={18} className='mr-2 animate-spin' /> <span className='text-lg font-light'>Please wait...</span>
                    </div>
            }

            {
                !isFBSigningUp ? <div className='w-full mt-4 bg-primary hover:bg-primary/80 py-3 px-3 flex items-center justify-center 
              text-white rounded-md cursor-pointer' onClick={ContWithFB}>
                    <FaFacebook size={18} className='mr-2' /> <span className='text-lg font-light'>Continue with Facebook</span>
                </div>
                    : <div className='w-full mt-4 bg-primary/70 py-3 px-3 flex items-center justify-center 
                text-white rounded-md cursor-pointer' >
                        <AiOutlineLoading3Quarters size={18} className='mr-2 animate-spin' /> <span className='text-lg font-light'>Please wait...</span>
                    </div>
            }

            <div className='w-full flex items-center justify-center my-6 font-bold text-2xl'>Or</div>

            <form onSubmit={(e) => handleSignUp(e)} className='w-full flex flex-col' next-action='/' method='post'>

                <div className='w-full'>
                    <input type='email' className='w-full py-2 px-3 border border-gray-600 outline-0 h-[50px] rounded-md' placeholder='Email' name='email' required />
                </div>

                <div className='w-full mt-4'>
                    <input type='password' className='w-full py-2 px-3 border border-gray-600 outline-0 h-[50px] rounded-md' placeholder='Password' name='password' required />
                </div>

                <div className='w-full mt-4'>
                    <input type='password' className='w-full py-2 px-3 border border-gray-600 outline-0 h-[50px] rounded-md' placeholder='Confirm Password' name='confirm_password' required />
                </div>

                <div className='w-full mt-4'>
                    {
                        !isSigningUp
                            ? <button className='w-full bg-primary hover:bg-primary/80 text-white text-center py-3 px-4 rounded-md'
                                type='submit'>Sign Up</button>
                            : <button className='w-full hover:bg-primary/80 text-white text-center py-3 px-4 rounded-md flex items-center justify-center'
                                disabled><AiOutlineLoading3Quarters size={17} className='mr-2 animate-spin' /> <span>Please wait...</span></button>
                    }
                </div>

                <div className='w-full mt-4 flex items-center justify-between'>
                    {
                        page == "Sign Up" ? <Link href='/login' className='text-sky-600'>Already have an account?</Link>
                            : <div className='text-sky-600 cursor-pointer' onClick={handleLoginModal}>Already have an account?</div>
                    }
                </div>
            </form>
            {/** <ToastContainer /> **/}
        </div>
    )
}

export default SignUpComponent