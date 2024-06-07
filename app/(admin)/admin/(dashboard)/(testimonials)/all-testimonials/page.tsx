"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import type { APIResponseProps, BlogCategories, Testimonials } from '@/components/types'
import React, { useEffect, useState } from 'react'
import { FaEdit } from 'react-icons/fa'
import { PiTrashThin } from 'react-icons/pi'
import PageTitle from '../../../_components/PageTitle'
import { useDispatch } from 'react-redux'
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice'
import Swal from 'sweetalert2'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@/components/Modal'
import AddBlogCategory from '../../../_components/AddBlogCategory'
import { HiOutlineViewGridAdd } from 'react-icons/hi'
import EditBlogCategory from '../../../_components/EditBlogCategory'
import { useSearchParams } from 'next/navigation'
import CustomLink from '@/components/CustomLink'

const helpers = new Helpers();
const AllTestimonials = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    const [testimonials, setTestimonials] = useState<any>([]);
    const [testi_fetched, setTestiFetched] = useState(false);

    const page_size = 20;
    let total_page = 0;
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    let all_testimonials: React.JSX.Element[] = [];

    const payload = {
        paginated: true,
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchTestimonials = async () => {

            try {

                const testiPromise: Promise<any> = helpers.LoadTestimonials(payload)
                const testiResp = await testiPromise;

                setTestimonials(testiResp.data);
                setTestiFetched(true);
                dispatch(hidePageLoader())

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchTestimonials();

    }, [curr_page]);

    const handleDelete = async (testimonial_id: number) => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this testimonial?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete It',
        });

        if (result.isConfirmed) {

            dispatch(showPageLoader());

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            await fetch(`${apiBaseUrl}/api/(testimonials)/manage-testimonials`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "testimonial_id": testimonial_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    const item = document.getElementById(`testimonial_${testimonial_id}`)
                    item?.classList.add("scale-0");

                    const rm_to = setTimeout(() => {
                        item?.remove();
                        window.clearTimeout(rm_to);
                    }, 450);

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

            });

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    const no_testi_added = <tr>
        <td colSpan={4} className='bg-white text-red-600'>

            <div className='my-10 flex flex-col justify-center items-center min-h-6'>
                <div className='w-full text-center'>No blog category added yet</div>
                <CustomLink href={`/admin/add-new-testimonial`} className='bg-primary py-3 px-6 mt-2 hover:shadow-lg text-white flex 
                items-center justify-center font-normal text-base cursor-pointer hover:drop-shadow-xl'>
                    <HiOutlineViewGridAdd className='mr-1 !text-xl' /> <span>Add New Testimonial</span>
                </CustomLink>
            </div>

        </td>
    </tr>

    if (Array.isArray(testimonials)) {

        if (testimonials.length > 0) {

            const total_records = testimonials[0].total_records
            const total_returned = testimonials.length
            total_page = Math.ceil(total_records / page_size)

            if (total_records > 0 && total_returned > 0) {

                all_testimonials = testimonials.map((testi) => {
                    return (
                        <tr key={testi.testimonial_id} id={`testimonial_${testi.testimonial_id}`} className='transition-all duration-500'>
                            <td className='border-b border-slate-100 p-4 text-slate-500'>{testi.fullname}</td>
                            <td className='border-b border-slate-100 p-4 text-slate-500'>{testi.account_type}</td>
                            <td className='border-b border-slate-100 p-4 text-slate-500'>{testi.testimonial}</td>
                            <td className='border-b border-slate-100 p-4 w-[250px]'>
                                <div className='flex justify-end'>
                                    <div className='hover:scale-110 transition-all duration-500 mr-3'>
                                        <CustomLink href={`/admin/edit-testimonial?testimonial_id=${testi.testimonial_id}`}
                                            className='flex items-center bg-sky-600 text-white py-2 px-4 rounded-md hover:shadow-xl'>
                                            <FaEdit size={16} /> <span className='font-normal ml-1'>Edit</span>
                                        </CustomLink>
                                    </div>
                                    <div className='hover:scale-110 transition-all duration-500'>
                                        <button className='flex items-center bg-red-600 text-white py-2 px-4 rounded-md hover:shadow-xl'
                                            onClick={() => handleDelete(testi.testimonial_id)}>
                                            <PiTrashThin size={16} /> <span className='font-normal ml-1'>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })

            } else {
                testimonials[0] = no_testi_added
            }

        } else {

            //Making sure request has been sent
            if (testi_fetched) {
                testimonials[0] = no_testi_added
            }

        }

    }

    const add_new_comp = <CustomLink href={`/admin/add-new-testimonial`} className='bg-primary text-white flex items-center justify-center 
    ml-2 py-1 h-10 px-4 text-sm font-medium cursor-pointer hover:drop-shadow-xl'>
        <HiOutlineViewGridAdd className='mr-1 !text-xl' /> <span>Add New Testimonial</span>
    </CustomLink>

    return (
        <div className='w-full box-border !max-w-[100%]'>
            <PageTitle text="Testimonials" show_back={false} right_component={add_new_comp} />
            <div className='!w-full !max-w-[100%] relative overflow-auto box-border pb-8'>
                <table className="shadow-xl table-auto w-[900px] lg:w-full text-sm mt-8 bg-slate-200 rounded-md border border-slate-300">
                    <thead className='w-full'>
                        <tr className='w-full'>
                            <th className='border-b font-medium p-4 pt-3 pb-3 text-primary text-left w-[200px]'>Name</th>
                            <th className='border-b font-medium p-4 pt-3 pb-3 text-primary text-left w-[150px]'>Account Type</th>
                            <th className='border-b font-medium p-4 pt-3 pb-3 text-primary text-left'>Testimonial</th>
                            <th className='border-b font-medium p-4 pt-3 pb-3 text-primary text-left w-[250px]'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='bg-white dark:bg-slate-800'>
                        {all_testimonials}
                    </tbody>
                </table>
            </div>
            {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/all-testimonials?' /> : null}
            <ToastContainer />
        </div>
    )

}

export default AllTestimonials