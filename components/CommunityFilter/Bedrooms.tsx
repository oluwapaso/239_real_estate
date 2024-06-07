"use client"

import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { CommunityPropertiesFilter } from '../types'
import FieldHeader from '../HomeSearch/FieldHeader'
import { Beds_Baths } from '../data'

function BedRoomsFilter({ beds, setBeds }: {
    beds: CommunityPropertiesFilter,
    setBeds: React.Dispatch<React.SetStateAction<CommunityPropertiesFilter>>
}) {

    const [isShown, setIsShown] = useState(false);
    const [maxBeds, setMaxBeds] = useState(Beds_Baths);
    const [minBeds, setMinBeds] = useState(Beds_Baths);

    let icon: React.ReactNode
    const min_bed = beds?.min ?? 0
    const max_bed = beds?.max ?? 0

    if (min_bed > 0 || max_bed > 0) {
        icon = <span className="absolute rounded-full size-2 flex justify-center items-center bg-red-600 text-white top-0 -right-2">
        </span>
    }

    const handleShow = () => {
        setIsShown(!isShown)
    }

    const wrapperRef = useRef<HTMLDivElement>(null);
    useEffect(() => {

        function handleClickOutSide(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsShown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutSide);
        return () => {
            document.removeEventListener('mousedown', handleClickOutSide);
        };

    }, [wrapperRef]);

    const handleBedsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBeds((prev_val) => {
            return {
                ...prev_val,
                [e.target.name]: parseInt(e.target.value),
            }
        })
    }

    const setMinMaxBeds = (bed_start: string, type: string) => {
        const bedStart = parseInt(bed_start)

        if (type == "Max") {

            if (bedStart > 0) {
                const max_beds = Beds_Baths.filter((bed) => {
                    return bed.value >= bedStart
                })
                setMaxBeds(max_beds)
            } else {
                setMaxBeds(Beds_Baths)
            }

        } else if (type == "Min") {

            if (bedStart > 0) {
                const min_beds = Beds_Baths.filter((bed) => {
                    return bed.value <= bedStart
                })
                setMinBeds(min_beds)
            } else {
                setMinBeds(Beds_Baths)
            }


        }
    }

    return (
        <div className='md:relative w-full xs:w-[auto]' ref={wrapperRef}>
            <button className='w-full xs:w-[auto] flex items-center justify-between transition-all duration-500 px-3 py-2 hover:bg-primary
             hover:text-white cursor-pointer text-sm' onClick={handleShow}>
                <span className='text-left mr-2 relative'>Bedrooms {icon}</span>
                <span className={`${isShown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={18} /></span>
            </button>
            <div className={`w-full md:w-[400px] left-0 md:-left-2 absolute bg-transparent md:pt-2 z-10 ${isShown ? "block" : "hidden"}`}>
                <div className='w-full bg-white m-0 md:mt-1 py-3 px-3 drop-shadow-md'>
                    <FieldHeader text="Bedrooms" />
                    <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center mt-2'>
                        <div className=''>
                            <select className='form-control' name='min' value={beds?.min}
                                onChange={(e) => {
                                    handleBedsChange(e);
                                    setMinMaxBeds(e.target.value, "Max")
                                }}>
                                <option value="0">Min</option>
                                {minBeds.map(({ value, text }) => {
                                    return <option value={value} key={value}>{text}</option>
                                })}
                            </select>
                        </div>
                        <div className='max-con px-4'>to</div>
                        <div className=''>
                            <select className='form-control' name='max' value={beds?.max}
                                onChange={(e) => {
                                    handleBedsChange(e);
                                    setMinMaxBeds(e.target.value, "Min")
                                }}>
                                <option value="0">Max</option>
                                {maxBeds.map(({ value, text }) => {
                                    return <option value={value} key={value}>{text}</option>
                                })}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BedRoomsFilter