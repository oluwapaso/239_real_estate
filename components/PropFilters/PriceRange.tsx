import React from 'react'

const PriceRange = ({ payload, handleCommonChange, setMinMaxPrice, filters }: {
    payload: any,
    handleCommonChange: (e: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>) => void,
    setMinMaxPrice: (price_start: string, type: string) => void,
    filters: any
}) => {
    return (
        <div className='w-full bg-white m-0 mt-1 lg:shadow-xl rounded-lg'>
            <div className='lg:bg-gray-100 lg:py-3 lg:px-3'>Price Range</div>
            <div className='w-full lg:py-4 lg:px-4'>

                <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center sm:mt-2'>
                    <div className=''>
                        <label className='w-full hidden lg:block'>Minimum</label>
                        <select className='form-control' name='min_price' value={payload.min_price} onChange={(e) => {
                            handleCommonChange(e);
                            setMinMaxPrice(e.target.value, "Max");
                        }}>
                            <option value="0">No Min</option>
                            {filters.minPrices.map(({ value, text }: { value: any, text: any }) => {
                                return <option value={value} key={value}>{text}</option>
                            })}
                        </select>
                    </div>
                    <div className='px-4'>
                        <label className='w-full text-white hidden lg:block'>-</label>
                        <div>-</div>
                    </div>
                    <div className=''>
                        <label className='w-full hidden lg:block'>Maximum</label>
                        <select className='form-control' name='max_price' value={payload.max_price} onChange={(e) => {
                            handleCommonChange(e);
                            setMinMaxPrice(e.target.value, "Min");
                        }}>
                            <option value="0">No Max</option>
                            {filters.maxPrices.map(({ value, text }: { value: any, text: any }) => {
                                return <option value={value} key={value}>{text}</option>
                            })}
                        </select>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default PriceRange