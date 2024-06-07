"use client"

import React, { useEffect, useRef, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { FaAsterisk, FaLess } from 'react-icons/fa';
import { APIResponseProps } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dynamic from 'next/dynamic';
import { LiaEdit } from 'react-icons/lia';
import { GrBlog } from 'react-icons/gr';
import { Helpers } from '@/_lib/helpers';
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import axios from 'axios';
import SelectBlogHeaderImage from '../../../_components/SelectBlogHeaderImage';
import { useSearchParams } from 'next/navigation';
import SearchItem from '@/components/SearchItem';
import { GiModernCity } from 'react-icons/gi';
import CityMenuLists from '../../../_components/CityMenuLists';
const Ck_Editor_Component = dynamic(() => import("../../../_components/Ckeditor"), { ssr: false });

const helpers = new Helpers();
const EditCommunity = () => {

    const searchParams = useSearchParams();
    const default_menu = { "home_page": "No", "lists": "No" }
    const param_city_id = parseInt(searchParams?.get('city_id') as string) || 0
    const empty_form_data = {
        mls_name: "",
        friendly_name: "",
        slug: "",
        excerpt: "",
        post_body: "",
    }

    const [post_found, setPostFound] = useState(true);
    const [isSearchDirty, setIsSearchDirty] = useState(false);
    const [city_id, setDraftId] = useState(param_city_id);
    const [header_image, setHeaderIMage] = useState("");
    const [published_header_image, setPubHeaderImage] = useState("");
    const [date_added, setDateAdded] = useState("");
    const [formData, setFormData] = useState(empty_form_data);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File>();
    const [checkedMenus, setCheckedMenus] = useState(default_menu);
    const [cities_results, setCitiesResults] = useState<any[]>([]);
    const [isSrchOpen, setIsSrchOpenOpen] = useState(false);
    const searchBoxRef = useRef<HTMLDivElement>(null);
    const [abortController, setAbortController] = useState(new AbortController());
    const dispatch = useDispatch();

    useEffect(() => {

        const fetchDraftInfo = async () => {
            try {

                const postPromise: Promise<APIResponseProps> = helpers.GetCityInfo(city_id, "City Id");
                const postResp = await postPromise;
                const data_info = postResp.data.city_info;

                if (!data_info || data_info == null) {
                    setPostFound(false);
                }

                const city_menus = data_info.show_on_menus;

                setFormData({
                    mls_name: data_info.mls_name,
                    friendly_name: data_info.friendly_name,
                    excerpt: data_info.excerpt,
                    post_body: data_info.draft_content,
                    slug: "",
                });

                setCheckedMenus({ ...city_menus });
                setHeaderIMage(data_info.header_image);

                if (city_menus.home_page == "Yes") {
                    const this_menu = document.getElementById(`home_page`) as HTMLInputElement;
                    if (this_menu) {
                        this_menu.checked = true;
                    }
                }

                if (city_menus.lists == "Yes") {
                    const this_menu = document.getElementById(`lists`) as HTMLInputElement;
                    if (this_menu) {
                        this_menu.checked = true;
                    }
                }

                dispatch(hidePageLoader());
                setIsSrchOpenOpen(false);

            } catch {
                dispatch(hidePageLoader());
            }
        }

        dispatch(showPageLoader());
        fetchDraftInfo();

    }, [param_city_id]);

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

            form_data.append("city_id", city_id.toString());
            form_data.append("menus", JSON.stringify(checkedMenus));
            form_data.append("mls_name", formData.mls_name);
            form_data.append("friendly_name", formData.friendly_name);
            form_data.append("excerpt", formData.excerpt);
            form_data.append("post_body", formData.post_body);
            form_data.append("submit_type", type);
            form_data.append("header_image", JSON.stringify(header_image));
            form_data.append("draft_header_image", JSON.stringify(published_header_image));

            const { data } = await axios.patch("/api/(cities)/manage-cities", form_data);

            toast.dismiss();
            if (data.success) {

                setHeaderIMage(data.data.header_image);
                setSelectedFile(undefined); //Reset the file field
                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

                if (type == "Publish") {
                    setPubHeaderImage(data.data.header_image);
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

    if (!post_found) {
        throw new Error("Invalid city info provided");
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
                body: JSON.stringify({ "keyword": formData.mls_name, "search_by": "City" }),
                signal: controller.signal, // Use the current controller's signal
            }).then((resp): Promise<APIResponseProps> => {
                return resp.json();
            }).then(data => {

                if (data.success && data.data?.results.length) {

                    const cities: any[] = [];
                    const addresses: any[] = [];
                    const postals: any[] = [];
                    const listings: any[] = [];

                    data.data?.results.map((item: any) => {

                        if (item.TABLE_NAME == "City") {
                            cities.push({ "location": item.location, "listing_key": item.ListingKey });
                        } else if (item.TABLE_NAME == "Address") {
                            addresses.push({ "location": item.location, "listing_key": item.ListingKey });
                        } else if (item.TABLE_NAME == "PostalCode") {
                            postals.push({ "location": item.location, "listing_key": item.ListingKey });
                        } else if (item.TABLE_NAME == "MLSNumber") {
                            listings.push({ "location": item.location, "listing_key": item.ListingKey });
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

    return (
        <div className='w-full'>

            <div className='container m-auto max-w-[600px] lg:max-w-[1100px]'>
                <PageTitle text="Edit City" show_back={true} />
                <div className='w-full grid grid-cols-1 lg:grid-cols-4 gap-5 mt-4'>
                    <div className='col-span-1 lg:col-span-3 order-2 lg:order-1 bg-white px-3 sm:px-4 lg:px-6 py-5 flex flex-col'>

                        <div className='w-full relative'>
                            <label className='w-full flex items-center font-semibold' htmlFor='mls_name'>
                                <span>MLS Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                            </label>
                            <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                            focus:shadow-md' placeholder='MLS Name' value={formData.mls_name} name='mls_name' onKeyUp={() => setIsSearchDirty(true)}
                                onChange={(e) => handleTitleChange(e)} autoComplete='false' />

                            <div className={`w-[400px] bg-white absolute top-[68px] drop-shadow-2xl border border-gray-200 z-10 ${(isSearchDirty && isSrchOpen) ? "block" :
                                "hidden"} max-h-[450px] overflow-x-hidden overflow-y-auto`} ref={searchBoxRef}>
                                <div className='w-full flex flex-col'>
                                    {
                                        (cities_results.length > 0) && (
                                            <SearchItem items={cities_results} type="MlsCityValue" value={formData.mls_name} formData={formData} setFormData={setFormData}
                                                setIsSrchOpenOpen={setIsSrchOpenOpen} header={<><GiModernCity size={14} /> <span className='ml-2'>Cities</span></>} />
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
                            <label className='w-full flex items-center font-semibold' htmlFor='excerpt'><span>Excerpt</span></label>
                            <textarea className='w-full h-20 border border-gray-300 p-2 outline-0 hover:border-sky-600 font-normal
                            focus:shadow-md resize-none' placeholder='Excerpt' value={formData.excerpt} name='excerpt'
                                onChange={(e) => handleChange(e)} />
                            <small className='w-full'>Excerpt is an optional hand-crafted summaries of your content</small>
                        </div>

                        <div className='w-full mt-4'>
                            <label className='w-full flex items-center font-semibold' htmlFor='excerpt'><span>Post Body</span></label>
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

                    <div className='col-span-1 flex flex-col'>

                        <div className='w-full bg-white px-3 pb-4 pt-2'>
                            <h3 className='w-full border-b border-gray-200 py-1 font-semibold'>Show on Page</h3>
                            <CityMenuLists handleCheckedMenu={handleCheckedMenu} />
                        </div>

                        <div className='w-full bg-white px-3 pb-4 pt-2 mt-4'>
                            <h3 className='w-full border-b border-gray-200 py-1 font-semibold'>Header Image</h3>
                            <SelectBlogHeaderImage selectedImage={selectedImage} setSelectedFile={setSelectedFile}
                                setSelectedImage={setSelectedImage} headerImage={header_image} />
                        </div>

                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );

}

export default EditCommunity