"use client"

import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { CommunityPropertiesFilter } from '../types'
import FieldHeader from '../HomeSearch/FieldHeader'
import { Beds_Baths } from '../data'

function BathRoomsFilter({ baths, setBaths }: {
    baths: CommunityPropertiesFilter,
    setBaths: React.Dispatch<React.SetStateAction<CommunityPropertiesFilter>>
}) {

    const [isShown, setIsShown] = useState(false);
    const [maxBaths, setMaxBaths] = useState(Beds_Baths);
    const [minBaths, setMinBaths] = useState(Beds_Baths);

    let icon: React.ReactNode
    const min_bath = baths?.min ?? 0
    const max_bath = baths?.max ?? 0

    if (min_bath > 0 || max_bath > 0) {
        icon = <span className="absolute rounded-full size-2 flex justify-center items-center bg-red-600 text-white top-0 -right-2">
        </span>
    }

    const handleShow = () => {
        setIsShown(!isShown)
    }

    const wrapperRef = useRef<HTMLDivElement>(null)
    useEffect(() => {

        const handleClickOutSide = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsShown(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutSide)

        return () => {
            document.removeEventListener("mousedown", handleClickOutSide)
        }

    }, [wrapperRef]);

    const handleBathsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBaths((prev_val) => {
            return {
                ...prev_val,
                [e.target.name]: parseInt(e.target.value),
            }
        })
    }

    const setMinMaxBath = (bath_start: string, type: string) => {
        const bathStart = parseInt(bath_start)

        if (type == "Max") {

            if (bathStart > 0) {
                const max_bath = Beds_Baths.filter((bath) => {
                    return bath.value >= bathStart
                })
                setMaxBaths(max_bath)
            } else {
                setMaxBaths(Beds_Baths)
            }

        } else if (type == "Min") {

            if (bathStart > 0) {
                const min_baths = Beds_Baths.filter((bath) => {
                    return bath.value <= bathStart
                })
                setMinBaths(min_baths)
            } else {
                setMinBaths(Beds_Baths)
            }


        }
    }

    return (
        <div className='md:relative w-full xs:w-[auto]' ref={wrapperRef}>
            <button className='w-full xs:w-[auto] flex items-center justify-between transition-all duration-500 px-3 py-2 hover:bg-primary
             hover:text-white cursor-pointer text-sm' onClick={handleShow}>
                <span className='text-left mr-2 relative'>Bathrooms {icon}</span>
                <span className={`${isShown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={18} /></span>
            </button>
            <div className={`w-full md:w-[400px] left-0 md:-left-2 absolute bg-transparent md:pt-2 z-10 ${isShown ? "block" : "hidden"}`}>
                <div className='w-full bg-white m-0 md:mt-1 py-3 px-3 drop-shadow-md'>
                    <FieldHeader text="Bedrooms" />
                    <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center mt-2'>
                        <div className=''>
                            <select className='form-control' name='min' value={baths?.min}
                                onChange={(e) => {
                                    handleBathsChange(e);
                                    setMinMaxBath(e.target.value, "Max")
                                }}>
                                <option value="0">Min</option>
                                {minBaths.map(({ value, text }) => {
                                    return <option value={value} key={value}>{text}</option>
                                })}
                            </select>
                        </div>
                        <div className='max-con px-4'>to</div>
                        <div className=''>
                            <select className='form-control' name='max' value={baths?.max}
                                onChange={(e) => {
                                    handleBathsChange(e);
                                    setMinMaxBath(e.target.value, "Min")
                                }}>
                                <option value="0">Max</option>
                                {maxBaths.map(({ value, text }) => {
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

export default BathRoomsFilter