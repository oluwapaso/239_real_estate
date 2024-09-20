import React from 'react'

const PageHeader = ({ bg_image, crumb, max_width, title }: { bg_image: string, crumb: React.JSX.Element, max_width: number, title: string }) => {

    let style = undefined;
    if (bg_image && bg_image != "") {
        style = { backgroundImage: `url("${bg_image}")` }
    }

    return (
        <div className='w-full h-[500px] relative flex flex-col justify-end bg-cover bg-center pb-20 bg-gradient-to-br from-sky-600 to-red-500'
            style={style}>
            <div className={`container mx-auto max-w-[${max_width}px] px-3 xl:px-0 text-left z-20`}>
                <div className='w-full text-5xl text-white mb-4'>{title}</div>
                <div className={`w-full font-medium text-white`}>{crumb}</div>
            </div>
            <div className='w-full h-full absolute bg-black/20 top-0 bottom-0'></div>
        </div>
    )
}

export default PageHeader
