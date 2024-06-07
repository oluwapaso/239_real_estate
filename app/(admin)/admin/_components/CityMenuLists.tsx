import React from 'react'

const CityMenuLists = ({ handleCheckedMenu }: { handleCheckedMenu: (event: React.ChangeEvent<HTMLInputElement>) => void }) => {
    return (
        <div className='w-full mt-2 flex flex-col'>
            <div className='w-full mt-2 mb-2 flex items-center select-none'>
                <input type='checkbox' className='styled-checkbox menu_cb' name={`home_page`} id={`home_page`}
                    onChange={(e) => handleCheckedMenu(e)} />
                <label htmlFor='home_page' className='flex w-full'><span>Home Page</span></label>
            </div>

            <div className='w-full mt-2 mb-2 flex_ items-center select-none hidden'>
                <input type='checkbox' className='styled-checkbox menu_cb' name={`lists`} id={`lists`}
                    onChange={(e) => handleCheckedMenu(e)} />
                <label htmlFor='lists' className='flex w-full'><span>City List Page</span></label>
            </div>
        </div>
    )
}

export default CityMenuLists