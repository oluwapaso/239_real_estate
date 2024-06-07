"use client"

import React, { useEffect, useState } from 'react'
import { CommunityPropertiesFilter } from '../types'
import BedRoomsFilter from './Bedrooms'
import BathRoomsFilter from './Bathrooms'
import PriceFilter from './PriceRange'
import { LiaSaveSolid } from 'react-icons/lia'
import { IoSearchSharp } from 'react-icons/io5'
import FilterBy from './FilterBy'
import { Helpers } from '@/_lib/helpers'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import SaveSearch from '@/app/(admin)/admin/_components/SaveSearch'
import Modal from '../Modal'

const helpers = new Helpers();

function CommunityFilter({ city }: { city?: string }) {

    const router = useRouter();
    const searchParams = useSearchParams();

    const prop_filters: CommunityPropertiesFilter = {
        min: 0,
        max: 0,
    }

    const closeModal = () => {
        const nav = document.querySelector(".nav") as HTMLElement;
        if (nav) {
            nav.style.zIndex = "200";
            document.body.style.overflowY = 'auto';
        }
        setShowModal(false);
    }

    const [bedsFilter, setBedsFilter] = useState(prop_filters);
    const [bathsFilter, setBathsFilter] = useState(prop_filters);
    const [pricesFilter, setPricesFilter] = useState(prop_filters);
    const [filterBy, setFilterBy] = useState("Price-DESC");
    const [showModal, setShowModal] = useState(false);
    const [modal_children, setModalChildren] = useState({} as React.ReactNode);

    useEffect(() => {

        const min_bed = searchParams?.get("min-bed");
        const max_bed = searchParams?.get("max-bed");
        const min_bath = searchParams?.get("min-bath");
        const max_bath = searchParams?.get("max-bath");
        const min_price = searchParams?.get("min-price");
        const max_price = searchParams?.get("max-price");
        const sort_by = searchParams?.get("sort-by");

        if ((min_bed && min_bed != "") || (max_bed && max_bed != "")) {
            if (min_bed && min_bed != "") {
                setBedsFilter((prev_val) => {
                    return {
                        ...prev_val,
                        min: parseInt(min_bed),
                    }
                })
            }

            if (max_bed && max_bed != "") {
                setBedsFilter((prev_val) => {
                    return {
                        ...prev_val,
                        max: parseInt(max_bed),
                    }
                })
            }
        } else {
            setBedsFilter(prop_filters);
        }

        if ((min_bath && min_bath != "") || (max_bath && max_bath != "")) {
            if (min_bath && min_bath != "") {
                setBathsFilter((prev_val) => {
                    return {
                        ...prev_val,
                        min: parseInt(min_bath),
                    }
                })
            }

            if (max_bath && max_bath != "") {
                setBathsFilter((prev_val) => {
                    return {
                        ...prev_val,
                        max: parseInt(max_bath),
                    }
                })
            }
        } else {
            setBathsFilter(prop_filters);
        }

        if ((min_price && min_price != "") || (max_price && max_price != "")) {
            if (min_price && min_price != "") {
                setPricesFilter((prev_val) => {
                    return {
                        ...prev_val,
                        min: parseInt(min_price),
                    }
                })
            }

            if (max_price && max_price != "") {
                setPricesFilter((prev_val) => {
                    return {
                        ...prev_val,
                        max: parseInt(max_price),
                    }
                })
            }
        } else {
            setPricesFilter(prop_filters);
        }

        if (sort_by && sort_by != "") {
            setFilterBy(sort_by);
        }

    }, [searchParams]);

    const handleSearch = () => {
        let query_link = "";

        if (bedsFilter?.min) {
            query_link += `min-bed=${bedsFilter?.min}&`;
        }

        if (bedsFilter?.max) {
            query_link += `max-bed=${bedsFilter?.max}&`;
        }

        if (bathsFilter?.min) {
            query_link += `min-bath=${bathsFilter?.min}&`;
        }

        if (bathsFilter?.max) {
            query_link += `max-bath=${bathsFilter?.max}&`;
        }

        if (pricesFilter?.min) {
            query_link += `min-price=${pricesFilter?.min}&`;
        }

        if (pricesFilter?.max) {
            query_link += `max-price=${pricesFilter?.max}&`;
        }

        if (filterBy) {
            query_link += `sort-by=${filterBy}&`;
        }

        query_link = helpers.rTrim(query_link, "&");

        router.push(`?${query_link}`, { scroll: false });

    }

    const handleSaveModal = () => {
        const nav = document.querySelector(".nav") as HTMLElement;
        if (nav) {
            nav.style.zIndex = "0";
            document.body.style.overflowY = 'hidden';
        }
        setModalChildren(<SaveSearch closeModal={closeModal} pricesFilter={pricesFilter} bedsFilter={bedsFilter} bathsFilter={bathsFilter}
            city={city} filterBy={filterBy} />);
        setShowModal(true);
    }

    return (
        <div className='w-full bg-gray-100 px-3 py-2 my-4 flex flex-wrap justify-between relative z-[1]'>
            <div className='w-auto relative border border-sky-400 py-2 px-2 flex flex-wrap font-normal bg-white items-center'>
                <BedRoomsFilter beds={bedsFilter} setBeds={setBedsFilter} />
                <div className='vertical-divider mx-2 h-7 border border-gray-300 hidden xs:block'></div>
                <BathRoomsFilter baths={bathsFilter} setBaths={setBathsFilter} />
                <div className='vertical-divider mx-2 h-7 border border-gray-300 hidden xs:block'></div>
                <PriceFilter prices={pricesFilter} setPrice={setPricesFilter} />
                <button className='px-4 py-2 mt-3 xs:mt-0 bg-primary text-white hover:bg-primary/90 text-sm flex items-center ml-2'
                    onClick={handleSaveModal}>
                    <LiaSaveSolid size={18} className='mr-2 hidden' /> <span>Save Search</span>
                </button>

                <button className='px-4 py-2 mt-3 xs:mt-0 bg-primary text-white hover:bg-primary/90 text-sm flex items-center ml-2'
                    onClick={handleSearch}>
                    <IoSearchSharp size={18} className='mr-2' /> <span>Search</span>
                </button>
            </div>

            <FilterBy filterBy={filterBy} setFilterBy={setFilterBy} />
            <Modal show={showModal} children={modal_children} width={600} closeModal={closeModal} title={<>SAVE THIS SEARCH</>} />
        </div >
    )
}

export default CommunityFilter