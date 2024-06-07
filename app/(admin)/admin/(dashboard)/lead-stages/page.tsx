"use client"

import { Helpers } from '@/_lib/helpers';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/user/userSlice';
import { APIResponseProps } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageTitle from '../../_components/PageTitle';
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';
import { TagsInput } from "react-tag-input-component";

const helpers = new Helpers();
const CompanyInfo = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const { is1Xm, is2Xm } = useCurrentBreakpoint();

    const dispatch = useDispatch();
    const [stages, setStages] = useState<any[]>([]);

    useEffect(() => {

        const fetch_info = async () => {
            const comp_info_prms = helpers.FetchCompanyInfo();
            const comp_info = await comp_info_prms

            if (comp_info.success && comp_info.data) {
                if (comp_info.data.lead_stages && comp_info.data.lead_stages.length) {
                    setStages(comp_info.data.lead_stages || [])
                }
                dispatch(hidePageLoader())
            }
        }

        dispatch(showPageLoader())
        fetch_info();

    }, []);

    const handleSubmit = async () => {

        dispatch(showPageLoader());
        console.log(JSON.stringify(stages));
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/update-lead-stages`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lead_stages: stages }),
        }).then((resp): Promise<APIResponseProps> => {
            dispatch(hidePageLoader());
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.success) {
                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
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
            <PageTitle text="Lead Stages" show_back={true} />
            <div className='container m-auto max-w-[650px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Lead stages.</div>
                            <div className=''>Lead stages are an important part of every sales funnel and pipeline and
                                help you understand and distinguish your lead's sales journey</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>
                            <div className='w-full'>
                                <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>

                                    <div className='col-span-1 sm:col-span-2'>
                                        <label htmlFor="company_name" className='form-label'>Stages</label>
                                        <TagsInput value={stages} onChange={setStages} name="stages" placeHolder="Enter stage name"
                                            classNames={{ input: "rounded-none", tag: 'bg-red-500' }} />
                                    </div>

                                    <div className='col-span-1 sm:col-span-2 mt-4'>
                                        <button type="submit" className='bg-gray-800 py-2 px-6 text-white float-right hover:bg-gray-700 
                                        hover:drop-shadow-md rounded' onClick={handleSubmit}>
                                            Update Stages
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    )

}

export default CompanyInfo