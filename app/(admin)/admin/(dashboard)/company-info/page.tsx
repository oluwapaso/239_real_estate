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
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';

const helpers = new Helpers();
const CompanyInfo = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const { is1Xm, is2Xm } = useCurrentBreakpoint();

    const dispatch = useDispatch();
    const [initialValues, setInitialValues] = useState({});

    useEffect(() => {

        const fetch_info = async () => {
            const comp_info_prms = helpers.FetchCompanyInfo();
            const comp_info = await comp_info_prms

            if (comp_info.success && comp_info.data) {
                setInitialValues(comp_info.data)
                dispatch(hidePageLoader())
            }
        }

        dispatch(showPageLoader())
        fetch_info();

    }, []);

    const handleSubmit = async (value: any) => {

        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/update-company-info`, {
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
            <PageTitle text="Company Info" show_back={true} />
            <div className='container m-auto max-w-[650px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Provide your company info.</div>
                            <div className=''>This will be used in the contact us page, header and footer of the
                                client side of the website</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>
                            <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                                <Form className='w-full'>
                                    <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>

                                        <div className='col-span-1 sm:col-span-2'>
                                            <label htmlFor="company_name" className='form-label'>Company Name</label>
                                            <Field type="text" name="company_name" className='form-field' placeholder='Company Name' />
                                            <ErrorMessage name="company_name" component="div" />
                                        </div>

                                        <div className='col-span-1 sm:col-span-1'>
                                            <label htmlFor="mls_office_key" className='form-label'>MLS Office Key</label>
                                            <Field type="text" name="mls_office_key" className='form-field' placeholder="MLS Office Key" />
                                            <ErrorMessage name="mls_office_key" component="div" />
                                            <small className='w-full'>Used to fetch <b>Homes we've sold</b></small>
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="default_email" className='form-label'>Default Email</label>
                                            <Field type="email" name="default_email" className='form-field' placeholder="Default Email" />
                                            <ErrorMessage name="default_email" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="phone_number" className='form-label'>Phone Number</label>
                                            <Field type="tel" name="phone_number" className='form-field' placeholder="Phone Number" />
                                            <ErrorMessage name="phone_number" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="contact_us_email" className='form-label'>Contact Us Email</label>
                                            <Field type="email" name="contact_us_email" className='form-field' placeholder="Contact Us Receiving Email" />
                                            <ErrorMessage name="contact_us_email" component="div" />
                                            <small className='w-full'>Will receive contact us messages</small>
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="buying_email" className='form-label'>Ready To Buy Email</label>
                                            <Field type="email" name="buying_email" className='form-field' placeholder="Ready To Buy Receiving Email" />
                                            <ErrorMessage name="buying_email" component="div" />
                                            <small className='w-full'>Will receive ready to buy messages</small>
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="selling_req_email" className='form-label'>Selling Request Email</label>
                                            <Field type="email" name="selling_req_email" className='form-field' placeholder="Selling Request Receiving Email" />
                                            <ErrorMessage name="selling_req_email" component="div" />
                                            <small className='w-full'>Will receive selling request messages</small>
                                        </div>

                                        <div className='col-span-1 sm:col-span-2'>
                                            <label htmlFor="address_1" className='form-label'>Address 1</label>
                                            <Field type="text" name="address_1" className='form-field' placeholder='Address 1' />
                                            <ErrorMessage name="address_1" component="div" />
                                        </div>

                                        <div className='col-span-1 sm:col-span-2'>
                                            <label htmlFor="address_2" className='form-label'>Address 2</label>
                                            <Field type="text" name="address_2" className='form-field' placeholder='Address 2' />
                                            <ErrorMessage name="address_2" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="facebook" className='form-label'>Facebook</label>
                                            <Field type="text" name="facebook" className='form-field' placeholder="Facebook" />
                                            <ErrorMessage name="facebook" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="instagram" className='form-label'>Instagram</label>
                                            <Field type="text" name="instagram" className='form-field' placeholder="Instagram" />
                                            <ErrorMessage name="instagram" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="twitter" className='form-label'>X(Twitter)</label>
                                            <Field type="text" name="twitter" className='form-field' placeholder="X(Twitter)" />
                                            <ErrorMessage name="twitter" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="youtube" className='form-label'>YouTube</label>
                                            <Field type="text" name="youtube" className='form-field' placeholder="YouTube" />
                                            <ErrorMessage name="youtube" component="div" />
                                        </div>

                                        <div className='col-span-1 sm:col-span-2 mt-4'>
                                            <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right 
                                            hover:bg-gray-700 hover:drop-shadow-md'>
                                                Update Info
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
    )

}

export default CompanyInfo