"use client"

import SimpleHeader from '@/components/SimpleHeader'
import { APIResponseProps, buying_dataProps } from '@/components/types'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FaAsterisk } from 'react-icons/fa'
import { RiMailSendLine } from 'react-icons/ri'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Buying = () => {

    const { data: session } = useSession();
    const user = session?.user as any;

    const empty_form_data: buying_dataProps = {
        user_id: user?.user_id || 0,
        first_name: "",
        last_name: "",
        email: "",
        primary_phone: "",
        secondary_phone: "",
        fax: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        num_of_beds: "1",
        num_of_baths: "1",
        square_feet: "Less than 1000",
        mode_of_contact: "Email",
        price_range: "Less than $300,000",
        move_on: "",
        started_looking_in: "",
        own_in: "",
        with_an_agent: "No",
        home_description: "",
        mailer: "Sendgrid",
        message_type: "Buying Request"
    }

    const [formData, setFormData] = useState(empty_form_data)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData((prev_data) => {
            return {
                ...prev_data,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleSubmit = () => {

        if (formData.first_name == "" || formData.last_name == "" || formData.email == "") {

            toast.error("Fields marked with asterisks are required.", {
                position: "top-center",
                theme: "colored"
            });

            return false;

        }

        setIsSubmitting(true);

        fetch("/api/(emails)/buying-request", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            if (data.message == "Email sent!") {

                toast.success("Message successfully sent, we will get back to you as soon as possible.", {
                    position: "top-center",
                    theme: "colored"
                });

                setFormData(empty_form_data)

            } else {

                toast.error("Unable to send your message, please try again later " + data.message, {
                    position: "top-center",
                    theme: "colored"
                });

                console.log(data.message)

            }

        })

    }

    return (
        <>
            <SimpleHeader page="Buying" />
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[850px] px-3 xl:px-0 text-left'>
                    <div className='w-full font-normal'>
                        <Link href="/">Home</Link> / <Link href="/buying">Ready To Buy?</Link>
                    </div>

                    <h3 className='w-full font-play-fair-display text-3xl md:text-4xl lg:text-5xl mt-2'>GETTING READY TO BUY?</h3>

                    <div className='w-100 text-center font-play-fair-display text-2xl my-6 md:my-10'>
                        PLEASE FILL OUT THE FORM BELOW AND ONE OF OUR QUALIFIED AGENTS WILL BE IN CONTACT
                        TO HELP YOU GET STARTED ON YOUR HOME SEARCH:
                    </div>

                    <div className='w-full'>
                        <h3 className='w-full font-play-fair-display text-3xl mt-2'>Contact Information</h3>
                        <div className='w-full mt-4'>
                            <div className='w-full grid grid-cols-1 2xs:grid-cols-2 gap-5'>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='first_name'>
                                        <span>First Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                    focus:shadow-md' placeholder='First Name' value={formData.first_name} name='first_name'
                                        onChange={(e) => handleChange(e)} />
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='last_name'>
                                        <span>Last Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' placeholder='Last Name' value={formData.last_name} name='last_name' onChange={(e) => handleChange(e)} />
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='email'>
                                        <span>Email Address</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' type='email' placeholder='Email Address' value={formData.email} name='email' onChange={(e) => handleChange(e)} />
                                    <small className='w-full text-red-600'>*Your email will never be shared with any third party.</small>
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='primary_phone'>
                                        <span>Primary Phone</span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' type='tel' placeholder='Primary Phone' value={formData.primary_phone} name='primary_phone' onChange={(e) => handleChange(e)} />
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='secondary_phone'>
                                        <span>Secondary Phone</span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' type='tel' placeholder='Secondary Phone' value={formData.secondary_phone} name='secondary_phone' onChange={(e) => handleChange(e)} />
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='fax'>
                                        <span>Fax</span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' type='tel' placeholder='Fax' value={formData.fax} name='fax' onChange={(e) => handleChange(e)} />
                                </div>

                            </div>
                        </div>
                    </div>


                    <div className='w-full mt-12'>
                        <h3 className='w-full font-play-fair-display text-3xl mt-2'>Mailing Address</h3>
                        <div className='w-full mt-4'>
                            <div className='w-full grid grid-cols-1 2xs:grid-cols-2 gap-5'>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='address'>
                                        <span>Address</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' placeholder='Address' value={formData.address} name='address' onChange={(e) => handleChange(e)} />
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='city'>
                                        <span>City</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' placeholder='City' value={formData.city} name='city' onChange={(e) => handleChange(e)} />
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='state'>
                                        <span>State</span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' placeholder='State' value={formData.state} name='state' onChange={(e) => handleChange(e)} />
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='zip_code'>
                                        <span>Zip Code</span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' type='number' placeholder='Zip Code' value={formData.zip_code} name='zip_code' onChange={(e) => handleChange(e)} />
                                </div>

                            </div>
                        </div>
                    </div>


                    <div className='w-full mt-12'>
                        <h3 className='w-full font-play-fair-display text-3xl mt-2'>Property Information</h3>
                        <div className='w-full mt-4'>
                            <div className='w-full grid grid-cols-1 2xs:grid-cols-2 gap-5'>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='num_of_beds'>
                                        <span>Number of Bedrooms</span>
                                    </label>
                                    <select className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md' value={formData.num_of_beds} name='num_of_beds' onChange={(e) => handleChange(e)}>
                                        {[1, 2, 3, 4, 5, 6, 7].map((item, index) => {
                                            let item_val: number | string = item
                                            if (item == 7) {
                                                item_val = "7+"
                                            }
                                            return (<option value={item_val} key={index}>{item_val}</option>)
                                        })}
                                    </select>
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='num_of_baths'>
                                        <span>Number of Bathrooms</span>
                                    </label>
                                    <select className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md' value={formData.num_of_baths} name='num_of_baths' onChange={(e) => handleChange(e)}>
                                        {[1, 2, 3, 4, 5, 6, 7].map((item, index) => {
                                            let item_val: number | string = item
                                            if (item == 7) {
                                                item_val = "7+"
                                            }
                                            return (<option value={item_val} key={index}>{item_val}</option>)
                                        })}
                                    </select>
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='square_feet'>
                                        <span>Square Feet</span>
                                    </label>
                                    <select className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md' value={formData.square_feet} name='square_feet' onChange={(e) => handleChange(e)}>
                                        <option value="Less than 1000">&lt; 1000</option>
                                        <option value="1000 - 1500">1000 - 1500</option>
                                        <option value="1500 - 2000">1500 - 2000</option>
                                        <option value="2000 - 2500">2000 - 2500</option>
                                        <option value="2500 - 3000">2500 - 3000</option>
                                        <option value="3000 - 3500">3000 - 3500</option>
                                        <option value="3500 - 4000">3500 - 4000</option>
                                        <option value="4000 - 4500">4000 - 4500</option>
                                        <option value="4500 - 5000">4500 - 5000</option>
                                        <option value="5000 - 6000">5000 - 6000</option>
                                        <option value="6000 - 7000">6000 - 7000</option>
                                        <option value="7000 - 8000">7000 - 8000</option>
                                        <option value="8000 - 9000">8000 - 9000</option>
                                        <option value="9000 - 10,000">9000 - 10,000</option>
                                        <option value="10,000 +">10,000 +</option>
                                    </select>
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='mode_of_contact'>
                                        <span>Contact You By</span>
                                    </label>
                                    <select className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md' value={formData.mode_of_contact} name='mode_of_contact' onChange={(e) => handleChange(e)}>
                                        <option value="Email">Email</option>
                                        <option value="Phone">Phone</option>
                                        <option value="Mobile">Mobile</option>
                                        <option value="Fax">Fax</option>
                                    </select>
                                </div>

                                <div className=''>
                                    <label className='w-full flex items-center font-semibold' htmlFor='price_range'>
                                        <span>Price Range</span>
                                    </label>
                                    <select className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md' value={formData.price_range} name='price_range' onChange={(e) => handleChange(e)}>
                                        <option value="Less than $300,000">Less than $300,000</option>
                                        <option value="$300,000 - $500,000">$300,000 - $500,000</option>
                                        <option value="$500,000 - $700,000">$500,000 - $700,000</option>
                                        <option value="$700,000 - $900,000">$700,000 - $900,000</option>
                                        <option value="$900,000 - $1,000,000">$900,000 - $1,000,000</option>
                                        <option value="$1,000,000 - $2,000,000">$1,000,000 - $2,000,000</option>
                                        <option value="Over $5,000,000">Over $2,000,000</option>
                                    </select>
                                </div>

                            </div>
                        </div>
                    </div>



                    <div className='w-full mt-12'>
                        <h3 className='w-full font-play-fair-display text-3xl mt-2'>Moving Details</h3>
                        <div className='w-full mt-4'>
                            <div className='w-full grid grid-cols-1 2xs:grid-cols-2 gap-5'>

                                <div className='col-span-1'>
                                    <label className='w-full flex items-center font-semibold' htmlFor='move_on'>
                                        <span>When do you want to move?</span>
                                    </label>
                                    <select className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md' value={formData.move_on} name='move_on' onChange={(e) => handleChange(e)}>
                                        <option value="">Choose</option>
                                        <option value="Less than 30 days">Less than 30 days</option>
                                        <option value="1 Month">1 Month</option>
                                        <option value="2 Months">2 Months</option>
                                        <option value="3 Months">3 Months</option>
                                        <option value="4 Months +">4 Months +</option>
                                    </select>
                                </div>

                                <div className='col-span-1'>
                                    <label className='w-full flex items-center font-semibold' htmlFor='started_looking_in'>
                                        <span>When did you start looking?</span>
                                    </label>
                                    <select className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md' value={formData.started_looking_in} name='started_looking_in' onChange={(e) => handleChange(e)}>
                                        <option value="">Choose</option>
                                        <option value="Less than 30 days">Less than 30 days</option>
                                        <option value="1 Month">1 Month</option>
                                        <option value="2 Months">2 Months</option>
                                        <option value="3 Months">3 Months</option>
                                        <option value="4 Months +">4 Months +</option>
                                    </select>
                                </div>

                                <div className='col-span-1'>
                                    <label className='w-full flex items-center font-semibold' htmlFor='own_in'>
                                        <span>Where would you like to own?</span>
                                    </label>
                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' placeholder='e.g The city' value={formData.own_in} name='own_in' onChange={(e) => handleChange(e)} />
                                </div>

                                <div className='col-span-1'>
                                    <label className='w-full flex items-center font-semibold' htmlFor='with_an_agent'>
                                        <span>Are you currently with an agent?</span>
                                    </label>
                                    <select className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md' value={formData.with_an_agent} name='with_an_agent' onChange={(e) => handleChange(e)}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>


                                <div className='col-span-1 2xs:col-span-2'>
                                    <label className='w-full flex items-center font-semibold' htmlFor='home_description'>
                                        <span>Describe your Dream Home</span>
                                    </label>
                                    <textarea className='w-full border border-gray-300 p-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md h-44 resize-none' placeholder='e.g. Large Windows, spacious kitchen ... '
                                        value={formData.home_description} name='home_description' onChange={(e) => handleChange(e)} />

                                    <small className='w-full text-red-600'>
                                        *Your information will never be shared with any third party.
                                    </small>
                                </div>

                                <div className='col-span-1 2xs:col-span-2 flex justify-end'>
                                    {!isSubmitting ?
                                        <button className='bg-primary py-3 px-6 text-white font-light text-sm uppercase flex items-center' onClick={handleSubmit}>
                                            <span>Submit Form</span> <RiMailSendLine size={16} className='ml-2' />
                                        </button> :
                                        <button className='bg-primary/80 py-3 px-6 text-white font-light text-sm uppercase flex items-center 
                                     cursor-not-allowed' disabled>
                                            <span>Please Wait</span> <AiOutlineLoading3Quarters size={16} className='animate-spin ml-2' />
                                        </button>
                                    }
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </section>
            {/** <ToastContainer /> **/}
        </>
    )
}

export default Buying