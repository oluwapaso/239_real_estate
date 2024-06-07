"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { APIResponseProps, BlogPostInfoParams } from '@/components/types'
import React, { useEffect, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { useDispatch } from 'react-redux'
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice'
import Swal from 'sweetalert2'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@/components/Modal'
import EditBlogCategory from '../../../_components/EditBlogCategory'
import Link from 'next/link'
import { BiAddToQueue, BiEditAlt } from 'react-icons/bi'
import MoreBlogActions from '../../../_components/MoreBlogActions'
import { useSearchParams } from 'next/navigation'
import CustomLink from '@/components/CustomLink'

const helpers = new Helpers();
const BlogPosts = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    const closeModal = () => {
        setShowModal(false);
    }

    const [blog_posts, setBlogPosts] = useState<any[]>([]);
    const [post_fetched, setPostFetched] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [refresh_page, setRefreshPage] = useState(false);
    const [modal_title, setModalTitle] = useState(<div>Add New Category</div>)
    const [modal_children, setModalChildren] = useState({} as React.ReactNode)

    const page_size = 20;
    let total_page = 0;
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    let all_posts: React.JSX.Element[] = [];

    const payload = {
        paginated: true,
        post_type: "Draft",
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchBlogPosts = async () => {

            try {

                const postPromise: Promise<BlogPostInfoParams[]> = helpers.LoadBlogPosts(payload)
                const postResp = await postPromise
                setBlogPosts(postResp);
                setPostFetched(true);
                dispatch(hidePageLoader())

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchBlogPosts();

    }, [curr_page, refresh_page]);

    const handleDelete = async (draft_id: number) => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this post?",
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
            await fetch(`${apiBaseUrl}/api/(blogs)/delete-blog-post`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "draft_id": draft_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    const item = document.getElementById(`blog_post_${draft_id}`)
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
                <div className='w-full text-center'>No blog post added yet</div>
                <CustomLink href={`/admin/add-new-post`} className='bg-primary py-3 px-6 mt-2 hover:shadow-lg text-white flex items-center 
                    justify-center font-normal text-base cursor-pointer hover:drop-shadow-xl'>
                    <BiAddToQueue className='mr-1 !text-xl' /> <span>Add New Post</span>
                </CustomLink>
            </div>

        </td>
    </tr>

    if (Array.isArray(blog_posts)) {

        if (blog_posts.length > 0) {

            const total_records = blog_posts[0].total_records
            const total_returned = blog_posts.length
            total_page = Math.ceil(total_records / page_size)

            if (total_records > 0 && total_returned > 0) {

                all_posts = blog_posts.map((post) => {

                    let dirty_icon;
                    if (post.is_dirty == "Yes") {
                        dirty_icon = <BiEditAlt size={17} className='ml-1 text-orange-500' />
                    }

                    return (
                        <tr key={post.draft_id} id={`blog_post_${post.draft_id}`} className='transition-all duration-500'>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500'>
                                <CustomLink href={`/admin/edit-blog-post?draft_id=${post.draft_id}`}
                                    className='font-medium text-sky-800'>{post.post_title}</CustomLink>
                            </td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500 text-center'>
                                {
                                    post.published == "Yes" ? <div className='!text-green-600 font-medium flex items-center justify-center'>
                                        <span>Published</span> {dirty_icon}
                                    </div> : <div className='!text-red-500'>Draft</div>
                                }
                            </td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500 text-center'>{post.views}</td>
                            <td className='border-b border-slate-100 p-4 pl-8 text-slate-500 text-center'>{post.comments}</td>
                            <td className='border-b border-slate-100 p-4 pl-8 w-[130px]'>
                                <div className='flex justify-end'>
                                    <MoreBlogActions post_id={post.post_id} draft_id={post.draft_id} slug={post.slug}
                                        published={post.published} handleDelete={() => handleDelete(post.draft_id)} />
                                </div>
                            </td>
                        </tr>
                    )
                })

            } else {
                all_posts[0] = no_cat_added
            }

        } else {

            //Making sure request has been sent
            if (post_fetched) {
                all_posts[0] = no_cat_added
            }

        }

    }

    const add_new_comp = <CustomLink href={`/admin/add-new-post`} className='bg-primary text-white flex items-center justify-center ml-2 py-1 
        h-10 px-4 text-sm font-medium cursor-pointer hover:drop-shadow-xl'>
        <BiAddToQueue className='mr-1 !text-xl' /> <span>Add New Post</span>
    </CustomLink>

    return (
        <div className='w-full'>
            <PageTitle text="Blog Posts" show_back={false} right_component={add_new_comp} />
            <div className='!w-full !max-w-[100%] relative overflow-auto box-border'>
                <table className="relative shadow-xl table-fixed w-[900px] lg:w-full text-sm mt-8 bg-slate-200 rounded-md border border-slate-300">
                    <thead className='w-full'>
                        <tr className='w-full'>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left'>Title</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-center w-[150px]'>Status</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-center w-[150px]'>Views</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-center w-[150px]'>Comments</th>
                            <th className='border-b font-medium p-4 pl-8 pt-3 pb-3 text-primary text-left w-[130px]'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='bg-white dark:bg-slate-800'>
                        {all_posts}
                    </tbody>
                    <tfoot className='bg-white'></tfoot>
                </table>
            </div>
            {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/blog-posts?' /> : null}
            <ToastContainer />
            <Modal show={showModal} children={modal_children} width={550} closeModal={closeModal} title={modal_title} />
        </div>
    )

}

export default BlogPosts