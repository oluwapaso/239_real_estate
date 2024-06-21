import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { CommunityInfo } from '../types';
import CommunityCard from '../Home/CommunityCard';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Helpers } from '@/_lib/helpers';
import Link from 'next/link';
import Pagination from '../pagination';
import { useModal } from '@/app/contexts/ModalContext';

const helpers = new Helpers();
function CommunitiesComponent(params: any) {

    const searchParams = useSearchParams();
    const { city_name, page_number, city_slug } = params;

    const [communities, setCommunities] = useState<any[]>([]);
    const [communities_fetched, setCommunitiesFetched] = useState(false);
    const { closeModal: close_auth_modal } = useModal();
    let all_comms: React.JSX.Element[] = [];

    const page_size = 24;
    let total_page = 0;
    const curr_page = parseInt(page_number) || 1;

    const payload = {
        paginated: true,
        city_slug: city_slug,
        post_type: "City's Community",
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchCommunities = async () => {

            try {

                const postPromise: Promise<CommunityInfo[]> = helpers.LoadCommunities(payload);
                const postResp = await postPromise;

                if (postResp.length > 0) {

                    setCommunities(postResp);

                } else {
                    throw new Error("Unable to load communities");
                }

            } catch (e: any) {
                console.log(e.message)
                setCommunities([]);
                setCommunitiesFetched(true);
            }

        }

        fetchCommunities();

    }, [curr_page]);

    //Close modal if it's opened, this usually happen after returning from property details page without signing in
    useEffect(() => {
        if (close_auth_modal) {
            close_auth_modal();
        }
    }, [])


    const no_post_added = <div className='w-full bg-red-100 text-red-600 flex justify-center items-center min-h-60 col-span-3'>
        No communities added yet
    </div>

    if (Array.isArray(communities)) {

        if (communities.length > 0) {

            const total_records = communities[0].total_records;
            const total_returned = communities.length;
            total_page = Math.ceil(total_records / page_size);

            if (total_records > 0 && total_returned > 0) {

                all_comms = communities.map((comm) => {
                    return <CommunityCard key={comm.comment_id} community={comm} city_slug={city_slug} />
                })

            } else {
                all_comms[0] = no_post_added
            }

        } else {

            //Making sure request has been sent
            if (communities_fetched) {
                all_comms[0] = no_post_added
            } else {
                all_comms[0] = <div className='w-full flex justify-center items-center min-h-60 col-span-3'>
                    <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                </div>
            }

        }

    } else {
        //Making sure request has been sent
        if (communities_fetched) {
            all_comms[0] = no_post_added
        } else {
            all_comms[0] = <div className='w-full flex justify-center items-center min-h-60 col-span-3'>
                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
            </div>
        }
    }

    return (
        <>
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[1200px] px-3 xl:px-0 text-left'>

                    <div className='w-full font-normal'>
                        <Link href="/">Home</Link><span> / </span>
                        <Link href={`/${city_slug}`}>{city_name}</Link><span> / </span>
                        <Link href={`/${city_slug}/communities`}>Communities</Link>
                    </div>

                    <h3 className='w-full font-play-fair-display text-2xl sm:text-3xl md:text-4xl capitalize'>{city_name} Communities</h3>

                    <div className='w-full grid grid-cols-1 xs:grid-cols-2 tab:grid-cols-3 xs:gap-x-2 gap-4 mt-6'>{all_comms}</div>

                    <div className='w-full mt-3'>
                        {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`/${city_slug}/communities?`} /> : null}
                    </div>
                </div>
            </section>
        </>
    )

}

export default CommunitiesComponent