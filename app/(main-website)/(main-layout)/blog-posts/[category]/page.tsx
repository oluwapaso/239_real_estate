"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { BlogPostInfoParams } from '@/components/types'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import HeroHeader from '@/components/HeroHeader'
import BlogSearch from '@/components/BlogSearch'
import BlogCategoryLists from '@/components/BlogCategoryLists'
import BlogPostCard from '@/components/BlogPostCard'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { RootState } from '../../GlobalRedux/store'
import { useSelector } from 'react-redux'
import CustomLinkMain from '@/components/CustomLinkMain'

const helpers = new Helpers();
const BlogPosts = () => {

    const searchParams = useSearchParams();
    const params = useParams();
    const comp_info = useSelector((state: RootState) => state.app);

    const [blog_posts, setBlogPosts] = useState<any[]>([]);
    const [keyword, setKeyword] = useState("");
    const [post_fetched, setPostFetched] = useState(false);

    const page_size = 20;
    let total_page = 0;
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    const cat_id = parseInt(searchParams?.get("ref") as string);
    const category_name = searchParams?.get("tag") as string;
    const category = params?.category;
    let all_posts: React.JSX.Element[] = [];

    const payload = {
        paginated: true,
        post_type: "Published By Cats",
        category_id: cat_id,
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

            } catch (e: any) {
                console.log(e.message)
            }

        }

        fetchBlogPosts();

    }, [curr_page]);


    const no_post_added = <div className='w-full bg-red-100 text-red-600 flex justify-center items-center min-h-60'>
        No blog posts added yet
    </div>

    if (Array.isArray(blog_posts)) {

        if (blog_posts.length > 0) {

            const total_records = blog_posts[0].total_records
            const total_returned = blog_posts.length
            total_page = Math.ceil(total_records / page_size)

            if (total_records > 0 && total_returned > 0) {

                all_posts = blog_posts.map((post) => {
                    return <BlogPostCard key={post.draft_id} post={post} />
                })

            } else {
                all_posts[0] = no_post_added
            }

        } else {

            //Making sure request has been sent
            if (post_fetched) {
                all_posts[0] = no_post_added
            } else {
                all_posts[0] = <div className='w-full flex justify-center items-center min-h-60'>
                    <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                </div>
            }

        }

    } else {
        //Making sure request has been sent
        if (post_fetched) {
            all_posts[0] = no_post_added
        } else {
            all_posts[0] = <div className='w-full flex justify-center items-center min-h-60'>
                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
            </div>
        }
    }

    const crumb = <><CustomLinkMain href="/"> Home</CustomLinkMain> <span>/</span> <CustomLinkMain href="/blog-posts?page=1">Real Estate News</CustomLinkMain></>

    return (
        <>
            <HeroHeader page="Has Hero" bg_image={`${comp_info.blog_header?.image_loc ? comp_info.blog_header?.image_loc : '../tulip-flowers-in-corner.jpg'}`} crumb={crumb} />
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[1250px] px-3 xl:px-0 text-left'>
                    <h3 className='w-full font-play-fair-display text-3xl md:text-4xl'>
                        Real Estate News - {category_name}
                    </h3>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-6 gap-6 mt-6'>

                        <div className='lg:col-span-4 order-2 lg:order-1'>
                            <div className='w-full'>
                                <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4'>{all_posts}</div>
                                {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`/blog-posts/${category}?ref=${cat_id}&tag=${category_name}&`} /> : null}
                            </div>
                        </div>

                        <div className='lg:col-span-2 order-1 lg:order-2'>
                            <BlogSearch keyword={keyword} setKeyword={setKeyword} setPostFetched={setPostFetched} />
                            <BlogCategoryLists curr_cat={cat_id} />
                        </div>

                    </div>
                </div>
            </section>
        </>
    )

}

export default BlogPosts