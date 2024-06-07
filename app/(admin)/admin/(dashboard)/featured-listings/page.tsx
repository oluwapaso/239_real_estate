"use client"

import { Helpers } from '@/_lib/helpers';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/user/userSlice';
import { APIResponseProps } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageTitle from '../../_components/PageTitle';
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';
import { Beds_Baths, Prices } from '@/components/data';

const helpers = new Helpers();
const FeaturedListings = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const { is1Xm, is2Xm } = useCurrentBreakpoint();

    const prop_types = [
        { "id": "residential", "value": "Residential" },
        { "id": "residential_income", "value": "Residential Income" },
        { "id": "land_and_lot", "value": "Lot & Land" },
        { "id": "commercial", "value": "Commercial" },
        { "id": "boat_dock", "value": "Boat Dock" }
    ]
    const dispatch = useDispatch();
    const [initialValues, setInitialValues] = useState<any>({})

    useEffect(() => {

        const fetch_info = async () => {
            const comp_info_prms = helpers.FetchCompanyInfo();
            const comp_info = await comp_info_prms

            if (comp_info.success && comp_info.data) {
                setInitialValues(comp_info.data.featured_listings);
                dispatch(hidePageLoader());
            }
        }

        dispatch(showPageLoader());
        fetch_info();

    }, []);

    const handleSubmit = async (value: any) => {

        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/(listings)/featured-listings`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "settings": JSON.stringify(value) }),
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

    const [maxPrices, setMaxPrices] = useState(Prices);
    const [minPrices, setMinPrices] = useState(Prices);
    const [maxBeds, setMaxBeds] = useState(Beds_Baths);
    const [minBeds, setMinBeds] = useState(Beds_Baths);
    const [maxBaths, setMaxBaths] = useState(Beds_Baths);
    const [minBaths, setMinBaths] = useState(Beds_Baths);

    const setMinMaxPrice = (price_start: string, type: string) => {
        const priceStart = parseInt(price_start);

        if (type == "Max") {

            if (priceStart > 0) {
                const max_prices = Prices.filter((price) => {
                    return price.value >= priceStart
                })
                setMaxPrices(max_prices)
            } else {
                setMaxPrices(Prices)
            }

        } else if (type == "Min") {

            if (priceStart > 0) {
                const min_prices = Prices.filter((price) => {
                    return price.value <= priceStart
                })
                setMinPrices(min_prices)
            } else {
                setMinPrices(Prices)
            }

        }
    }

    const setMinMaxBeds = (bed_start: string, type: string) => {
        const bedStart = parseInt(bed_start)

        if (type == "Max") {

            if (bedStart > 0) {
                const max_beds = Beds_Baths.filter((bed) => {
                    return bed.value >= bedStart
                })
                setMaxBeds(max_beds)
            } else {
                setMaxBeds(Beds_Baths)
            }

        } else if (type == "Min") {

            if (bedStart > 0) {
                const min_beds = Beds_Baths.filter((bed) => {
                    return bed.value <= bedStart
                })
                setMinBeds(min_beds)
            } else {
                setMinBeds(Beds_Baths)
            }


        }
    }

    const setMinMaxBaths = (bath_start: string, type: string) => {
        const bathStart = parseInt(bath_start)

        if (type == "Max") {

            if (bathStart > 0) {
                const max_bath = Beds_Baths.filter((bath) => {
                    return bath.value >= bathStart
                })
                setMaxBaths(max_bath)
            } else {
                setMaxBaths(Beds_Baths)
            }

        } else if (type == "Min") {

            if (bathStart > 0) {
                const min_baths = Beds_Baths.filter((bath) => {
                    return bath.value <= bathStart
                })
                setMinBaths(min_baths)
            } else {
                setMinBaths(Beds_Baths)
            }


        }
    }

    return (
        <div className='w-full'>
            <PageTitle text="Fetaured Listings" show_back={true} />
            <div className='container m-auto max-w-[650px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Fetaured Listings Parameters.</div>
                            <div className=''>This will be used to display featured listings in the home page</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>
                            <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                                {(formik) => {
                                    const { values } = formik;
                                    return <Form className='w-full'>
                                        <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>

                                            <div className='col-span-1 sm:col-span-2'>
                                                <label htmlFor="location" className='form-label'>Location</label>
                                                <Field type="text" name="location" className='form-field' placeholder='Location' />
                                                <ErrorMessage name="location" component="div" />
                                            </div>

                                            <div className='col-span-1 sm:col-span-1'>
                                                <label htmlFor="min_price" className='form-label'>Min Price</label>
                                                <Field as="select" name="min_price" id="min_price" className='form-field' onChange={(e: any) => {
                                                    setInitialValues(() => {
                                                        return {
                                                            ...values,
                                                            min_price: e.target.value,
                                                        }
                                                    });
                                                    setMinMaxPrice(e.target.value, "Max");
                                                }}>
                                                    <option value="0">Min</option>
                                                    {minPrices.map(({ value, text }) => {
                                                        return <option value={value} key={value}>{text}</option>
                                                    })}
                                                </Field>
                                                <ErrorMessage name="min_price" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="max_price" className='form-label'>Max Price</label>
                                                <Field as="select" name="max_price" id="max_price" className='form-field' onChange={(e: any) => {
                                                    setInitialValues(() => {
                                                        return {
                                                            ...values,
                                                            max_price: e.target.value,
                                                        }
                                                    });
                                                    setMinMaxPrice(e.target.value, "Min")
                                                }}>
                                                    <option value="0">Max</option>
                                                    {maxPrices.map(({ value, text }) => {
                                                        return <option value={value} key={value}>{text}</option>
                                                    })}
                                                </Field>
                                                <ErrorMessage name="max_price" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="min_beds" className='form-label'>Min Beds</label>
                                                <Field as="select" name="min_beds" className='form-field' onChange={(e: any) => {
                                                    setInitialValues(() => {
                                                        return {
                                                            ...values,
                                                            min_beds: e.target.value,
                                                        }
                                                    });
                                                    setMinMaxBeds(e.target.value, "Max")
                                                }}>
                                                    <option value="0">Min</option>
                                                    {minBeds.map(({ value, text }) => {
                                                        return <option value={value} key={value}>{text}</option>
                                                    })}
                                                </Field>
                                                <ErrorMessage name="min_beds" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="max_beds" className='form-label'>Max Beds</label>
                                                <Field as="select" name="max_beds" className='form-field' onChange={(e: any) => {
                                                    setInitialValues(() => {
                                                        return {
                                                            ...values,
                                                            max_beds: e.target.value,
                                                        }
                                                    });
                                                    setMinMaxBeds(e.target.value, "Min")
                                                }}>
                                                    <option value="0">Max</option>
                                                    {maxBeds.map(({ value, text }) => {
                                                        return <option value={value} key={value}>{text}</option>
                                                    })}
                                                </Field>
                                                <ErrorMessage name="max_beds" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="min_baths" className='form-label'>Min Baths</label>
                                                <Field as="select" name="min_baths" className='form-field' onChange={(e: any) => {
                                                    setInitialValues(() => {
                                                        return {
                                                            ...values,
                                                            min_baths: e.target.value,
                                                        }
                                                    });
                                                    setMinMaxBaths(e.target.value, "Max")
                                                }}>
                                                    <option value="0">Min</option>
                                                    {minBaths.map(({ value, text }) => {
                                                        return <option value={value} key={value}>{text}</option>
                                                    })}
                                                </Field>
                                                <ErrorMessage name="min_baths" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="max_baths" className='form-label'>Max Baths</label>
                                                <Field as="select" name="max_baths" className='form-field' onChange={(e: any) => {
                                                    setInitialValues(() => {
                                                        return {
                                                            ...values,
                                                            max_baths: e.target.value,
                                                        }
                                                    });
                                                    setMinMaxBaths(e.target.value, "Min")
                                                }}>
                                                    <option value="0">Max</option>
                                                    {maxBaths.map(({ value, text }) => {
                                                        return <option value={value} key={value}>{text}</option>
                                                    })}
                                                </Field>
                                                <ErrorMessage name="max_baths" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="limits" className='form-label'>Limits</label>
                                                <Field type="number" name="limits" className='form-field h-[50px]' placeholder="Limits" />
                                                <ErrorMessage name="limits" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="sort_by" className='form-label'>Sort By</label>
                                                <Field as="select" name="sort_by" className='form-field'>
                                                    <option value="Price-DESC">Price, high to low</option>
                                                    <option value="Price-ASC">Price, low to high</option>
                                                    <option value="Date-DESC">Newest First</option>
                                                    <option value="Date-ASC">Oldest First</option>
                                                </Field>
                                                <ErrorMessage name="sort_by" component="div" />
                                            </div>

                                            <div className='col-span-2'>
                                                <label htmlFor="property_type" className='form-label'>Property Type</label>
                                                <Field name="property_type" className='form-field'>
                                                    {({ field }: { field: any }) => {
                                                        {
                                                            return prop_types.map(({ id, value }) => {
                                                                return <React.Fragment key={id}>
                                                                    <div className='w-full mt-2 mb-2 flex items-center select-none -ml-[10px]'>
                                                                        <Field type='checkbox' className='styled-checkbox menu_cb'
                                                                            name={id} id={id} value={value} />
                                                                        <label htmlFor={id} className='flex w-full'>
                                                                            <span>{value}</span>
                                                                        </label>
                                                                    </div>
                                                                </React.Fragment>
                                                            })
                                                        }
                                                    }}
                                                </Field>
                                                <ErrorMessage name="property_type" component="div" />

                                            </div>

                                            <div className='col-span-1 sm:col-span-2 mt-4'>
                                                <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right 
                                            hover:bg-gray-700 hover:drop-shadow-md'>
                                                    Update Info
                                                </button>
                                            </div>
                                        </div>
                                    </Form>
                                }}
                            </Formik>
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    )

}

export default FeaturedListings