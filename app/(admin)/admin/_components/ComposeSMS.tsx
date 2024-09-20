"use client"

import React, { useRef, useState } from 'react'
import TempCodes from './TempCodes';
import { temp_codes } from '@/_lib/data';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import SMSTempLists from './SMSTemplateLists';
import { toast } from 'react-toastify';
import { APIResponseProps } from '@/components/types';

function ComposeSMS({ phone_number, user_id, setRefreshActivities }:
    { phone_number: string, user_id: number, setRefreshActivities: React.Dispatch<React.SetStateAction<boolean>> }) {

    const [to_number, setToNumber] = useState(phone_number);
    const [sms_body, setSMSBody] = useState("");
    const [is_sending_msg, setIsSendingMsg] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [show_eml_ins_code, setShowEmlInsCode] = useState(false);
    const eml_temp_code_ref = useRef<HTMLDivElement | null>(null);

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


    const sendSMS = () => {

        toast.dismiss();

        if (!to_number || to_number == "") {
            toast.error("Provide a valid to receipient number", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        if (!sms_body || sms_body == "") {
            toast.error("All fields are required", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        setIsSendingMsg(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(sms)/send-single-sms`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to_number, sms_body, user_id, message_type: "CRM Message" }),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSendingMsg(false);
            if (!resp.ok) {
                throw new Error("Unable to send sms.")
            }
            return resp.json();

        }).then(data => {
            if (data.success) {

                toast.success("SMS successfully sent", {
                    position: "top-center",
                    theme: "colored"
                });

                setSMSBody("");
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

    return (
        <div className='w-full bg-white'>
            <div className='full flex border-b border-gray-200 py-3 px-3'>
                <div className='font-semibold mr-2'>To:</div>
                <div className='flex-grow'><input type='text' value={to_number} name='to_number' className='w-full border-0 focus:outline-none'
                    onChange={(e) => setToNumber(e.target.value)} placeholder='744 838 8830' /></div>
            </div>
            <div className='w-full border border-gray-200 border-r-0 border-l-0'>
                <textarea value={sms_body} name='sms_body' className='w-full h-[180px] resize-none border-0 px-5 py-4 focus:outline-none'
                    onChange={(e) => setSMSBody(e.target.value)} ref={textareaRef} placeholder='Write your text...' />
            </div>
            <div className='w-full py-5 px-4 flex justify-between items-center'>
                <div className='flex items-center'>
                    <div className='group relative w-36 h-11 mr-2'>
                        <div className='border border-primary rounded cursor-pointer px-3 py-2 h-full flex items-center text-primary hover:shadow-md'>Select Template</div>
                        <div className='absolute hidden top-[45px] group-hover:block bg-white shadow-xl z-20'>
                            <SMSTempLists setSMSTempBody={setSMSBody} />
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
                                    return (<TempCodes key={index} code={code} insertTextAtCaret={insertInSMSCaret} />)
                                })
                            }
                        </div>
                    </div>
                </div>

                {!is_sending_msg && <div className='px-6 py-2 h-11 rounded flex items-center justify-center bg-sky-700 text-white 
                cursor-pointer' onClick={sendSMS}>
                    Send text
                </div>}

                {is_sending_msg && <div className='px-6 py-2 h-11 rounded flex items-center justify-center bg-sky-700/50 text-white 
                cursor-not-allowed'>
                    <AiOutlineLoading3Quarters className='animate-spin mr-2' />  <span>Please Wait...</span>
                </div>}
            </div>
        </div>
    )

}

export default ComposeSMS