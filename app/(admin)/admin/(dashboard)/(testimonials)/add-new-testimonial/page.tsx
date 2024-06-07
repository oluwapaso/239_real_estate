"use client"

import React, { useEffect, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import { APIResponseProps } from '@/components/types';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useSearchParams } from 'next/navigation';

const AddNewTestimonial = () => {

    const [initialValues, setInitialValues] = useState({ fullname: "", account_type: "Buyer", testimonial: "" });
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(hidePageLoader());
    }, []);

    const handleSubmit = async (value: any, onSubmit: any) => {

        if (!value.fullname || !value.account_type || !value.testimonial) {

            toast.error("All fields are required.", {
                position: "top-center",
                theme: "colored"
            });

            return false;

        }

        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(testimonials)/manage-testimonials`, {
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
                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

                onSubmit.resetForm();
            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });
    }

    return (
        <div className='w-full'>
            <PageTitle text="Add Testimonial" show_back={true} />
            <div className='container m-auto max-w-[650px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Testimonials.</div>
                            <div className=''>Testimonials are displayed on home page.</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>
                            <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                                <Form className='w-full'>
                                    <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>

                                        <div className='col-span-1 sm:col-span-1'>
                                            <label htmlFor="fullname" className='form-label'>Fullname</label>
                                            <Field type="text" name="fullname" className='form-field' placeholder="Fullname" />
                                            <ErrorMessage name="fullname" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="account_type" className='form-label'>Type</label>
                                            <Field as="select" name="account_type" className='form-field' value="Buyer">
                                                <option value={'Buyer'}>Buyer</option>
                                                <option value={'Seller'}>Seller</option>
                                                <option value={'Agent'}>Agent</option>
                                            </Field>
                                            <ErrorMessage name="account_type" component="div" />
                                        </div>

                                        <div className='col-span-full'>
                                            <label htmlFor="testimonial" className='form-label'>Testimonial</label>
                                            <Field as="textarea" name="testimonial" className='form-field h-[200px] resize-none' placeholder="Testimonial" />
                                            <ErrorMessage name="testimonial" component="div" />
                                        </div>

                                        <div className='col-span-1 sm:col-span-2 mt-2'>
                                            <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right 
                                            hover:bg-gray-700 hover:drop-shadow-md'>
                                                Add Testimonial
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            </Formik>
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    );

}

export default AddNewTestimonial