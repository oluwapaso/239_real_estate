"use client"

import { Helpers } from '@/_lib/helpers';
import { APIResponseProps } from '@/components/types';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'react-toastify';
import EmailTempLists from './EmailTempLists';
import { temp_codes } from '@/_lib/data';
import TempCodes from './TempCodes';
const Ck_Editor_Component = dynamic(() => import("./Ckeditor"), { ssr: false });

const helpers = new Helpers();
function ComposeMail({ user_email, user_id, setRefreshActivities }:
    { user_email: string, user_id: number, setRefreshActivities: React.Dispatch<React.SetStateAction<boolean>> }) {

    const [from_email, setFromEmail] = useState("");
    const [to_email, setToEmail] = useState(user_email);
    const [subject, setSubject] = useState("");
    const [mail_body, setMailBody] = useState("");
    const [is_sending_msg, setIsSendingMsg] = useState(false);
    const [editorRef, setEditor] = useState<any>();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
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

    const sendEmail = () => {

        toast.dismiss();

        if (!helpers.validateEmail(from_email)) {
            toast.error("Provide a valid from email", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        if (!helpers.validateEmail(to_email)) {
            toast.error("Provide a valid to email", {
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

        setIsSendingMsg(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(emails)/send-single-mail`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from_email, to_email, subject, mail_body, user_id, mailer: "Sendgrid", message_type: "CRM Message" }),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to send email.")
            }
            setIsSendingMsg(false);
            return resp.json();

        }).then(data => {
            if (data.success) {

                toast.success("Email successfully sent", {
                    position: "top-center",
                    theme: "colored"
                });

                setMailBody("");
                setSubject("");
                setIsSendingMsg(false);
                setRefreshActivities(true);

            } else {
                toast.error(data.message, {
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
                <div className='font-semibold mr-2'>To:</div>
                <div className='flex-grow'>
                    <input type='email' value={to_email} name='to_email' className='w-full border-0 focus:outline-none'
                        onChange={(e) => setToEmail(e.target.value)} placeholder='example@domain.com' />
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
                <Ck_Editor_Component data={mail_body} onDataChange={handleDataChange} height="240px" setEditor={setEditor} />
            </div>
            <div className='w-full py-5 px-4 flex justify-between items-center'>
                <div className='flex items-center'>
                    <div className='group relative w-36 h-11 mr-2'>
                        <div className='border border-primary rounded cursor-pointer px-3 py-2 h-full flex items-center text-primary hover:shadow-md'>Select Template</div>
                        <div className='absolute hidden top-[45px] group-hover:block bg-white shadow-xl z-20'>
                            <EmailTempLists setEmailTempSubject={setSubject} setEmailTempBody={setMailBody} />
                        </div>
                    </div>

                    <div className='relative h-11'>
                        <div className='border border-primary px-3 py-2 h-full flex items-center rounded text-primary hover:shadow-md cursor-pointer'
                            onClick={() => setShowEmlInsCode(!show_eml_ins_code)}>
                            Insert Code
                        </div>

                        <div ref={eml_temp_code_ref} className={`w-[320px] flex-col h-[350px] overflow-x-0hidden overflow-y-scroll border 
                        bg-white border-primary shadow-lg absolute z-20 right-0 top-full ${show_eml_ins_code ? 'flex' : 'hidden'} pb-10`}>
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
                    <AiOutlineLoading3Quarters className='animate-spin mr-2' />  <span>Please Wait...</span>
                </div>}
            </div>
        </div>
    )
}

export default ComposeMail