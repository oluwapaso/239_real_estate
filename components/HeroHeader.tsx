import Link from 'next/link'
import NavBar from './NavBar'
import PageHero from './PageHero'
import { NavProps } from './types'

function HeroHeader({ page, bg_image, crumb, max_width, big_crum }: NavProps) {

    return (
        <header className='w-full'>
            <NavBar page={page} />
            <PageHero bg_image={bg_image || "../gradient-background.jpg"} crumb={crumb} max_width={max_width} big_crum={big_crum} />
        </header>
    )
}

export default HeroHeader