import React from 'react'

function PageHero({ bg_image, crumb, max_width, big_crum }: { bg_image: string, crumb: React.ReactNode, max_width?: number, big_crum?: boolean }) {

    if (!max_width || max_width < 1) {
        max_width = 1200;
    }

    return (
        <div className='w-full h-[500px] flex flex-col justify-end bg-cover bg-center pb-20 relative'
            style={{ backgroundImage: `url("${bg_image}")` }}>
            <div className={`container mx-auto max-w-[${max_width}px] px-3 xl:px-0 text-left z-10`}>
                <div className={`w-full font-medium *:text-white ${!big_crum ? "*:text-shadow-primary" : ""}`}>{crumb}</div>
            </div>

            <div className='w-full h-full absolute bg-black/20 top-0 bottom-0'></div>
        </div>
    )
}

export default PageHero