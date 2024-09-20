"use client"

import React, { useEffect } from 'react'
import { useSession } from "next-auth/react"
import LoginComponent from '@/components/LoginComponent';
import { hidePageLoader } from '../../(main-layout)/GlobalRedux/app/appSlice'
import { useDispatch } from 'react-redux';

const LoginPage = () => {

  const { data: session } = useSession();
  const dispatch = useDispatch();

  if (session?.user) {
    window.location.href = "/";
  } else {

    //Close modal if it's opened, this usually happen after returning from property details page without signing in
    useEffect(() => {
      dispatch(hidePageLoader())
    }, [])

    return (
      <section className='w-full bg-primary h-svh py-20 flex justify-center items-center font-poppins'>
        <div className='container mx-auto max-w-[480px] text-center'>

          <div className='w-full text-white text-center font-light text-2xl mb-4 font-poppins'>Sign In</div>
          <div className='w-full max-w-[95%] mx-auto bg-white drop-shadow-xl px-4 xs:px-7 py-8 xs:py-10 rounded xs:rounded-xl'>
            <LoginComponent page="Login" />
          </div>

        </div>
      </section>
    )

  }
}

export default LoginPage