"use client"

import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { CommunityPropertiesFilter } from '../types'
import FieldHeader from '../HomeSearch/FieldHeader'
import { Prices } from '../data'

function PriceFilter({ prices, setPrice }: {
    prices: CommunityPropertiesFilter,
    setPrice: React.Dispatch<React.SetStateAction<CommunityPropertiesFilter>>
}) {

    const [isShown, setIsShown] = useState(false)
    const [maxPrices, setMaxPrices] = useState(Prices);
    const [minPrices, setMinPrices] = useState(Prices);

    let icon: React.ReactNode
    const min_bed = prices?.min ?? 0
    const max_bed = prices?.max ?? 0

    if (min_bed > 0 || max_bed > 0) {
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

    const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPrice((prev_val) => {
            return {
                ...prev_val,
                [e.target.name]: parseInt(e.target.value),
            }
        })
    }

    const setMinMaxPrice = (price_start: string, type: string) => {
        const priceStart = parseInt(price_start)


        if (type == "Max") {

            if (priceStart > 0) {
                const max_prices = Prices.filter((price) => {
                    return price.value >= priceStart
                })
                setMaxPrices(max_prices)
            } else {
                setMaxPrices(Prices)
            }

        } else if (type == "Min") {

            if (priceStart > 0) {
                const min_prices = Prices.filter((price) => {
                    return price.value <= priceStart
                })
                setMinPrices(min_prices)
            } else {
                setMinPrices(Prices)
            }

        }
    }

    return (
        <div className='md:relative w-full xs:w-[auto]' ref={wrapperRef}>
            <button className='w-full xs:w-[auto] flex items-center justify-between transition-all duration-500 px-3 py-2 hover:bg-primary
             hover:text-white cursor-pointer text-sm' onClick={handleShow}>
                <span className='text-left mr-2 relative'>Price Range {icon}</span>
                <span className={`${isShown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={18} /></span>
            </button>
            <div className={`w-full md:w-[400px] left-0 md:-left-2 absolute bg-transparent md:pt-2 z-10 ${isShown ? "block" : "hidden"}`}>
                <div className='w-full bg-white m-0 md:mt-1 py-3 px-3 drop-shadow-md'>
                    <FieldHeader text="Price Range" />
                    <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center mt-2'>
                        <div className=''>
                            <select className='form-control' name='min' value={prices?.min} onChange={(e) => {
                                handlePriceChange(e);
                                setMinMaxPrice(e.target.value, "Max")
                            }}>
                                <option value="0">Min</option>
                                {minPrices.map(({ value, text }) => {
                                    return <option value={value} key={value}>{text}</option>
                                })}
                            </select>
                        </div>
                        <div className='px-4'>to</div>
                        <div className=''>
                            <select className='form-control' name='max' value={prices?.max} onChange={(e) => {
                                handlePriceChange(e);
                                setMinMaxPrice(e.target.value, "Min")
                            }}>
                                <option value="0">Max</option>
                                {maxPrices.map(({ value, text }) => {
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

export default PriceFilter