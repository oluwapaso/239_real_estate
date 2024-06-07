"use client"

import { Helpers } from '@/_lib/helpers'
import { APIResponseProps, BlogCommentsListsParams } from '@/components/types'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import HeroHeader from '@/components/HeroHeader'
import BlogSearch from '@/components/BlogSearch'
import BlogCategoryLists from '@/components/BlogCategoryLists'
import ImageWithFallback from '@/components/ImageWithFallback'
import "../../../../../CkEditor/content-styles.css";
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import moment from 'moment'
import { ImFacebook2 } from 'react-icons/im'
import { FaSquareFacebook, FaXTwitter } from 'react-icons/fa6'
import { GrPrint } from 'react-icons/gr'
import CommentBox from '@/components/CommentBox'
import CommentCard from '@/app/(admin)/admin/_components/CommentCard'
import Modal from '@/components/Modal'
import {
    EmailShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    WhatsappShareButton,
} from "react-share";
import { BsTwitterX } from 'react-icons/bs'
import { MdOutlineMarkEmailUnread } from 'react-icons/md'
import { FaLinkedin, FaWhatsapp } from 'react-icons/fa'
import { RootState } from '../../GlobalRedux/store'
import { useSelector } from 'react-redux'

const helpers = new Helpers();
const BlogPostDetails = () => {

    const params = useParams();
    const slug = params?.slug as string;
    const comp_info = useSelector((state: RootState) => state.app);

    const [loggedUserId, setLoggedUserId] = useState('');
    const [post, setBlogPost] = useState<any>();
    const [post_fetched, setPostFetched] = useState(false);
    const [post_comments, setPostsComments] = useState<any[]>([]);
    const [fetch_comments, setFetchComments] = useState(true);
    const [comment_fetched, setCommentsFetched] = useState(false);
    const [draft_id, setDraftId] = useState(0);
    const [keyword, setKeyword] = useState("");
    let all_comments: React.JSX.Element[] = [];
    const [page_url, setPageURL] = useState("");
    const share_title = `Look at what i found on ${process.env.NEXT_PUBLIC_COMPANY_NAME}'s website`;

    const [showModal, setShowModal] = useState(false);
    const [modal_children, setModalChildren] = useState({} as React.ReactNode);

    const closeModal = () => {
        setShowModal(false);
    }

    const handleReply = (draft_id: number, comment_id: number, comment_parent: string) => {
        // setModalChildren(<ReplyComments closeModal={closeModal} draft_id={draft_id} comment_id={comment_id} comment_parent={comment_parent} />);
        // setShowModal(true);
    }

    useEffect(() => {
        setPageURL(`${window.location.href}/${slug}`);
    }, []);

    useEffect(() => {
        const storedValue = localStorage.getItem('logged_user_id');
        if (storedValue) {
            setLoggedUserId(storedValue);
        } else {
            const val = helpers.GenarateRandomString(15);
            localStorage.setItem('logged_user_id', val);
            setLoggedUserId(val);
        }
    }, []);

    useEffect(() => {

        const fetchBlogPosts = async () => {

            try {

                const postPromise: Promise<APIResponseProps> = helpers.GetBlogPostInfo(slug)
                const postResp = await postPromise;

                if (postResp.success) {

                    setBlogPost(postResp.data.draft_info);
                    setDraftId(postResp.data.draft_info.post_draft_id);
                    setPostFetched(true);

                } else {
                    throw new Error(postResp.message)
                }

            } catch (e: any) {
                console.log(e.message)
            }

        }

        const addBlogView = async () => {
            try {

                const viewPromise: Promise<APIResponseProps> = helpers.AddBlogView(slug, loggedUserId)
                const viewResp = await viewPromise;

                if (!viewResp.success) {
                    console.log("addBlogView error:", viewResp.message)
                }

            } catch (e: any) {
                console.log("addBlogView errorC:", e.message)
            }
        }

        fetchBlogPosts();
        addBlogView();

    }, [slug]);

    useEffect(() => {

        const fetchPostComments = async () => {

            try {

                const payload = {
                    post_id: draft_id,
                    paginated: false,
                }

                const commentPromise: Promise<BlogCommentsListsParams[]> = helpers.LoadBlogComments(payload)
                const comResp = await commentPromise;
                setPostsComments(comResp);
                setFetchComments(false);
                setCommentsFetched(true);

            } catch (e: any) {
                console.log(e.message);
            }

        }

        if (fetch_comments && draft_id > 0) {
            fetchPostComments();
        }

    }, [fetch_comments, draft_id]);

    //const crumb = <><Link href="/"> Home</Link> <span>/</span> <Link href="/blog-posts?page=1">Real Estate News</Link></>
    const crumb = <div className='font-play-fair-display text-4xl !text-white'>
        {
            post_fetched ? (
                post ? (
                    post.post_title
                ) : ""
            ) : ""
        }
    </div>;

    const no_cat_added = <div className='bg-red-100 p-10 mt-2 text-red-600 flex flex-col justify-center items-center min-h-6'>
        <div className='w-full text-center'>No comment added yet. Be the first to leave a comments.</div>
    </div>

    if (Array.isArray(post_comments)) {

        if (post_comments.length > 0) {

            all_comments = post_comments.map((comm) => {
                return (<CommentCard key={comm.comment_id} comm={comm} handleReply={handleReply} />)
            })

        } else {

            //Making sure request has been sent
            if (comment_fetched) {
                all_comments[0] = no_cat_added
            } else {
                all_comments[0] = <div className='w-full flex justify-center items-center min-h-60'>
                    <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                </div>
            }

        }

    }

    return (
        <>
            <HeroHeader page="Has Hero" bg_image={`${comp_info.blog_header?.image_loc ? comp_info.blog_header?.image_loc : '../tulip-flowers-in-corner.jpg'}`} crumb={crumb} big_crum={true} />
            <section className='w-full bg-white py-10'>
                <div className='container mx-auto max-w-[700px] lg:max-w-[1200px] px-3 xl:px-0 text-left'>
                    {
                        post_fetched ? (
                            post ? (
                                <div className='w-full grid grid-cols-1 lg:grid-cols-6 gap-6 mt-0'>

                                    <div className='lg:col-span-4'>
                                        <div className='w-full'>
                                            <div className='w-full'>

                                                <div className='w-full'>
                                                    <ImageWithFallback key={post.post_id} width={1250} height={400}
                                                        src={`${(post.header_image?.image_loc && post.header_image?.image_loc != "") ? post.header_image?.image_loc : "/no-blog-image-added.png"}`}
                                                        fallbackSrc={`/no-blog-image-added.png`} alt={post.post_title} />
                                                </div>

                                                <div className='w-full font-normal mt-3 overflow-x-hidden'>
                                                    <div className='w-full ck-content' dangerouslySetInnerHTML={{ __html: post.post_body }} />
                                                </div>

                                                <div className='w-full my-1 py-2 border-b border-gray-200 text-gray-600 font-normal'>
                                                    Posted On <time>{moment(post.date_added).format("MMMM DD, YYYY")}</time>
                                                </div>

                                                <div className='mt-4 w-full font-medium'>Share This Page:</div>
                                                <div className='w-full mt-1 flex items-center *:!p-2 *:!flex *:!items-center *:!justify-center 
                                                *:!bg-primary text-white *:!cursor-pointer *:!rounded-md space-x-4 flex-wrap'>
                                                    <FacebookShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                        <FaSquareFacebook size={22} />
                                                    </FacebookShareButton>

                                                    <TwitterShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                        <BsTwitterX size={22} />
                                                    </TwitterShareButton>

                                                    <EmailShareButton url={page_url} subject={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                        <MdOutlineMarkEmailUnread size={22} />
                                                    </EmailShareButton>

                                                    <LinkedinShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                        <FaLinkedin size={22} />
                                                    </LinkedinShareButton>

                                                    <WhatsappShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                        <FaWhatsapp size={22} />
                                                    </WhatsappShareButton>

                                                    <button className='hover:shadow-xl hover:bg-sky-700' onClick={() => window.print()}>
                                                        <GrPrint size={22} />
                                                    </button>

                                                </div>

                                                <div className='w-full mt-10'>
                                                    <div className='w-full font-semibold text-2xl'>Comments</div>
                                                    <div className='w-full'>{all_comments}</div>
                                                </div>

                                                <CommentBox draft_id={draft_id} setFetchComments={setFetchComments} />

                                            </div>
                                        </div>
                                    </div>

                                    <div className='hidden lg:block lg:col-span-2'>
                                        <BlogSearch keyword={keyword} setKeyword={setKeyword} setPostFetched={setPostFetched} />
                                        <BlogCategoryLists />
                                    </div>

                                </div>
                            ) : <div className='w-full bg-red-100 text-red-600 flex justify-center items-center min-h-60'>
                                Invalid blog posts info provided...
                            </div>
                        ) : <div className='w-full flex justify-center items-center min-h-60'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>
                    }

                </div>
            </section>

            <Modal show={showModal} children={modal_children} width={700} closeModal={closeModal} title=<div>Reply To Comment</div> />
        </>
    )

}

export default BlogPostDetails