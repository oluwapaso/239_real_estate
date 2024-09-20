"use client"
import React, { useEffect, useState } from 'react'
import { FaChevronRight } from 'react-icons/fa'
import { BlogCategories } from './types';
import { Helpers } from '@/_lib/helpers';
import Link from 'next/link';
import CustomLinkMain from './CustomLinkMain';

const BlogCategoryLists = ({ curr_cat }: { curr_cat?: number }) => {

    const helpers = new Helpers();
    const [categories, setCategories] = useState<BlogCategories[]>([]);
    useEffect(() => {

        const fetchBlogPosts = async () => {

            try {

                const payload = {
                    paginated: false,
                }

                const catPromise: Promise<BlogCategories[]> = helpers.LoadCategories(payload);
                const catResp = await catPromise
                setCategories(catResp);

            } catch (e: any) {
                console.log(e.message)
            }

        }

        fetchBlogPosts();

    }, []);

    return (
        <div className='w-full mb-5'>
            <div className='w-full bg-primary font-play-fair-display text-2xl px-3 py-4 text-white'>News Categories</div>
            <ul className='w-full *:border-b *:border-gray-300 *:cursor-pointer'>
                <CustomLinkMain href={`/blog-posts?page=1`} className={`w-full flex items-center px-1 py-3 text-base font-normal hover:bg-gray-100`}>
                    <FaChevronRight size={15} /> <span className='ml-1 flex-grow'>All Categories</span>
                </CustomLinkMain>
                {
                    categories.map((cat) => (
                        <CustomLinkMain href={`/blog-posts/${cat.slug}?ref=${cat.category_id}&tag=${cat.name}&page=1`} className={`w-full flex items-center 
                        px-1 py-3 text-base font-normal hover:bg-gray-100 ${(curr_cat && curr_cat == cat.category_id) ? "bg-gray-200" : ""}`}>
                            <FaChevronRight size={15} /> <span className='ml-1 flex-grow'>{cat.name}</span>
                        </CustomLinkMain>
                    ))
                }
            </ul>
        </div>
    )
}

export default BlogCategoryLists