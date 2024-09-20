"use client"

import React, { useEffect, useState } from 'react'
import PageTitle from '../../_components/PageTitle'
import { Helpers } from '@/_lib/helpers';
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/user/userSlice';
import { APIResponseProps, compStateProps } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const helpers = new Helpers();
function PageHeaderSettings() {

    const [comp_info, setCompInfo] = useState({} as compStateProps);
    const [selectedHomeHeader, setSelectedHomeHeader] = useState("");
    const [selectedHomeFile, setSelectedHomeFile] = useState<File>();
    const [selectedCalcHeader, setSelectedCalcHeader] = useState("");
    const [selectedCalcFile, setSelectedCalcFile] = useState<File>();
    const [selectedMlsHeader, setSelectedMlsHeader] = useState("");
    const [selectedMlsFile, setSelectedMlsFile] = useState<File>();
    const [pri_uploading, setHomeUploading] = useState(false);
    const [sec_uploading, setCalcUploading] = useState(false);
    const [blog_uploading, setBlogUploading] = useState(false);
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

            if (upload_type == "Home Header") {

                if (selectedHomeFile) {
                    form_data.append("file", selectedHomeFile);
                } else {
                    toast.error("Please select a header to upload", {
                        position: "top-center",
                        theme: "colored"
                    });
                    return false;
                }

                form_data.append("old_header", comp_info?.home_header?.image_loc);
                setHomeUploading(true);

            } else if (upload_type == "Calculator Header") {

                if (selectedCalcFile) {
                    form_data.append("file", selectedCalcFile);
                } else {
                    toast.error("Please select a header to upload", {
                        position: "top-center",
                        theme: "colored"
                    });
                    return false;
                }

                form_data.append("old_header", comp_info?.calculator_header?.image_loc);
                setCalcUploading(true);

            } else if (upload_type == "Blog Header") {

                if (selectedMlsFile) {
                    form_data.append("file", selectedMlsFile);
                } else {
                    toast.error("Please select a header to upload", {
                        position: "top-center",
                        theme: "colored"
                    });
                    return false;
                }

                form_data.append("old_header", comp_info?.blog_header?.image_loc);
                setBlogUploading(true);

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

                if (upload_type == "Home Header") {
                    comp_info.home_header = data.data.header_data
                } else if (upload_type == "Calculator Header") {
                    comp_info.calculator_header = data.data.header_data
                } else if (upload_type == "Blog Header") {
                    comp_info.blog_header = data.data.header_data
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

            if (upload_type == "Home Header") {
                setHomeUploading(false);
            } else if (upload_type == "Calculator Header") {
                setCalcUploading(false);
            } else if (upload_type == "Blog Header") {
                setBlogUploading(false);
            }

        } catch (e: any) {

            if (upload_type == "Home Header") {
                setHomeUploading(false);
            } else if (upload_type == "Calculator Header") {
                setCalcUploading(false);
            } else if (upload_type == "Blog Header") {
                setBlogUploading(false);
            }

            toast.error(`${e.message}`, {
                position: "top-center",
                theme: "colored"
            })
        }

    }

    return (
        <div className='w-full'>
            <PageTitle text="Header Settings" show_back={true} />
            <div className='container m-auto max-w-[550px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Home Header</div>
                            <div className=''>This is the header on the home page.</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                            {(selectedHomeHeader || comp_info.home_header?.image_loc) && (
                                <div className="w-full rounded mb-2 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                    <img src={selectedHomeHeader || comp_info.home_header?.image_loc} alt="" />
                                </div>)
                            }

                            <div className='w-full flex items-center'>
                                <label className='flex-grow'>
                                    <input type="file" hidden
                                        onChange={(event) => {
                                            if (event.target.files && event.target.files.length > 0) {
                                                const file = event.target.files[0];
                                                const fileUrl = URL.createObjectURL(file);
                                                setSelectedHomeHeader(fileUrl);
                                                setSelectedHomeFile(file);
                                            }
                                        }}
                                    />
                                    <div className="w-full p-3 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                        Select Image
                                    </div>
                                </label>
                                <button onClick={() => handleUpload("Home Header")} disabled={pri_uploading} style={{ opacity: pri_uploading ? ".5" : "1" }}
                                    className="bg-red-600 border-2 border-red-600 p-3 w-32 text-center rounded text-white ml-2">
                                    {pri_uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>

                        </div>

                    </div>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Mortgage Calculator Header.</div>
                            <div className=''>This is the header on mortgage calculator page.</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                            {(selectedCalcHeader || comp_info.calculator_header?.image_loc) && (
                                <div className="w-full rounded mb-2 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                    <img src={selectedCalcHeader || comp_info.calculator_header?.image_loc} alt="" />
                                </div>)
                            }

                            <div className='w-full flex items-center'>
                                <label className='flex-grow'>
                                    <input type="file" hidden
                                        onChange={({ target }) => {
                                            if (target.files) {
                                                const file = target.files[0];
                                                setSelectedCalcHeader(URL.createObjectURL(file));
                                                setSelectedCalcFile(file);
                                            }
                                        }}
                                    />
                                    <div className="w-full p-3 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                        Select Image
                                    </div>
                                </label>
                                <button onClick={() => handleUpload("Calculator Header")} disabled={sec_uploading} style={{ opacity: sec_uploading ? ".5" : "1" }}
                                    className="bg-red-600 border-2 border-red-600 p-3 w-32 text-center rounded text-white ml-2">
                                    {sec_uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>

                        </div>

                    </div>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                        <div className='lg:col-span-1'>
                            <div className='w-full font-semibold'>Blog Header.</div>
                            <div className='w-full'>This is the header displayed on blog lists page.</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>

                            {(selectedMlsHeader || comp_info.blog_header?.image_loc) && (
                                <div className="w-full rounded mb-2 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                    <img src={selectedMlsHeader || comp_info.blog_header?.image_loc} alt="" />
                                </div>)
                            }

                            <div className='w-full flex items-center'>
                                <label className='flex-grow'>
                                    <input type="file" hidden
                                        onChange={({ target }) => {
                                            if (target.files) {
                                                const file = target.files[0];
                                                setSelectedMlsHeader(URL.createObjectURL(file));
                                                setSelectedMlsFile(file);
                                            }
                                        }}
                                    />
                                    <div className="w-full p-3 flex items-center justify-center border-2 border-dashed cursor-pointer">
                                        Select Image
                                    </div>
                                </label>
                                <button onClick={() => handleUpload("Blog Header")} disabled={blog_uploading} style={{ opacity: blog_uploading ? ".5" : "1" }}
                                    className="bg-red-600 border-2 border-red-600 p-3 w-32 text-center rounded text-white ml-2">
                                    {blog_uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10'>

                        <div className='col-span-3'>
                            <div className='w-full font-semibold'>Note:</div>
                            <div className='w-full'>All header should maintain a conventional aspect ratio before uploading.
                                Web header <strong>width</strong> is usually between <strong>1000px</strong> to <strong>2000px</strong> and
                                <strong>heigth</strong> is usually between <strong>600px</strong> to <strong>750px</strong>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <ToastContainer />
        </div>
    )
}

export default PageHeaderSettings