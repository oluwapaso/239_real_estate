"use client"

import React, { useEffect, useRef, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import { APIResponseProps } from '@/components/types';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import dynamic from 'next/dynamic';
import TempCodes from '../../../_components/TempCodes';
import { temp_codes } from '@/_lib/data';
const Ck_Editor_Component = dynamic(() => import("../../../_components/Ckeditor"), { ssr: false });

const AddNewTemplate = () => {

    const [template_type, setTempType] = useState("Email");
    const [sms_body, setSMSBody] = useState("");
    const [email_body, setMailBody] = useState("");
    const [editorRef, setEditor] = useState<any>();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [show_ins_code, setShowInsCode] = useState(false);
    const eml_temp_code_ref = useRef<HTMLDivElement | null>(null);

    const [initialValues, setInitialValues] = useState({
        template_type: template_type,
        template_name: "",
        email_subject: "",
        email_body: "",
        sms_body: sms_body
    });

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(hidePageLoader());
    }, []);

    const handleType = (type: string) => {
        setTempType(type);
    }

    const handleDataChange = (data: string) => {
        setMailBody(data);
    };

    const insertTextAtCaret = (text: string) => {
        if (editorRef) {
            const edtr = editorRef.current;
            edtr.model.change((writer: any) => {
                const insertPosition = edtr.model.document.selection.getFirstPosition();
                writer.insert(` ${text} `, insertPosition);

                // Move the caret to the position after the inserted text
                const endPosition = writer.createPositionAt(insertPosition.parent, insertPosition.offset + (text.length + 2));
                writer.setSelection(endPosition);
            });

            // Focus the editor
            edtr.editing.view.focus();
        }
    };

    const insertInSMSCaret = (insertText: string) => {
        if (textareaRef.current) {

            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const newText = sms_body.substring(0, start) + ` ${insertText} ` + sms_body.substring(end);
            setSMSBody(newText);

            // Update caret position
            const newCaretPosition = start + (insertText.length + 2);
            requestAnimationFrame(() => {
                textarea.selectionStart = newCaretPosition;
                textarea.selectionEnd = newCaretPosition;
            });

            textarea.focus();

        }
    };

    const handleSubmit = async (value: any, onSubmit: any) => {

        if (!value.template_name) {

            toast.dismiss();
            toast.error("Provide a valid template name and body.", {
                position: "top-center",
                theme: "colored"
            });

            return false;

        }

        value.template_type = template_type;
        value.email_body = email_body;
        value.sms_body = sms_body;

        if (template_type == "SMS") {
            value.email_body = "";
        } else {
            value.sms_body = "";
        }

        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(templates)/manage-templates`, {
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
                });

                onSubmit.resetForm();
            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });
    }

    useEffect(() => {

        const handleClickOutside = (e: MouseEvent) => {
            if (eml_temp_code_ref.current && !eml_temp_code_ref.current.contains(e.target as Node)) {
                setShowInsCode(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [eml_temp_code_ref]);


    return (
        <div className='w-full'>
            <PageTitle text="Add Template" show_back={true} />
            <div className='container m-auto max-w-[650px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Templates.</div>
                            <div className=''>Add new email/SMS templates.</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                            <div className='w-full mb-4'>
                                <label htmlFor="template_type" className='form-label'>Template Type</label>
                                <select value={template_type} name='template_type' className='form-field' onChange={(e) => handleType(e.target.value)}>
                                    <option value="Email">Email</option>
                                    <option value="SMS">SMS</option>
                                </select>
                            </div>

                            {
                                template_type == "Email" && <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                                    <Form className='w-full'>
                                        <div className='w-full grid grid-cols-1 gap-4'>

                                            <div className=''>
                                                <label htmlFor="template_name" className='form-label'>Name</label>
                                                <Field type="text" name="template_name" className='form-field' placeholder="Name" />
                                                <ErrorMessage name="template_name" component="div" />
                                            </div>

                                            <div className=''>
                                                <label htmlFor="email_subject" className='form-label'>Subject</label>
                                                <Field type="text" name="email_subject" className='form-field' placeholder="Subject" />
                                                <ErrorMessage name="email_subject" component="div" />
                                            </div>

                                            <div className=''>
                                                <label htmlFor="email_body" className='form-label'>Body</label>
                                                <Ck_Editor_Component data={email_body} onDataChange={handleDataChange}
                                                    height="500px" setEditor={setEditor} />
                                            </div>

                                            <div className='mt-2 flex justify-between items-center'>
                                                <div className='relative'>
                                                    <div className='border border-gray-400 py-2 px-4 rounded shadow hover:shadow-xl 
                                                    cursor-pointer' onClick={() => setShowInsCode(!show_ins_code)}>
                                                        Insert Template Code
                                                    </div>

                                                    <div ref={eml_temp_code_ref} className={`w-[320px] flex-col h-[350px] overflow-x-0hidden overflow-y-scroll border bg-white 
                                                    border-gray-300 shadow-lg absolute right-0 bottom-full ${show_ins_code ? 'flex' : 'hidden'} pb-10`}>
                                                        {
                                                            temp_codes.map((code, index) => {
                                                                return (<TempCodes key={index} code={code} insertTextAtCaret={insertTextAtCaret} />)
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                                <button type="submit" className='bg-gray-800 py-3 px-4 text-white hover:bg-gray-700 
                                                hover:drop-shadow-md'>
                                                    Add Template
                                                </button>

                                            </div>
                                        </div>
                                    </Form>
                                </Formik>
                            }

                            {
                                template_type == "SMS" && <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                                    <Form className='w-full'>
                                        <div className='w-full grid grid-cols-1 gap-4'>

                                            <div className=''>
                                                <label htmlFor="template_name" className='form-label'>Name</label>
                                                <Field type="text" name="template_name" className='form-field' placeholder="Name" />
                                                <ErrorMessage name="template_name" component="div" />
                                            </div>

                                            <div className=''>
                                                <label htmlFor="sms_body" className='form-label'>SMS Body</label>
                                                <textarea placeholder="SMS Body" value={sms_body} name='sms_body' className='form-field h-[240px] resize-none'
                                                    onChange={(e) => setSMSBody(e.target.value)} ref={textareaRef} />
                                            </div>

                                            <div className='mt-2 flex justify-between items-center'>
                                                <div className='relative'>
                                                    <div className='border border-gray-400 py-2 px-4 rounded shadow hover:shadow-xl 
                                                    cursor-pointer' onClick={() => setShowInsCode(!show_ins_code)}>
                                                        Insert Template Code
                                                    </div>

                                                    <div ref={eml_temp_code_ref} className={`w-[320px] flex-col h-[350px] overflow-x-0hidden overflow-y-scroll border bg-white 
                                                    border-gray-300 shadow-lg absolute right-0 bottom-full ${show_ins_code ? 'flex' : 'hidden'} pb-10`}>
                                                        {
                                                            temp_codes.map((code, index) => {
                                                                return (<TempCodes key={index} code={code} insertTextAtCaret={insertInSMSCaret} />)
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                                <button type="submit" className='bg-gray-800 py-3 px-4 text-white hover:bg-gray-700 
                                                hover:drop-shadow-md'>
                                                    Add Template
                                                </button>

                                            </div>
                                        </div>
                                    </Form>
                                </Formik>
                            }
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    );

}

export default AddNewTemplate