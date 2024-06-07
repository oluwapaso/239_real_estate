"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { BlogCommentsListsParams } from '@/components/types'
import React, { useEffect, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { useDispatch } from 'react-redux'
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ImReply } from 'react-icons/im'
import { RiAdminLine } from 'react-icons/ri'
import moment from 'moment'
import Modal from '@/components/Modal'
import ReplyComments from '../../../_components/ReplyComments'
import { useSearchParams } from 'next/navigation'

const helpers = new Helpers();
const BlogComments = () => {

    const closeModal = () => {
        setShowModal(false);
    }

    const searchParams = useSearchParams();
    const [post_comments, setPostsComments] = useState<any[]>([]);
    const [comment_fetched, setCommentsFetched] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modal_children, setModalChildren] = useState({} as React.ReactNode);

    const page_size = 20;
    let total_page = 0;
    let total_comments = 0;
    const post_id = parseInt(searchParams?.get("post_id") as string) || 0; //Actually a draft_id
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    const dispatch = useDispatch();
    let all_comments: React.JSX.Element[] = [];

    const payload = {
        post_id: post_id,
        paginated: true,
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchBlogComments = async () => {

            try {

                const commentPromise: Promise<BlogCommentsListsParams[]> = helpers.LoadBlogComments(payload)
                const comResp = await commentPromise
                setPostsComments(comResp);
                setCommentsFetched(true);
                dispatch(hidePageLoader())

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader())
        fetchBlogComments();

    }, [curr_page]);

    const handleReply = (draft_id: number, comment_id: number, comment_parent: string) => {
        setModalChildren(<ReplyComments closeModal={closeModal} draft_id={draft_id} comment_id={comment_id} comment_parent={comment_parent} />);
        setShowModal(true);
    }

    const no_cat_added = <div className='bg-white p-10 mt-2 text-red-600 flex flex-col justify-center items-center min-h-6'>
        <div className='w-full text-center'>No comment added yet</div>
    </div>

    if (Array.isArray(post_comments)) {

        if (post_comments.length > 0) {

            const total_records = post_comments[0].total_records
            const total_returned = post_comments.length
            total_page = Math.ceil(total_records / page_size);
            total_comments = total_records;

            if (total_records > 0 && total_returned > 0) {

                all_comments = post_comments.map((comm) => {
                    return (
                        <div key={comm.comment_id} id={`post_id_${comm.comment_id}`}
                            className='w-full max-w-[100%] p-4 border border-gray-200 bg-white my-3'>
                            <div className='w-full flex flex-col xs:flex-row justify-between items-start xs:items-center mb-2'>
                                <div className='font-bold text-base flex flex-col'>
                                    {
                                        comm.reply_by == "Admin" ? (
                                            <>
                                                <span className='flex text-red-600 items-center'>
                                                    <RiAdminLine size={20} /> <span className='ml-1'>Admin</span>
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{comm.name}</span>
                                                <span className='text-gray-700 text-sm font-normal break-words'>({comm.email})</span>
                                            </>
                                        )
                                    }

                                </div>
                                <div className='mt-2 xs:mt-0'>
                                    <button className='bg-sky-700 text-white rounded flex items-center justify-center py-2 px-4
                                     hover:drop-shadow-xl' onClick={() => handleReply(comm.post_id, comm.comment_id, comm.comment_body)}>
                                        <ImReply size={15} /> <span className='text-sm ml-1'>Reply</span>
                                    </button>
                                </div>
                            </div>

                            <div className='w-full'>
                                <div className='w-full'>{comm.comment_body}</div>
                                {
                                    (comm.comment_parent && comm.comment_parent != "") && (
                                        <div className='w-full mt-2 bg-gray-50 p-4 border border-gray-200'>
                                            {comm.comment_parent}
                                        </div>
                                    )
                                }
                            </div>

                            <div className='w-full mt-2 flex justify-end'>
                                <span className=' text-gray-500 text-sm font-medium'>{moment(comm.date_added).format("MMMM D, YYYY h:m:s A")}</span>
                            </div>
                        </div>
                    )
                });

            } else {
                all_comments[0] = no_cat_added
            }

        } else {

            //Making sure request has been sent
            if (comment_fetched) {
                all_comments[0] = no_cat_added
            }

        }

    }

    return (
        <div className='w-full'>

            <div className='container m-auto max-w-[600px] lg:max-w-[1100px]'>
                <PageTitle text="Post Comments" show_back={true} />
                <div className='w-full px-2 sm:px-4 mt-6 font-medium text-lg'>{total_comments} Comment{total_comments > 0 ? "s" : ""}</div>
                <div className='w-full px-2 sm:px-4'>
                    {all_comments}
                </div>

                {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`/admin/blog-comments?post_id=${post_id}&`} /> : null}
            </div>

            <ToastContainer />
            <Modal show={showModal} children={modal_children} width={700} closeModal={closeModal} title=<div>Reply To Comment</div> />
        </div>
    )

}

export default BlogComments