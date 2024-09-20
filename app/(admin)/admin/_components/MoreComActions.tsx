"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { CiRead } from 'react-icons/ci';
import { FaEdit } from 'react-icons/fa';
import { IoMdMore } from 'react-icons/io'
import { PiTrashThin } from 'react-icons/pi';
import { showPageLoader } from '../GlobalRedux/user/userSlice';
import { useDispatch } from 'react-redux';

const MoreCommunityActions = ({ community_id, draft_id, slug, published, handleDelete, is_last }:
    {
        community_id: number, draft_id: number, slug: string, published: string, handleDelete: (draft_id: number) => Promise<void>,
        is_last?: boolean
    }) => {

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [menuRef]);

    const GoTo = (link: string) => {
        router.push(link)
    }

    const openInNewTab = (url: string) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
    }

    return (
        <div className='relative' ref={menuRef}>
            <button className='group flex items-center bg-gray-50 hover:bg-gray-200 px-1 py-2' onClick={() => setIsOpen(!isOpen)}>
                <IoMdMore size={20} />
            </button>
            {
                isOpen && (
                    <ul className={`w-[140px] bg-white shadow-xl border border-gray-200 rounded absolute right-0 z-20 *:px-4 *:py-4 *:cursor-pointer
                     divide-y divide-gray-200 ${is_last && 'bottom-full'}`}>
                        <li className='hover:bg-gray-50' onClick={() => {
                            dispatch(showPageLoader());
                            GoTo(`/admin/edit-community?draft_id=${draft_id}`);
                        }}>
                            <div className='w-full flex items-center'>
                                <FaEdit size={16} /> <span className='font-normal ml-1'>Edit</span>
                            </div>
                        </li>
                        {
                            published == "Yes" && (
                                <>
                                    <li className='hover:bg-gray-50' onClick={() => openInNewTab(`/community/${slug}`)}>
                                        <div className='w-full flex items-center'>
                                            <CiRead size={16} /> <span className='font-normal ml-1'>Preview</span>
                                        </div>
                                    </li>
                                </>
                            )
                        }
                        <li className='hover:bg-gray-50'>
                            <div className='w-full flex items-center' onClick={() => handleDelete(draft_id)}>
                                <PiTrashThin size={16} /> <span className='font-normal ml-1'>Delete</span>
                            </div>
                        </li>
                    </ul>
                )
            }
        </div>
    )
}

export default MoreCommunityActions