"use client";

import { MdClose } from "react-icons/md";
import Slider from "react-slick";
import 'react-multi-carousel/lib/styles.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Gallery({ photos, show, closeGallery, initialSlide }: { photos: any[], show: boolean, closeGallery: () => void, initialSlide: number }) {

    const settings = {
        dots: true,
        arrows: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        focusOnSelect: true,
        infinite: true,
        initialSlide: initialSlide
    };

    let slides: React.JSX.Element[] = [];
    if (photos && photos.length) {
        slides = photos.map((image, index) => (
            <div key={index} className='relative flex items-center justify-center'>
                <img src={`${(image && image != "") ? image : "/no-blog-image-added.png"}`} alt={`Alt here`}
                    onError={(e: any) => { e.target.onerror = null; e.target.src = `/no-blog-image-added.png`; }}
                    className={`w-auto h-[70vh] m-auto`}
                />
            </div>
        ));
    } else {
        slides.push(<div className='relative'>
            <img src="/loading-photos-from-mls-1.png" alt={`Alt here`} onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = `/loading-photos-from-mls-1.png`;
            }} className={`w-full h-full object-cover z-10 relative`} />
        </div>)
    }

    return (
        show && (
            <dialog className="gallery fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-auto backdrop-blur flex 
            justify-center items-center">
                <div className={`bg-transparent m-auto relative rounded w-full h-full flex items-center justify-center`}>
                    <div className="flex justify-center items-center cursor-pointer self-start absolute top-2 right-2 hover:scale-125
                      z-20 duration-300" onClick={closeGallery}>
                        <MdClose size={35} className="font-bold text-white" />
                    </div>
                    <div className="z-10 flex items-center w-full h-[70vh] mt-2 mb-2 relative">
                        <div className="absolute w-full h-full">
                            <Slider {...settings} lazyLoad="ondemand" className="w-full">
                                {slides}
                            </Slider>
                        </div>
                    </div>
                </div>
            </dialog>
        )
    );
}

export default Gallery;