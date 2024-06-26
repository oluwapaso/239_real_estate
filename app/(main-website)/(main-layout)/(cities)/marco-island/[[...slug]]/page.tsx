"use client"

import { Helpers } from '@/_lib/helpers'
import CityComponent from '@/components/CityAndCommunity/CityComponent'
import CommunitiesComponent from '@/components/CityAndCommunity/CommunitiesComponent'
import CommunityComponent from '@/components/CityAndCommunity/CommunityComponent'
import CustomLinkMain from '@/components/CustomLinkMain'
import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const helper = new Helpers();
function MarcoIslandCatchAll() {

    const params = useParams();
    const path = usePathname();
    const searchParams = useSearchParams();
    let page = searchParams?.get("page");
    const city_slug = path?.split("/")[1];
    const city_name = "Marco Island";

    const slugs = params?.slug;
    let first_param = "";
    let bredcrumb = <CustomLinkMain href="/Marco-island" className=''>Marco Island</CustomLinkMain>;
    let component: React.JSX.Element = <></>;
    if (!page) {
        page = "1";
    }

    if (slugs?.length) {
        first_param = slugs[0];
    } else {
        first_param = "all-listings";
    }

    if (first_param.includes("listings") || first_param.includes("-beds") || first_param.includes("-baths")) {
        component = <CityComponent city_name={city_name} path={path} city_slug={city_slug} city_params={params} slugs={slugs} page_number={page} />
    } else if (first_param == "communities") {
        component = <CommunitiesComponent city_name={city_name} city_slug={city_slug} page_number={page} />
    } else {
        /** Wild community [any-community-slug] */
        component = <CommunityComponent city_name={city_name} path={path} city_slug={city_slug} community_slug={first_param}
            community_params={params} slugs={slugs} page_number={page} />
    }

    return (
        <>
            <SimpleHeader page="Marco Island" />
            {component}
        </>
    )
}

export default MarcoIslandCatchAll
