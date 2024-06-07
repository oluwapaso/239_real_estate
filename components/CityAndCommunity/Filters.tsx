"use client"

import React, { useEffect, useState } from 'react'
import { CommunityPropertiesFilter } from '../types'
import BedRoomsFilter from '../CommunityFilter/Bedrooms'
import BathRoomsFilter from '../CommunityFilter/Bathrooms'
import PriceFilter from '../CommunityFilter/PriceRange'
import { LiaSaveSolid } from 'react-icons/lia'
import { IoSearchSharp } from 'react-icons/io5'
import FilterBy from '../CommunityFilter/FilterBy'
import { Helpers } from '@/_lib/helpers'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import SaveSearch from '@/app/(admin)/admin/_components/SaveSearch'
import Modal from '../Modal'

const helper = new Helpers();
function Filters({ page_slug, city_params, city_name, mls_name, save_via, path }:
    { page_slug?: string, city_params?: any, city_name?: string, mls_name?: string, save_via?: string, path?: string }) {

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

        let min_bed = "";
        let max_bed = "";
        let min_bath = "";
        let max_bath = "";
        let min_price = "";
        let max_price = "";
        let sort_by = searchParams?.get("sort-by");

        if (city_params && city_params.slug && city_params.slug.length) {
            city_params.slug.forEach((params: string) => {

                if (params && params != "") {
                    if (params.includes("listings")) {

                        /** all-listings, 100000-2000000-listings, listings-over-2000, listings-under-2000 */
                        if (params != "all-listings") {
                            if (params.includes("-over-")) {
                                min_price = params.split("-over-")[1];
                            } else if (params.includes("-under-")) {
                                max_price = params.split("-under-")[1];
                            } else {
                                min_price = params.split("-")[0];
                                max_price = params.split("-")[1];
                            }
                        }

                    } else if (params.includes("beds")) {

                        /** 2-3-beds, 4-beds, 2-beds-plus */
                        if (params.includes("-beds-plus")) {
                            min_bed = params.split("-beds-plus")[1];
                        } else {
                            min_bed = params.split("-")[0];
                            max_bed = params.split("-")[1];
                            if (max_bed == "beds") { //4 - beds
                                max_bed = "";
                            }
                        }

                    } else if (params.includes("baths")) {

                        /** 2-3-baths, 4-baths, 2-baths-plus */
                        if (params.includes("-baths-plus")) {
                            min_bath = params.split("-baths-plus")[1];
                        } else {
                            min_bath = params.split("-")[0];
                            max_bath = params.split("-")[1];
                            if (max_bath == "baths") { //4 - baths
                                max_bath = "";
                            }
                        }

                    }
                }
            });
        }

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

        if (pricesFilter?.min || pricesFilter?.max) {
            if (pricesFilter?.min && pricesFilter?.max) {
                query_link += `/${pricesFilter?.min}-${pricesFilter?.max}-listings`;
            } else if (pricesFilter?.min && !pricesFilter?.max) {
                query_link += `/listings-over-${pricesFilter?.min}`;
            } else if (!pricesFilter?.min && pricesFilter?.max) {
                query_link += `/listings-under-${pricesFilter?.max}`;
            }
        }

        if (bedsFilter?.min || bedsFilter?.max) {
            if (bedsFilter?.min && bedsFilter?.max) {
                query_link += `/${bedsFilter?.min}-${bedsFilter?.max}-beds`;
            } else if (bedsFilter?.min && !bedsFilter?.max) {
                query_link += `/${bedsFilter?.min}-beds`;
            } else if (!bedsFilter?.min && bedsFilter?.max) {
                query_link += `/${bedsFilter?.max}-beds-plus`;
            }
        }

        if (bathsFilter?.min || bathsFilter?.max) {
            if (bathsFilter?.min && bathsFilter?.max) {
                query_link += `/${bathsFilter?.min}-${bathsFilter?.max}-baths`;
            } else if (bathsFilter?.min && !bathsFilter?.max) {
                query_link += `/${bathsFilter?.min}-baths`;
            } else if (!bathsFilter?.min && bathsFilter?.max) {
                query_link += `/${bathsFilter?.max}-baths-plus`;
            }
        }

        if (filterBy) {
            query_link += `?sort-by=${filterBy}&page=1`;
        }

        router.push(`/${page_slug}${query_link}`, { scroll: false });

    }

    const handleSaveModal = () => {
        const path = window.location.pathname;
        const nav = document.querySelector(".nav") as HTMLElement;
        if (nav) {
            nav.style.zIndex = "0";
            document.body.style.overflowY = 'hidden';
        }
        setModalChildren(<SaveSearch closeModal={closeModal} pricesFilter={pricesFilter} bedsFilter={bedsFilter} bathsFilter={bathsFilter}
            city={city_name} filterBy={filterBy} save_via={save_via} mls_name={mls_name} city_params={path} />);
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
            <Modal show={showModal} children={modal_children} width={550} closeModal={closeModal} title={<>SAVE THIS SEARCH</>} />
        </div >
    )
}

export default Filters