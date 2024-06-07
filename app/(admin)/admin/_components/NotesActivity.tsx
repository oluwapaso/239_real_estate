import moment from 'moment'
import React from 'react'
import { AiOutlineDelete } from 'react-icons/ai';
import { BsTelephoneOutboundFill } from 'react-icons/bs';
import { FaHeart } from 'react-icons/fa6';
import { GrNotes } from 'react-icons/gr';
import { IoHeartDislike } from 'react-icons/io5';
import { TbEyeSearch, TbHomeSearch } from 'react-icons/tb';
import { TfiSave } from 'react-icons/tfi';

const NoteActivity = ({ activity, index, activities_len }: { activity: any, index: number, activities_len: number }) => {

    let icon = <></>;
    let color = "bg-sky-600";
    let note_desc = "";
    let note = activity.description;
    if (activity.type == "Call Log") {
        icon = <BsTelephoneOutboundFill size={22} />
        color = "bg-pink-600"
        note_desc = "You added a call log";
    } else if (activity.type == "Notes") {
        icon = <GrNotes size={25} />
        color = "bg-violet-600"
        note_desc = "You added a note";
    } else if (activity.type == "Favorite a Property") {
        icon = <FaHeart size={25} />
        color = "bg-indigo-800"
        note_desc = "Liked a property";
        note = note.replace("{{property_id}}",
            `<a target='_blank' href='${process.env.NEXT_PUBLIC_BASE_URL}/listings/${activity.field_2}/${activity.field_3}'
            class="text-sky-700 font-medium">#${activity.field_2}</a>`)
    } else if (activity.type == "Unfavorite a Property") {
        icon = <IoHeartDislike size={25} />
        color = "bg-red-600"
        note_desc = "Unliked a property";
        note = note.replace("{{property_id}}",
            `<a target='_blank' href='${process.env.NEXT_PUBLIC_BASE_URL}/listings/${activity.field_2}/${activity.field_3}'
            class="!text-red-600 font-medium">#${activity.field_2}</a>`)
    } else if (activity.type == "Viewed a Property") {
        icon = <TbEyeSearch size={25} />
        color = "bg-orange-600"
        note_desc = "Viewed a listings";
        note = note.replace("{{property_id}}",
            `<a target='_blank' href='${process.env.NEXT_PUBLIC_BASE_URL}/listings/${activity.field_2}/${activity.field_3}'
            class="!text-orange-700 font-medium">#${activity.field_2}</a>`)
    } else if (activity.type == "Search For Listings") {
        icon = <TbHomeSearch size={25} />
        color = "bg-emerald-700"
        note_desc = "Search for listings";
    } else if (activity.type == "Saved a Search") {
        icon = <TfiSave size={21} />
        color = "bg-cyan-700"
        note_desc = "Saved a search";
    } else if (activity.type == "Deleted a Search") {
        icon = <AiOutlineDelete size={21} />
        color = "bg-red-600"
        note_desc = "Deleted a search";
    }


    return (
        <li className="rounded-lg cursor-pointer">
            <div className="flex flex-row">
                <div className="items-center flex flex-col justify-around relative">
                    <div className="">
                        <div className={`${color} size-12 rounded-full flex justify-center items-center *:text-white`}>
                            {icon}
                        </div>
                    </div>
                    <div className={`border-l h-full ${index == (activities_len - 1) ? "border-transparent" : "border-gray-400"}`}></div>
                </div>
                <div className="flex flex-col group-hover:bg-gray-50 ml-4 pb-10 flex-grow">
                    <div className='w-full pb-1 border-b border-gray-400 flex flex-col mb-3'>
                        <div className='w-full text-lg font-medium'>
                            <span>{moment(activity.date).fromNow()}</span>
                            <span className='ml-1 text-sm text-gray-500'>({moment(activity.date).format("MMMM Do, YYYY h:m:s A")})</span>
                        </div>
                        <div className='w-full text-base font-medium text-sky-800'>{note_desc}</div>
                    </div>
                    <div className="text-base" dangerouslySetInnerHTML={{ __html: note }} />
                </div>
            </div>
        </li>
    )
}

export default NoteActivity
