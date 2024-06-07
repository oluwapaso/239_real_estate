import React, { useEffect, useState } from 'react'
import NavBar from './NavBar'
import HomeHero from './HomeHero'
import { NavProps } from './types'

function Header({ page }: NavProps) {

    return (
        <header className='w-full'>
            <NavBar page={page} />
            <HomeHero />
        </header>
    )
}

export default Header