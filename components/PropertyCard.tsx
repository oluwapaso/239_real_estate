import moment from 'moment'
import Link from 'next/link'
import numeral from 'numeral'
import React, { useState } from 'react'
import { FaArrowDownLong, FaArrowUpLong, FaRegHeart, FaStar } from 'react-icons/fa6'
import { GoDotFill } from 'react-icons/go'
import PropCarousel from './PropCarousel'
import PropFavs from './PropFavs'
import useCurrentBreakpoint from '@/_hooks/useMediaQuery'

const PropertyCard = ({ prop, page }: { prop: any, page?: string }) => {

    const diffInMinutes = moment().diff(moment(prop.MatrixModifiedDT), 'minutes');

    const { is1Xm, is2Xm, isXs } = useCurrentBreakpoint();
    let card_height = "h-[300px]";
    if (isXs) {
        card_height = "h-[240px]";
    }

    if (page == "Map") {
        card_height = "h-[265px]";
    }
    const link_address = prop.FullAddress.replace(/[^a-zA-Z0-9]+/g, "-") + "-" + prop.StateOrProvince + "-" + prop.PostalCode;
    return (
        <div key={prop.matrix_unique_id} className='prop-card group cursor-pointer border border-primary/40 rounded-md overflow-hidden
        shadow-md hover:shadow-xl'> {/** hover:scale-105 duration-200 hover:z-50 **/}
            <div className={`w-full relative transition-all duration-500 ${card_height}`}>
                {/** pb-[75%] */}
                <PropCarousel key={prop.matrix_unique_id} images={prop.Images} defaultpic={prop.DefaultPic} listing_id={prop.MLSNumber} address={link_address} page={page} />

                <PropFavs ListingId={prop.matrix_unique_id} MLSNumber={prop.MLSNumber} PropAddress={prop.FullAddress} />
                <div className='w-full absolute top-0 right-0 p-2 flex justify-end items-center z-40'>
                    {
                        diffInMinutes <= 60 && (
                            <div className='px-3 py-1 rounded-sm text-white bg-green-600 text-xs font-normal tracking-wider mr-2'>NEW</div>)
                    }

                    {
                        page == "Featured" && (
                            <div className='px-3 py-1 rounded-sm text-white flex items-center bg-primary text-xs font-normal tracking-wider'>
                                <FaStar size={13} className='mr-1' /> <span>Featured</span>
                            </div>
                        )
                    }
                </div>
            </div>

            <Link href={`/listings/${prop.MLSNumber}/${link_address}`}>
                <div className='w-full pt-2 flex flex-col px-3 py-2 bg-white'>
                    <div className='w-full flex items-center'>
                        <h2 className='font-normal text-2xl group-hover:underline underline-offset-4 transition-all duration-500'>
                            {numeral(prop.ListPrice).format('$0,0')}
                        </h2>

                        {
                            (prop.LastChangeType == "Price Decrease" && moment(prop.LastChangeTimestamp).isBefore(moment().subtract(10, 'days'))) && (
                                <div className='px-2 py-1 ml-2 rounded-sm text-white bg-red-600 text-xs font-normal tracking-wider flex items-center'>
                                    <FaArrowUpLong size={12} /> <span className='ml-1'>{numeral(prop.ListPrice - prop.OriginalListPrice).format('$0,0')}</span>
                                </div>
                            )
                        }

                        {
                            (prop.LastChangeType == "Price Increase" && moment(prop.LastChangeTimestamp).isBefore(moment().subtract(10, 'days'))) && (
                                <div className='px-2 py-1 ml-2 rounded-sm text-white bg-green-600 text-xs font-normal tracking-wider flex items-center'>
                                    <FaArrowDownLong size={12} /> <span className='ml-1'>{numeral(prop.OriginalListPrice - prop.ListPrice).format('$0,0')}</span>
                                </div>
                            )
                        }

                    </div>

                    <div className='w-full mt-2 font-bold text-base'>{prop.FullAddress}, {prop.City}, {prop.StateOrProvince} {prop.PostalCode}</div>
                    <div className='w-full mt-1 flex flex-wrap items-center font-normal'>
                        {
                            prop.BedsTotal > 0 && (
                                <div>{prop.BedsTotal} BED{prop.BedsTotal > 1 ? "S" : ""}</div>
                            )
                        }
                        {
                            prop.BathsTotal > 0 && (
                                <div className='flex items-center'>
                                    <span className='text-gray-400 px-1'><GoDotFill size={12} /></span>
                                    <span>{numeral(prop.BathsTotal).format("0,0")} BATH{prop.BathsTotal > 1 ? "S" : ""}</span>
                                </div>
                            )
                        }
                        {
                            prop.TotalArea > 0 && (
                                <div className='flex items-center'>
                                    <span className='text-gray-400 px-1'><GoDotFill size={12} /></span>
                                    <span>{numeral(prop.TotalArea).format("0,0")} SQFT</span>
                                </div>
                            )
                        }
                        <div className='flex items-center'>
                            <span className='text-gray-400 px-1'><GoDotFill size={12} /></span>
                            <span className='uppercase'>{prop.PropertyType}</span>
                        </div>
                        <div className='flex items-center'><span className='text-gray-400 pr-1'>
                            <GoDotFill size={12} /></span> <span>MLS<sup>&reg;</sup> #{prop.MLSNumber}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )

}

export default PropertyCard