"use client"

import { Helpers } from '@/_lib/helpers';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { APIResponseProps } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import PageTitle from '../../../_components/PageTitle';
import AgentForm from '../../../_components/AgentForm';

const helpers = new Helpers();
const AddNewAgent = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();

    let initialValues = {
        "name": "",
        "email": "",
        "phone": "",
        "role": "",
        "facebook": "",
        "license_number": "",
        "instagram": "",
        "twitter": "",
        "bio": ""
    };

    const dispatch = useDispatch();

    const handleSubmit = async (value: any, actions: any) => {

        const name = value.name
        const email = value.email

        if (!name || !email) {
            toast.error("Provide a valid name and email address.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(agents)/add-new-agent`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        }).then((resp): Promise<APIResponseProps> => {
            dispatch(hidePageLoader());
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.success) {

                actions.setValues(initialValues);
                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                })

            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });

    }

    useEffect(() => {
        dispatch(hidePageLoader());
    }, [])

    return (
        <div className='w-full'>
            <PageTitle text="Add New Agent" show_back={true} />
            <div className='container m-auto md:max-w-[600px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='col-span-1'>
                            <div className='font-semibold'>Provide agent info.</div>
                            <div className=''>Agents will be listed in the main website with the info provided here</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 md:p-7 bg-white shadow-lg'>
                            <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                                <AgentForm type='Add' />
                            </Formik>
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    )

}

export default AddNewAgent