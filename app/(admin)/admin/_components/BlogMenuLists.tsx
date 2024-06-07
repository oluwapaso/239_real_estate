import React from 'react'

const BlogMenuLists = ({ handleCheckedMenu }: { handleCheckedMenu: (event: React.ChangeEvent<HTMLInputElement>) => void }) => {
    return (
        <div className='w-full mt-2 flex flex-col'>

            <div className='w-full mt-2 mb-2 flex items-center select-none'>
                <input type='checkbox' className='styled-checkbox menu_cb' name={`buyer_menu`} id={`buyer_menu`}
                    onChange={(e) => handleCheckedMenu(e)} />
                <label htmlFor='buyer_menu' className='flex w-full'><span>Buyer Menu</span></label>
            </div>

            <div className='w-full mt-2 mb-2 flex items-center select-none'>
                <input type='checkbox' className='styled-checkbox menu_cb' name={`seller_menu`} id={`seller_menu`}
                    onChange={(e) => handleCheckedMenu(e)} />
                <label htmlFor='seller_menu' className='flex w-full'><span>Seller Menu</span></label>
            </div>

        </div>
    )
}

export default BlogMenuLists