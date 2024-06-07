"use client"

import { Helpers } from '@/_lib/helpers'
import { InfoWindow, OverlayView } from '@react-google-maps/api'
import numeral from 'numeral'
import React, { useEffect, useRef, useState } from 'react'
import { FaHouseChimneyMedical } from 'react-icons/fa6'
import { HiMiniBuildingOffice2 } from 'react-icons/hi2'
import PropCarousel from './PropCarousel'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { APIResponseProps } from './types'
import PropFavs from './PropFavs'

const helper = new Helpers();
const CustomMarker = ({ prop, zoom_level }: { prop: any, zoom_level: number }) => {

    const [showInfoWindow, setInfoWindowFlag] = useState(false);
    const windowRef = useRef<HTMLDivElement | null>(null);

    let class_color = "bg-red-500";
    if (prop.RAN_ForSaleRent == "For Rent" && prop.StandardStatus == "Active") {
        class_color = "bg-purple-700";
    } else if (prop.StandardStatus == "Closed") {
        class_color = "bg-pink-600";
    }

    useEffect(() => {

        const handleClickOutside = (e: MouseEvent) => {
            if (windowRef.current && !windowRef.current.contains(e.target as Node)) {
                setInfoWindowFlag(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [windowRef]);

    const link_address = prop.FullAddress.replace(/[^a-zA-Z0-9]+/g, "-") + "-" + prop.StateOrProvince + "-" + prop.PostalCode;;

    return (
        <OverlayView key={prop.listing_id} position={{ lat: parseFloat(prop.Latitude), lng: parseFloat(prop.Longitude) }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
            <div className='relative' onClick={() => setInfoWindowFlag(true)}>
                <button onClick={() => { }} type='button' className={`p-[6px] w-auto rounded-full border-2 border-white hover:bg-green-600 flex 
                    justify-center items-center hover:scale-125 transition-all duration-300 absolute z-10 hover:z-20 ${class_color} bg
                    text-white`}>
                    {
                        !prop.clustered
                            ? <div className='flex w-[auto] justify-center items-center whitespace-nowrap'>
                                {prop.NewConstructionYN == "true" && <FaHouseChimneyMedical size={12} className='text-white' />}
                                {zoom_level > 11 && <span className={`${prop.NewConstructionYN == "true" ? "ml-1" : null} text-[11px] font-medium`}>
                                    {helper.formatPrice(prop.ListPrice)}</span>}
                            </div>
                            : <div className='flex w-[auto] justify-center items-center whitespace-nowrap'>
                                <HiMiniBuildingOffice2 size={11} className='text-white' />
                                <span className='ml-1'>{prop.num_of_clusters} units</span>
                            </div>
                    }
                </button>
                {
                    showInfoWindow && <InfoWindow options={{ maxWidth: 295, minWidth: 295 }}
                        position={{ lat: parseFloat(prop.Latitude), lng: parseFloat(prop.Longitude) }}>
                        <div ref={windowRef} className='w-[295px] h-[295px] bg-white flex flex-col'>
                            {
                                !prop.clustered
                                    ? <>
                                        <div className='map-props w-full h-[180px] relative'>
                                            <PropCarousel key={prop.matrix_unique_id} images={prop.Images} listing_id={prop.MLSNumber} address={link_address}
                                                page="Map-Info" defaultpic={prop.DefaultPic} />
                                            <PropFavs ListingId={prop.matrix_unique_id} MLSNumber={prop.MLSNumber} PropAddress={prop.FullAddress} />
                                        </div>
                                        <div className='flex-grow flex flex-col p-2 !font-poppins'>
                                            <h1 className='w-full font-bold text-lg'>{numeral(prop.ListPrice).format("$0,0")}</h1>
                                            <div className='w-full flex divide-x divide-gray-400 *:px-2 *:text-sm'>
                                                <div className='!pl-0'><strong className='font-semibold'>{prop.BedsTotal}</strong> bds</div>
                                                <div><strong className='font-semibold'>{numeral(prop.BathsTotal).format("0,0")}</strong> ba</div>
                                                <div><strong className='font-semibold'>{numeral(prop.TotalArea).format("0,0")}</strong> sqft</div>
                                            </div>
                                            <div className='w-full mt-1 whitespace-nowrap font-medium overflow-hidden overflow-ellipsis'>{prop.FullAddress}, {prop.City}, {prop.StateOrProvince} {prop.PostalCode}</div>
                                            <div className='w-full mt-1 font-normal'>{prop.PropertyType} - MLS<sup>&reg;</sup> #{prop.MLSNumber}</div>
                                        </div>
                                    </>
                                    : <>
                                        <div className='w-full h-full overflow-x-hidden overflow-y-auto relative'>
                                            {
                                                (prop.clustered_rops && prop.clustered_rops.length > 0) && <div className='w-full'>
                                                    <div className='w-full bg-gray-100 font-medium text-sm py-2 px-3 h-[36px]'>
                                                        {prop.clustered_rops.length} propeties found in this location
                                                    </div>
                                                    <div className='w-full absolute !h-[calc(100%-36px)] overflow-y-auto'>
                                                        {
                                                            prop.clustered_rops.map((c_prop: any, index: number) => {
                                                                let bg_img = `${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/${c_prop.DefaultPic}`;
                                                                if (c_prop.Images && c_prop.Images.length) {
                                                                    bg_img = c_prop.Images[0];
                                                                }

                                                                const address = c_prop.FullAddress.replace(/[^a-zA-Z0-9]+/g, "-") + "-" + c_prop.StateOrProvince + "-" + c_prop.PostalCode;

                                                                return (
                                                                    <Link key={index} href={`/listings/${c_prop.MLSNumber}/${address}`}>
                                                                        <div className='w-full grid grid-cols-6 h-[90px] !font-poppins cursor-pointer'>
                                                                            <div className='col-span-2 h-full bg-cover object-contain' style={{ backgroundImage: `url(${bg_img})`, backgroundPosition: "center", }}>
                                                                            </div>
                                                                            <div className='col-span-4 flex flex-col px-2 border-b border-gray-200'>
                                                                                <h3 className='w-full font-bold text-lg mt-1'>{numeral(c_prop.ListPrice).format("$0,0")}</h3>
                                                                                <div className='w-full mt-1 grid grid-cols-3 gap-2'>
                                                                                    <div className='flex flex-col'>
                                                                                        <div className='font-medium'>{numeral(c_prop.BedsTotal).format("0,0")}</div>
                                                                                        <div>Beds</div>
                                                                                    </div>

                                                                                    <div className='flex flex-col'>
                                                                                        <div className='font-medium'>{numeral(c_prop.BathsTotal).format("0,0")}</div>
                                                                                        <div>Baths</div>
                                                                                    </div>

                                                                                    <div className='flex flex-col'>
                                                                                        <div className='font-medium'>{numeral(c_prop.TotalArea).format("0,0")}</div>
                                                                                        <div>SqFt</div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </>
                            }
                        </div>
                    </InfoWindow>
                }
            </div>
        </OverlayView>
    )
}

export default CustomMarker