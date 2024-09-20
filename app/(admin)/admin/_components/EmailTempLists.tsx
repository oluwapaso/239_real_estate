"use client"

import { Helpers } from '@/_lib/helpers';
import { TemplateLists } from '@/components/types';
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const helpers = new Helpers();
const EmailTempLists = ({ setEmailTempSubject, setEmailTempBody, setEmailTempName }:
    {
        setEmailTempSubject: React.Dispatch<React.SetStateAction<string>>,
        setEmailTempBody: React.Dispatch<React.SetStateAction<string>>,
        setEmailTempName?: React.Dispatch<React.SetStateAction<string>>
    }) => {

    const [templates, setTemplates] = useState<TemplateLists[]>([]);
    const [temp_fetched, setTempFetched] = useState(false);

    const payload = {
        paginated: false,
        search_type: "Template Lists",
        template_type: "Email",
    }

    useEffect(() => {

        const fetchTemplates = async () => {

            try {

                const tempPromise: Promise<TemplateLists[]> = helpers.LoadTemplates(payload);
                const tempResp = await tempPromise;

                setTemplates(tempResp);
                setTempFetched(true);

            } catch (e: any) {
                console.log(e.message)
            }

        }

        fetchTemplates();

    }, [])

    const handleClick = (temp_id: number, subject: string, body: string, template_name: string) => {
        setEmailTempSubject("");
        setEmailTempBody("");
        if (setEmailTempName) {
            setEmailTempName("");
        }
        // Set a temporary timeout to ensure states are cleared before updating
        const timer = setTimeout(() => {
            setEmailTempSubject(subject);
            setEmailTempBody(body);
            if (setEmailTempName) {
                setEmailTempName(template_name);
            }
        }, 100);

        // Clean up the timer if the component unmounts
        return () => clearTimeout(timer);
    }

    return (
        <div className='w-full min-w-[300px] divide-y divide-gray-100 border border-gray-100 overflow-y-auto max-h-[250px]'>
            {/* Loader */}
            {!temp_fetched && <div className=' col-span-full h-[120px] bg-white flex items-center justify-center'>
                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
            </div>}

            {/* Rows */}
            {
                temp_fetched && (
                    (templates.length && templates.length > 0)
                        ? (templates.map((temp) => {
                            return (
                                <div key={temp.template_id} className='cursor-pointer px-4 py-3 hover:bg-gray-100' onClick={() => {
                                    handleClick(temp.template_id, temp.email_subject, temp.email_body, temp.template_name)
                                }}>
                                    {temp.template_name}
                                </div>
                            )
                        }))
                        : <div className=' col-span-full h-[250px] bg-white flex items-center justify-center'>
                            No templates added yet.
                        </div>)
            }
        </div>
    )
}

export default EmailTempLists
