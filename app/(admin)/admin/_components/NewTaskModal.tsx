"use client"

import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { hidePageLoader, showPageLoader } from '../GlobalRedux/user/userSlice'
import { useDispatch } from 'react-redux'
import { APIResponseProps } from '@/components/types'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment'
import * as Yup from 'yup';

const NewTaskModal = ({ closeModal, user_id, setAddTaskResponse }:
    { closeModal: () => void, user_id: number, setAddTaskResponse: React.Dispatch<any> }) => {

    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const initialValues = {
        title: "",
        date: moment().format('YYYY-MM-DD'),
        time: "",
        time_hour: "1",
        time_minute: "00",
        time_part: "PM",
    }

    const validationSchema = Yup.object({
        title: Yup.string().trim().required("Provide a valid title."),
        date: Yup.string().trim().required("Provide a valid date.")
    });

    const CustomDatePicker = ({ field, form, ...props }: { field: any, form: any }) => {
        return (
            <DatePicker {...field} {...props} selected={(field.value && new Date(field.value)) || null}
                //onChange={val => form.setFieldValue(field.name, val)}
                onChange={(date: Date) => form.setFieldValue(field.name, moment(date).format('YYYY-MM-DD'))}
                minDate={new Date()}
                dateFormat="YYYY-MM-DD"
                isClearable={false}
                placeholderText="Select a date"
                showPopperArrow={false}
                shouldCloseOnSelect={true}
                className='form-field w-full' />
        );
    };

    const handleSubmit = async (value: any, actions: any) => {

        value = validationSchema.cast(value);
        if (!value.title || !value.date || !value.time_hour || !value.time_minute || !value.time_part) {
            alert("All fields are required.")
            return false;
        }

        value.user_id = user_id;
        value.time = `${value.time_hour}:${value.time_minute} ${value.time_part}`;

        closeModal();
        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(tasks)/manage-tasks`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        }).then((resp): Promise<APIResponseProps> => {
            return resp.json();
        }).then(data => {
            setAddTaskResponse(data);
        }).catch((e: any) => {
            alert(e.message)
            dispatch(hidePageLoader());
        });

    }

    return (
        <div className='w-full'>
            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
                <Form className='w-full' autoComplete="off">

                    <div className='w-full'>
                        <label htmlFor="title" className='form-label'>Title</label>
                        <Field type="text" name="title" className='form-field' placeholder='Title' />
                        <ErrorMessage name="title" component="div" className='text-red-500 text-sm' />
                    </div>

                    <div className='w-full mt-4 flex flex-col '>
                        <label htmlFor="date" className='form-label w-full'>Date</label>
                        <Field type="date" name="date" className='w-full' component={CustomDatePicker} auto />
                        <ErrorMessage name="date" component="div" className='text-red-500 text-sm' />
                    </div>

                    <div className='w-full mt-4 grid grid-cols-[repeat(2,1fr)_max-content] gap-3'>
                        <div>
                            <label htmlFor="time_hour" className='form-label'>Time</label>
                            <Field as="select" name="time_hour" className='form-field'>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
                            </Field>
                            <ErrorMessage name="time_hour" component="div" className='text-red-500 text-sm' />
                        </div>

                        <div>
                            <label htmlFor="time_minute" className='form-label !text-white'>-</label>
                            <Field as="select" name="time_minute" className='form-field'>
                                <option value="00">00</option>
                                <option value="15">15</option>
                                <option value="30">30</option>
                                <option value="45">45</option>
                            </Field>
                            <ErrorMessage name="time_minute" component="div" className='text-red-500 text-sm' />
                        </div>

                        <div>
                            <label htmlFor="time_part" className='form-label !text-white'>-</label>
                            <Field as="select" name="time_part" className='form-field'>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </Field>
                            <ErrorMessage name="time_part" component="div" className='text-red-500 text-sm' />
                        </div>
                    </div>

                    <div className='w-full mt-4'>
                        <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right hover:bg-gray-700 hover:drop-shadow-md'>
                            Add Task
                        </button>
                    </div>
                </Form>
            </Formik>

        </div>
    )
}

export default NewTaskModal