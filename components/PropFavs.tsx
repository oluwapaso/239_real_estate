"use client"
import React, { useState } from 'react'
import { APIResponseProps } from './types';
import { useSession } from 'next-auth/react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useModal } from '@/app/contexts/ModalContext';

const PropFavs = ({ ListingId, page, MLSNumber, PropAddress }: { ListingId: string, page?: string, MLSNumber?: string, PropAddress?: string }) => {

    const { data: session, update } = useSession();
    const user = session?.user as any;
    const [isUpdatingFav, setIsUpdatingFav] = useState(false);
    if (PropAddress) {
        PropAddress = PropAddress.replace(/[^a-zA-Z0-9]+/g, "-");
    }

    const { showModal, closeModal, modalTitle, modalChildren, handleLoginModal } = useModal();

    const AddOrRemoveFromFavs = (prop_id: string, type: string) => {

        toast.dismiss();
        if (!user || !user.user_id) {
            toast.error("You need to login to add properties to favorites", {
                position: "top-center",
                theme: "colored"
            });

            handleLoginModal();
            return false;
        }

        setIsUpdatingFav(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/(listings)/manage-favorites`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                listing_id: prop_id,
                user_id: user.user_id,
                type: type,
                mls_number: MLSNumber,
                property_address: PropAddress,
            }),
        }).then((resp): Promise<APIResponseProps> => {
            setIsUpdatingFav(false);
            return resp.json();
        }).then(data => {
            if (data.success) {
                const updatedUser = { ...user };
                updatedUser.favorites = data.data;
                update(updatedUser);
            } else {
                alert(data.message);
            }
        }).catch((e: any) => {
            alert(e.message);
        })

    }

    let classes = `bottom-0 right-0`;
    if (page && page == "Prop Details") {
        classes = `bottom-[10px] left-2`;
    }

    return (
        <>
            <div className={`absolute z-[15] flex justify-end items-center transition-all duration-500 ${classes}`}>
                {
                    isUpdatingFav ? <div className='p-2 animate-spin'> <AiOutlineLoading3Quarters size={25} className='text-white' /></div> :
                        (user && user.favorites && user.favorites.length > 0 && user.favorites.includes(ListingId)) ?
                            <div className='p-2 text-red-600 hover:text-red-400 cursor-pointer'
                                onClick={() => AddOrRemoveFromFavs(ListingId, "Remove")}><FaHeart size={25} /></div>
                            : <div className='p-2 text-white hover:text-yellow-500 cursor-pointer'
                                onClick={() => AddOrRemoveFromFavs(ListingId, "Add")}><FaRegHeart size={25} /></div>
                }
            </div>

            {
                /** <AuthModal show={showModal} children={modalChildren} closeModal={closeModal} title={modalTitle} /> */
            }
        </>
    )
}

export default PropFavs