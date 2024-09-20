import React from 'react'
import { CommunityInfo } from '../types'
import Link from 'next/link'
import { Helpers } from '@/_lib/helpers'
import CustomLinkMain from '../CustomLinkMain';

const helper = new Helpers();
const CommunityCard = ({ community, city_slug }: { community: CommunityInfo, city_slug: string }) => {
    return (
        <CustomLinkMain href={`/${city_slug}/${community.slug}`} className='w-100 h-[250px] xs:h-[200px] sm:h-[280px] md:h-[250px] cursor-pointer bg-center bg-cover'
            style={{ backgroundImage: `url(${community?.header_image?.image_loc})` }}>
            <div className='flex flex-col justify-end w-full h-full bg-gradient-to-t from-black/70 to-transparent to-80% hover:from-black'>
                <div className='w-full font-play-fair-display text-3xl px-3 py-4 text-white'>{helper.ucwords(community.friendly_name)}</div>
            </div>
        </CustomLinkMain>
    )
}

export default CommunityCard