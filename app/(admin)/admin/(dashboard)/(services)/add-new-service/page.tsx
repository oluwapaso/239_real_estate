"use client"

import React, { useEffect, useRef, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { FaAsterisk } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dynamic from 'next/dynamic';
import { LiaEdit } from 'react-icons/lia';
import { GrBlog } from 'react-icons/gr';
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import SelectBlogHeaderImage from '../../../_components/SelectBlogHeaderImage';
import { APIResponseProps, CityInfo } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import ServicesMenuLists from '../../../_components/ServicesMenuLists';
const Ck_Editor_Component = dynamic(() => import("../../../_components/Ckeditor"), { ssr: false });

const helpers = new Helpers();
const AddNewCommunity = () => {

    const default_menu = { "home_page": "No", "menu_lists": "No" }
    const empty_form_data = {
        mls_name: "",
        friendly_name: "",
        slug: "",
        excerpt: "",
        post_body: "",
    }

    const [draft_id, setDraftId] = useState(0);
    const [header_image, setHeaderIMage] = useState("");
    const [formData, setFormData] = useState(empty_form_data);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File>();
    const [checkedMenus, setCheckedMenus] = useState(default_menu);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const post_title = e.target.value.trim();
        const post_slug = post_title.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

        setFormData((prev_data) => {
            return {
                ...prev_data,
                [e.target.name]: e.target.value,
                ["slug"]: post_slug
            }
        });
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let post_slug = e.target.value.trim();
        post_slug = post_slug.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

        setFormData((prev_data) => {
            return {
                ...prev_data,
                ["slug"]: post_slug
            }
        })
    }

    const handleBodyChange = (data: string) => {
        setFormData((prev_data) => {
            return {
                ...prev_data,
                post_body: data
            }
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData((prev_data) => {
            return {
                ...prev_data,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleCheckedMenu = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        if (checked) {
            setCheckedMenus({ ...checkedMenus, [event.target.name]: "Yes" });
        } else {
            setCheckedMenus({ ...checkedMenus, [event.target.name]: "No" });
        }
    };

    const handleSubmit = async (type: string) => {

        try {
            if (formData.friendly_name == "") {

                toast.error("Fields marked with asterisks are required.", {
                    position: "top-center",
                    theme: "colored"
                });

                return false;

            }

            dispatch(showPageLoader());

            const form_data = new FormData();
            if (selectedFile) {
                form_data.append("file", selectedFile);
            }

            form_data.append("draft_id", draft_id.toString());
            form_data.append("menus", JSON.stringify(checkedMenus));
            form_data.append("friendly_name", formData.friendly_name);
            form_data.append("slug", formData.slug);
            form_data.append("excerpt", formData.excerpt);
            form_data.append("post_body", formData.post_body);
            form_data.append("submit_type", type);
            form_data.append("old_header_image", JSON.stringify(header_image));

            const { data } = await axios.post("/api/(services)/manage-services", form_data);

            toast.dismiss();
            if (data.success) {

                setDraftId(data.data.service_draft_id);
                setHeaderIMage(data.data.header_image);
                setSelectedFile(undefined); //Reset the file field
                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

                if (type == "Publish") {
                    router.push(`/admin/edit-service?draft_id=${data.data.service_draft_id}`)
                }

            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

            dispatch(hidePageLoader());

        } catch (error: any) {
            dispatch(hidePageLoader());
            console.log(error.response?.data);
        }

    }

    useEffect(() => {
        dispatch(hidePageLoader());
    }, []);

    return (
        <div className='w-full'>

            <div className='container m-auto max-w-[600px] lg:max-w-[1100px]'>
                <PageTitle text="Add New Community" show_back={false} />
                <div className='w-full grid grid-cols-1 lg:grid-cols-4 gap-5 mt-4'>
                    <div className='col-span-1 lg:col-span-3 order-2 lg:order-1 bg-white px-3 sm:px-4 lg:px-6 py-5 flex flex-col'>

                        <div className='w-full mt-4'>
                            <label className='w-full flex items-center font-semibold' htmlFor='friendly_name'>
                                <span>Service Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                            focus:shadow-md' placeholder='Service Name' value={formData.friendly_name} name='friendly_name'
                                onChange={(e) => handleTitleChange(e)} />
                        </div>

                        <div className='w-full mt-4'>
                            <label className='w-full flex items-center font-semibold' htmlFor='slug'>
                                <span>Slug</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <div className='flex flex-col lg:flex-row items-center box-border'>
                                <div className='w-full lg:w-auto max-w-[100%] overflow-hidden overflow-ellipsis py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700 text-base'>
                                    {process.env.NEXT_PUBLIC_BASE_URL}/services/
                                </div>
                                <div className='flex-grow w-full lg:w-auto'>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 
                                    font-normal focus:shadow-md' placeholder='Slug' value={formData.slug} name='slug'
                                        onChange={(e) => handleSlugChange(e)} />
                                </div>
                            </div>
                        </div>

                        <div className='w-full mt-4'>
                            <label className='w-full flex items-center font-semibold' htmlFor='excerpt'><span>Excerpt</span></label>
                            <textarea className='w-full h-20 border border-gray-300 p-2 outline-0 hover:border-sky-600 font-normal
                            focus:shadow-md resize-none' placeholder='Excerpt' value={formData.excerpt} name='excerpt'
                                onChange={(e) => handleChange(e)} />
                            <small className='w-full'>Excerpt is an optional hand-crafted summaries of your content</small>
                        </div>

                        <div className='w-full mt-4'>
                            <label className='w-full flex items-center font-semibold' htmlFor='excerpt'><span>Page Body</span></label>
                            <Ck_Editor_Component data={formData.post_body} onDataChange={handleBodyChange} height="400px" />
                        </div>

                        <div className='mt-6 w-full flex justify-end'>
                            <button className='test_btn bg-red-500 py-3 px-4 text-white float-right hover:drop-shadow-md flex 
                            items-center hover:bg-red-300 text-sm lg:text-base' onClick={() => handleSubmit("Draft")}>
                                <LiaEdit size={17} className='mr-1' /> <span>Save To Draft</span>
                            </button>

                            <button className='test_btn bg-green-800 py-3 px-4 text-white float-right hover:drop-shadow-md ml-3 
                            flex items-center hover:bg-green-500 text-sm lg:text-base' onClick={() => handleSubmit("Publish")}>
                                <GrBlog size={13} className='mr-1' /> <span>Publish</span>
                            </button>
                        </div>

                    </div>

                    <div className='col-span-1 order-1 lg:order-2 flex flex-col'>
                        <div className='w-full bg-white px-3 pb-4 pt-2'>
                            <h3 className='w-full border-b border-gray-200 py-1 font-semibold'>Show on Menu</h3>
                            <ServicesMenuLists handleCheckedMenu={handleCheckedMenu} />
                        </div>

                        <div className='w-full bg-white px-3 pb-4 pt-2 mt-4'>
                            <h3 className='w-full border-b border-gray-200 py-1 font-semibold'>Header Image</h3>
                            <SelectBlogHeaderImage selectedImage={selectedImage} setSelectedFile={setSelectedFile} setSelectedImage={setSelectedImage} />
                        </div>

                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );

}

export default AddNewCommunity