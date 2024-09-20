import React, { useEffect, useRef, useState } from 'react';
import Slider from "react-slick";
import 'react-multi-carousel/lib/styles.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from 'next/link';
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';
import CustomLinkMain from './CustomLinkMain';


const PropCarousel = ({ images, defaultpic, listing_id, address, page }:
    { images: any[], defaultpic?: string, listing_id: string, address: string, page?: string }) => {

    const slickSlider = useRef<HTMLDivElement>(null);
    const [transformCount, setTransformCount] = useState(0);
    const maxDots = 4;
    const transformXIntervalNext = -18;
    const transformXIntervalPrev = 18;


    const { is1Xm, is2Xm, isXs } = useCurrentBreakpoint();
    let card_height = "h-[300px]";
    if (isXs) {
        card_height = "h-[240px]";
    }

    if (page == "Map") {
        card_height = "h-[265px]";
    } else if (page == "Map-Info") {
        card_height = "h-[180px]";
    }

    useEffect(() => {
        if (slickSlider.current) {
            const slick = slickSlider.current;
            const dots = slick.querySelector('ul.slick-dots') as HTMLElement;
            if (dots) {
                const wrapper = document.createElement('div');
                wrapper.className = 'slick-dots-container';

                dots.parentNode?.insertBefore(wrapper, dots);
                wrapper.appendChild(dots);
                dots.style.transform = 'translateX(0)';
            }

            const li = slick.querySelectorAll('ul.slick-dots li');
            li.forEach((element, index) => {
                element.classList.add('dot-index-' + index);
            });

            setBoundries(slick, 'default');
        }
    }, []);

    const setBoundries = (slick: any, state: string) => {
        if (state === 'default') {
            const dots = slick.querySelectorAll('li');
            if (dots.length > 4) {
                dots[4].classList.add('n-small-1');
            } else {
                if (slickSlider.current) {
                    const slick = slickSlider.current;
                    const dots = slick.querySelector('ul.slick-dots') as HTMLElement;
                    if (dots) {
                        dots.style.justifyContent = "center";
                    }
                }
            }
        }
    };

    //https://codepen.io/nazarkomar/pen/RdRjqJ
    const beforeChangeHandler = (currentSlide: number, nextSlide: number) => {

        if (slickSlider.current) {
            const slick = slickSlider.current;
            const dots = slick.querySelector('ul.slick-dots') as HTMLElement;
            let totalCount = 0;
            if (dots) {
                totalCount = dots.querySelectorAll('li').length;
            }

            if (totalCount > maxDots) {
                if (nextSlide > currentSlide) {

                    const nextSlideElement = dots.querySelector('li.dot-index-' + nextSlide);
                    if (nextSlideElement?.classList.contains('n-small-1')) {

                        const lastChild = dots.querySelector('li:last-child');
                        if (!lastChild?.classList.contains('n-small-1')) {
                            setTransformCount(prev_count => prev_count + transformXIntervalNext);
                            nextSlideElement.classList.remove('n-small-1');
                            const nextSlidePlusOneElement = dots.querySelector('li.dot-index-' + (nextSlide + 1));
                            nextSlidePlusOneElement?.classList.add('n-small-1');
                            //dots.style.transform = 'translateX(' + transformCount + 'px)!important';
                            //dots.style.display = 'flex!important';
                            const pPointer = nextSlide - 2;
                            const pPointerMinusOne = pPointer - 1;

                            dots.querySelectorAll('li')[pPointer].classList.remove('p-small-1');
                            dots.querySelectorAll('li')[pPointerMinusOne].classList.add('p-small-1');
                        }
                    }

                } else {

                    const nextSlideElement = dots.querySelector('li.dot-index-' + nextSlide);
                    if (nextSlideElement?.classList.contains('p-small-1')) {

                        const firstChild = dots.querySelector('li:first-child');
                        if (!firstChild?.classList.contains('p-small-1')) {
                            //transformCount = transformCount + transformXIntervalPrev;
                            setTransformCount(prev_count => prev_count + transformXIntervalPrev);
                            nextSlideElement.classList.remove('p-small-1');
                            const nextSlidePlusOne = nextSlide - 1;
                            dots.querySelector('li.dot-index-' + nextSlidePlusOne)?.classList.add('p-small-1');
                            //dots.style.transform = 'translateX(' + transformCount + 'px)';
                            const nPointer = currentSlide + 3;
                            const nPointerMinusOne = nPointer - 1;
                            dots.querySelectorAll('li')[nPointer].classList.remove('n-small-1');
                            dots.querySelectorAll('li')[nPointerMinusOne].classList.add('n-small-1');
                        }
                    }

                }
            }
        }
    };

    const afterChangeHandler = () => {
        if (slickSlider.current) {
            const slick = slickSlider.current;
            const li = slick.querySelectorAll('ul.slick-dots li');
            li.forEach((element, index) => {
                element.classList.add('dot-index-' + index);
            });
        }
    }

    useEffect(() => {

        if (slickSlider.current) {
            const slick = slickSlider.current;
            const dots = slick.querySelector('ul.slick-dots') as HTMLElement;
            if (dots) {
                dots.style.transform = 'translateX(' + transformCount + 'px)';
                dots.style.display = 'flex';
            }
        }

    }, [transformCount]);

    useEffect(() => {
        const sliders = document.querySelectorAll('.slick-slider');
        if (sliders) {

            sliders.forEach(_slider => {

                let slider = _slider as HTMLElement
                let slider_hight = "300px";
                if (page == "Map") {
                    slider_hight = "265px";
                }

                slider.style.height = slider_hight;

            })
        }
    }, [])

    let show_dots_and_arrows = true;
    if (!images || (images && images.length < 2)) {
        show_dots_and_arrows = false;
    }

    const settings = {
        dots: show_dots_and_arrows,
        arrows: show_dots_and_arrows,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        focusOnSelect: true,
        infinite: false,
        //nextArrow: <NextArrow className="slick-next" />
    };

    let slides: React.JSX.Element[] = [];
    if (images && images.length) {

        slides = images.map((image, index) => (
            <CustomLinkMain key={index} href={`/listings/${listing_id}/${address}`} className='relative !w-[100.1%]'>
                <img src={`${(image && image != "") ? image : "/no-blog-image-added.png"}`} alt={`Alt here`}
                    onError={(e: any) => { e.target.onerror = null; e.target.src = `/no-blog-image-added.png`; }}
                    className={`w-full ${card_height} object-cover z-10 relative`}
                />
                <img src="https://i.imgur.com/xyA2TRg.gif" className=" absolute top-0 bottom-0 right-0 left-0 m-auto h-8 w-8 z-[5]" />
            </CustomLinkMain>
        ));
    } else {
        //"/loading-photos-from-mls-1.png"
        slides.push(<CustomLinkMain href={`/listings/${listing_id}/${address}`} className='relative !w-[100.1%]'>
            <img src={`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/${defaultpic}`} alt={`Alt here`} onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = `/loading-photos-from-mls-1.png`;
            }} className={`w-full ${card_height} object-cover z-10 relative`} />
        </CustomLinkMain>)
    }
    //MANAWA
    //`/api/fetch-proxy-image?image_url=${image.MediaURL}`
    //`/api/fetch-proxy-image?image_url=${image}`

    return (
        <div ref={slickSlider} className='slick-body absolute overflow-hidden w-full h-full'>
            <Slider
                {...settings}
                lazyLoad="ondemand"
                beforeChange={beforeChangeHandler}
                afterChange={afterChangeHandler}>
                {slides}
            </Slider>
        </div>
    )
}

export default PropCarousel