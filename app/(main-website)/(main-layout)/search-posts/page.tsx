"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { BlogPostInfoParams } from '@/components/types'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import HeroHeader from '@/components/HeroHeader'
import BlogSearch from '@/components/BlogSearch'
import BlogCategoryLists from '@/components/BlogCategoryLists'
import BlogPostCard from '@/components/BlogPostCard'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const helpers = new Helpers();
const BlogPostsSearch = () => {

    const searchParams = useSearchParams();
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    const params_keyword = searchParams?.get("keyword") as string;

    const [blog_posts, setBlogPosts] = useState<any[]>([]);
    const [keyword, setKeyword] = useState(params_keyword);
    const [post_fetched, setPostFetched] = useState(false);

    const page_size = 20;
    let total_page = 0;
    let all_posts: React.JSX.Element[] = [];

    const payload = {
        paginated: true,
        post_type: "Post Search",
        page: curr_page,
        limit: page_size,
        keyword: keyword
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

    }, [curr_page, post_fetched]); //keyword


    const no_post_added = <div className='w-full bg-red-100 text-red-600 flex justify-center items-center min-h-60'>
        No blog posts found
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

    const crumb = <><Link href="/"> Home</Link> <span>/</span> <Link href="/blog-posts?page=1">Real Estate News</Link></>

    return (
        <>
            <HeroHeader page="Has Hero" bg_image='../tulip-flowers-in-corner.jpg' crumb={crumb} />
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[1250px] px-3 xl:px-0 text-left'>
                    <h3 className='w-full font-play-fair-display text-3xl md:text-4xl'>
                        {blog_posts[0]?.total_records} Result{blog_posts[0]?.total_records > 1 ? "s" : ""} For {helpers.ucwords(params_keyword)}
                    </h3>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-6 gap-6 mt-6'>

                        <div className='lg:col-span-4 order-2 lg:order-1'>
                            <div className='w-full'>
                                <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4'>{all_posts}</div>
                                {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`/search-posts?keyword=${keyword}&`} /> : null}
                            </div>
                        </div>

                        <div className='lg:col-span-2 order-1 lg:order-2'>
                            <BlogSearch keyword={keyword} setKeyword={setKeyword} setPostFetched={setPostFetched} />
                            <BlogCategoryLists />
                        </div>

                    </div>
                </div>
            </section>
        </>
    )

}

export default BlogPostsSearch