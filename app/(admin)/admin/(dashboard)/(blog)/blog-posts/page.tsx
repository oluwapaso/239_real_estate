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
import { BiAddToQueue, BiEditAlt } from 'react-icons/bi'
import MoreBlogActions from '../../../_components/MoreBlogActions'
import { useSearchParams } from 'next/navigation'
import CustomLink from '@/components/CustomLink'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

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

    if (Array.isArray(blog_posts)) {

        if (blog_posts.length > 0) {

            const total_records = blog_posts[0].total_records
            const total_returned = blog_posts.length
            total_page = Math.ceil(total_records / page_size)

        }

    }

    const add_new_comp = <CustomLink href={`/admin/add-new-post`} className='bg-primary text-white flex items-center justify-center ml-2 py-1 
        h-10 px-4 text-sm font-medium cursor-pointer hover:drop-shadow-xl rounded-md'>
        <BiAddToQueue className='mr-1 !text-xl' /> <span>Add New Post</span>
    </CustomLink>

    return (
        <div className='w-full'>
            <PageTitle text="Blog Posts" show_back={false} right_component={add_new_comp} />
            <div className='!w-full !max-w-[100%] h-auto relative box-border pb-5'>
                <div className="w-full mt-3 border border-gray-200 rounded-md shadow-xl">
                    {/* Header */}
                    <div className=" bg-gray-100 grid grid-cols-[2fr_repeat(3,1fr)_minmax(100px,100px)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                        <div className="cell-header">Title</div>
                        <div className="cell-header">Status</div>
                        <div className="cell-header">Views</div>
                        <div className="cell-header">Comments</div>
                        <div className="cell-header">Actions</div>
                    </div>

                    <div className='w-full divide-y divide-gray-200'>
                        {/* Loader */}
                        {!post_fetched && <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}


                        {/* Rows */}
                        {
                            post_fetched && (
                                (blog_posts.length && blog_posts.length > 0)
                                    ? (blog_posts.map((post) => {

                                        let dirty_icon;
                                        if (post.is_dirty == "Yes") {
                                            dirty_icon = <BiEditAlt size={17} className='ml-1 text-orange-500' />
                                        }

                                        return (<div key={post.draft_id} id={`blog_post_${post.draft_id}`} className="bg-white grid 
                                            grid-cols-[2fr_repeat(3,1fr)_minmax(100px,100px)] items-center *:text-wrap *:break-all *:px-4 *:py-3 
                                            *:font-normal">
                                            <div>
                                                <CustomLink href={`/admin/edit-blog-post?draft_id=${post.draft_id}`}
                                                    className='font-medium text-sky-800'>{post.post_title}</CustomLink>
                                            </div>
                                            <div>
                                                {
                                                    post.published == "Yes" ? <div className='!text-green-600 font-medium flex items-center'>
                                                        <span>Published</span> {dirty_icon}
                                                    </div> : <div className='!text-red-500'>Draft</div>
                                                }
                                            </div>
                                            <div>{post.views}</div>
                                            <div>{post.comments}</div>
                                            <div className='flex justify-end'>
                                                <MoreBlogActions post_id={post.post_id} draft_id={post.draft_id} slug={post.slug}
                                                    published={post.published} handleDelete={() => handleDelete(post.draft_id)} />
                                            </div>
                                        </div>)
                                    }))
                                    : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                        No blog post added yet.
                                    </div>)
                        }
                    </div>

                </div>
            </div>
            <div className='w-full h-[90px]'>
                {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/blog-posts?' /> : null}
            </div>
            <ToastContainer />
            <Modal show={showModal} children={modal_children} width={550} closeModal={closeModal} title={modal_title} />
        </div>
    )

}

export default BlogPosts