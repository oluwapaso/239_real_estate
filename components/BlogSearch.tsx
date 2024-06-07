"use client"
import { useRouter } from 'next/navigation'
import React from 'react'
import { IoSearchSharp } from 'react-icons/io5'

const BlogSearch = ({ keyword, setKeyword, setPostFetched }:
    { keyword: string, setKeyword: React.Dispatch<React.SetStateAction<string>>, setPostFetched: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const router = useRouter();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    }

    const handleSearch = () => {
        if (keyword && keyword != "") {
            setPostFetched(false);
            router.push(`/search-posts?keyword=${keyword}&page=1`);
        }
    }

    return (
        <div className='w-full mb-5'>
            <div className=''>
                <div className='flex items-center'>
                    <div className='flex-grow'>
                        <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal 
                            focus:shadow-md' type='number appearance-none' placeholder='Search...'
                            value={keyword} name='keyword' onChange={(e) => handleChange(e)} />
                    </div>
                    <div className='flex items-center justify-center py-2 bg-primary h-11 px-4 border border-primary text-white
                    hover:bg-gray-600 hover:shadow-lg cursor-pointer'
                        onClick={handleSearch}><IoSearchSharp size={20} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogSearch