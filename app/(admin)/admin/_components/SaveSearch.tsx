"use client"

import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { APIResponseProps, CommunityPropertiesFilter } from '@/components/types'
import * as Yup from 'yup';
import { MdInfoOutline, MdOutlineCheckCircleOutline } from 'react-icons/md'
import { Helpers } from '@/_lib/helpers'
import { useSession } from 'next-auth/react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useModal } from '@/app/contexts/ModalContext';

const helper = new Helpers();

const SaveSearch = ({ closeModal, pricesFilter, bedsFilter, bathsFilter, city, filterBy, payload, save_via, city_params, mls_name }: {
    closeModal: () => void, pricesFilter?: CommunityPropertiesFilter, bedsFilter?: CommunityPropertiesFilter,
    bathsFilter?: CommunityPropertiesFilter, city?: string, filterBy?: string, payload?: { [key: string]: any; },
    save_via?: string, city_params?: any, mls_name?: string
}) => {

    const { data: session } = useSession();
    const { handleLoginModal } = useModal();
    const user = session?.user as any;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [frequent_out, setFrequentOut] = useState("day");

    type initialValuesProps = {
        search_title: string
        email_frequency: string
        email_immediately: boolean
    }

    let query_link = "";
    let default_title = "Homes for sale";

    //Just set data
    if (payload) {
        pricesFilter = { min: payload.min_price, max: payload.max_price }
        bedsFilter = { min: payload.min_bed, max: payload.max_bed }
        bathsFilter = { min: payload.min_bath, max: payload.max_bath }
        filterBy = payload.sort_by;
    }

    if (pricesFilter) {
        if (pricesFilter.min && pricesFilter?.min > 0 && pricesFilter.max && pricesFilter?.max > 0) {
            default_title += `, from ${helper.formatPrice(pricesFilter.min)} to ${helper.formatPrice(pricesFilter.max)}`;
        } else if (pricesFilter.min && pricesFilter?.min > 0 && !pricesFilter.max) {
            default_title += `, ${helper.formatPrice(pricesFilter.min)} and over`;
        } else if (pricesFilter.max && pricesFilter?.max > 0 && !pricesFilter.min) {
            default_title += `, ${helper.formatPrice(pricesFilter.max)} and under`;
        }
        query_link += `min_price=${pricesFilter?.min}&max_price=${pricesFilter?.max}&`;
    }

    if (bedsFilter) {
        if (bedsFilter.min && bedsFilter?.min > 0 && bedsFilter.max && bedsFilter?.max > 0) {
            default_title += `, ${helper.formatPrice(bedsFilter.min)}-${helper.formatPrice(bedsFilter.max)} beds`;
        } else if (bedsFilter.min && bedsFilter?.min > 0 && !bedsFilter.max) {
            default_title += `, ${helper.formatPrice(bedsFilter.min)}+ beds`;
        } else if (bedsFilter.max && bedsFilter?.max > 0 && !bedsFilter.min) {
            default_title += `, <=${helper.formatPrice(bedsFilter.max)} beds`;
        }
        query_link += `min_bed=${bedsFilter?.min}&max_bed=${bedsFilter?.max}&`;
    }

    if (bathsFilter) {
        if (bathsFilter.min && bathsFilter?.min > 0 && bathsFilter.max && bathsFilter?.max > 0) {
            default_title += `, ${helper.formatPrice(bathsFilter.min)}-${helper.formatPrice(bathsFilter.max)} baths`;
        } else if (bathsFilter.min && bathsFilter?.min > 0 && !bathsFilter.max) {
            default_title += `, ${helper.formatPrice(bathsFilter.min)}+ baths`;
        } else if (bathsFilter.max && bathsFilter?.max > 0 && !bathsFilter.min) {
            default_title += `, <=${helper.formatPrice(bathsFilter.max)} baths`;
        }
        query_link += `min_bath=${bathsFilter?.min}&max_bath=${bathsFilter?.max}&`;
    }

    if (city && city != "") {
        default_title += ` in ${city}`;
        query_link += `location=${city}&`;
    }

    if (filterBy) {
        query_link += `sort_by=${filterBy}&`;
    }

    query_link = helper.rTrim(query_link, "&");

    const initialValues: initialValuesProps = {
        search_title: default_title,
        email_frequency: "Daily",
        email_immediately: false
    }

    const validationSchema = Yup.object({
        search_title: Yup.string().trim().required("Provide a valid search name.")
    });

    const handleSubmit = async (value: any, actions: any) => {

        toast.dismiss();
        if (!user || !user.user_id) {
            toast.error("You need to login to add properties to favorites", {
                position: "top-center",
                theme: "colored"
            });
            closeModal();
            handleLoginModal();
            return false;
        }

        value.user_id = user.user_id;

        if (city && city != "") {
            value.query_type = "search";
            value.location = city;
        }

        if (bedsFilter?.min) {
            value.min_bed = bedsFilter?.min;
        }

        if (bedsFilter?.max) {
            value.max_bed = bedsFilter?.max;
        }

        if (bathsFilter?.min) {
            value.min_bath = bathsFilter?.min;
        }

        if (bathsFilter?.max) {
            value.max_bath = bathsFilter?.max;
        }

        if (pricesFilter?.min) {
            value.min_price = pricesFilter?.min;
        }

        if (pricesFilter?.max) {
            value.max_price = pricesFilter?.max;
        }

        if (filterBy) {
            value.sort_by = filterBy;
        }

        if (payload) {

            if (payload.home_type) {
                value.home_type = payload.home_type;
                query_link += `home_type=${JSON.stringify(payload.home_type)}&`;
            }

            if (payload.sales_type) {
                value.sales_type = payload.sales_type;
                query_link += `sales_type=${payload.sales_type}&`;
            }

            if (payload.max_hoa) {
                value.max_hoa = payload.max_hoa;
                query_link += `max_hoa=${payload.max_hoa}&`;
            }

            if (payload.include_incomp_hoa_data) {
                value.include_incomp_hoa_data = payload.include_incomp_hoa_data;
                query_link += `include_incomp_hoa_data=${payload.include_incomp_hoa_data}&`;
            }

            if (payload.virtual_tour) {
                value.virtual_tour = payload.virtual_tour;
                query_link += `virtual_tour=${payload.virtual_tour}&`;
            }

            if (payload.garage) {
                value.garage = payload.garage;
                query_link += `garage=${payload.garage}&`;
            }

            if (payload.basement) {
                value.basement = payload.basement;
                query_link += `basement=${payload.basement}&`;
            }

            if (payload.pool) {
                value.pool = payload.pool;
                query_link += `pool=${payload.pool}&`;
            }

            if (payload.waterfront) {
                value.waterfront = payload.waterfront;
                query_link += `waterfront=${payload.waterfront}&`;
            }

            if (payload.photos) {
                value.photos = payload.photos;
                query_link += `photos=${payload.photos}&`;
            }

            if (payload.min_square_feet) {
                value.min_square_feet = payload.min_square_feet;
                query_link += `min_square_feet=${payload.min_square_feet}&`;
            }

            if (payload.max_square_feet) {
                value.max_square_feet = payload.max_square_feet;
                query_link += `max_square_feet=${payload.max_square_feet}&`;
            }

            if (payload.min_lot) {
                value.min_lot = payload.min_lot;
                query_link += `min_lot=${payload.min_lot}&`;
            }

            if (payload.max_lot) {
                value.max_lot = payload.max_lot;
                query_link += `max_lot=${payload.max_lot}&`;
            }

            if (payload.min_year) {
                value.min_year = payload.min_year;
                query_link += `min_year=${payload.min_year}&`;
            }

            if (payload.max_year) {
                value.max_year = payload.max_year;
                query_link += `max_year=${payload.max_year}&`;
            }

            if (payload.parking_spots) {
                value.parking_spots = payload.parking_spots;
                query_link += `parking_spots=${payload.parking_spots}&`;
            }

        }

        if (value.email_frequency == "Hourly") {
            setFrequentOut("hour");
        } else if (value.email_frequency == "Daily") {
            setFrequentOut("day");
        } else if (value.email_frequency == "Weekly") {
            setFrequentOut("week");
        } else if (value.email_frequency == "Monthly") {
            setFrequentOut("month");
        } else if (value.email_frequency == "Never") {
            setFrequentOut("never");
        }

        let query_type = "search";
        if (save_via == "City" || save_via == "Community") {
            query_link = city_params;
            query_type = "path";
            if (save_via == "City") {
                value.location = mls_name;
            } else if (save_via == "Community") {
                value.county = mls_name;
                value.location = "";
            }
        }

        query_link = helper.rTrim(query_link, "&");
        value.query_link = query_link;
        value.query_type = query_type;

        setIsSubmitting(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(listings)/save-search`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.success) {

                setIsSaved(true);
                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

            } else {
                toast.error(data.message, {
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
        !isSaved
            ? <div className='w-full'>
                <div className='w-full mb-3'>
                    <div className='w-full border border-sky-600 flex items-center bg-sky-200 font-normal py-2 px-3'>
                        <MdInfoOutline size={18} className='mr-2 text-border' /> <span>Save this search to receive updates of new listings.</span>
                    </div>
                </div>
                <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
                    <Form className='w-full'>
                        <div className='w-full mt-4'>
                            <label htmlFor='search_title' className='font-semibold'>Search Title</label>
                            <Field name="search_title" className='form-field' placeholder='Search Title' />
                            <ErrorMessage name="search_title" component="div" className='text-sm text-red-500 font-normal' />
                        </div>

                        <div className='w-full mt-5'>
                            <label htmlFor='email_frequency' className='font-semibold'>Email Frequency</label>
                            <Field as="select" name="email_frequency" className='form-field'>
                                <option value="Never">Never</option>
                                <option value="Hourly">Hourly</option>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </Field>
                            <ErrorMessage name="email_frequency" component="div" className='text-sm text-red-500 font-normal' />
                        </div>

                        <div className='w-full mt-4 select-none -ml-[10px]'>
                            <Field type='checkbox' className='styled-checkbox menu_cb' name="email_immediately" id="email_immediately" />
                            <label htmlFor='email_immediately' className='font-semibold'>Email Results Immediately</label>
                        </div>

                        <div className='w-full mt-5'>
                            {
                                !isSubmitting ? <button type="submit" className='bg-gray-800 py-3 px-6 text-white float-right 
                            hover:bg-gray-700 hover:drop-shadow-md font-light uppercase text-sm'>
                                    Save Search
                                </button> : <button disabled className='bg-gray-800/70 py-3 px-6 text-white float-right font-light 
                            uppercase text-sm flex items-center cursor-not-allowed'>
                                    <AiOutlineLoading3Quarters size={18} className='mr-2 animate-spin' /> <span>Please wait...</span>
                                </button>
                            }
                        </div>
                    </Form>
                </Formik>

            </div>
            : <div className='w-full'>
                <div className='w-full mb-3'>
                    <div className='w-full border border-green-600 flex items-center bg-green-200 font-normal py-2 px-3'>
                        <MdOutlineCheckCircleOutline size={18} className='mr-2 text-border' /> <span>Your Search was Successfully Saved!</span>
                    </div>

                    <div className='w-full mt-4 font-normal leading-7'>
                        You can review and update your saved search on any device on your&nbsp;
                        <Link onClick={closeModal} href={"/my-dashboard?tab=Searches&page=1"} className='underline'>dashboard</Link>
                    </div>

                    <div className='w-full mt-4 font-normal leading-7'>
                        {
                            frequent_out != "never" ? `New listings will be sent to your inbox every ${frequent_out}!`
                                : `Check in regularly to see what new listings are available!`
                        }
                    </div>
                </div>
            </div>

    )
}

export default SaveSearch