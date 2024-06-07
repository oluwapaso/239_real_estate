import moment from 'moment'
import Link from 'next/link';
import numeral from 'numeral';
import React from 'react'
import { RiHeartAdd2Line } from 'react-icons/ri';

const FavoritesActivity = ({ activity, index, activities_len }: { activity: any, index: number, activities_len: number }) => {

    let color = "bg-green-700";
    let description = activity.description;
    let desc: any = {};
    let req_body: React.JSX.Element = <></>

    if (description && description != "" && typeof description == "string") {
        desc = JSON.parse(description);
    }

    const address = activity.FullAddress.replace(/[^a-zA-Z0-9]+/g, "-");
    return (
        <li className="rounded-lg cursor-pointer">
            <div className="flex flex-row">
                <div className="items-center flex flex-col justify-around relative">
                    <div className="">
                        <div className={`${color} size-12 rounded-full flex justify-center items-center *:text-white`}>
                            <RiHeartAdd2Line size={20} />
                        </div>
                    </div>
                    <div className={`border-l h-full ${index == (activities_len - 1) ? "border-transparent" : "border-gray-400"}`}></div>
                </div>
                <div className="flex flex-col group-hover:bg-gray-50 ml-4 pb-10 flex-grow">
                    <div className='w-full pb-1 border-b border-gray-400 flex flex-col mb-5'>
                        <div className='w-full text-lg font-medium'>
                            <span>{moment(activity.date_added).fromNow()}</span>
                            <span className='ml-1 text-sm text-gray-500'>({moment(activity.date_added).format("MMMM Do, YYYY h:m:s A")})</span>
                        </div>
                    </div>

                    <div className='w-full text-base font-medium text-sky-800'>
                        <div className='w-full flex'>
                            <div className='w-[110px] bg-center bg-cover'
                                style={{ backgroundImage: `url("${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/${activity.DefaultPic}")` }}></div>
                            <div className='flex-grow flex flex-col ml-2'>
                                <div className='w-full font-semibold'>
                                    <Link href={`/listings/${activity.MLSNumber}/${address}`} target='_blank'>
                                        {activity.FullAddress}, {activity.City}, {activity.State}, {activity.PostalCode}
                                    </Link>
                                </div>
                                <div className='w-full text-zinc-900'>{numeral(activity.ListPrice).format("$0,0.00")}</div>
                                <div className='w-full text-zinc-900'>{numeral(activity.BedsTotal).format("0,0")} beds, {numeral(activity.BathsTotal).format("0,0")} baths</div>
                                <div className='w-full'>
                                    <Link href={`/listings/${activity.MLSNumber}/${address}`} target='_blank'>View Property</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    )
}

export default FavoritesActivity
