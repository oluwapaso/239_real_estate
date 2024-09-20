"use client"

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { GrUserAdmin } from 'react-icons/gr'
import { useDispatch, useSelector } from 'react-redux'
import { Login, emptyError, hidePageLoader } from '../../GlobalRedux/user/userSlice'
import { AppDispatch, RootState, store } from '../../GlobalRedux/store'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation'
import useCurrentBreakpoint from '@/_hooks/useMediaQuery'
import CustomLink from '@/components/CustomLink'

const AdminPage = () => {

  const dispatch = useDispatch<AppDispatch>();
  const auth_params = {
    username: "",
    password: ""
  }

  const user = useSelector((state: RootState) => state.user);
  const { is1Xm, is2Xm } = useCurrentBreakpoint();
  let icon_size = 40;
  if (is1Xm || is2Xm) {
    icon_size = 30;
  }

  const [AuthParams, setAuthParams] = useState(auth_params);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthParams((prev_state) => {
      return {
        ...prev_state,
        [e.target.name]: e.target.value
      }
    })
  }

  const handleLogin = async () => {

    let login_toast: any
    if (!AuthParams.username || !AuthParams.username) {
      if (login_toast) {
        toast.dismiss();
        login_toast = null
      }
      login_toast = toast.error("Provide a valid login info", {
        position: "top-center",
        theme: "colored"
      });
      return false;
    }

    await dispatch(Login({ username: AuthParams.username, password: AuthParams.password }))

  }

  //Display errors
  useEffect(() => {
    if (user.isLogginIn == false && user.error != "") {

      toast.dismiss();
      toast.error(user.error, {
        position: "top-center",
        theme: "colored"
      });

      dispatch(emptyError());

    }
  }, [user.error])


  //Handle successfull logins
  useEffect(() => {
    if (user.isLogginIn == false && user.error == "" && user.admin_id != null) {

      toast.dismiss();
      toast.success("Successfully logged in", {
        position: "top-center",
        theme: "colored"
      });

    }
  }, [user.admin_id])

  useEffect(() => {
    dispatch(hidePageLoader());
  }, []);

  if (user.isLogged) {
    const router = useRouter();
    router.push("/admin/dashboard")
  } else {

    return (
      <section className='w-full h-svh bg-gradient-to-br from-sky-600 to-red-500 py-20 flex justify-center items-center font-poppins'>
        <div className='container mx-auto max-w-[95%] xs:max-w-[480px] text-left'>

          <div className='w-full text-white text-center font-normal text-xl xs:text-2xl mb-4'>Log Into CRM Dashboard</div>
          <div className='bg-white drop-shadow-xl border border-slate-400 px-4 xs:px-7 py-10'>
            <div className='w-full flex items-center justify-center'>
              <div className='size-[65px] xs:size-[90px] rounded-full bg-red-400 flex items-center justify-center'>
                <GrUserAdmin size={icon_size} className='text-white' />
              </div>
            </div>

            <div className='w-full flex flex-col mt-7'>

              <div className='w-full'>
                <input className='w-full py-2 border-b border-slate-400 outline-0' placeholder='Username or Email' name='username'
                  value={AuthParams.username} onChange={handleChange} />
              </div>

              <div className='w-full mt-4'>
                <input type='password' className='w-full py-2 border-b border-slate-400 outline-0' placeholder='Password' name='password'
                  value={AuthParams.password} onChange={handleChange} />
              </div>

              <div className='w-full mt-8'>
                {!user.isLogginIn ?
                  <button className='w-full bg-sky-800 text-white text-center py-3 px-4' onClick={handleLogin}>Login</button> :
                  <button className='w-full bg-sky-800/70 text-white text-center py-3 px-4 flex items-center justify-center cursor-not-allowed' disabled>
                    <span>Login In... Please wait</span> <AiOutlineLoading3Quarters size={16} className='animate-spin ml-2' /></button>
                }
              </div>

              <div className='w-full mt-4'>
                <CustomLink href='/admin/forgot-pasword' className='text-sky-600'>Forgot password?</CustomLink>
              </div>
            </div>
          </div>

        </div>
        <ToastContainer />
      </section>
    )
  }
}

export default AdminPage