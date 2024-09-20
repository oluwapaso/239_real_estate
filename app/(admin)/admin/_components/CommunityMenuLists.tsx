import React from 'react'

const CommunityMenuLists = ({ handleCheckedMenu }: { handleCheckedMenu: (event: React.ChangeEvent<HTMLInputElement>) => void }) => {
    return (
        <div className='w-full mt-2 flex flex-col'>
            <div className='w-full mt-2 mb-2 flex items-center select-none'>
                <input type='checkbox' className='styled-checkbox menu_cb' name={`home_page`} id={`home_page`}
                    onChange={(e) => handleCheckedMenu(e)} />
                <label htmlFor='home_page' className='flex w-full'><span>Home Page</span></label>
            </div>
        </div>
    )
}

export default CommunityMenuLists