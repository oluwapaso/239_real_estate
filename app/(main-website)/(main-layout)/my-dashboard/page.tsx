"use client"

import MyFavorites from '@/components/MyFavorites'
import MyPrefrences from '@/components/MyPrefrences'
import SavedSearches from '@/components/SavedSearches'
import SimpleHeader from '@/components/SimpleHeader'
import { signOut, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { hidePageLoader, showPageLoader } from '../GlobalRedux/app/appSlice'
import { useDispatch } from 'react-redux'

const MyDashboard = () => {

    const { data: session, status } = useSession();
    const dispatch = useDispatch();

    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams?.get("tab");
    const prop_status = searchParams?.get("status");
    const page = searchParams?.get("page");
    const [pageCompo, setPageCompo] = useState<React.JSX.Element>(<div className='w-full h-[200px] flex items-center justify-center'>
        <AiOutlineLoading3Quarters size={35} className='animate-spin' />
    </div>);
    let page_header = "My Listings";

    if (tab == "Favorites") {
        page_header = "My Listings";
    } else if (tab == "Searches") {
        page_header = "My Searches";
    } else if (tab == "Preferences") {
        page_header = "My Preferences";
    }

    const GotoTab = (goto: string) => {

        let show_loader = false;
        if (goto == "My Listings") {
            if (tab != "Favorites") {
                show_loader = true;
            }
            router.push("/my-dashboard?tab=Favorites&status=Active&page=1");
        } else if (goto == "My Searches") {
            if (tab != "Searches") {
                show_loader = true;
            }
            router.push("/my-dashboard?tab=Searches&page=1");
        } else if (goto == "My Preferences") {
            if (tab != "Preferences") {
                show_loader = true;
            }
            router.push("/my-dashboard?tab=Preferences");
        }

        if (show_loader) {
            dispatch(showPageLoader());
        }

    }

    useEffect(() => {

        if (!session?.user && status != "loading") {
            window.location.href = "/login";
        }

        setPageCompo(<div className='w-full h-[200px] flex items-center justify-center'><AiOutlineLoading3Quarters size={35} className='animate-spin' /></div>);

        if (tab == "Favorites") {
            setPageCompo(<MyFavorites />);
        } else if (tab == "Searches") {
            setPageCompo(<SavedSearches />);
        } else if (tab == "Preferences") {
            setPageCompo(<MyPrefrences />);
        }

    }, [session, status, tab]);

    useEffect(() => {
        dispatch(hidePageLoader())
    })

    return (
        <div className={` ${status == "authenticated" ? "block" : "hidden"}`}>
            <SimpleHeader page={page_header} />

            <div className='shadow bg-white w-full border-b border-gray-300'>
                <div className='container m-auto max-w-[1260px] px-3 xl:px-0 overflow-x-auto'>
                    <div className='w-[600px] sm:w-full grid grid-cols-[max-content_1fr]'>

                        <div className=''>
                            <div className='w-full flex items-center *:uppercase *:py-6 space-x-8 *:cursor-pointer *:border-b-2 *:border-transparent
                            *:text-sm *:sm:text-base'>
                                <div className={`hover:border-gray-900 ${tab == "Favorites" ? "!border-gray-900" : null}`}
                                    onClick={() => GotoTab("My Listings")}>My Listings</div>
                                <div className={`hover:border-gray-900 ${tab == "Searches" ? "!border-gray-900" : null}`}
                                    onClick={() => GotoTab("My Searches")}>My Searches</div>
                                <div className={`hover:border-gray-900 ${tab == "Preferences" ? "!border-gray-900" : null}`}
                                    onClick={() => GotoTab("My Preferences")}>My Preferences</div>
                            </div>
                        </div>

                        <div className='justify-self-end grid grid-cols-1 items-center'>
                            <button className='text-primary py-2 px-7 flex items-center justify-center hover:shadow-xl font-normal
                            border border-gray-500 uppercase text-sm sm:text-base' onClick={() => signOut()}>Sign Out</button>
                        </div>
                    </div>
                </div>
            </div>

            <section className='w-full bg-gray-50 py-7 md:py-14'>
                <div className='container mx-auto max-w-[1260px] text-left px-3 xl:px-0'>
                    {pageCompo}
                </div>
            </section >
        </div>
    )
}

export default MyDashboard