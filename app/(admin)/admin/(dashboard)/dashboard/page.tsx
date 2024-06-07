"use client"

import React, { useEffect } from 'react'
import { Helpers } from '@/_lib/helpers'
import PageTitle from '../../_components/PageTitle'
import useCurrentBreakpoint from '@/_hooks/useMediaQuery'
import { useDispatch } from 'react-redux'
import { hidePageLoader } from '../../GlobalRedux/user/userSlice'

const helpers = new Helpers();
const Dashboard = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const { is1Xm, is2Xm } = useCurrentBreakpoint();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(hidePageLoader());
    }, []);

    return (
        <div className='w-full'>
            <PageTitle text="Dashboard" show_back={false} />
            <div className='w-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8'>
                Dashboard Here
            </div>
        </div>
    )
}

export default Dashboard