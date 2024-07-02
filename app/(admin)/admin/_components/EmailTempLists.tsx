"use client"

import { Helpers } from '@/_lib/helpers';
import { TemplateLists } from '@/components/types';
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const helpers = new Helpers();
const EmailTempLists = () => {

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

    return (
        <div className='w-full min-w-[300px]'>
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
                                <div key={temp.template_id}>Template #{temp.template_id}</div>
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
