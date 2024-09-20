"use client"

import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { hidePageLoader, showPageLoader } from '../GlobalRedux/user/userSlice'
import { useDispatch } from 'react-redux'
import { APIResponseProps, Automations } from '@/components/types'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment'
import * as Yup from 'yup';
import { Helpers } from '@/_lib/helpers';

const helpers = new Helpers();

const NewUserAutomationModal = ({ closeModal, user_id, setAddAutomationResponse }:
    { closeModal: () => void, user_id: number, setAddAutomationResponse: React.Dispatch<any> }) => {

    const dispatch = useDispatch();
    const [automations, setAutomations] = useState<Automations[]>([]);

    const initialValues = {
        automation_id: "",
    }

    const validationSchema = Yup.object({
        automation_id: Yup.string().trim().required("Select a valid automation to continue."),
    });

    const handleSubmit = async (value: any, actions: any) => {

        value = validationSchema.cast(value);
        value.user_id = user_id;

        closeModal();
        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(automations)/manage-campaign`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        }).then((resp): Promise<APIResponseProps> => {
            return resp.json();
        }).then(data => {
            setAddAutomationResponse(data);
        }).catch((e: any) => {
            alert(e.message)
            dispatch(hidePageLoader());
        });

    }

    useEffect(() => {

        const getAutomations = async () => {

            const payload = {
                paginated: false,
                search_type: "Active Automation Lists"
            }

            const dripPromise: Promise<Automations[]> = helpers.LoadAutomations(payload);
            const dripResp = await dripPromise;
            setAutomations(dripResp);

        }

        getAutomations();

    }, [])

    return (
        <div className='w-full'>
            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
                <Form className='w-full' autoComplete="off">

                    <div className='w-full'>
                        <label htmlFor="automation_id" className='form-label'>Automation</label>
                        <Field as="select" name="automation_id" className='form-field'>
                            <option value="">Select an automation</option>
                            {
                                automations.map((autom: Automations, index: number) => {
                                    return <option key={index} value={autom.automation_id}>{autom.name}</option>
                                })
                            }
                        </Field>
                        <ErrorMessage name="automation_id" component="div" className='text-red-500 text-sm' />
                    </div>

                    <div className='w-full mt-4'>
                        <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right hover:bg-gray-700 
                        hover:drop-shadow-md rounded'>
                            Add Automation
                        </button>
                    </div>
                </Form>
            </Formik>

        </div>
    )
}

export default NewUserAutomationModal