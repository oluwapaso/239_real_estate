"use client"

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6'

const Pagination = ({ totalPage, curr_page, url_path, scroll_to }: { totalPage: number, curr_page: number, url_path: string, scroll_to?: string }) => {

    const active_link = '!bg-red-400 text-white rounded-full drop-shadow-xl hover:rounded-none'
    const prev_class = 'cursor-pointer mr-2 border-2 border-white hover:border-primary p-1'
    const next_class = 'cursor-pointer ml-2 border-2 border-white hover:border-primary p-1'
    const router = useRouter();
    const [canScroll, setCanScroll] = useState(false);

    const handleClick = (loc: string) => {
        setCanScroll(true);
        router.push(loc, { scroll: false });
    }

    useEffect(() => {
        // Scroll to the target component when the component mounts
        if (canScroll) {
            const element = document.getElementById(scroll_to as string);
            if (element) {

                const rect = element.getBoundingClientRect();
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const finalOffset = rect.top + scrollTop - 180;

                window.scrollTo({
                    top: finalOffset,
                    behavior: 'smooth'
                });

            }
        }
    }, [curr_page]);

    // return (
    //     <div className='w-full text-cent flex justify-end items-center mt-5 flex-wrap'>
    //         {curr_page > 1 ? (<div onClick={() => handleClick(`${url_path}page=${curr_page - 1}`)} className={prev_class}><FaArrowLeftLong size={25} /></div>) :
    //             <div className={`${prev_class} !cursor-not-allowed !opacity-50`}><FaArrowLeftLong size={25} /></div>}

    //         {[...Array(Math.min(6, totalPage))].map((_elem, index) => {

    //             const pageNumber = index + 1;
    //             const isCurrent = curr_page === pageNumber;
    //             const showEllipsisStart = ((totalPage > 10) && (pageNumber < (curr_page - 1)));
    //             const showEllipsisEnd = totalPage > 10 && pageNumber > curr_page + 1 && pageNumber < totalPage - 2;

    //             return (
    //                 <>
    //                     {index === 1 && showEllipsisStart && <div className='mx-1'>...</div>}
    //                     <div key={index} onClick={() => handleClick(`${url_path}page=${pageNumber}`)} className={`size-10 flex items-center 
    //                     justify-center font-medium bg-slate-200 cursor-pointer hover:bg-sky-400 hover:drop-shadow-xl mx-1 hover:scale-125 
    //                     transition-all duration-300 ${isCurrent ? active_link : null}`}>{pageNumber}</div>
    //                     {index === Math.min(4, totalPage - 1) && showEllipsisEnd && <div className='mx-1'>...</div>}
    //                     {"pageNumber < (curr_page - 1) = " + (curr_page - 1) + "  showEllipsisStart:" + showEllipsisStart + "  pageNumber:" + pageNumber}
    //                 </>
    //             )
    //         })}

    //         {totalPage > 10 && curr_page < totalPage - 2 && (
    //             <div onClick={() => handleClick(`${url_path}page=${totalPage}`)} className={`size-10 flex items-center justify-center font-medium bg-slate-200 cursor-pointer hover:bg-sky-400 hover:drop-shadow-xl mx-1 hover:scale-125 transition-all duration-300 ${curr_page === totalPage ? active_link : ''}`}>
    //                 {totalPage}
    //             </div>
    //         )}

    //         {curr_page < totalPage ? (<div onClick={() => handleClick(`${url_path}page=${curr_page + 1}`)}
    //             className={next_class}><FaArrowRightLong size={25} /></div>) :
    //             <div className={`${next_class} !cursor-not-allowed !opacity-50`}><FaArrowRightLong size={25} /></div>}

    //     </div>
    // )

    return (
        <div className='w-full text-cent flex justify-end items-center mt-5'>
            {curr_page > 1 ? (
                <div onClick={() => handleClick(`${url_path}page=${curr_page - 1}`)} className={prev_class}>
                    <FaArrowLeftLong size={25} />
                </div>
            ) : (
                <div className={`${prev_class} !cursor-not-allowed !opacity-50`}>
                    <FaArrowLeftLong size={25} />
                </div>
            )}

            {[...Array(totalPage)].map((_elem, index) => {
                // Show first link
                if (index === 0) {
                    return (
                        <div key={index} onClick={() => handleClick(`${url_path}page=${index + 1}`)} className={`size-10 flex items-center 
                        justify-center font-medium bg-slate-200 cursor-pointer hover:bg-sky-400 hover:drop-shadow-xl mx-1 hover:scale-125 
                        transition-all duration-300 ${curr_page === index + 1 ? active_link : null}`}>{index + 1}
                        </div>
                    );
                }

                // Show ellipsis before the last link and after the first link
                if ((index === 1 && curr_page > 3) || (index === totalPage - 2 && curr_page < totalPage - 2)) {
                    return (
                        <div key={index} className="mx-1">...</div>
                    );
                }

                // Show current page link and nearby links
                if (index === totalPage - 1 || (index >= curr_page - 3 && index <= curr_page + 1)) {
                    return (
                        <div key={index} onClick={() => handleClick(`${url_path}page=${index + 1}`)} className={`size-10 flex items-center 
                        justify-center font-medium bg-slate-200 cursor-pointer hover:bg-sky-400 hover:drop-shadow-xl mx-1 hover:scale-125 
                        transition-all duration-300 ${curr_page === index + 1 ? active_link : null}`}>{index + 1}
                        </div>
                    );
                }

                return null; // Hide other links
            })}

            {curr_page < totalPage ? (
                <div onClick={() => handleClick(`${url_path}page=${curr_page + 1}`)} className={next_class}>
                    <FaArrowRightLong size={25} />
                </div>
            ) : (
                <div className={`${next_class} !cursor-not-allowed !opacity-50`}>
                    <FaArrowRightLong size={25} />
                </div>
            )}
        </div>
    );


}


export default Pagination