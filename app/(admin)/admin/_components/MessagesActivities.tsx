"use client"
import { Helpers } from '@/_lib/helpers';
import { InitialActivities } from '@/components/types'
import React, { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import EmailActivity from './EmailActivity';
import SMSActivity from './SMSActivity';

const helpers = new Helpers();
const MessagesActivities = ({ user_id, setActivityCounts, message_type }:
    { user_id: number, setActivityCounts: React.Dispatch<React.SetStateAction<InitialActivities>>, message_type: string }) => {

    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [skip, setSkip] = useState<number>(1); //skip is current page, so we use 1
    const [returned_data, setReturnedData] = useState(0);
    const limit = 20; //20

    useEffect(() => {

        const fetchActivies = async () => {

            try {

                const actsPromise: Promise<any> = helpers.LoadUsersActivities(user_id as unknown as number, message_type, skip, limit);
                const actsResp = await actsPromise;

                setActivities((prev_activities) => {
                    return [...prev_activities, ...actsResp?.activities]
                });

                setReturnedData(actsResp?.activities?.length);
                setActivityCounts(actsResp?.data_counts);
                setIsLoading(false);
                setIsLoadingMore(false);

            } catch (e: any) {
                console.log(e.message);
            }

        }

        fetchActivies();

    }, [user_id, skip]);

    const loadMoreActivities = () => {
        setIsLoadingMore(true);
        setSkip(skip + 1);
    }

    return (
        <div className='w-full bg-white p-4'>
            {
                isLoading && <div className='w-full flex h-[200px] items-center justify-center'>
                    <AiOutlineLoading3Quarters size={28} className='animate-spin' />
                </div>
            }
            <div className='w-full'>
                <div className="bg-white flex flex-col">
                    <ul className="list-none">
                        {
                            !isLoading && activities && activities.length && (
                                activities.map((activity, index) => {

                                    let activity_comp = <></>;
                                    if (activity.table_name == "emails") {
                                        activity_comp = <EmailActivity key={index} activity={activity} index={index} activities_len={activities.length} />
                                    } else if (activity.table_name == "sms") {
                                        activity_comp = <SMSActivity key={index} activity={activity} index={index} activities_len={activities.length} />
                                    }

                                    return (activity_comp)

                                })
                            )
                        }
                    </ul>
                </div>
            </div>

            {
                !isLoading && activities && returned_data == limit && (
                    <>
                        {
                            !isLoadingMore ?
                                <div className='w-full mt-4 flex items-center justify-center'>
                                    <div className='bg-sky-600 text-white font-normal rounded-md py-2 px-8 cursor-pointer shadow-md hover:shadow-lg'
                                        onClick={loadMoreActivities}>Load More</div>
                                </div>
                                : <div className='w-full mt-4 flex items-center justify-center'>
                                    <div className='bg-sky-600/40 text-white font-normal rounded-md py-2 px-8 cursor-not-allowed flex items-center 
                                    justify-center'><AiOutlineLoading3Quarters size={14} className='animate-spin mr-2' />
                                        <span>Please wait...</span></div>
                                </div>
                        }
                    </>
                )
            }
        </div>
    )

}

export default MessagesActivities