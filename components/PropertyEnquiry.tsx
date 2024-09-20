"use client"

import { ErrorMessage, Field, Form, Formik, useFormikContext } from 'formik'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { APIResponseProps } from '@/components/types'
import * as Yup from 'yup';
import { FaAsterisk } from 'react-icons/fa'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { Helpers } from '@/_lib/helpers'
import { useParams } from 'next/navigation'
import ErrorComponent from './ErrorComponent'
import { useSession } from 'next-auth/react'

const helper = new Helpers();
const MakeInquiry = ({ closeModal, type, address, listing_key }: {
    closeModal: () => void, type: string, address: string,
    listing_key: string
}) => {

    type initialValuesType = {
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
        subject: string;
        comments: string;
        prop_url: string;
        tour_type: string;
        type: string;
        mailer: string;
        message_type: string;
    }

    const params = useParams();
    const slug = params?.slug as string;

    let btn_text = "";
    let subject = "More Info";
    let comments = "";
    if (type == "Info") {
        btn_text = "Send Inquiry";
        subject = "More Info";
        comments = ""
    } else if (type == "Question") {
        btn_text = "Send Inquiry";
        subject = "Question";
        comments = ""
    } else if (type == "Question 2") {
        btn_text = "Send Question";
        subject = "More Info";
        comments = `Please send me more information regarding ${address}`;
    } else if (type == "Tour") {
        btn_text = "Request Tour";
        comments = `I'd like a video tour of ${address} (MLS® #${listing_key}).Thank you!`;
    }

    const { data: session } = useSession();
    const user = session?.user as any;

    let message_type = "Enquiry";
    if (type == "Tour") {
        message_type = "Tour Request";
    }

    const initialValues: initialValuesType = {
        first_name: user.firstname || "",
        last_name: user.lastname || "",
        email: user.email || "",
        phone_number: user.phone_1 || "",
        subject: subject,
        comments: comments,
        prop_url: "",
        tour_type: "Video",
        type: type,
        mailer: "Sendgrid",
        message_type: message_type
    }

    const validationSchema = Yup.object({
        first_name: Yup.string().trim().required("Provide a valid first name."),
        last_name: Yup.string().trim().required("Provide a valid last name."),
        email: Yup.string().email("Provide a valid email address.").trim().required("Provide a valid email address."),
        phone_number: Yup.string().trim().required("Provide a valid phone number."),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (value: any, actions: any) => {

        if (!value.first_name || !value.last_name || !value.email || !value.phone_number) {
            toast.dismiss();
            toast.error("Fields marked with asterisks are required.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        if (!helper.validateEmail(value.email)) {
            toast.dismiss();
            toast.error("Provide a valid email address.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        setIsSubmitting(true);
        value.prop_url = `${window.location.href}/${slug}`;
        value.user_id = user.user_id;

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(emails)/make-inquiry`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.message == "Email sent!") {

                actions.setValues(initialValues);
                toast.success("Request received successfully, we will get back to you as soon as possible.", {
                    position: "top-center",
                    theme: "colored"
                });

                closeModal();

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
            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
                {({ values, setFieldValue }) => {

                    useEffect(() => {

                        if (type == "Tour") {
                            if (values.tour_type == "In-Person") {
                                setFieldValue("comments", `I'd like an in-person tour of ${address} (MLS® #${listing_key}).Thank you!`);
                            } else if (values.tour_type == "Video") {
                                setFieldValue("comments", `I'd like a video tour of ${address} (MLS® #${listing_key}).Thank you!`);
                            }
                        }

                    }, [values, setFieldValue]);

                    return (<Form className='w-full'>
                        <div className='w-full grid grid-cols-2 gap-4'>
                            <div className=''>
                                <label htmlFor="first_name" className='form-label !font-normal flex items-center'>
                                    <span>First Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                </label>
                                <Field type="text" name="first_name" className='form-field' placeholder='First Name' normalize={(value: string) => value.trim()} />
                                <ErrorMessage name="first_name" component={ErrorComponent} />
                            </div>

                            <div className=''>
                                <label htmlFor="last_name" className='form-label !font-normal flex items-center'>
                                    <span>Last Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                </label>
                                <Field type="text" name="last_name" className='form-field' placeholder='Last Name' normalize={(value: string) => value.trim()} />
                                <ErrorMessage name="last_name" component={ErrorComponent} />
                            </div>
                        </div>

                        <div className='w-full grid grid-cols-2 gap-4 mt-8'>
                            <div className=''>
                                <label htmlFor="email" className='form-label !font-normal flex items-center'>
                                    <span>Email</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                </label>
                                <Field type="text" name="email" className='form-field' placeholder='Email' normalize={(value: string) => value.trim()} />
                                <ErrorMessage name="email" component={ErrorComponent} />
                            </div>

                            <div className=''>
                                <label htmlFor="phone_number" className='form-label !font-normal flex items-center'>
                                    <span>Phone Number</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                </label>
                                <Field type="text" name="phone_number" className='form-field' placeholder='Phone Number' normalize={(value: string) => value.trim()} />
                                <ErrorMessage name="phone_number" component={ErrorComponent} />
                            </div>
                        </div>

                        <div className={`w-full mt-8  ${(type == "Info" || type == "Question" || type == "Question 2") ? "block" : "hidden"}`}>
                            <label htmlFor="subject" className='form-label !font-normal'>Subject</label>
                            <Field as="select" name="subject" className='form-field' placeholder='Subject' normalize={(value: string) => value.trim()}>
                                <option value="More Info">I would like to request more information regarding this property</option>
                                <option value="Contact">I am inquiring about selling a property</option>
                                <option value="Question">I have a real estate question</option>
                            </Field>
                            <ErrorMessage name="subject" component="div" />
                        </div>

                        <div className='w-full mt-8'>
                            <label htmlFor="comments" className='form-label !font-normal'>Additional Comments or Information</label>
                            <Field as="textarea" name="comments" className='form-field resize-none h-[140px]' placeholder='comments'
                                normalize={(value: string) => value.trim()} />
                            <ErrorMessage name="comments" component="div" />
                        </div>

                        <div className={`w-full mt-8 ${(type == "Info" || type == "Question" || type == "Question 2") ? "hidden" : "block"}`}>
                            <div className='w-full'>Select Type of Property Tour</div>
                            <div className='flex items-center'>
                                <Field type="radio" name="tour_type" id="tour_type_1" className='styled-checkbox fomik-checkbox' value="In-Person"
                                    checked={values.tour_type.includes('In-Person')} />
                                <label htmlFor="tour_type_1">In-Person</label>
                            </div>

                            <div className='flex items-center mt-2'>
                                <Field type="radio" name="tour_type" id="tour_type_2" className='styled-checkbox fomik-checkbox' value="Video"
                                    checked={values.tour_type.includes('Video')} />
                                <label htmlFor="tour_type_2">Video</label>
                            </div>
                        </div>

                        <div className='w-full mt-4 mb-4'>
                            <button type="submit" className={`bg-gray-800 py-3 px-6 text-white float-right hover:bg-gray-700 cursor-pointer
                        hover:drop-shadow-md font-light flex items-center ${isSubmitting ? "opacity-55 cursor-not-allowed" : null}`}
                                disabled={isSubmitting ? true : false}>
                                {
                                    isSubmitting
                                        ? <><AiOutlineLoading3Quarters size={18} className='mr-2 animate-spin' /> <span>Please Wait...</span></>
                                        : btn_text
                                }
                            </button>
                        </div>
                    </Form>
                    )
                }}
            </Formik>
        </div>
    )
}

export default MakeInquiry