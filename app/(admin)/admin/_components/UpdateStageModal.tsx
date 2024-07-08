"use client"

import { ErrorMessage, Field, Form, Formik } from 'formik'
import React from 'react'
import { hidePageLoader, showPageLoader } from '../GlobalRedux/user/userSlice'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { APIResponseProps, CheckedItems } from '@/components/types'
import * as Yup from 'yup';

const UpdateStageModal = ({ closeModal, all_lead_stage, lead_stage, TriggerStage, checkedItems }:
    {
        closeModal: () => void, all_lead_stage: any[], lead_stage: string, TriggerStage: (stage: string) => void, checkedItems: CheckedItems
    }) => {

    const dispatch = useDispatch();
    type initialValuesProps = {
        lead_stage: string
    }

    const initialValues: initialValuesProps = {
        lead_stage: "",
    }

    const validationSchema = Yup.object({
        lead_stage: Yup.string().trim().required("Provide a valid lead stage.")
    });

    const handleSubmit = async (value: any, actions: any) => {

        if (!value.lead_stage) {
            toast.dismiss();
            toast.error("Provide a valid automation name.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        const users = Object.entries(checkedItems);
        const trueKeys = users.filter(([key, user]) => user).map(([key]) => key);

        const num_items = trueKeys.length;
        value.user_ids = trueKeys;

        toast.dismiss();
        if (num_items < 1) {
            toast.error("Select at least one lead to update", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        closeModal();
        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(users)/update-lead-status`, {
            method: "PATCH",
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

                TriggerStage(lead_stage);

            } else {
                dispatch(hidePageLoader());
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        }).catch((e: any) => {
            toast.error(`${e.message}`, {
                position: "top-center",
                theme: "colored"
            })
            dispatch(hidePageLoader());
        })

    }

    return (
        <div className='w-full'>
            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
                <Form className='w-full'>
                    <div className='w-full'>
                        <label htmlFor="lead_stage" className='form-label'>Lead Stage</label>
                        <Field as="select" name="lead_stage" className='form-field'>
                            <option value="">-- select an option --</option>
                            {
                                all_lead_stage.map((lead_stage, index) => {
                                    return (
                                        <option key={index} value={lead_stage}>{lead_stage}</option>
                                    )
                                })
                            }
                        </Field>
                        <ErrorMessage name="lead_stage" component="div" className='text-red-600 mt-1 text-sm' />
                    </div>

                    <div className='w-full mt-4'>
                        <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right hover:bg-gray-700 hover:drop-shadow-md'>
                            Update Lead Stage
                        </button>
                    </div>
                </Form>
            </Formik>
        </div>
    )
}

export default UpdateStageModal