"use client"

import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { hidePageLoader, showPageLoader } from '../GlobalRedux/user/userSlice'
import { useDispatch } from 'react-redux'
import { APIResponseProps } from '@/components/types'
import * as Yup from 'yup';
import { toast } from 'react-toastify'
import { FaUserPlus } from 'react-icons/fa6'

const EditDripNameModal = ({ closeModal, automation_id, curr_name, setUpdateNameResponse, setRefreshPage }:
    {
        closeModal: () => void, automation_id: number, curr_name: string, setUpdateNameResponse: React.Dispatch<any>,
        setRefreshPage: React.Dispatch<React.SetStateAction<boolean>>
    }) => {

    const dispatch = useDispatch();

    const initialValues = {
        automation_name: curr_name,
    }

    const validationSchema = Yup.object({
        automation_name: Yup.string().trim().required("Provide a valid name."),
    });

    const handleSubmit = async (value: any, actions: any) => {

        value = validationSchema.cast(value);
        if (!value.automation_name) {
            closeModal();
            toast.error("Provide a valid name.", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }
        value.automation_id = automation_id;
        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(automations)/manage-automations`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        }).then((resp): Promise<APIResponseProps> => {
            closeModal();
            dispatch(hidePageLoader());
            return resp.json();
        }).then(data => {
            setUpdateNameResponse(data);
        }).catch((e: any) => {
            toast.error(`${e.message}.`, {
                position: "top-center",
                theme: "colored"
            });
        });

    }

    return (
        <div className='w-full'>
            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
                <Form className='w-full' autoComplete="off">

                    <div className='w-full'>
                        <label htmlFor="automation_name" className='form-label'>Automation Name</label>
                        <Field type="text" name="automation_name" className='form-field' placeholder='Automation Name' />
                        <ErrorMessage name="automation_name" component="div" className='text-red-500 text-sm' />
                    </div>

                    <div className='w-full mt-4'>
                        <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right hover:bg-gray-700 hover:drop-shadow-md'>
                            Automation Name
                        </button>
                    </div>
                </Form>
            </Formik>

        </div>
    )
}

export default EditDripNameModal