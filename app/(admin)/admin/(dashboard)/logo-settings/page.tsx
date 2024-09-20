"use client"

import React, { useEffect, useState } from 'react'
import PageTitle from '../../_components/PageTitle'
import { Helpers } from '@/_lib/helpers';
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/user/userSlice';
import { APIResponseProps, compStateProps } from '@/components/types';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const helpers = new Helpers();
function LogoSettings() {

    const [comp_info, setCompInfo] = useState({} as compStateProps);
    const [selectedPriLogo, setSelectedPriLogo] = useState("");
    const [selectedPriFile, setSelectedPriFile] = useState<File>();
    const [selectedSecLogo, setSelectedSecLogo] = useState("");
    const [selectedSecFile, setSelectedSecFile] = useState<File>();
    const [selectedMlsLogo, setSelectedMlsLogo] = useState("");
    const [selectedMlsFile, setSelectedMlsFile] = useState<File>();
    const [pri_uploading, setPriUploading] = useState(false);
    const [sec_uploading, setSecUploading] = useState(false);
    const [mls_uploading, setMLSUploading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {

        const fetch_info = async () => {
            const comp_info_prms = helpers.FetchCompanyInfo();
            const comp_info = await comp_info_prms

            if (comp_info.success && comp_info.data) {
                setCompInfo(comp_info.data)
                dispatch(hidePageLoader())
            }
        }

        dispatch(showPageLoader());
        fetch_info();

    }, []);

    const handleUpload = async (upload_type: string) => {

        toast.dismiss();
        try {

            const form_data = new FormData();

            if (upload_type == "Primary Logo") {

                if (selectedPriFile) {
                    form_data.append("file", selectedPriFile);
                } else {
                    toast.error("Please select a logo to upload", {
                        position: "top-center",
                        theme: "colored"
                    });
                    return false;
                }

                form_data.append("old_logo", comp_info?.primary_logo?.image_loc);
                setPriUploading(true);

            } else if (upload_type == "Secondary Logo") {

                if (selectedSecFile) {
                    form_data.append("file", selectedSecFile);
                } else {
                    toast.error("Please select a logo to upload", {
                        position: "top-center",
                        theme: "colored"
                    });
                    return false;
                }

                form_data.append("old_logo", comp_info?.secondary_logo?.image_loc);
                setSecUploading(true);

            } else if (upload_type == "MLS Logo") {

                if (selectedMlsFile) {
                    form_data.append("file", selectedMlsFile);
                } else {
                    toast.error("Please select a logo to upload", {
                        position: "top-center",
                        theme: "colored"
                    });
                    return false;
                }

                form_data.append("old_logo", comp_info?.mls_logo?.image_loc);
                setMLSUploading(true);

            }

            form_data.append("upload_type", upload_type);

            //const { data } = await axios.post("/api/upload-image", form_data);
            const data = await fetch("/api/upload-image", {
                method: 'POST',
                body: form_data,
            }).then((resp): Promise<APIResponseProps> => {
                return resp.json();
            }).then(data => {
                return data;
            });

            if (data.success) {

                if (upload_type == "Primary Logo") {
                    comp_info.primary_logo = data.data.logo_data
                } else if (upload_type == "Secondary Logo") {
                    comp_info.secondary_logo = data.data.logo_data
                } else if (upload_type == "MLS Logo") {
                    comp_info.mls_logo = data.data.logo_data
                }

                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

            if (upload_type == "Primary Logo") {
                setPriUploading(false);
            } else if (upload_type == "Secondary Logo") {
                setSecUploading(false);
            } else if (upload_type == "MLS Logo") {
                setMLSUploading(false);
            }

        } catch (e: any) {

            if (upload_type == "Primary Logo") {
                setPriUploading(false);
            } else if (upload_type == "Secondary Logo") {
                setSecUploading(false);
            } else if (upload_type == "MLS Logo") {
                setMLSUploading(false);
            }

            toast.error(`${e.message}`, {
                position: "top-center",
                theme: "colored"
            })
        }

    }

    return (
        <div className='w-full'>
            <PageTitle text="Logo Settings" show_back={true} />
            <div className='container m-auto max-w-[550px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Primary Logo</div>
                            <div className=''>This logo is usually displayed on trasparent and dark sections. So it's usually light color.</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                            {(selectedPriLogo || comp_info.primary_logo?.image_loc) && (
                                <div className="w-full rounded mb-2 flex items-center justify-center border-2 border-dashed 
                                cursor-pointer bg-gray-100">
                                    <img src={selectedPriLogo || comp_info.primary_logo?.image_loc} alt="" />
                                </div>)
                            }

                            <div className='w-full flex items-center'>
                                <label className='flex-grow'>
                                    <input type="file" hidden
                                        onChange={(event) => {
                                            if (event.target.files && event.target.files.length > 0) {
                                                const file = event.target.files[0];
                                                const fileUrl = URL.createObjectURL(file);
                                                setSelectedPriLogo(fileUrl);
                                                setSelectedPriFile(file);
                                            }
                                        }}
                                    />
                                    <div className="w-full p-3 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                        Select Image
                                    </div>
                                </label>
                                <button onClick={() => handleUpload("Primary Logo")} disabled={pri_uploading} style={{ opacity: pri_uploading ? ".5" : "1" }}
                                    className="bg-red-600 border-2 border-red-600 p-3 w-32 text-center rounded text-white ml-2">
                                    {pri_uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>

                        </div>

                    </div>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Secondary Logo.</div>
                            <div className=''>This logo is usually displayed on light sections. So it's usually dark color.</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                            {(selectedSecLogo || comp_info.secondary_logo?.image_loc) && (
                                <div className="w-full rounded mb-2 flex items-center justify-center border-2 border-dashed 
                                cursor-pointer bg-gray-100">
                                    <img src={selectedSecLogo || comp_info.secondary_logo?.image_loc} alt="" />
                                </div>)
                            }

                            <div className='w-full flex items-center'>
                                <label className='flex-grow'>
                                    <input type="file" hidden
                                        onChange={({ target }) => {
                                            if (target.files) {
                                                const file = target.files[0];
                                                setSelectedSecLogo(URL.createObjectURL(file));
                                                setSelectedSecFile(file);
                                            }
                                        }}
                                    />
                                    <div className="w-full p-3 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                        Select Image
                                    </div>
                                </label>
                                <button onClick={() => handleUpload("Secondary Logo")} disabled={sec_uploading} style={{ opacity: sec_uploading ? ".5" : "1" }}
                                    className="bg-red-600 border-2 border-red-600 p-3 w-32 text-center rounded text-white ml-2">
                                    {sec_uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>

                        </div>

                    </div>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                        <div className='lg:col-span-1'>
                            <div className='w-full font-semibold'>MLS Logo.</div>
                            <div className='w-full'>This logo is will be displayed in the footer section with the MLS disclaimer text and it's usually light color.</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                            {(selectedMlsLogo || comp_info.mls_logo?.image_loc) && (
                                <div className="w-full rounded mb-2 flex items-center justify-center border-2 border-dashed 
                                cursor-pointer bg-gray-100">
                                    <img src={selectedMlsLogo || comp_info.mls_logo?.image_loc} alt="" />
                                </div>)
                            }

                            <div className='w-full flex items-center'>
                                <label className='flex-grow'>
                                    <input type="file" hidden
                                        onChange={({ target }) => {
                                            if (target.files) {
                                                const file = target.files[0];
                                                setSelectedMlsLogo(URL.createObjectURL(file));
                                                setSelectedMlsFile(file);
                                            }
                                        }}
                                    />
                                    <div className="w-full p-3 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                        Select Image
                                    </div>
                                </label>
                                <button onClick={() => handleUpload("MLS Logo")} disabled={mls_uploading} style={{ opacity: mls_uploading ? ".5" : "1" }}
                                    className="bg-red-600 border-2 border-red-600 p-3 w-32 text-center rounded text-white ml-2">
                                    {mls_uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className='w-full grid grid-cols-3 gap-4 mt-10'>

                        <div className='col-span-3'>
                            <div className='w-full font-semibold'>Note:</div>
                            <div className='w-full'>All logo should maintain a conventional aspect ratio before uploading.
                                Web logo <strong>width</strong> is usually between <strong>100px</strong> to <strong>300px</strong> and
                                <strong>heigth</strong> is usually between <strong>40px</strong> to <strong>70px</strong>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <ToastContainer />
        </div>
    )
}

export default LogoSettings