"use client"

import { Helpers } from '@/_lib/helpers';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import { APIResponseProps, User } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageTitle from '../../../_components/PageTitle';
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';
import { useSearchParams } from 'next/navigation';
import moment from 'moment';

const helpers = new Helpers();
const EditUserInfo = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const { is1Xm, is2Xm } = useCurrentBreakpoint();

    const search_params = useSearchParams();
    const user_id = search_params?.get("user_id");
    const dispatch = useDispatch();
    const [initialValues, setInitialValues] = useState({});
    const [lead_stages, setLeadStage] = useState<any[]>([]);

    useEffect(() => {

        const fetch_info = async () => {
            const userPromise: Promise<User> = helpers.LoadSingleUser(user_id as string);
            const user_info = await userPromise;

            if (user_info.user_id) {
                setInitialValues(() => {
                    return {
                        ...user_info,
                        birthday: moment(user_info.birthday).format("YYYY-MM-DD"),
                    }
                });
                dispatch(hidePageLoader());
            }
        }

        const fetch_comp = async () => {
            const compPromise = helpers.FetchCompanyInfo();
            const comp_info = await compPromise;

            if (comp_info.success && comp_info.data.lead_stages && comp_info.data.lead_stages.length) {
                let lead_stage = comp_info.data.lead_stages;
                setLeadStage(lead_stage);
            }
        }

        dispatch(showPageLoader());
        fetch_comp();
        fetch_info();

    }, []);

    const handleSubmit = async (value: any) => {

        dispatch(showPageLoader());
        value.user_id = user_id;
        console.log("value:", value)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(users)/update-lead-info`, {
            method: "PATCH",
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
            <PageTitle text="User Info" show_back={true} />
            <div className='container m-auto max-w-[650px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Update user info.</div>
                            <div className=''></div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>
                            <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                                <Form className='w-full'>
                                    <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>

                                        <div className='col-span-1 sm:col-span-1'>
                                            <label htmlFor="firstname" className='form-label'>First Name</label>
                                            <Field type="text" name="firstname" className='form-field' placeholder="First Name" />
                                            <ErrorMessage name="firstname" component="div" />
                                        </div>

                                        <div className='col-span-1 sm:col-span-1'>
                                            <label htmlFor="lastname" className='form-label'>Last Name</label>
                                            <Field type="text" name="lastname" className='form-field' placeholder="Last Name" />
                                            <ErrorMessage name="lastname" component="div" />
                                        </div>

                                        <div className='col-span-1 sm:col-span-2'>
                                            <label htmlFor="email" className='form-label'>Primary Email</label>
                                            <Field type="email" name="email" className='form-field' placeholder="Primary Email" />
                                            <ErrorMessage name="email" component="div" />
                                        </div>

                                        <div className='col-span-1 sm:col-span-2'>
                                            <label htmlFor="secondary_email" className='form-label'>Secondary Email</label>
                                            <Field type="email" name="secondary_email" className='form-field' placeholder="Secondary Email" />
                                            <ErrorMessage name="secondary_email" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="phone_1" className='form-label'>Phone 1</label>
                                            <Field type="tel" name="phone_1" className='form-field' placeholder="Phone 1" />
                                            <ErrorMessage name="phone_1" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="phone_2" className='form-label'>Phone 2</label>
                                            <Field type="tel" name="phone_2" className='form-field' placeholder="Phone 1" />
                                            <ErrorMessage name="phone_2" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="work_phone" className='form-label'>Work Phone</label>
                                            <Field type="tel" name="work_phone" className='form-field' placeholder="Work Phone" />
                                            <ErrorMessage name="work_phone" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="fax" className='form-label'>Fax</label>
                                            <Field type="tel" name="fax" className='form-field' placeholder="Fax" />
                                            <ErrorMessage name="fax" component="div" />
                                        </div>

                                        <div className='col-span-1 sm:col-span-2'>
                                            <label htmlFor="street_address" className='form-label'>Street Address</label>
                                            <Field type="text" name="street_address" className='form-field' placeholder='Street Address' />
                                            <ErrorMessage name="street_address" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="city" className='form-label'>City</label>
                                            <Field type="text" name="city" className='form-field' placeholder="City" />
                                            <ErrorMessage name="city" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="state" className='form-label'>State</label>
                                            <Field type="text" name="state" className='form-field' placeholder="State" />
                                            <ErrorMessage name="state" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="zip" className='form-label'>Zip Code</label>
                                            <Field type="text" name="zip" className='form-field' placeholder="Zip Code" />
                                            <ErrorMessage name="zip" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="price_range" className='form-label'>Price Range</label>
                                            <Field type="text" name="price_range" className='form-field' placeholder="Price Range" />
                                            <ErrorMessage name="price_range" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="spouse_name" className='form-label'>Spouse Name</label>
                                            <Field type="text" name="spouse_name" className='form-field' placeholder="Spouse Name" />
                                            <ErrorMessage name="spouse_name" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="birthday" className='form-label'>Birthday</label>
                                            <Field type="date" name="birthday" className='form-field' placeholder="Birthday" />
                                            <ErrorMessage name="birthday" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="facebook" className='form-label'>Facebook</label>
                                            <Field type="text" name="facebook" className='form-field' placeholder="Facebook" />
                                            <ErrorMessage name="facebook" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="linkedin" className='form-label'>Linkedin</label>
                                            <Field type="text" name="linkedin" className='form-field' placeholder="Linkedin" />
                                            <ErrorMessage name="linkedin" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="twitter" className='form-label'>X(Twitter)</label>
                                            <Field type="text" name="twitter" className='form-field' placeholder="X(Twitter)" />
                                            <ErrorMessage name="twitter" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="tictoc" className='form-label'>Tic Toc</label>
                                            <Field type="text" name="tictoc" className='form-field' placeholder="Tic Toc" />
                                            <ErrorMessage name="tictoc" component="div" />
                                        </div>

                                        <div className='col-span-1'>
                                            <label htmlFor="whatsapp" className='form-label'>Whatsapp</label>
                                            <Field type="text" name="whatsapp" className='form-field' placeholder="Whatsapp" />
                                            <ErrorMessage name="whatsapp" component="div" />
                                        </div>



                                        <div className='col-span-1'>
                                            <label htmlFor="lead_stage" className='form-label'>Lead Stage</label>
                                            <Field as="select" name="lead_stage" className='form-field'>
                                                <option value="">-- select an option --</option>
                                                {
                                                    lead_stages.map((lead_stage, index) => {
                                                        return (
                                                            <option value={lead_stage}>{lead_stage}</option>
                                                        )
                                                    })
                                                }
                                            </Field>
                                            <ErrorMessage name="lead_stage" component="div" />
                                        </div>

                                        <div className='col-span-1 sm:col-span-2'>
                                            <label htmlFor="background" className='form-label'>Background</label>
                                            <Field as="textarea" name="background" className='form-field h-[200px] resize-none' placeholder="Background" />
                                            <ErrorMessage name="background" component="div" />
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

export default EditUserInfo