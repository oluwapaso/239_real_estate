"use client"

import ResetPasswordComponent from '@/components/ResetPasswordComponent'
import { useSession } from 'next-auth/react'
import React from 'react'

const ForgotPassword = () => {

    const { data: session } = useSession();

    if (session?.user) {
        window.location.href = "/";
    } else {

        return (
            <section className='w-full bg-primary h-svh py-20 flex justify-center items-center font-poppins'>
                <div className='container mx-auto max-w-[480px] text-left'>

                    <div className='w-full text-white text-center font-light text-2xl mb-4 font-poppins'>Reset Password</div>
                    <div className='w-full max-w-[95%] mx-auto bg-white drop-shadow-xl px-4 xs:px-7 py-8 xs:py-10 rounded xs:rounded-xl'>
                        <ResetPasswordComponent page='Reset Password' />
                    </div>

                </div>
            </section>
        )
    }
}

export default ForgotPassword