"use client"

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FaFacebook, FaGoogle } from 'react-icons/fa6'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const LoginComponent = ({ page, redirect, handleForgotPwrdModal, handleSignupModal }: {
    page: string, redirect?: string, handleForgotPwrdModal?: () => void, handleSignupModal?: () => void
}) => {

    const router = useRouter();
    const [isLogginIn, setIsLogginIn] = useState(false);
    const [isGoogleLogginIn, setIsGoogleLogginIn] = useState(false);
    const [isFBLogginIn, setIsFBLogginIn] = useState(false);

    const ContWithGoogle = async () => {
        setIsGoogleLogginIn(true);
        signIn("google");
    }

    const ContWithFB = () => {
        setIsFBLogginIn(true);
        signIn("facebook");
    }

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>, redirect?: string) => {

        e.preventDefault();
        toast.dismiss();
        const data = new FormData(e.currentTarget);
        setIsLogginIn(true);

        const SignInResp = await signIn("credentials", {
            email: data.get("email"),
            password: data.get("password"),
            redirect: false, //Dont redirect to next auth generated form on error
        });

        if (SignInResp && !SignInResp.error) {

            if (redirect && redirect != "") {
                //router.push(redirect);
                window.location.reload();
            } else {
                //router.push("/");
                window.location.href = "/";
            }

        } else {
            toast.error(`${SignInResp?.error}`, {
                position: "top-center",
                theme: "colored"
            });
            setIsLogginIn(false);
        }

        return false;
    }

    return (
        <div className='w-full'>
            {
                !isGoogleLogginIn ? <div className='w-full mt-4 bg-primary hover:bg-primary/80 py-3 px-3 flex items-center justify-center 
              text-white rounded-md cursor-pointer' onClick={ContWithGoogle}>
                    <FaGoogle size={18} className='mr-2' /> <span className='text-lg font-light'>Continue with Google</span>
                </div>
                    : <div className='w-full mt-4 bg-primary/70 py-3 px-3 flex items-center justify-center 
                text-white rounded-md cursor-pointer' >
                        <AiOutlineLoading3Quarters size={18} className='mr-2 animate-spin' /> <span className='text-lg font-light'>Please wait...</span>
                    </div>
            }

            {
                !isFBLogginIn ? <div className='w-full mt-4 bg-primary hover:bg-primary/80 py-3 px-3 flex items-center justify-center 
              text-white rounded-md cursor-pointer' onClick={ContWithFB}>
                    <FaFacebook size={18} className='mr-2' /> <span className='text-lg font-light'>Continue with Facebook</span>
                </div>
                    : <div className='w-full mt-4 bg-primary/70 py-3 px-3 flex items-center justify-center 
                text-white rounded-md cursor-pointer' >
                        <AiOutlineLoading3Quarters size={18} className='mr-2 animate-spin' /> <span className='text-lg font-light'>Please wait...</span>
                    </div>
            }

            <div className='w-full flex items-center justify-center my-6 font-bold text-2xl'>Or</div>

            <form onSubmit={(e) => handleLogin(e, redirect)} className='w-full flex flex-col' next-action='/' method='post'>

                <div className='w-full'>
                    <input type='email' className='w-full py-2 px-3 border border-gray-600 outline-0 h-[50px] rounded-md' placeholder='Email' name='email' required />
                </div>

                <div className='w-full mt-4'>
                    <input type='password' className='w-full py-2 px-3 border border-gray-600 outline-0 h-[50px] rounded-md' placeholder='Password' name='password' required />
                </div>

                <div className='w-full mt-4'>
                    {
                        !isLogginIn
                            ? <button className='w-full bg-primary hover:bg-primary/80 text-white text-center py-3 px-4 rounded-md'
                                type='submit'>Login</button>
                            : <button className='w-full hover:bg-primary/80 text-white text-center py-3 px-4 rounded-md flex items-center justify-center'
                                disabled><AiOutlineLoading3Quarters size={17} className='mr-2 animate-spin' /> <span>Login in...</span></button>
                    }
                </div>

                <div className='w-full mt-4 flex items-center justify-between'>
                    {
                        page == "Login" ? <><Link href='/sign-up' className='text-sky-600'>Need a new account?</Link>
                            <Link href='/forgot-pasword' className='text-sky-600'>Forgot password?</Link></>
                            : <><div className='text-sky-600 cursor-pointer' onClick={handleSignupModal}>Need a new account?</div>
                                <div className='text-sky-600 cursor-pointer' onClick={handleForgotPwrdModal}>Forgot password?</div></>
                    }
                </div>
            </form>
            {/** <ToastContainer /> **/}
        </div>
    )
}

export default LoginComponent