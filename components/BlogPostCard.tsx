import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ImageWithFallback from './ImageWithFallback'

const BlogPostCard = ({ post }: { post: any }) => {
    return (
        <div className='w-full py-4 px-4 border border-gray-200 rounded flex flex-col hover:border-gray-500 mb-5'>
            <h1 className='w-full font-play-fair-display text-2xl'>
                <Link href={`/read-post/${post.slug}`} >
                    <span className=' border-b border-transparent hover:border-gray-600 cursor-pointer'>{post.post_title}</span>
                </Link>
            </h1>

            <div className='w-full my-1 py-2 border-b border-gray-200 text-gray-600 font-normal'>
                Posted On <time>{moment(post.date_added).format("MMMM DD, YYYY")}</time>
            </div>

            <div className='w-full mt-3 flex justify-center'>
                <ImageWithFallback key={post.post_id} width={1250} height={400}
                    src={`${(post.header_image?.image_loc && post.header_image?.image_loc != "") ? post.header_image?.image_loc : "/no-blog-image-added.png"}`}
                    fallbackSrc={`/no-blog-image-added.png`} alt={post.post_title}
                />
            </div>

            <div className='w-full font-normal mt-3'>{post.excerpt}</div>
            <div className='w-full my-1 py-2 border-b border-gray-200 text-gray-600 font-normal'>
                {post.views} View{post.views > 1 ? "s" : null}, {post.comments} Comment{post.comments > 1 ? "s" : null}
            </div>

            <div className='w-full my-6'>
                <Link href={`/read-post/${post.slug}`} className='bg-primary text-white px-6 py-3 text-base hover:shadow-xl font-normal'>Read Full Post</Link>
            </div>

        </div>
    )
}

export default BlogPostCard