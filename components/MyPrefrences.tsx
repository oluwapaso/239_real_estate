"use client"

import { ErrorMessage, Field, Form, Formik } from 'formik'
import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { APIResponseProps } from './types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaAsterisk } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Helpers } from '@/_lib/helpers';
import Swal from 'sweetalert2';

const helper = new Helpers();
const MyPrefrences = () => {

    const { data: session, update } = useSession();
    const user = session?.user as any;
    const [initialValues, setInitialValues] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!user) return;

        const updatedUser = { ...user };

        if (updatedUser?.sub_to_updates && updatedUser?.sub_to_updates != "") {
            updatedUser.sub_to_updates = updatedUser.sub_to_updates === "true";
        }

        if (updatedUser?.sub_to_mailing_lists && updatedUser?.sub_to_mailing_lists != "") {
            updatedUser.sub_to_mailing_lists = updatedUser.sub_to_mailing_lists === "true";
        }

        setInitialValues(updatedUser);
    }, [user]);

    const handleSubmit = async (value: any) => {

        if (!helper.validateEmail(value.email)) {
            toast.error("Provide a valid email address in primry email field.", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        if (!value.firstname || !value.lastname || !value.phone_1 || !value.email) {
            toast.error("Fields marked with asterisk are required.", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        setIsSubmitting(true);

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(users)/update-info`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.success) {

                setInitialValues(data.data);
                update(data.data);

                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });
    }

    const deleteAccount = async () => {
        const result = await Swal.fire({
            title: "This action will be permanent and data cannot be recovered after deletion.",
            text: "Are you sure you want to proceed?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Proceed',
        });

        if (result.isConfirmed) {

            setIsDeleting(true);
            toast.dismiss();

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/(users)/delete-account`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "user_id": user.user_id
                }),
            }).then((resp): Promise<APIResponseProps> => {
                setIsDeleting(false);
                return resp.json();
            }).then(data => {
                if (data.success) {
                    signOut();
                } else {
                    toast.error("An error occured. " + data.message, {
                        position: "top-center",
                        theme: "colored"
                    });
                }
            });

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    return (
        <div className='container mx-auto max-w-[900px] text-left'>
            <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                <Form className='w-full'>
                    <h1 className='w-full font-play-fair-display text-2xl sm:text-3xl md:text-4xl'>Contact Information</h1>
                    <div className='w-full grid grid-cols-1 xs:grid-cols-2 gap-4 gap-y-4 xs:gap-y-8 mt-4'>
                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='firstname'>
                                <span>First Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <Field type="text" name="firstname" className='form-field' placeholder='First Name' />
                            <ErrorMessage name="firstname" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='lastname'>
                                <span>Last Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <Field name="lastname" className='form-field' placeholder="Last Name" />
                            <ErrorMessage name="lastname" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='email'>
                                <span>Primary Email</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <Field type="email" name="email" className='form-field' placeholder='Primary Email' />
                            <ErrorMessage name="email" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='secondary_email'>
                                <span>Secondary Email</span>
                            </label>
                            <Field type="email" name="secondary_email" className='form-field' placeholder='Secondary Email' />
                            <ErrorMessage name="secondary_email" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='phone_1'>
                                <span>Primary Phone Number</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <Field type="tel" name="phone_1" className='form-field' placeholder='Primary Phone Number' />
                            <ErrorMessage name="phone_1" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='phone_2'>
                                <span>Secondary Phone Number</span>
                            </label>
                            <Field type="tel" name="phone_2" className='form-field' placeholder='Secondary Phone Number' />
                            <ErrorMessage name="phone_2" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='work_phone'>
                                <span>Work Phone Number</span>
                            </label>
                            <Field type="tel" name="work_phone" className='form-field' placeholder='Work Phone Number' />
                            <ErrorMessage name="work_phone" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='fax'>
                                <span>Fax Number</span>
                            </label>
                            <Field type="tel" name="fax" className='form-field' placeholder='Fax Number' />
                            <ErrorMessage name="fax" component="div" />
                        </div>

                    </div>

                    <h1 className='w-full font-play-fair-display text-2xl sm:text-3xl md:text-4xl mt-10'>Mailing Information</h1>
                    <div className='w-full grid grid-cols-1 xs:grid-cols-2 gap-4 gap-y-4 xs:gap-y-8 mt-4'>
                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='street_address'>
                                <span>Street Address</span>
                            </label>
                            <Field type="text" name="street_address" className='form-field' placeholder='Street Address' />
                            <ErrorMessage name="street_address" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='city'>
                                <span>City</span>
                            </label>
                            <Field type="text" name="city" className='form-field' placeholder='City' />
                            <ErrorMessage name="city" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='state'>
                                <span>State</span>
                            </label>
                            <Field type="text" name="state" className='form-field' placeholder='State' />
                            <ErrorMessage name="state" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='zip'>
                                <span>Zip Code</span>
                            </label>
                            <Field type="number" name="zip" className='form-field' placeholder='Zip Code' />
                            <ErrorMessage name="zip" component="div" />
                        </div>

                        <div className=''>
                            <label className='w-full flex items-center font-semibold' htmlFor='country'>
                                <span>Country</span>
                            </label>
                            <Field type="text" name="country" className='form-field' placeholder='Country' />
                            <ErrorMessage name="country" component="div" />
                        </div>
                    </div>

                    <h1 className='w-full font-play-fair-display text-2xl sm:text-3xl md:text-4xl mt-10'>Subscription Information</h1>
                    <div className='w-full mt-4'>

                        <div className='w-full mt-2 mb-2 flex items-center select-none -ml-[10px]'>
                            <Field type='checkbox' className='styled-checkbox menu_cb' name={`sub_to_updates`} id={`sub_to_updates`} />
                            <label htmlFor='sub_to_updates' className='flex w-full'>
                                <span>Yes, I would like to receive listing updates matching my saved search criteria.</span>
                            </label>
                        </div>

                        <div className='w-full mt-2 mb-2 flex items-center select-none -ml-[10px]'>
                            <Field type='checkbox' className='styled-checkbox menu_cb' name={`sub_to_mailing_lists`} id={`sub_to_mailing_lists`} />
                            <label htmlFor='sub_to_mailing_lists' className='flex w-full'>
                                <span>I consent to receiving emails containing real estate related information from this site.
                                    I understand that I can unsubscribe at any time.</span>
                            </label>
                        </div>

                    </div>

                    <h1 className='w-full font-play-fair-display text-2xl md:text-3xl sm:text-4xl mt-10'>Delete Account</h1>
                    <div className='w-full mt-4 font-normal'>
                        <p className='w-full'>If you do not want to use this website anymore and you would like your account to be deleted, we're here to help.
                            Please note: You will not be able to reactivate your account to access any data added to your account including
                            saved searches, listings and messages.
                        </p>
                        <p className='mt-4 w-full'>If you would still like to send a request to have your account deleted you can click the "Delete My Account"
                            button below.
                        </p>

                        <div className='w-full mt-4'>
                            {
                                !isDeleting
                                    ? <div className='w-[200px] flex justify-center items-center py-3 px-4 bg-red-600 text-white 
                                        cursor-pointer hover:shadow-xl uppercase text-sm' onClick={deleteAccount}>Delete My Account</div>
                                    : <div className='w-[200px] flex justify-center items-center py-3 px-4 bg-red-400 text-white 
                                        cursor-not-allowed uppercase text-sm' onClick={deleteAccount}>
                                        <AiOutlineLoading3Quarters size={17} className='mr-2' /> <span>Please wait...</span>
                                    </div>
                            }

                        </div>
                    </div>

                    <div className='w-full mt-10 font-normal flex justify-end border-t border-gray-300 pt-4'>
                        {
                            !isSubmitting ? <button type="submit" className='w-[200px] flex justify-center items-center py-3 px-2 bg-primary text-white 
                            cursor-pointer hover:shadow-xl uppercase text-sm'>Update Information</button>
                                : <div className='w-[200px] flex justify-center items-center py-3 px-2 bg-primary/80 text-white 
                            cursor-pointer hover:shadow-xl uppercase text-sm'>
                                    <AiOutlineLoading3Quarters size={18} className='mr-2' /> <span>Please wait...</span></div>
                        }

                    </div>
                </Form>
            </Formik>
            {/** <ToastContainer /> **/}
        </div>
    )
}

export default MyPrefrences