"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import type { APIResponseProps, BlogCategories } from '@/components/types'
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

const helpers = new Helpers();
const BlogCategories = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    const closeModal = () => {
        setShowModal(false);
    }

    const [categories, setCategories] = useState<BlogCategories[]>([]);
    const [cat_fetched, setCatFetched] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [refresh_page, setRefreshPage] = useState(false);
    const [modal_title, setModalTitle] = useState(<div>Add New Category</div>);
    const [modal_children, setModalChildren] = useState({} as React.ReactNode);

    const page_size = 20;
    let total_page = 0;
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    let all_categories: React.JSX.Element[] = [];

    const payload = {
        paginated: true,
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const catPromise: Promise<BlogCategories[]> = helpers.LoadCategories(payload)
                const catsResp = await catPromise
                setCategories(catsResp);
                setCatFetched(true);
                dispatch(hidePageLoader())

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchCategories();

    }, [curr_page, refresh_page]);

    const handleAdd = () => {
        setModalTitle(<div>Add New Category</div>)
        setModalChildren(<AddBlogCategory closeModal={closeModal} setRefreshPage={setRefreshPage} refresh_page={refresh_page} />);
        setShowModal(true);
    }

    const handleEdit = (cat_id: number, cat_name: string) => {
        setModalTitle(<div>Update Category Name</div>)
        setModalChildren(<EditBlogCategory closeModal={closeModal} cat_id={cat_id} cat_name={cat_name}
            setRefreshPage={setRefreshPage} refresh_page={refresh_page} />);
        setShowModal(true);
    }

    const handleDelete = async (category_id: number) => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this blog category?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Continue',
        });

        if (result.isConfirmed) {

            dispatch(showPageLoader());

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            await fetch(`${apiBaseUrl}/api/(blogs)/manage-categories`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "category_id": category_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    const item = document.getElementById(`category_${category_id}`)
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

    const no_cat_added = <tr>
        <td colSpan={4} className='bg-white text-red-600'>

            <div className='my-10 flex flex-col justify-center items-center min-h-6'>
                <div className='w-full text-center'>No blog category added yet</div>
                <div className='bg-primary py-3 px-6 mt-2 hover:shadow-lg text-white flex items-center justify-center font-normal 
                    text-base cursor-pointer hover:drop-shadow-xl' onClick={handleAdd}>
                    <HiOutlineViewGridAdd className='mr-1 !text-xl' /> <span>Add New Category</span>
                </div>
            </div>

        </td>
    </tr>

    if (Array.isArray(categories)) {

        if (categories.length > 0) {

            const total_records = categories[0].total_records
            const total_returned = categories.length
            total_page = Math.ceil(total_records / page_size)

            if (total_records > 0 && total_returned > 0) {

                all_categories = categories.map((cat) => {
                    return (
                        <tr key={cat.category_id} id={`category_${cat.category_id}`} className='transition-all duration-500'>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500'>{cat.name}</td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500'>{cat.slug}</td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500'>{cat.number_of_posts}</td>
                            <td className='border-b border-slate-100 p-4 pl-8 w-[250px]'>
                                <div className='flex justify-end'>
                                    <div className='hover:scale-110 transition-all duration-500 mr-3'>
                                        <button className='flex items-center bg-sky-600 text-white py-2 px-4 rounded-md hover:shadow-xl'
                                            onClick={() => handleEdit(cat.category_id, cat.name)}>
                                            <FaEdit size={16} /> <span className='font-normal ml-1'>Edit</span>
                                        </button>
                                    </div>
                                    <div className='hover:scale-110 transition-all duration-500'>
                                        <button className='flex items-center bg-red-600 text-white py-2 px-4 rounded-md hover:shadow-xl'
                                            onClick={() => handleDelete(cat.category_id)}>
                                            <PiTrashThin size={16} /> <span className='font-normal ml-1'>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })

            } else {
                all_categories[0] = no_cat_added
            }

        } else {

            //Making sure request has been sent
            if (cat_fetched) {
                all_categories[0] = no_cat_added
            }

        }

    }

    const add_new_comp = <div className='bg-primary text-white flex items-center justify-center ml-2 py-1 h-10 px-4 text-sm font-medium 
    cursor-pointer hover:drop-shadow-xl' onClick={handleAdd}>
        <HiOutlineViewGridAdd className='mr-1 !text-xl' /> <span>Add New Category</span>
    </div>

    return (
        <div className='w-full box-border !max-w-[100%]'>
            <PageTitle text="Blog Categories" show_back={false} right_component={add_new_comp} />
            <div className='!w-full !max-w-[100%] relative overflow-auto box-border'>
                <table className="shadow-xl table-fixed w-[900px] lg:w-full text-sm mt-8 bg-slate-200 rounded-md border border-slate-300">
                    <thead className='w-full'>
                        <tr className='w-full'>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left'>Name</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left'>Slug</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left'>Number of Posts</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left w-[250px]'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='bg-white dark:bg-slate-800'>
                        {all_categories}
                    </tbody>
                </table>
            </div>
            {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/blog-categories?' /> : null}
            <ToastContainer />
            <Modal show={showModal} children={modal_children} width={550} closeModal={closeModal} title={modal_title} />
        </div>
    )

}

export default BlogCategories