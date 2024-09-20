import React from 'react'

function BedsBathsRange({ payload, handleCommonChange, setMinMaxBeds, setMinMaxBath, filters }: {
    payload: any,
    handleCommonChange: (e: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>) => void,
    setMinMaxBeds: (bed_start: string, type: string) => void,
    setMinMaxBath: (bath_start: string, type: string) => void
    filters: any
}) {
    return (
        <div className='w-full bg-white m-0 mt-1 xl:shadow-xl rounded-lg'>
            <div className='xl:bg-gray-100 xl:py-3 xl:px-3'>Number of Bedrooms</div>
            <div className='w-full xl:py-4 xl:px-4'>
                <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center'>
                    <div className=''>
                        <label className='w-fulll hidden xl:block'>Minimum</label>
                        <select className='form-control' name='min_bed' value={payload.min_bed}
                            onChange={(e) => {
                                handleCommonChange(e);
                                setMinMaxBeds(e.target.value, "Max")
                            }}>
                            <option value="0">Min</option>
                            {filters.minBeds.map(({ value, text }: { value: any, text: any }) => {
                                return <option value={value} key={value}>{text}</option>
                            })}
                        </select>
                    </div>
                    <div className='px-4'>
                        <label className='w-full text-white hidden xl:block'>-</label>
                        <div>-</div>
                    </div>
                    <div className=''>
                        <label className='w-fulll hidden xl:block'>Maximum</label>
                        <select className='form-control' name='max_bed' value={payload.max_bed}
                            onChange={(e) => {
                                handleCommonChange(e);
                                setMinMaxBeds(e.target.value, "Min")
                            }}>
                            <option value="0">Max</option>
                            {filters.maxBeds.map(({ value, text }: { value: any, text: any }) => {
                                return <option value={value} key={value}>{text}</option>
                            })}
                        </select>
                    </div>
                </div>
            </div>

            <div className='xl:bg-gray-100 xl:py-3 xl:px-3 mt-6 xl:mt-2'>Number of Bathrooms</div>
            <div className='w-full xl:py-4 xl:px-4'>
                <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center'>
                    <div className=''>
                        <label className='w-full hidden xl:block'>Minimum</label>
                        <select className='form-control' name='min_bath' value={payload.min_bath}
                            onChange={(e) => {
                                handleCommonChange(e);
                                setMinMaxBath(e.target.value, "Max")
                            }}>
                            <option value="0">No Min</option>
                            {filters.minBaths.map(({ value, text }: { value: any, text: any }) => {
                                return <option value={value} key={value}>{text}</option>
                            })}
                        </select>
                    </div>
                    <div className='px-4'>
                        <label className='w-full text-white hidden xl:block'>-</label>
                        <div>-</div>
                    </div>
                    <div className=''>
                        <label className='w-fulll hidden xl:block'>Maximum</label>
                        <select className='form-control' name='max_bath' value={payload.max_bath}
                            onChange={(e) => {
                                handleCommonChange(e);
                                setMinMaxBath(e.target.value, "Min")
                            }}>
                            <option value="0">No Max</option>
                            {filters.maxBaths.map(({ value, text }: { value: any, text: any }) => {
                                return <option value={value} key={value}>{text}</option>
                            })}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BedsBathsRange