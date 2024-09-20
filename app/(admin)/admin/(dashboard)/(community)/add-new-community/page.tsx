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
import CommunityMenuLists from '../../../_components/CommunityMenuLists';
import { GiModernCity } from 'react-icons/gi';
import SearchItem from '@/components/SearchItem';
import { APIResponseProps, CityInfo } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { NonEmptyArray } from 'ckeditor5/src/core';
const Ck_Editor_Component = dynamic(() => import("../../../_components/Ckeditor"), { ssr: false });

const helpers = new Helpers();
const AddNewCommunity = () => {

    const default_menu = { "home_page": "No" }
    const empty_form_data = {
        city_info: "",
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
    const [cities_results, setCitiesResults] = useState<any[]>([]);
    const [isSrchOpen, setIsSrchOpenOpen] = useState(false);
    const searchBoxRef = useRef<HTMLDivElement>(null);
    const [abortController, setAbortController] = useState(new AbortController());
    const [cities, setCities] = useState<any[]>([]);
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

    const handleSubmit = async (type: string) => {

        try {
            if (formData.mls_name == "" || formData.friendly_name == "") {

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
            form_data.append("city_info", formData.city_info);
            form_data.append("mls_name", formData.mls_name);
            form_data.append("friendly_name", formData.friendly_name);
            form_data.append("slug", formData.slug);
            form_data.append("excerpt", formData.excerpt);
            form_data.append("post_body", formData.post_body);
            form_data.append("submit_type", type);
            form_data.append("old_header_image", JSON.stringify(header_image));

            const { data } = await axios.post("/api/(communities)/manage-communities", form_data);

            toast.dismiss();
            if (data.success) {

                setDraftId(data.data.comm_draft_id);
                setHeaderIMage(data.data.header_image);
                setSelectedFile(undefined); //Reset the file field
                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

                if (type == "Publish") {
                    router.push(`/admin/edit-community?draft_id=${data.data.comm_draft_id}`)
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

    /** Live location search **/
    useEffect(() => {

        if (formData.mls_name != "") {

            setIsSrchOpenOpen(true);

            // Create a new AbortController for each effect
            const controller = new AbortController();
            setAbortController(controller);

            // Cancel previous API request
            abortController.abort();

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/(listings)/live-search`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "keyword": formData.mls_name, "search_by": "County" }),
                signal: controller.signal, // Use the current controller's signal 
            }).then((resp): Promise<APIResponseProps> => {
                return resp.json();
            }).then(data => {

                if (data.success && data.data?.results.length) {

                    const cities: any[] = [];

                    data.data?.results.map((item: any) => {

                        if (item.TABLE_NAME == "CountyOrParish") {
                            cities.push({ "location": item.location, "listing_key": item.ListingKey });
                        }

                    });

                    setCitiesResults(cities);

                } else {
                    setCitiesResults([]);
                }

            });

            // Cleanup function to abort the request if the component unmounts or the dependency changes
            return () => {
                controller.abort();
            };

        } else {
            setIsSrchOpenOpen(false);
        }

    }, [formData.mls_name]);
    /** Live location search **/

    useEffect(() => {

        const handleClickOutside = (e: MouseEvent) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
                setIsSrchOpenOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [searchBoxRef]);

    useEffect(() => {

        const fetchCities = async () => {

            try {

                const payload = {
                    paginated: false,
                    post_type: "Published"
                }

                const cityPromise: Promise<CityInfo[]> = helpers.LoadCities(payload)
                const cityResp = await cityPromise;
                setCities(cityResp);

            } catch (e: any) {
                console.log(e.message);
            }

        }

        dispatch(hidePageLoader());
        fetchCities();

    }, []);

    let cityInfo: any;
    if (formData.city_info && typeof formData.city_info == "string") {
        cityInfo = JSON.parse(formData.city_info);
    }

    return (
        <div className='w-full'>

            <div className='container m-auto max-w-[600px] lg:max-w-[1100px]'>
                <PageTitle text="Add New Community" show_back={false} />
                <div className='w-full grid grid-cols-1 lg:grid-cols-4 gap-5 mt-4'>
                    <div className='col-span-1 lg:col-span-3 order-2 lg:order-1 bg-white px-3 sm:px-4 lg:px-6 py-5 flex flex-col'>

                        <div className='w-full'>
                            <label className='w-full flex items-center font-semibold' htmlFor='city_info'>
                                <span>City</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <select className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                            focus:shadow-md' value={formData.city_info} name='city_info' onChange={(e) => handleChange(e)}>
                                <option value="">Select a city</option>
                                {
                                    (cities && cities.length) && (
                                        cities.map(city => {
                                            return <option value={`{"slug":"${city.slug}", "id":"${city.city_id}"}`}>{city.slug}</option>
                                        })
                                    )
                                }
                            </select>
                        </div>

                        <div className='w-full relative mt-4'>
                            <label className='w-full flex items-center font-semibold' htmlFor='mls_name'>
                                <span>MLS Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                            focus:shadow-md' placeholder='MLS Name' value={formData.mls_name} name='mls_name'
                                onChange={(e) => handleTitleChange(e)} />
                            <small className='w-full mt-1'>
                                This is the name on the MLS database and will be used to fetch community info.
                            </small>

                            <div className={`w-[400px] bg-white absolute top-[68px] drop-shadow-2xl border border-gray-200 z-10 ${isSrchOpen ? "block" :
                                "hidden"} max-h-[450px] overflow-x-hidden overflow-y-auto`} ref={searchBoxRef}>
                                <div className='w-full flex flex-col'>
                                    {
                                        (cities_results.length > 0) && (
                                            <SearchItem items={cities_results} type="MlsCityValue" value={formData.mls_name} formData={formData} setFormData={setFormData}
                                                setIsSrchOpenOpen={setIsSrchOpenOpen} header={<><GiModernCity size={14} /> <span className='ml-2'>Communities</span></>} />
                                        )
                                    }
                                </div>
                            </div>
                        </div>

                        <div className='w-full mt-4'>
                            <label className='w-full flex items-center font-semibold' htmlFor='friendly_name'>
                                <span>Friendly Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                            focus:shadow-md' placeholder='Friendly Name' value={formData.friendly_name} name='friendly_name'
                                onChange={(e) => handleChange(e)} />
                        </div>

                        <div className='w-full mt-4'>
                            <label className='w-full flex items-center font-semibold' htmlFor='slug'>
                                <span>Slug</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <div className='flex flex-col lg:flex-row items-center box-border'>
                                <div className='w-full lg:w-auto max-w-[100%] overflow-hidden overflow-ellipsis py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700 text-base'>
                                    {process.env.NEXT_PUBLIC_BASE_URL}/{cityInfo?.slug}/
                                </div>
                                <div className='flex-grow w-full lg:w-auto'>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 
                                    font-normal focus:shadow-md' placeholder='Slug' value={formData.slug} name='slug'
                                        onChange={(e) => handleSlugChange(e)} />
                                </div>
                            </div>
                        </div>

                        <div className='w-full mt-4 hidden'>
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