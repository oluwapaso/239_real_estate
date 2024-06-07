"use client"

import { ErrorMessage, Field, Form, Formik } from 'formik'
import React from 'react'
import { hidePageLoader, showPageLoader } from '../GlobalRedux/user/userSlice'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { APIResponseProps } from '@/components/types'
import * as Yup from 'yup';

const ReplyComments = ({ closeModal, draft_id, comment_id, comment_parent }:
    { closeModal: () => void, draft_id: number, comment_id: number, comment_parent: string }) => {

    const dispatch = useDispatch();

    type initialValuesProps = {
        comments: string
    }

    const initialValues: initialValuesProps = {
        comments: "",
    }

    const validationSchema = Yup.object({
        comments: Yup.string().trim().required("Provide a valid reply.")
    });

    const handleSubmit = async (value: any, actions: any) => {

        value = validationSchema.cast(value);
        if (!comment_id || !draft_id) {
            toast.dismiss();
            toast.error("Fatal error.", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        if (!value.comments) {
            toast.dismiss();
            toast.error("Provide a valid reply.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        value.draft_id = draft_id;
        value.comment_id = comment_id;
        value.comment_parent = comment_parent;
        value.reply_by = "Admin";

        closeModal();
        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(blogs)/reply-blog-comment`, {
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

                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

                dispatch(hidePageLoader());

            } else {
                dispatch(hidePageLoader());
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                });
            }

        }).catch((e: any) => {
            dispatch(hidePageLoader());
            toast.error(`${e.message}`, {
                position: "top-center",
                theme: "colored"
            });
        });

    }

    return (
        <div className='w-full'>
            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
                <Form className='w-full'>
                    <div className='w-full'>
                        <Field as="textarea" name="comments" className='form-field h-[180px] resize-none' placeholder='Add your reply...' />
                        <ErrorMessage name="comments" component="div" />
                    </div>

                    <div className='w-full mt-4'>
                        <button type="submit" className='bg-gray-800 py-2 px-4 text-white float-right hover:bg-gray-700 hover:drop-shadow-md'>
                            Add Reply
                        </button>
                    </div>
                </Form>
            </Formik>
        </div>
    )
}

export default ReplyComments