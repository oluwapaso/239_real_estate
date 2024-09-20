"use client"

import { Helpers } from '@/_lib/helpers';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { APIResponseProps, AgentsType } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import PageTitle from '../../../_components/PageTitle';
import AgentForm from '../../../_components/AgentForm';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

const helpers = new Helpers();
const EditAgent = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const searchParams = useSearchParams();

    const agent_id = parseInt(searchParams?.get("agent_id") as string)
    const dispatch = useDispatch();
    const [initialValues, setInitialValues] = useState({} as AgentsType);

    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File>();

    const handleUpload = async () => {
        setUploading(true);
        try {

            if (!selectedFile) return;
            const formData = new FormData();
            formData.append("file", selectedFile);

            formData.append("myImage", selectedFile);
            formData.append("agent_id", searchParams?.get("agent_id") as string);
            formData.append("upload_type", "Agent DP");
            formData.append("old_dp", initialValues?.image?.image_loc);
            const { data } = await axios.post("/api/upload-image", formData);

            toast.dismiss();
            if (data.success) {
                initialValues.image = data.data.profile_image
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

        } catch (error: any) {
            toast.error(`${error.message}`, {
                position: "top-center",
                theme: "colored"
            })
        }
        setUploading(false);
    };

    useEffect(() => {

        const fetch_info = async () => {
            const agent_info_prms = helpers.FetchAgentInfo({ agent_id });
            const agent_info = await agent_info_prms

            if (agent_info.success && agent_info.data) {
                setInitialValues(agent_info.data)
                dispatch(hidePageLoader())
            }
        }

        dispatch(showPageLoader())
        fetch_info();

    }, [])


    const handleSubmit = async (value: any) => {

        const name = value.name
        const email = value.email

        if (!name || !email) {
            toast.error("Provide a valid name and email address.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(agents)/update-agent-info`, {
            method: "PATCH",
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
            <PageTitle text="Edit Agent Info" show_back={true} />
            <div className='container m-auto max-w-[600px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='col-span-1'>
                            <div className='font-semibold'>Update agent info.</div>
                            <div className=''>Agents will be listed in the main website with the info provided here</div>
                            <div className='w-full mt-3'>

                                {(selectedImage || initialValues?.image?.image_loc) && (
                                    <div className="w-full rounded mb-2 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                        <img src={selectedImage || initialValues?.image?.image_loc} alt="" />
                                    </div>)
                                }

                                <label>
                                    <input type="file" hidden
                                        onChange={({ target }) => {
                                            if (target.files) {
                                                const file = target.files[0];
                                                setSelectedImage(URL.createObjectURL(file));
                                                setSelectedFile(file);
                                            }
                                        }}
                                    />
                                    <div className="w-full mt-2 py-3 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                        Select Image
                                    </div>
                                </label>
                                <button onClick={handleUpload} disabled={uploading} style={{ opacity: uploading ? ".5" : "1" }}
                                    className="bg-red-600 p-3 my-2 w-32 text-center rounded text-white">
                                    {uploading ? "Uploading.." : "Upload"}
                                </button>

                            </div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 lg:p-7 bg-white shadow-lg'>
                            <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                                <AgentForm type='Edit' />
                            </Formik>
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    )

}

export default EditAgent