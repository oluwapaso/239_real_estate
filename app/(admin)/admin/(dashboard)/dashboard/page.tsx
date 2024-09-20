"use client"

import React, { useEffect, useState } from 'react'
import { Helpers } from '@/_lib/helpers'
import PageTitle from '../../_components/PageTitle'
import { useDispatch } from 'react-redux'
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/user/userSlice'
import { APIResponseProps } from '@/components/types'
import CustomLink from '@/components/CustomLink'
import { FaUsers } from 'react-icons/fa6'
import numeral from 'numeral'
import { HiOutlineHomeModern } from 'react-icons/hi2'
import { TbCalendarTime } from 'react-icons/tb'
import { MdOutlineMarkAsUnread } from 'react-icons/md'
import { GoTasklist } from 'react-icons/go'

const helpers = new Helpers();
const Dashboard = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const dispatch = useDispatch();

    const [dashboard_data, setDashboardData] = useState<any>({})

    useEffect(() => {

        dispatch(showPageLoader());

        fetch("/api/get-dashboard-data", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "dashboard_data": "Yes" }),
        }).then((resp): Promise<APIResponseProps> => {
            dispatch(hidePageLoader());
            if (!resp.ok) {
                console.log(resp.statusText);
            }
            return resp.json();
        }).then(data => {

            if (data.success) {
                setDashboardData(data.data)
            } else {
                console.log(data.data.message);
            }

        }).catch((e: any) => {
            console.log(e.message);
        });

    }, []);

    return (
        <div className='w-full'>
            <PageTitle text="Dashboard" show_back={false} />
            <div className='w-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8
            *:px-6 *:py-9 *:bg-white *:shadow *:border *:border-gray-200 *:flex *:flex-col *:justify-center *:items-center
            *:rounded-md  *:cursor-pointer'>

                <CustomLink href="/admin/all-users?stage=Any&page=1" className="hover:shadow-2xl hover:shadow-gray-300">
                    <div className="text-3xl font-light">{numeral(dashboard_data.Users).format("0,0")}</div>
                    <div className="text-lg font-medium mt-2 flex justify-center items-center">
                        <FaUsers size={20} className="mr-2" /> <span>Users</span>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/tasks?type=Upcoming%20Tasks&page=1" className="hover:shadow-2xl hover:shadow-gray-300">
                    <div className="text-3xl font-light">{numeral(dashboard_data.Tasks).format("0,0")}</div>
                    <div className="text-lg font-medium mt-2 flex justify-center items-center">
                        <GoTasklist size={20} className="mr-2" /> <span>Tasks</span>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/appointments?type=Upcoming%20Appointments&page=1" className="hover:shadow-2xl hover:shadow-gray-300">
                    <div className="text-3xl font-light">{numeral(dashboard_data.Appointments).format("0,0")}</div>
                    <div className="text-lg font-medium mt-2 flex justify-center items-center">
                        <TbCalendarTime size={20} className="mr-2" /> <span>Appointments</span>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/requests?type=Buying%20Requests&page=1" className="hover:shadow-2xl hover:shadow-gray-300">
                    <div className="text-3xl font-light">{numeral(dashboard_data.BuyingRequest).format("0,0")}</div>
                    <div className="text-lg font-medium mt-2 flex justify-center items-center">
                        <MdOutlineMarkAsUnread size={20} className="mr-2" /> <span>Buying Requests</span>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/requests?type=Selling%20Requests&page=1" className="hover:shadow-2xl hover:shadow-gray-300">
                    <div className="text-3xl font-light">{numeral(dashboard_data.SellingRequest).format("0,0")}</div>
                    <div className="text-lg font-medium mt-2 flex justify-center items-center">
                        <MdOutlineMarkAsUnread size={20} className="mr-2" /> <span>Selling Requests</span>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/requests?type=Info%20Requests&page=1" className="hover:shadow-2xl hover:shadow-gray-300">
                    <div className="text-3xl font-light">{numeral(dashboard_data.InfoRequest).format("0,0")}</div>
                    <div className="text-lg font-medium mt-2 flex justify-center items-center">
                        <MdOutlineMarkAsUnread size={20} className="mr-2" /> <span>Info Requests</span>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/requests?type=Tour%20Requests&page=1" className="hover:shadow-2xl hover:shadow-gray-300">
                    <div className="text-3xl font-light">{numeral(dashboard_data.TourRequest).format("0,0")}</div>
                    <div className="text-lg font-medium mt-2 flex justify-center items-center">
                        <MdOutlineMarkAsUnread size={20} className="mr-2" /> <span>Tour Requests</span>
                    </div>
                </CustomLink>

                <CustomLink href="/admin/requests?type=Showing%20Requests&page=1" className="hover:shadow-2xl hover:shadow-gray-300">
                    <div className="text-3xl font-light">{numeral(dashboard_data.ShowingRequest).format("0,0")}</div>
                    <div className="text-lg font-medium mt-2 flex justify-center items-center">
                        <MdOutlineMarkAsUnread size={20} className="mr-2" /> <span>Showing Requests</span>
                    </div>
                </CustomLink>
            </div>
        </div>
    );
}

export default Dashboard