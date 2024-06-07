"use client"

import { Helpers } from '@/_lib/helpers';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/user/userSlice';
import { APIResponseProps } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageTitle from '../../_components/PageTitle';

const helpers = new Helpers();
const APISettings = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();

    const dispatch = useDispatch();
    const [initialValues, setInitialValues] = useState({});

    useEffect(() => {

        const fetch_info = async () => {
            const api_info_prms = helpers.FetchAPIInfo();
            const api_info = await api_info_prms

            if (api_info.success && api_info.data) {
                setInitialValues(api_info.data);
                dispatch(hidePageLoader());
            }
        }

        dispatch(showPageLoader())
        fetch_info();

    }, []);

    const handleSubmit = async (value: any) => {

        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/update-api-info`, {
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
                })
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
            <PageTitle text="API Settings" show_back={true} />
            <div className='container m-auto max-w-[650px] lg:max-w-[1100px]'>
                <div className='w-full mt-6 mb-6'>

                    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                        <Form className='w-full'>
                            <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                                <div className='lg:col-span-1'>
                                    <div className='font-semibold'>Google Auth API.</div>
                                    <div className=''>This will be used for authentication with google mail.</div>
                                </div>

                                <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                                    <div className='w-full grid grid-cols-1 gap-4'>
                                        <div className=''>
                                            <label htmlFor="google_auth_client_id" className='form-label'>Client ID</label>
                                            <Field type="text" name="google_auth_client_id" className='form-field' placeholder='Client ID' />
                                            <ErrorMessage name="google_auth_client_id" component="div" className='text-red-600' />
                                        </div>

                                        <div className=''>
                                            <label htmlFor="google_auth_client_secret" className='form-label'>Client Secret</label>
                                            <Field name="google_auth_client_secret" className='form-field' placeholder="Client Secret" />
                                            <ErrorMessage name="google_auth_client_secret" component="div" className='text-red-600' />
                                        </div>
                                    </div>

                                </div>
                            </div>


                            <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                                <div className='lg:col-span-1'>
                                    <div className='font-semibold'>Facebook Auth API.</div>
                                    <div className=''>This will be used for authentication with facebook account.</div>
                                </div>

                                <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                                    <div className='w-full grid grid-cols-1 gap-4'>

                                        <div className=''>
                                            <label htmlFor="facebook_auth_app_id" className='form-label'>App ID</label>
                                            <Field type="text" name="facebook_auth_app_id" className='form-field' placeholder='App ID' />
                                            <ErrorMessage name="facebook_auth_app_id" component="div" className='text-red-600' />
                                        </div>

                                        <div className=''>
                                            <label htmlFor="facebook_auth_app_secret" className='form-label'>App Secret</label>
                                            <Field name="facebook_auth_app_secret" className='form-field' placeholder="App Secret" />
                                            <ErrorMessage name="facebook_auth_app_secret" component="div" className='text-red-600' />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                                <div className='lg:col-span-1'>
                                    <div className='font-semibold'>Google Map API.</div>
                                    <div className=''>This will be used for google map.</div>
                                </div>

                                <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                                    <div className='w-full grid grid-cols-1 gap-4'>
                                        <div className=''>
                                            <label htmlFor="google_map_key" className='form-label'>Key</label>
                                            <Field type="text" name="google_map_key" className='form-field' placeholder='Key' />
                                            <ErrorMessage name="google_map_key" component="div" className='text-red-600' />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10 hidden'>

                                <div className='lg:col-span-1'>
                                    <div className='font-semibold'>Facebook Post API.</div>
                                    <div className=''>This will be used for posting to facebook page.</div>
                                </div>

                                <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                                    <div className='w-full grid grid-cols-1 gap-4'>

                                        <div className=''>
                                            <label htmlFor="facebook_short_token" className='form-label'>Short Token</label>
                                            <Field type="text" name="facebook_short_token" className='form-field' placeholder='Long Token' />
                                            <ErrorMessage name="facebook_short_token" component="div" className='text-red-600' />
                                        </div>

                                        <div className=''>
                                            <label htmlFor="facebook_long_token" className='form-label'>Long Token</label>
                                            <Field name="facebook_long_token" className='form-field' placeholder="Long Token" />
                                            <ErrorMessage name="facebook_long_token" component="div" className='text-red-600' />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                                <div className='lg:col-span-1'>
                                    <div className='font-semibold'>Twilio API.</div>
                                    <div className=''>This will be used for texting.</div>
                                </div>

                                <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                                    <div className='w-full grid grid-cols-1 gap-4'>

                                        <div className=''>
                                            <label htmlFor="twillio_account_sid" className='form-label'>Account SID</label>
                                            <Field type="text" name="twillio_account_sid" className='form-field' placeholder='Account SID' />
                                            <ErrorMessage name="twillio_account_sid" component="div" className='text-red-600' />
                                        </div>

                                        <div className=''>
                                            <label htmlFor="twillio_auth_token" className='form-label'>Auth Token</label>
                                            <Field name="twillio_auth_token" className='form-field' placeholder="Auth Token" />
                                            <ErrorMessage name="twillio_auth_token" component="div" className='text-red-600' />
                                        </div>

                                        <div className=''>
                                            <label htmlFor="twillio_twiml_sid" className='form-label'>Twiml SID</label>
                                            <Field name="twillio_twiml_sid" className='form-field' placeholder="Twiml SID" />
                                            <ErrorMessage name="twillio_twiml_sid" component="div" className='text-red-600' />
                                        </div>

                                        <div className=''>
                                            <label htmlFor="twillio_phone_number" className='form-label'>Twilio Phone Number</label>
                                            <Field name="twillio_phone_number" className='form-field' placeholder="Twilio Phone Number" />
                                            <ErrorMessage name="twillio_phone_number" component="div" className='text-red-600' />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                                <div className='lg:col-span-1'>
                                    <div className='font-semibold'>Sendgrid.</div>
                                    <div className=''>This will be used for mass email.</div>
                                </div>

                                <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                                    <div className='w-full grid grid-cols-1 gap-4'>
                                        <div className=''>
                                            <label htmlFor="sendgrid_key" className='form-label'>API Key</label>
                                            <Field type="text" name="sendgrid_key" className='form-field' placeholder='Sendgrid Key' />
                                            <ErrorMessage name="sendgrid_key" component="div" className='text-red-600' />
                                        </div>

                                        <div className=''>
                                            <label htmlFor="sendgrid_mailer" className='form-label'>Default Mailer</label>
                                            <Field type="text" name="sendgrid_mailer" className='form-field' placeholder='Default Mailer' />
                                            <ErrorMessage name="sendgrid_mailer" component="div" className='text-red-600' />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                                <div className='lg:col-span-1'>
                                    <div className='font-semibold'>Walkscore.</div>
                                    <div className=''>This will be used to display property's accessibility.</div>
                                </div>

                                <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                                    <div className='w-full grid grid-cols-1 gap-4'>
                                        <div className=''>
                                            <label htmlFor="walkscore_api" className='form-label'>API Key</label>
                                            <Field type="text" name="walkscore_api" className='form-field' placeholder='Sendgrid Key' />
                                            <ErrorMessage name="walkscore_api" component="div" className='text-red-600' />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className='col-span-2 mt-6 flex justify-end'>
                                <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right hover:bg-gray-700 
                                hover:drop-shadow-md'> Update API Info</button>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </div>
            <ToastContainer />
        </div>
    )

}

export default APISettings