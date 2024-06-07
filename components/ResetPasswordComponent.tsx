import { Helpers } from '@/_lib/helpers';
import Link from 'next/link'
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { toast } from 'react-toastify'
import { APIResponseProps } from './types';

const helpers = new Helpers();

const ResetPasswordComponent = ({ page, handleLoginModal, handleForgotPwrdModal }:
    {
        page: string, handleLoginModal?: () => void, handleForgotPwrdModal?: () => void
    }) => {

    const [accntEmail, setAccntEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {

        toast.dismiss();

        if (!helpers.validateEmail(accntEmail)) {
            toast.error("Please provide a valid account email", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const payload = {
            account_email: accntEmail
        }

        setIsSubmitting(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/(auths)/reset-password`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            if (data.message == "Reset Link Sent") {

                toast.success("Reset link successfully sent, follow the link to set new a password", {
                    position: "top-center",
                    theme: "colored"
                });

                //dispatch(logout());

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
        <div className='w-full relative'>
            {
                /** page == "Reset Password" && <div className='w-full text-white text-center font-normal text-2xl mb-4'>Reset Password</div> */
            }
            <div className='w-full flex flex-col mt-3'>

                <div className='w-full'>
                    <input type='email' className='w-full py-2 px-3 border border-gray-600 outline-0 h-[50px] rounded-md' placeholder='Account Email'
                        value={accntEmail} name='account_email' onChange={(e) => setAccntEmail(e.target.value)} />
                </div>

                <div className='w-full mt-4'>
                    {!isSubmitting ?
                        <button className='w-full bg-primary hover:bg-primary/80 text-white text-center py-3 px-4 rounded-md' onClick={handleSubmit}>Send Reset Link</button> :
                        <button className='w-full bg-primary/80 py-3 px-4 text-white flex justify-center items-center 
                                    cursor-not-allowed rounded-md' disabled>
                            <span>Please Wait</span> <AiOutlineLoading3Quarters size={16} className='animate-spin ml-2' />
                        </button>
                    }
                </div>

                <div className='w-full mt-4 flex items-center justify-between'>
                    {
                        page == "Reset Password" ? <Link href='/login' className='text-sky-600'>Remember your password?</Link>
                            : <div className='text-sky-600 cursor-pointer' onClick={handleLoginModal}>Remember your password?</div>
                    }
                </div>
            </div>
            {/** <ToastContainer /> */}
        </div>
    )
}

export default ResetPasswordComponent