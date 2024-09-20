import React, { useState } from 'react'
import { RiEqualizerLine } from 'react-icons/ri'
import FieldHeader from './FieldHeader'
import { Beds_Baths, Prices, RentPrices } from '../data'
import { FilterValueTypes } from '../types'

const FIltersComponent = ({ filter_values, setFilterValues, tab }: {
    filter_values: Partial<FilterValueTypes>,
    setFilterValues: React.Dispatch<React.SetStateAction<Partial<FilterValueTypes>>>,
    tab: string
}) => {

    let prices = Prices;
    if (tab == "Rent") {
        prices = RentPrices;
    }

    const [isShown, setIsShown] = useState(false)
    const [maxPrices, setMaxPrices] = useState(prices);
    const [minPrices, setMinPrices] = useState(prices);
    const [maxBeds, setMaxBeds] = useState(Beds_Baths);
    const [minBeds, setMinBeds] = useState(Beds_Baths);
    const [maxBaths, setMaxBaths] = useState(Beds_Baths);
    const [minBaths, setMinBaths] = useState(Beds_Baths);

    const handleShow = () => {
        setIsShown(!isShown)
    }

    const setMinMaxPrice = (price_start: string, type: string) => {
        const priceStart = parseInt(price_start)

        if (type == "Max") {

            if (priceStart > 0) {
                const max_prices = prices.filter((price) => {
                    return price.value >= priceStart
                })
                setMaxPrices(max_prices)
            } else {
                setMaxPrices(Prices)
            }

        } else if (type == "Min") {

            if (priceStart > 0) {
                const min_prices = prices.filter((price) => {
                    return price.value <= priceStart
                })
                setMinPrices(min_prices)
            } else {
                setMinPrices(Prices)
            }

        }
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

    const setMinMaxBaths = (bath_start: string, type: string) => {
        const bathStart = parseInt(bath_start)

        if (type == "Max") {

            if (bathStart > 0) {
                const max_baths = Beds_Baths.filter((bath) => {
                    return bath.value >= bathStart
                })
                setMaxBaths(max_baths)
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

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterValues((prev_val) => {
            return {
                ...prev_val,
                [e.target.name]: parseInt(e.target.value),
            }
        })
    }

    const handleResetFilter = () => {
        setFilterValues({
            min_price: 0,
            max_price: 0,
            min_beds: 0,
            max_beds: 0,
            min_baths: 0,
            max_baths: 0,
        });
    }

    const applyFilters = () => {
        setIsShown(false);
    }

    return (
        <div className={`w-[100px] px-3 py-2 transition-all duration-500 cursor-pointer hidden  ${tab == "Rent" ? "xs:block" : "sm:block"}`}>
            <button className='flex items-center justify-between' onClick={handleShow}>
                <span className='w-[55px] text-left'>Filters</span>
                <span className={`${isShown ? "rotate-180" : null}`}><RiEqualizerLine size={24} /></span>
            </button>
            <div className={`status-lists w-full max-w-[700px] right-0 absolute shadow-xl bg-transparent pt-4 ${isShown ? "block" : "hidden"}`}>
                <div className='bg-white mt-1 h-[260px] relative flex flex-col justify-end'>
                    <div className='main-filter-body flex-grow p-4'>
                        <div className='w-full'>
                            <FieldHeader text="Price Range" />
                            <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center mt-2'>
                                <div className=''>
                                    <select className='form-control' name='min_price' value={filter_values.min_price} onChange={(e) => {
                                        handleFilterChange(e);
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
                                    <select className='form-control' name='max_price' value={filter_values.max_price} onChange={(e) => {
                                        handleFilterChange(e);
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

                        <div className='w-full mt-7'>
                            <div className='w-full grid grid-cols-[1fr_max-content_1fr]'>
                                <div>
                                    <div className='w-full'>
                                        <FieldHeader text="BedRooms" />
                                        <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center mt-2'>
                                            <div className=''>
                                                <select className='form-control' name='min_beds' value={filter_values.min_beds}
                                                    onChange={(e) => {
                                                        handleFilterChange(e);
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
                                                <select className='form-control' name='max_beds' value={filter_values.max_beds}
                                                    onChange={(e) => {
                                                        handleFilterChange(e);
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

                                <div className='px-4 select-none text-white opacity-0'>to</div>

                                <div>
                                    <div className='w-full'>
                                        <FieldHeader text="BathRooms" />
                                        <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center mt-2'>
                                            <div className=''>
                                                <select className='form-control' name='min_baths' value={filter_values.min_baths}
                                                    onChange={(e) => {
                                                        handleFilterChange(e);
                                                        setMinMaxBaths(e.target.value, "Max")
                                                    }}>
                                                    <option value="0">Min</option>
                                                    {minBaths.map(({ value, text }) => {
                                                        return <option value={value} key={value}>{text}</option>
                                                    })}
                                                </select>
                                            </div>
                                            <div className='max-con px-4'>to</div>
                                            <div className=''>
                                                <select className='form-control' name='max_baths' value={filter_values.max_baths}
                                                    onChange={(e) => {
                                                        handleFilterChange(e);
                                                        setMinMaxBaths(e.target.value, "Min")
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
                        </div>
                    </div>
                    <div className='home-filter-footer w-full h-[45px] py-1 px-2 bg-gray-200 flex justify-between items-center *:font-normal'>
                        <button className='hover:bg-white border border-gray-200 hover:border-primary px-3 py-1 text-sm 
                        tracking-widest' onClick={handleResetFilter}>RESET FILTERS</button>
                        <button className='bg-slate-950 text-white hover:bg-slate-800 px-3 py-1 text-sm tracking-widest'
                            onClick={applyFilters}>APPLY FILTERS</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FIltersComponent