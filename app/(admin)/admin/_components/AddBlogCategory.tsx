"use client"

import { ErrorMessage, Field, Form, Formik } from 'formik'
import React from 'react'
import { hidePageLoader, showPageLoader } from '../GlobalRedux/user/userSlice'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { APIResponseProps } from '@/components/types'
import * as Yup from 'yup';

const AddBlogCategory = ({ closeModal, setRefreshPage, refresh_page }: {
    closeModal: () => void, refresh_page: boolean, setRefreshPage: React.Dispatch<React.SetStateAction<boolean>>
}) => {

    const dispatch = useDispatch();
    type initialValuesProps = {
        category_name: string
    }

    const initialValues: initialValuesProps = {
        category_name: "",
    }

    const validationSchema = Yup.object({
        category_name: Yup.string().trim().required("Provide a valid category name.")
    });

    const handleSubmit = async (value: any, actions: any) => {

        if (!value.category_name) {
            toast.dismiss();
            toast.error("Provide a valid category name.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        closeModal();
        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(blogs)/manage-categories`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        }).then((resp): Promise<APIResponseProps> => {
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.success) {

                actions.setValues(initialValues);
                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

                setRefreshPage(!refresh_page);

            } else {
                dispatch(hidePageLoader());
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });

    }

    return (
        <div className='w-full'>
            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
                <Form className='w-full'>
                    <div className='w-full'>
                        <label htmlFor="category_name" className='form-label'>Category Name</label>
                        <Field type="text" name="category_name" className='form-field' placeholder='Category Name' normalize={(value: string) => value.trim()} />
                        <ErrorMessage name="category_name" component="div" className='text-red-500 text-sm' />
                    </div>

                    <div className='w-full mt-4'>
                        <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right hover:bg-gray-700 hover:drop-shadow-md'>
                            Add Category
                        </button>
                    </div>
                </Form>
            </Formik>
        </div>
    )
}

export default AddBlogCategory