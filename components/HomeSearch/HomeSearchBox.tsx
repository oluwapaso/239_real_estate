"use client"

import React, { useState } from 'react'
import BuySearchTab from './BuySearchTab'
import RentSearchTab from './RentSearchTab'
import SellTab from './SellTab'

function HomeSearchBox() {

    const [openedTab, setOpenedTab] = useState("Buy")
    const handleTab = (tab: string) => {
        setOpenedTab(tab)
    }

    let tab_opened: React.ReactNode
    if (openedTab == "Buy") {
        tab_opened = <BuySearchTab />
    } else if (openedTab == "Rent") {
        tab_opened = <RentSearchTab />
    } else if (openedTab == "Sell") {
        tab_opened = <SellTab />
    }

    return (
        <div className='home-search-box w-full max-w-[850px] flex flex-col justify-end'>

            <div className='search-tab w-full'>
                {tab_opened}
            </div>

            <div className='search-buttons w-full px-4 lg:px-0 flex *:mr-8 *:p-2 *:uppercase *:text-white *:cursor-pointer'>
                <div onClick={() => handleTab("Buy")} className={`!pl-0 hover:active-search-tab ${openedTab == "Buy" ? "active-search-tab" : ""}`}>Buy</div>
                <div onClick={() => handleTab("Rent")} className={`hover:active-search-tab ${openedTab == "Rent" ? "active-search-tab" : ""}`}>Rent</div>
                <div onClick={() => handleTab("Sell")} className={`hover:active-search-tab ${openedTab == "Sell" ? "active-search-tab" : ""}`}>Sell</div>
            </div>
        </div>
    )
}

export default HomeSearchBox