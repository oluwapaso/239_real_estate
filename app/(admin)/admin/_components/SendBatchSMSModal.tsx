"use client"

import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { APIResponseProps, CheckedItems } from '@/components/types'
import dynamic from 'next/dynamic'
import { Helpers } from '@/_lib/helpers'
import TempCodes from './TempCodes'
import { temp_codes } from '@/_lib/data'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import SMSTempLists from './SMSTemplateLists';

const helpers = new Helpers();
const SendBatchSMSModal = ({ closeModal, checkedItems, handleCheckAllChange }: {
    closeModal: () => void, checkedItems: CheckedItems, handleCheckAllChange: (uncheck_all?: string) => void
}) => {

    const [sms_body, setSMSBody] = useState("");
    const [template_name, setSMSTempName] = useState("");
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

        if (!sms_body || sms_body == "") {
            toast.error("Message body is required", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        //dispatch(showPageLoader());
        setIsSendingMsg(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(sms)/send-batch-sms`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_ids: trueKeys, sms_body, template_name: template_name }),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                setIsSendingMsg(false);
                throw new Error("Unable to queue batch SMS.")
            }
            return resp.json();

        }).then(data => {
            if (data.success) {

                toast.success(`${data.message}`, {
                    position: "top-center",
                    theme: "colored"
                });

                setSMSBody("");
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
            <div className='w-full border border-gray-200'>
                <textarea value={sms_body} name='sms_body' className='w-full h-[180px] resize-none border-0 px-5 py-4 focus:outline-none'
                    onChange={(e) => setSMSBody(e.target.value)} ref={textareaRef} placeholder='Write your text...' />
            </div>
            <div className='w-full py-5 px-4 flex justify-between items-center'>
                <div className='flex items-center'>
                    <div className='group relative w-36 h-11 mr-2'>
                        <div className='border border-primary rounded cursor-pointer px-3 py-2 h-full flex items-center text-primary hover:shadow-md'>Select Template</div>
                        <div className='absolute hidden bottom-[45px] group-hover:block bg-white shadow-xl z-20'>
                            <SMSTempLists setSMSTempBody={setSMSBody} setSMSTempName={setSMSTempName} />
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

                <input type="hidden" value={template_name} name='template_name' className='w-full border-0 focus:outline-none'
                    onChange={(e) => setSMSTempName(e.target.value)} placeholder='Template name' />
            </div>
        </div>
    )
}

export default SendBatchSMSModal