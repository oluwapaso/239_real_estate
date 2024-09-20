import React from 'react'
import NavBar from './NavBar'
import { NavProps } from './types'

function SimpleHeader({ page }: NavProps) {

    return (
        <header className='w-full'>
            <NavBar page={page} />
        </header>
    )
}

export default React.memo(SimpleHeader);