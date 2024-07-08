"use client"

import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { APIResponseProps, CheckedItems } from '@/components/types'
import dynamic from 'next/dynamic'
import { Helpers } from '@/_lib/helpers'
import EmailTempLists from './EmailTempLists'
import TempCodes from './TempCodes'
import { temp_codes } from '@/_lib/data'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
const Ck_Editor_Component = dynamic(() => import("./Ckeditor"), { ssr: false })

const helpers = new Helpers();
const SendBatchEmailModal = ({ closeModal, checkedItems, handleCheckAllChange }: {
    closeModal: () => void, checkedItems: CheckedItems, handleCheckAllChange: (uncheck_all?: string) => void
}) => {

    const [from_email, setFromEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [mail_body, setMailBody] = useState("");
    const [template_name, setEmailTempName] = useState("");
    const [is_sending_msg, setIsSendingMsg] = useState(false);
    const [editorRef, setEditor] = useState<any>();
    const [show_eml_ins_code, setShowEmlInsCode] = useState(false);
    const eml_temp_code_ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        const fetch_info = async () => {
            const api_info_prms = helpers.FetchAPIInfo();
            const api_info = await api_info_prms

            if (api_info.success && api_info.data) {
                setFromEmail(api_info.data.sendgrid_mailer);
            }
        }

        fetch_info();

    }, []);

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

    const sendEmail = () => {

        toast.dismiss();

        if (!helpers.validateEmail(from_email)) {
            toast.error("Provide a valid from email", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const users = Object.entries(checkedItems);
        const trueKeys = users.filter(([key, user]) => user).map(([key]) => key);
        const num_items = trueKeys.length;

        toast.dismiss();
        if (num_items < 1) {
            toast.error("Select at least one lead to send message to", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        if (!subject || subject == "" || !mail_body || mail_body == "") {
            toast.error("All fields are required", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        //dispatch(showPageLoader());
        setIsSendingMsg(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(emails)/send-batch-email`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from_email, user_ids: trueKeys, subject, mail_body, template_name: template_name, mailer: "Sendgrid" }),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                setIsSendingMsg(false);
                throw new Error("Unable to queue batch email.")
            }
            return resp.json();

        }).then(data => {
            if (data.success) {

                toast.success(`${data.message}`, {
                    position: "top-center",
                    theme: "colored"
                });

                setMailBody("");
                setSubject("");
                setIsSendingMsg(false);
                handleCheckAllChange("Yes");
                closeModal();

            } else {
                toast.error(`${data.message}`, {
                    position: "top-center",
                    theme: "colored"
                });
            }

        }).catch((e: any) => {
            toast.error(`${e.message}`, {
                position: "top-center",
                theme: "colored"
            });
        });

    }

    return (
        <div className='w-full bg-white'>
            <div className='full flex border-b border-gray-100 py-3 px-3'>
                <div className='font-semibold mr-2'>From:</div>
                <div className='flex-grow'>
                    <input type='email' value={from_email} name='from_email' className='w-full border-0 focus:outline-none'
                        onChange={(e) => setFromEmail(e.target.value)} placeholder='example@your-verified-domain.com' />
                </div>
            </div>
            <div className='full flex border-b border-gray-100 py-3 px-3'>
                <div className='font-semibold mr-2'>Subject:</div>
                <div className='flex-grow'>
                    <input type='text' value={subject} name='subject' className='w-full border-0 focus:outline-none'
                        onChange={(e) => setSubject(e.target.value)} placeholder='Subject' />
                </div>
            </div>
            <div className='w-full border border-gray-100 border-r-0 border-l-0'>
                <Ck_Editor_Component data={mail_body} onDataChange={handleDataChange} setEditor={setEditor} />
            </div>
            <div className='w-full py-5 px-4 flex justify-between items-center'>
                <div className='flex items-center'>
                    <div className='group relative w-36 h-11 mr-2'>
                        <div className='border border-primary rounded cursor-pointer px-3 py-2 h-full flex items-center text-primary hover:shadow-md'>Select Template</div>
                        <div className='absolute hidden bottom-[45px] group-hover:block bg-white shadow-xl z-20'>
                            <EmailTempLists setEmailTempSubject={setSubject} setEmailTempBody={setMailBody} setEmailTempName={setEmailTempName} />
                        </div>
                    </div>

                    <div className='relative h-11'>
                        <div className='border border-primary px-3 py-2 h-full flex items-center rounded text-primary hover:shadow-md cursor-pointer'
                            onClick={() => setShowEmlInsCode(!show_eml_ins_code)}>
                            Insert Code
                        </div>

                        <div ref={eml_temp_code_ref} className={`w-[320px] flex-col h-[350px] overflow-x-0hidden overflow-y-scroll border 
                        bg-white border-primary shadow-lg absolute z-20 right-0 bottom-full ${show_eml_ins_code ? 'flex' : 'hidden'} pb-10`}>
                            {
                                temp_codes.map((code, index) => {
                                    return (<TempCodes key={index} code={code} insertTextAtCaret={insertTextAtCaret} />)
                                })
                            }
                        </div>
                    </div>
                </div>

                {!is_sending_msg && <div className='px-6 py-2 h-11 rounded flex items-center justify-center bg-sky-700 text-white 
                cursor-pointer' onClick={sendEmail}>
                    Send Email
                </div>}

                {is_sending_msg && <div className='px-6 py-2 h-11 rounded flex items-center justify-center bg-sky-700/50 text-white 
                cursor-not-allowed'>
                    <AiOutlineLoading3Quarters className='animate-spin mr-2' /> <span>Please Wait...</span>
                </div>}

                <input type="hidden" value={template_name} name='template_name' className='w-full border-0 focus:outline-none'
                    onChange={(e) => setEmailTempName(e.target.value)} placeholder='Template name' />
            </div>
        </div>
    )
}

export default SendBatchEmailModal