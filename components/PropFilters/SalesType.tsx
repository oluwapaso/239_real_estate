"use client"

import React from 'react'

const SalesType = ({ payload, handleSalesType }: { payload: any, handleSalesType: (salesType: string) => void }) => {
    return (
        <div className='w-full bg-white m-0 mt-1 tab:py-3 tab:px-3 tab:shadow-xl sm:rounded-lg'>
            <label className='w-full flex items-center mb-1 tab:hidden'>Sales Type</label>
            <div className="w-full hover:bg-gray-50 py-3 px-3">
                <label className="flex items-center cursor-pointer" htmlFor="for_sale">
                    <input className="custom_radio" type="checkbox" name="sales_type" id="for_sale"
                        onChange={(e) => handleSalesType("For Sale")} checked={payload.sales_type == "For Sale"} />
                    <span className='ml-2'>For Sale</span>
                </label>
            </div>

            <div className="w-full hover:bg-gray-50 py-3 px-3 hidden">
                <label className="flex items-center cursor-pointer" htmlFor="for_rent">
                    <input className="custom_radio" type="checkbox" name="sales_type" id="for_rent"
                        onChange={(e) => handleSalesType("For Rent")} checked={payload.sales_type == "For Rent"} />
                    <span className='ml-2'>For Rent</span>
                </label>
            </div>

            <div className="w-full hover:bg-gray-50 py-3 px-3">
                <label className="flex items-center cursor-pointer" htmlFor="sold">
                    <input className="custom_radio" type="checkbox" name="sales_type" id="sold"
                        onChange={(e) => handleSalesType("Sold")} checked={payload.sales_type == "Sold"} />
                    <span className='ml-2'>Sold</span>
                </label>
            </div>

        </div>
    )
}

export default SalesType