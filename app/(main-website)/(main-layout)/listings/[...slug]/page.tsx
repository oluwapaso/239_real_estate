"use client"

import Link from 'next/link'
import React, { lazy, useEffect, useRef, useState } from 'react'
import SimpleHeader from '@/components/SimpleHeader'
import { useParams, useSearchParams } from 'next/navigation'
import { MdAttachMoney, MdOutlineMarkEmailUnread, MdOutlineOndemandVideo, MdOutlinePhotoLibrary } from 'react-icons/md'
import numeral from 'numeral'
import { BsBuildings, BsPersonWalking, BsTwitterX } from 'react-icons/bs'
import { IoBedOutline, IoBicycle, IoCloseSharp, IoConstructOutline } from 'react-icons/io5'
import { GiIsland } from 'react-icons/gi'
import { TbCalendarDollar } from 'react-icons/tb'
import { GoogleMap, OverlayView } from '@react-google-maps/api'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import Image from 'next/image'
import { FaAsterisk, FaShower } from 'react-icons/fa'
import { HiCheck } from 'react-icons/hi'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { APIResponseProps } from '@/components/types'
import { Helpers } from '@/_lib/helpers'
import Modal from '@/components/Modal'
import MakeInquiry from '@/components/PropertyEnquiry'
import { BiUserVoice } from 'react-icons/bi'
import { FaLinkedin, FaSquareFacebook, FaWhatsapp } from 'react-icons/fa6'
import { GrPrint } from 'react-icons/gr'
import {
    EmailShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    WhatsappShareButton,
} from "react-share";
import { RiMapPinLine } from 'react-icons/ri'
import PropertyCard from '@/components/PropertyCard'
import { PiTrain, PiVirtualRealityLight } from 'react-icons/pi'
import Gallery from '@/components/Gallery'
import PropFavs from '@/components/PropFavs'
import PropFeatures from '@/components/PropFeatures'
import CircularProgressBar from '@/components/Circular_Progress'
import useWalkScore from '@/_hooks/useWalkscore'
import { useSession } from 'next-auth/react'
import { useModal } from '@/app/contexts/ModalContext'

const helper = new Helpers();
const PropertyDetails = () => {

    const searchParams = useSearchParams();
    const params = useParams();
    const slug = params?.slug as string;
    const { data: session } = useSession();
    const user = session?.user as any;
    const share_title = `Look at what i found on ${process.env.NEXT_PUBLIC_COMPANY_NAME}'s website`;
    const [prop_address, setPropAddress] = useState("");
    const [listing_key, setListingKey] = useState("");

    const [walk_score, setWalkScrore] = useState<any>({});
    const [transit_score, setTransitScrore] = useState<any>({});
    const [bike_score, setBikeScrore] = useState<any>({});
    const [lat, setLat] = useState(''); // Example latitude
    const [lon, setLon] = useState(''); // Example longitude
    const [address, setAddress] = useState(''); // Example address
    const { walkScore, error, loading } = useWalkScore(lat, lon, address);

    const containerStyle = {
        width: '100%',
        height: '100%',
    };

    const center = {
        lat: 44.900771,
        lng: -89.5694905,
    };

    const mapOptions = {
        fullscreenControl: false,
        mapTypeControl: false, // Remove other controls if needed
        streetViewControl: true,
        zoomControl: true,
    };

    const empty_form_data = {
        user_id: user?.user_id || 0,
        fullname: `${user?.firstname} ${user?.lastname}`,
        phone_number: user?.phone_1,
        email: user?.email,
        prefer_date: "ASAP",
        exact_date: "Select a Day",
        notes: "",
        prop_url: window.location.href,
        mailer: "Sendgrid",
        message_type: "Showing Request"
    }

    const mortgae_form_data = {
        property_price: 150000,
        downpay_dollar: 30000,
        downpay_percent: 20,
        length_of_mortgage: 30,
        interest_rate: 3,
    }

    const [mapCenter, setMapCenter] = useState(center);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [formData, setFormData] = useState(empty_form_data);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isShowingReqLoading, setIsShowingReqLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modal_title, setModalTitle] = useState(<></>);
    const [modal_children, setModalChildren] = useState({} as React.ReactNode);
    const [page_url, setPageURL] = useState("");
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isInfoLoaded, setIsInfoLoaded] = useState(false);
    const [prop, setProp] = useState<any>({});
    const [page_error, setPageError] = useState("");
    const [similar_by, setSimilarBy] = useState("Price");
    const [isLoadingSimilarProps, setIsLoadingSimilarProps] = useState(true);
    const [isSimilarPropsLoaded, setIsSimilarPropsLoaded] = useState(false);
    const [similar_props, setSimilarProps] = useState<any[]>([]);
    const [gallery, setGallery] = useState<React.JSX.Element>(<div className='col-span-2 bg-white flex items-center justify-center h-full'><AiOutlineLoading3Quarters size={30} className='animate-spin' /></div>);
    const [showGallery, setShowGallery] = useState(false);
    const [initialSlide, setInitialSlide] = useState(1);
    const [monthly_payment, setMonthlyPayment] = useState("0");
    const [calc_data, setCalcData] = useState(mortgae_form_data);
    const { handleLoginModal, closeModal: close_modal } = useModal();

    const closeModal = () => {
        setShowModal(false);
    }

    useEffect(() => {
        if (slug.length) {

            let prop_key = slug[0];
            setIsLoadingInfo(true);
            setPageError("");

            fetch("/api/(listings)/load-single-property", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "prop_key": prop_key }),
            }).then((resp): Promise<APIResponseProps> => {
                setIsLoadingInfo(false);
                if (!resp.ok) {
                    setPageError(resp.statusText);
                }
                return resp.json();
            }).then(data => {

                if (data.success && data.data.property.found) {

                    const propAddress = `${data.data.property.FullAddress}, ${data.data.property.City}, ${data.data.property.StateOrProvince} ${data.data.property.PostalCode}`;
                    setProp(data.data.property);
                    setIsInfoLoaded(true);
                    setPropAddress(propAddress);
                    setListingKey(data.data.property.MLSNumber);
                    setMapCenter((prev) => {
                        return {
                            lat: parseFloat(data.data.property.Latitude),
                            lng: parseFloat(data.data.property.Longitude),
                        }
                    });

                    setLat(data.data.property.Latitude as string);
                    setLon(data.data.property.Longitude as string);
                    setAddress(data.data.property.FullAddress as string);

                    setFormData(prev => {
                        return {
                            ...prev,
                            notes: `I'd like to request a showing of ${propAddress} (MLS® #${data.data.property.MLSNumber}). Thank you!`,
                        }
                    });

                    const percent = ((20 / 100) * data.data.property.ListPrice)
                    setCalcData(prev => {
                        return {
                            ...prev,
                            downpay_dollar: percent,
                            property_price: data.data.property.ListPrice
                        }
                    });

                } else {
                    setPageError(data.data.property.message);
                }

            }).catch((e: any) => {
                setPageError(e.message);
            });

        }
    }, [slug]);

    useEffect(() => {
        const nextWeek = moment().add(7, 'days').format('YYYY-MM-DD');
        setSelectedDate(nextWeek);
        setPageURL(`${window.location.href}/${slug}`);
    }, []);

    const handleDateChange = (date: string | null) => {
        setSelectedDate(date);
        setFormData((prev) => {
            return {
                ...prev,
                exact_date: date as string,
            }
        });
        setIsDatePickerOpen(false);
    };

    useEffect(() => {
        if (!isMapLoaded) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY}`;
            script.async = true;
            script.onload = () => setIsMapLoaded(true);
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [isMapLoaded]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev_data) => {
            return {
                ...prev_data,
                [e.target.name]: e.target.value
            }
        });
    }

    const handleSelectADay = () => {
        setIsDatePickerOpen(!isDatePickerOpen);
        setPreferDate("Exact Day");
    }

    const setPreferDate = (date: string) => {
        if (isDatePickerOpen) {
            setIsDatePickerOpen(false);
        }
        setFormData((prev_data) => {
            return {
                ...prev_data,
                prefer_date: date
            }
        })
    }

    const handleShowingRequest = () => {

        if (formData.fullname == "" || formData.phone_number == "" || formData.email == "") {

            toast.error("Fields marked with asterisks are required.", {
                position: "top-center",
                theme: "colored"
            });

            return false;

        }

        if (!helper.validateEmail(formData.email)) {
            toast.error("Provide a valid email address.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        if (formData.prefer_date == "Exact Day" && (formData.exact_date == "Select a Day" || formData.exact_date == "" || !formData.exact_date)) {
            toast.error("Select a valid date.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        setIsShowingReqLoading(true);
        formData.prop_url = `${window.location.href}/${slug}`;
        formData.user_id = user.user_id;

        fetch("/api/(emails)/request-showing", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        }).then((resp): Promise<APIResponseProps> => {
            setIsShowingReqLoading(false);
            return resp.json();
        }).then(data => {

            if (data.message == "Email sent!") {

                toast.success("Request received successfully, we will get back to you as soon as possible.", {
                    position: "top-center",
                    theme: "colored"
                });

                //setFormData(empty_form_data);

            } else {

                toast.error("Unable to send your request, please try again later", {
                    position: "top-center",
                    theme: "colored"
                });

                console.log(data.message)

            }

        });

    }

    const handleInfo = (type: string) => {
        if (type == "Question 2") {
            setModalTitle(<div>LISTING INQUIRY</div>);
        } else {
            setModalTitle(<div>FIND OUT MORE ABOUT {prop_address} (MLS&reg; #{listing_key})</div>);
        }
        setModalChildren(<MakeInquiry closeModal={closeModal} type={type} address={prop_address} listing_key={listing_key} />);
        setShowModal(true);
    }

    const handleVideoTour = () => {
        setModalTitle(<div>TOUR {prop_address}(MLS&reg; #{listing_key})</div>)
        setModalChildren(<MakeInquiry closeModal={closeModal} type="Tour" address={prop_address} listing_key={listing_key} />);
        setShowModal(true);
    }

    const [activeDivId, setActiveDivId] = useState<string | null>(null);

    useEffect(() => {

        if (!user) {
            if (!user || !user.user_id) {
                toast.error("You need to login to view property details", {
                    position: "top-center",
                    theme: "colored"
                });

                handleLoginModal();
            } else {
                toast.dismiss();
                close_modal();
            }
        } else {
            setFormData((prev_data) => {
                return {
                    ...prev_data,
                    fullname: `${user?.firstname} ${user?.lastname}`,
                    phone_number: user.phone_1,
                    email: user.email,
                }
            })
            toast.dismiss();
            close_modal();
        }

        const handleScroll = () => {
            const windscroll = window.scrollY || document.documentElement.scrollTop;
            document.querySelectorAll('.section').forEach(function (section, i) {
                let id = section.id;

                // The number at the end of the next line is how many pixels from the top you want it to activate.
                if (section instanceof HTMLElement) {
                    var sectionTop = section.offsetTop - 105;
                    if (sectionTop <= windscroll) {
                        const all_actives = document.querySelector('.section.active')
                        all_actives?.classList.remove('active');
                        document.querySelectorAll('.section')[i].classList.add('active');
                        setActiveDivId(id);
                    }
                }
            });

        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

    }, [user]);



    useEffect(() => {

        const logView = (user_id: any) => {

            fetch("/api/(users)/log-property-view", {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "user_id": user_id, "listing_key": listing_key, "property_address": prop_address }),
            }).then((resp): Promise<APIResponseProps> => {
                setIsLoadingInfo(false);
                if (!resp.ok) {
                    setPageError(resp.statusText);
                }
                return resp.json();
            }).then(data => {
                console.log("Log vie data:", data)
            });
        }

        if (isInfoLoaded && user && user.user_id) {
            logView(user.user_id);
        }

    }, [user, isInfoLoaded])

    const handleButtonClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 105;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const SimilarBy = (type: string) => {
        setSimilarBy(type);
    }

    useEffect(() => {

        const LoadSimilarProps = () => {

            setIsLoadingSimilarProps(true);
            setIsSimilarPropsLoaded(false);
            setSimilarProps([]);
            setPageError("");

            fetch("/api/(listings)/load-similar-property", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "prop_key": prop.matrix_unique_id,
                    "prop_type": prop.PropertyType,
                    "similar_by": similar_by,
                    "price": prop.ListPrice,
                    "beds": prop.BedsTotal,
                    "baths": prop.BathsTotal,
                    "location": prop.PostalCode,
                }),
            }).then((resp): Promise<APIResponseProps> => {
                setIsLoadingSimilarProps(false);
                setIsSimilarPropsLoaded(true);
                if (!resp.ok) {
                    setPageError(resp.statusText);
                }
                return resp.json();
            }).then(data => {

                if (data.success && data.data.properties.length) {
                    setSimilarProps(data.data.properties);
                } else {
                    setPageError(data.data.message);
                }

            }).catch((e: any) => {
                setPageError(e.message);
            });
        }

        if (isInfoLoaded) {
            LoadSimilarProps();
        }

    }, [similar_by, isInfoLoaded]);

    useEffect(() => {

        if (isInfoLoaded) {

            let gallery = <></>
            let virtual_tour = <Link href={prop.VirtualTourURL ? prop.VirtualTourURL : prop.VirtualTourURL2} target='_blank' className='absolute right-2 top-2 
            bg-white py-2 px-6 flex justify-center items-center rounded-md cursor-pointer hover:drop-shadow-lg'>
                <PiVirtualRealityLight size={22} className='mr-1' /> <span>Virtual Tour</span>
            </Link>

            let new_listing = <div className='w-[55px] absolute top-2 left-3 p-2 flex justify-end items-center'>
                <div className='px-3 py-1 rounded-sm text-white bg-green-600 text-xs font-normal tracking-wider'>NEW</div>
            </div>

            const diffInMinutes = moment().diff(moment(prop.MatrixModifiedDT), 'minutes');

            if (prop.Images && prop.Images.length > 0) {

                if (prop.Images.length == 1) {
                    gallery = <div className='w-full grid grid-cols-1 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)} style={{ backgroundImage: `url(${prop.Images[0]})`, backgroundPosition: "center", }}></div>
                        {diffInMinutes <= 60 && new_listing}
                        {(prop.VirtualTourURL || prop.VirtualTourURL2) && virtual_tour}
                        <PropFavs ListingId={prop.matrix_unique_id} page='Prop Details' MLSNumber={prop.MLSNumber} PropAddress={prop.FullAddress} />
                    </div>
                } else if (prop.Images.length == 2) {

                    gallery = <div className='w-full grid grid-cols-2 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full col-span-2 md:col-span-1 bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)} style={{ backgroundImage: `url(${prop.Images[0]})`, backgroundPosition: "center", }}></div>
                        <div className='h-full relative cursor-pointer'>
                            <div className={`h-full grid grid-cols-1`}>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(1)} style={{ backgroundImage: `url(${prop.Images[1]})`, backgroundPosition: "center", }}></div>
                            </div>
                        </div>
                        {(prop.VirtualTourURL || prop.VirtualTourURL2) && virtual_tour}
                        {diffInMinutes <= 60 && new_listing}
                        <PropFavs ListingId={prop.matrix_unique_id} page='Prop Details' MLSNumber={prop.MLSNumber} PropAddress={prop.FullAddress} />
                    </div>

                } else if (prop.Images.length == 3) {

                    gallery = <div className='w-full grid grid-cols-2 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full col-span-2 md:col-span-1 bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)} style={{ backgroundImage: `url(${prop.Images[0]})`, backgroundPosition: "center", }}></div>
                        <div className='h-full relative cursor-pointer'>
                            <div className={`h-full grid grid-cols-1 gap-[2px]`}>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(1)} style={{ backgroundImage: `url(${prop.Images[1]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(2)} style={{ backgroundImage: `url(${prop.Images[2]})`, backgroundPosition: "center", }}></div>
                            </div>
                        </div>
                        {(prop.VirtualTourURL || prop.VirtualTourURL2) && virtual_tour}
                        {diffInMinutes <= 60 && new_listing}
                        <PropFavs ListingId={prop.matrix_unique_id} page='Prop Details' MLSNumber={prop.MLSNumber} PropAddress={prop.FullAddress} />
                    </div>

                } else if (prop.Images.length == 4) {

                    gallery = <div className='w-full grid grid-cols-2 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full col-span-2 md:col-span-1 bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)} style={{ backgroundImage: `url(${prop.Images[0]})`, backgroundPosition: "center", }}></div>
                        <div className='h-full relative cursor-pointer'>
                            <div className={`h-full w-full grid grid-cols-2 gap-[2px]`}>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(1)} style={{ backgroundImage: `url(${prop.Images[1]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(2)} style={{ backgroundImage: `url(${prop.Images[2]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain col-span-2' onClick={() => OpenGallery(3)} style={{ backgroundImage: `url(${prop.Images[3]})`, backgroundPosition: "center", }}></div>
                            </div>
                        </div>
                        {(prop.VirtualTourURL || prop.VirtualTourURL2) && virtual_tour}
                        {diffInMinutes <= 60 && new_listing}
                        <PropFavs ListingId={prop.matrix_unique_id} page='Prop Details' MLSNumber={prop.MLSNumber} PropAddress={prop.FullAddress} />
                    </div>

                } else {

                    gallery = <div className='w-full grid grid-cols-2 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full col-span-2 md:col-span-1 bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)}
                            style={{ backgroundImage: `url(${prop.Images[0]})`, backgroundPosition: "center", }}></div>
                        <div className='hidden md:flex md:col-span-1 h-full cursor-pointer'>
                            <div className={`h-full w-full grid grid-cols-2 gap-[2px]`}>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(1)} style={{ backgroundImage: `url(${prop.Images[1]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(2)} style={{ backgroundImage: `url(${prop.Images[2]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(3)} style={{ backgroundImage: `url(${prop.Images[3]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(4)} style={{ backgroundImage: `url(${prop.Images[4]})`, backgroundPosition: "center", }}></div>
                            </div>
                        </div>

                        <div className='w-[200px] absolute right-2 bottom-2 bg-white py-3 px-4 flex justify-center items-center 
                                rounded-md cursor-pointer hover:drop-shadow-lg' onClick={() => OpenGallery(0)}>
                            <MdOutlinePhotoLibrary size={22} className='mr-1' /> <span>See all {prop.Images.length} photos</span>
                        </div>

                        {(prop.VirtualTourURL || prop.VirtualTourURL2) && virtual_tour}

                        {diffInMinutes <= 60 && new_listing}

                        <PropFavs ListingId={prop.matrix_unique_id} page='Prop Details' MLSNumber={prop.MLSNumber} PropAddress={prop.FullAddress} />
                    </div>

                }

            } else {

                gallery = <div className='w-full grid grid-cols-1 gap-[2px] h-[70vh] relative overflow-hidden'>
                    <div className='h-full bg-cover object-contain cursor-pointer'
                        style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/${prop.DefaultPic})`, backgroundPosition: "center", }}>
                    </div>

                    {(prop.VirtualTourURL || prop.VirtualTourURL2) && virtual_tour}

                    {diffInMinutes <= 60 && new_listing}

                    <PropFavs ListingId={prop.matrix_unique_id} page='Prop Details' MLSNumber={prop.MLSNumber} PropAddress={prop.FullAddress} />
                </div>
            }

            setGallery(gallery);
        }

    }, [isInfoLoaded]);

    const OpenGallery = (index: number) => {
        setInitialSlide(index);
        setShowGallery(true);
        document.body.style.overflowY = 'hidden';
    }

    const closeGallery = () => {
        document.body.style.overflowY = 'auto';
        setShowGallery(false);
    }

    const handleCalcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCalcData((prev_data) => {
            return {
                ...prev_data,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleDpChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.name == "downpay_dollar") {

            let value = 100 * (parseFloat(e.target.value) / calc_data.property_price)
            if (Number.isNaN(value)) {
                value = 0
            }

            setCalcData((prev_data) => {
                return {
                    ...prev_data,
                    [e.target.name]: e.target.value,
                    ["downpay_percent"]: parseFloat(value.toFixed(2))
                }
            })

        } else if (e.target.name == "downpay_percent") {

            let value = calc_data.property_price * (parseFloat(e.target.value) / 100)

            setCalcData((prev_data) => {
                return {
                    ...prev_data,
                    [e.target.name]: e.target.value,
                    ["downpay_dollar"]: parseFloat(value.toFixed(2))
                }
            })

        }

    }

    const CalculateMortagage = () => {

        const downPayment = parseFloat(calc_data.downpay_dollar.toString());
        const propertyPrice = parseFloat(calc_data.property_price.toString());
        const interestRate = parseFloat(calc_data.interest_rate.toString()) / 100;
        const mortgageLength = parseFloat(calc_data.length_of_mortgage.toString());
        const monthlyInterestRate = interestRate / 12;
        const numberOfPayments = mortgageLength * 12;
        const principal = propertyPrice - downPayment;
        const monthlyPayment = (principal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
        setMonthlyPayment(new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(monthlyPayment));

    }

    useEffect(() => {
        CalculateMortagage();
    }, [calc_data]);

    useEffect(() => {

        if (walkScore) {
            setWalkScrore({ "percentage": walkScore?.walkscore, "description": walkScore?.description })
            setTransitScrore({ "percentage": walkScore?.transit?.score, "description": walkScore?.transit?.description })
            setBikeScrore({ "percentage": walkScore?.bike?.score, "description": walkScore?.bike?.description })
        }

    }, [walkScore, loading, error]);

    return (
        <>
            <SimpleHeader page="Property Details" />
            {
                isLoadingInfo && <>
                    <div className='w-full bg-white flex items-center justify-center h-[300px]'>
                        <AiOutlineLoading3Quarters size={30} className='animate-spin' />
                    </div>
                </>
            }

            {(!isLoadingInfo && isInfoLoaded) && (
                <>
                    {gallery}

                    <div className='w-full bg-primary py-3 lg:py-7 px-3 xl:px-0'>
                        <div className='container m-auto max-w-[1260px]'>
                            <div className='w-full'>
                                <div className='w-full grid grid-cols-1 md:grid-cols-5 gap-y-3 text-white'>
                                    <div className='md:col-span-3'>
                                        <h2 className='w-full font-semibold text-2xl md:text-4xl'>{numeral(prop.ListPrice).format("$0,0")}</h2>
                                        <div className='w-full font-light text-lg'>{prop.FullAddress}, {prop.City},
                                            {prop.StateOrProvince} {prop.PostalCode}</div>
                                    </div>
                                    <div className='md:col-span-2 grid grid-cols-3'>
                                        <div className='flex flex-col'>
                                            <h2 className='w-full font-semibold text-2xl md:text-4xl'>{numeral(prop.BedsTotal).format("0,0")}</h2>
                                            <div className='text-lg font-light'>beds</div>
                                        </div>

                                        <div className='flex flex-col'>
                                            <h2 className='w-full font-semibold text-2xl md:text-4xl '>{numeral(prop.BathsTotal).format("0,0")}</h2>
                                            <div className='text-lg font-light'>baths</div>
                                        </div>

                                        <div className='flex flex-col'>
                                            <h2 className='w-full font-semibold text-2xl md:text-4xl'>{numeral(prop.ApproxLivingArea).format("0,0")}</h2>
                                            <div className='text-lg font-light'>sqft</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='sticky top-0 z-20 shadow bg-white w-full border-b border-gray-300'>
                        <div className='container m-auto max-w-[1200px] px-3 xl:px-0 overflow-y-hidden overflow-x-auto'>
                            <div className='w-full min-w-[1050px] md:min-w-[full] grid grid-cols-2 gap-y-3'>

                                <div className='grid grid-cols-[max-content]'>
                                    <div className='w-full flex items-center *:capitalize *:py-6 space-x-8 *:cursor-pointer *:border-b-2 *:border-transparent'>
                                        <div className={`hover:border-gray-900 ${activeDivId == "about" ? "!border-gray-900" : null}`}
                                            onClick={() => handleButtonClick('about')}>Overview</div>
                                        <div className={`hover:border-gray-900 ${activeDivId == "features" ? "!border-gray-900" : null}`}
                                            onClick={() => handleButtonClick('features')}>Facts &amp; Features</div>
                                        <div className={`hover:border-gray-900 ${activeDivId == "map_area" ? "!border-gray-900" : null}`}
                                            onClick={() => handleButtonClick('map_area')}>Map &amp; Directions</div>
                                        <div className={`hover:border-gray-900 ${activeDivId == "request_info" ? "!border-gray-900" : null}`}
                                            onClick={() => handleButtonClick('request_info')}>Request Showing</div>
                                    </div>
                                </div>

                                <div className='justify-self-end grid grid-cols-2 gap-3 items-center'>
                                    <button className='rounded-3xl text-white py-2 px-4 md:px-7 flex items-center justify-center bg-sky-600 
                            hover:bg-sky-500 hover:drop-shadow-xl font-normal' onClick={() => handleInfo("Info")}>Request Info</button>
                                    <button className='rounded-3xl text-white py-2 px-4 md:px-7 flex items-center justify-center bg-green-600
                            hover:bg-green-500 hover:drop-shadow-xl font-normal' onClick={() => handleInfo("Question")}>Ask a Question</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='w-full py-6'>
                        <div className='container m-auto max-w-[1260px] px-3 xl:px-0'>

                            <div className='w-full grid grid-cols-1 lg:grid-cols-6 gap-8'>

                                <div className='lg:col-span-4'>

                                    <div className="section w-full" id='about'>

                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>About {prop.FullAddress}</h1>

                                        <div className='w-full grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5'>
                                            <div className='py-4 px-4 bg-gray-50 flex items-center'>
                                                <BsBuildings size={25} className='mr-2' />
                                                <span> {prop.PropertyClass != "RNT" ? prop.OwnershipDesc : prop.PropertyType}</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-50 flex items-center'>
                                                <IoConstructOutline size={25} className='mr-2' />  <span>Built in {prop.YearBuilt}</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-50 flex items-center'>
                                                <GiIsland size={25} className='mr-2' />
                                                <span>{prop.TotalArea ? numeral(prop.TotalArea).format("0,0") : "--"} sqft lot</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-50 flex items-center'>
                                                <div className='mr-2'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 30 30">
                                                        <path fill='black' d="M29 21H11V3a1.003 1.003 0 00-1-1H3a1.003 1.003 0 00-1 1v26a1.003 1.003 0 001 1h26a1.003 1.003 0 001-1v-7a1.003 1.003 0 00-1-1zm-1 7H4V4h5v2H8a1 1 0 000 2h1v3H8a1 1 0 000 2h1v3H8a1 1 0 000 2h1v5h5v1a1 1 0 002 0v-1h3v1a1 1 0 002 0v-1h3v1a1 1 0 002 0v-1h2z"></path>
                                                        <path d="M20.038 14.587a2.882 2.882 0 01-1.947-.831 1.347 1.347 0 00-.926-.419.802.802 0 00-.865.825 1.578 1.578 0 00.595 1.141 4.027 4.027 0 002.19.883v.885a.929.929 0 001.858 0v-.913a2.949 2.949 0 002.757-2.875c0-1.385-.838-2.23-2.54-2.562l-1.278-.263c-.858-.17-1.25-.494-1.25-1 0-.568.506-1.02 1.303-1.02a2.31 2.31 0 011.737.763 1.414 1.414 0 00.98.419.751.751 0 00.777-.757 1.622 1.622 0 00-.58-1.136 3.7 3.7 0 00-1.907-.856v-.943a.929.929 0 00-1.857 0v.927a2.834 2.834 0 00-2.67 2.772c0 1.378.824 2.257 2.46 2.595l1.27.277c.974.21 1.359.507 1.359 1.014 0 .649-.514 1.074-1.466 1.074z"></path>
                                                    </svg>
                                                </div>
                                                <span>{prop.PricePerSqFt ? numeral(prop.PricePerSqFt).format("$0,0") : "--"} sqft</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-50 flex items-center'>
                                                <div className='mr-2'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 30 30">
                                                        <path d="M21.65 6.47l-5-4.23a1 1 0 00-1.3 0l-5 4.23a1 1 0 00-.35.76v6.27a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5V7.23a1 1 0 00-.35-.76zM20 13h-3v-2a1 1 0 00-2 0v2h-3V7.69l4-3.38 4 3.38z"></path>
                                                        <path d="M14.31 20.81l-3.94-4.75-.09-.1A2.91 2.91 0 008 15.2v-2.7C8 9.92 6.38 9 5 9s-3 1.08-3 3.5v7.2a3.74 3.74 0 00.82 2.3L7 27.25V29a1 1 0 001 1h6a1 1 0 001-1v-6.28a3 3 0 00-.69-1.91zM13 28H9v-1.1a1 1 0 00-.22-.62l-4.4-5.51A1.67 1.67 0 014 19.7v-7.2c0-.68.17-1.5 1-1.5.25 0 1 0 1 1.5v3.85A3 3 0 006.23 20l3 3.6a1 1 0 001.54-1.28l-3-3.64a1 1 0 01-.06-1.28.86.86 0 011.2 0l3.89 4.68a1 1 0 01.23.64zM27 9c-1.38 0-3 .92-3 3.5v2.69a2.93 2.93 0 00-2.28.77l-.09.1-3.94 4.75a3 3 0 00-.69 1.91V29a1 1 0 001 1h6a1 1 0 001-1v-1.75L29.18 22a3.74 3.74 0 00.82-2.3v-7.2c0-2.42-1.51-3.5-3-3.5zm1 10.7a1.71 1.71 0 01-.38 1.08l-4.4 5.5a1 1 0 00-.22.62V28h-4v-5.28a1 1 0 01.23-.64l3.89-4.68a.84.84 0 011.14 0 1 1 0 010 1.38l-3 3.6a1 1 0 101.54 1.28l3-3.56a3 3 0 00.2-3.73V12.5c0-1.5.75-1.5 1-1.5.83 0 1 .82 1 1.5z"></path>
                                                    </svg>
                                                </div>
                                                <span>{prop.HOAFee ? numeral(prop.HOAFee).format("$0,0") : "--"} HOA</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-50 flex items-center'>
                                                <TbCalendarDollar size={25} className='mr-2' />
                                                <span>{prop.PropertyClass != "RNT" ? numeral(monthly_payment).format("$0,0.00") : numeral(prop.ListPrice).format("$0,0.00")}/mo</span>
                                            </div>

                                        </div>

                                        <div className='w-full mt-5 leading-8 font-normal'>{prop.PropertyInformation}</div>
                                        <div className='w-full mt-5 leading-8 font-normal flex flex-col'>
                                            <div className='w-full mb-2 flex items-center'>
                                                <div className='font-medium'>Listing updated:</div>
                                                <div className='ml-2 text-sm'>{moment(prop.MatrixModifiedDT).format("MMMM DD, YYYY hh:mma")}</div>
                                            </div>
                                            <div className='w-full mb-2 flex items-center'>
                                                <div className='font-medium'>Listed by:</div>
                                                <div className='ml-2 text-sm'>{prop.ListOfficeName}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='section w-full mt-14' id='features'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Features of {prop.FullAddress}</h1>
                                        <div className='w-full mt-4 grid grid-cols-1 xs:grid-cols-2 gap-x-6 *:py-4 *:border-b *:border-gray-300'>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>MLS&reg; #</div>
                                                <div className='font-normal text-base text-right'>{prop.MLSNumber}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Price</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.ListPrice).format("$0,0")}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Bedrooms</div>
                                                <div className='font-normal text-base text-right'>{prop.BedsTotal}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Total Bathrooms</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.BathsTotal).format("0,0")}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Half Baths</div>
                                                <div className='font-normal text-base text-right'>{prop.BathsHalf}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Full Baths</div>
                                                <div className='font-normal text-base text-right'>{prop.BathsFull}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Square Footage</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.ApproxLivingArea).format("0,0")}</div>
                                            </div>

                                            {
                                                prop.Acres && <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>Acres</div>
                                                    <div className='font-normal text-base text-right'>{numeral(prop.Acres).format("0,0")}</div>
                                                </div>
                                            }

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Year Built</div>
                                                <div className='font-normal text-base text-right'>{prop.YearBuilt}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Type</div>
                                                <div className='font-normal text-base text-right'>{prop.PropertyType}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Sub-Type</div>
                                                <div className='font-normal text-base text-right'>{prop.OwnershipDesc}</div>
                                            </div>

                                            {
                                                prop.GarageSpaces && <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>Garage Spaces</div>
                                                    <div className='font-normal text-base text-right'>{numeral(prop.GarageSpaces).format("0,0")}</div>
                                                </div>
                                            }

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Is Waterfront</div>
                                                <div className='font-normal text-base text-right'>{prop.WaterfrontYN == "1" ? "Yes" : "No"}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Status</div>
                                                <div className={`text-sm text-right uppercase font-normal bg-white px-4 py-1 rounded-full
                                                ${prop.Status == "Active" ? "!bg-green-600 text-white" : null}
                                                ${prop.Status == "Closed" ? "!bg-red-600 text-white" : null}`}>
                                                    {prop.Status}
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className='w-full mt-14' id='community'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Community Information</h1>
                                        <div className='w-full mt-4 grid grid-cols-1 xs:grid-cols-2 gap-x-6 *:py-4 *:border-b *:border-gray-300'>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Address</div>
                                                <div className='font-normal text-base text-right'>{prop.FullAddress}</div>
                                            </div>

                                            <div className='fle_x justify-between hidden'>
                                                <div className='font-semibold text-base'>Area</div>
                                                <div className='font-normal text-base text-right'>{`(${prop.PostalCode})`}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Development</div>
                                                <div className='font-normal text-base text-right'>{prop.Development}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>City</div>
                                                <div className='font-normal text-base text-right'>{prop.City}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>County</div>
                                                <div className='font-normal text-base text-right'>{prop.CountyOrParish}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>State</div>
                                                <div className='font-normal text-base text-right'>{prop.StateOrProvince}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Zip Code</div>
                                                <div className='font-normal text-base text-right'>{prop.PostalCode}</div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className={`w-full mt-14 ${((prop.Amenities && prop.Amenities != "")
                                        || (prop.Equipment && prop.Equipment != "")
                                        || (prop.PrivatePoolDesc && prop.PrivatePoolDesc != "")
                                        || (prop.PrivateSpaDesc && prop.PrivateSpaDesc != "")) ? "block" : "hidden"
                                        }`} id='amenities'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Amenities</h1>
                                        <div className='w-full mt-4 *:py-4 *:border-b *:border-gray-300'>
                                            {
                                                (prop.Amenities && prop.Amenities != "") && <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
                                                    <div className='w-full font-semibold text-base'>Amenities</div>
                                                    {
                                                        prop.Amenities.split(",").map((amenity: any, index: number) => {
                                                            return <div key={index} className='flex mr-2 mb-2 rounded items-center 
                                                                justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer 
                                                                hover:drop-shadow-lg'>{amenity}</div>
                                                        })
                                                    }
                                                </div>
                                            }

                                            {
                                                (prop.Equipment && prop.Equipment != "") && <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
                                                    <div className='w-full font-semibold text-base'>Equipment</div>
                                                    {
                                                        prop.Equipment.split(",").map((utility: any, index: number) => {
                                                            return <div key={index} className='flex mr-2 mb-2 rounded items-center 
                                                            justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer 
                                                            hover:drop-shadow-lg'>{utility}</div>
                                                        })
                                                    }
                                                </div>
                                            }

                                            {
                                                (prop.PrivatePoolDesc && prop.PrivatePoolDesc != "") && <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
                                                    <div className='w-full font-semibold text-base'>Private Pool Description</div>
                                                    {
                                                        prop.PrivatePoolDesc.split(",").map((garage: any, index: number) => {
                                                            return <div key={index} className='flex mr-2 mb-2 rounded items-center 
                                                            justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer 
                                                            hover:drop-shadow-lg'>{garage}</div>
                                                        })
                                                    }
                                                </div>
                                            }

                                            {
                                                (prop.PrivateSpaDesc && prop.PrivateSpaDesc != "") && <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
                                                    <div className='w-full font-semibold text-base'>Private Spa Description</div>
                                                    {
                                                        prop.PrivateSpaDesc.split(",").map((garage: any, index: number) => {
                                                            return <div key={index} className='flex mr-2 mb-2 rounded items-center 
                                                            justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer 
                                                            hover:drop-shadow-lg'>{garage}</div>
                                                        })
                                                    }
                                                </div>
                                            }

                                        </div>
                                    </div>

                                    <div className={`w-full mt-14 ${((prop.InteriorFeatures && prop.InteriorFeatures != "")
                                        || (prop.Flooring && prop.Flooring != "")
                                        || (prop.Cooling && prop.Cooling != "")
                                        || (prop.Heat && prop.Heat != "")) ? "block" : "hidden"
                                        }`} id='interior'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Interior</h1>
                                        <div className='w-full mt-4 *:py-4 *:border-b *:border-gray-300'>

                                            {
                                                (prop.InteriorFeatures && prop.InteriorFeatures != "") && <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
                                                    <div className='w-full font-semibold text-base'>Interior Features</div>
                                                    {
                                                        prop.InteriorFeatures.split(",").map((interior: any, index: number) => {
                                                            return <div key={index} className='flex mr-2 mb-2 rounded items-center 
                                                            justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer 
                                                            hover:drop-shadow-lg'>{interior}</div>
                                                        })
                                                    }
                                                </div>
                                            }

                                            {
                                                (prop.Flooring && prop.Flooring != "") && <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
                                                    <div className='w-full font-semibold text-base'>Flooring</div>
                                                    {
                                                        prop.Flooring.split(",").map((heating: any, index: number) => {
                                                            return <div key={index} className='flex mr-2 mb-2 rounded items-center 
                                                            justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer 
                                                            hover:drop-shadow-lg'>{heating}</div>
                                                        })
                                                    }
                                                </div>
                                            }

                                            {
                                                (prop.Cooling && prop.Cooling != "") && <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
                                                    <div className='w-full font-semibold text-base'>Cooling</div>
                                                    {
                                                        prop.Cooling.split(",").map((app: any, index: number) => {
                                                            return <div key={index} className='flex mr-2 mb-2 rounded items-center 
                                                            justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer 
                                                            hover:drop-shadow-lg'>{app}</div>
                                                        })
                                                    }
                                                </div>
                                            }

                                            {
                                                (prop.Heat && prop.Heat != "") && <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
                                                    <div className='w-full font-semibold text-base'>Heat</div>
                                                    {
                                                        prop.Heat.split(",").map((app: any, index: number) => {
                                                            return <div key={index} className='flex mr-2 mb-2 rounded items-center 
                                                            justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer 
                                                            hover:drop-shadow-lg'>{app}</div>
                                                        })
                                                    }
                                                </div>
                                            }

                                        </div>
                                    </div>

                                    <div className={`w-full mt-14 ${((prop.ExteriorFeatures && prop.ExteriorFeatures != "")
                                        || (prop.ExteriorFinish && prop.ExteriorFinish != "")
                                        || (prop.StormProtection && prop.StormProtection != "")
                                        || (prop.View && prop.View != ""))
                                        ? "block" : "hidden"}`} id='exterior'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Exterior</h1>
                                        <div className='w-full mt-4 *:py-4 *:border-b *:border-gray-300'>
                                            <PropFeatures title="Exterior Features" features={prop.ExteriorFeatures} />
                                            <PropFeatures title="View" features={prop.View} />
                                            <PropFeatures title="Exterior Finish" features={prop.ExteriorFinish} />
                                            <PropFeatures title="Storm Protection" features={prop.StormProtection} />
                                        </div>
                                    </div>

                                    <div className={`w-full mt-14 ${((prop.Pets && prop.Pets != "")
                                        || (prop.PetsLimitMaxNumber && prop.PetsLimitMaxNumber != "")
                                        || (prop.PetLimitBreed && prop.PetLimitBreed != "")
                                        || (prop.PetDepositFee && prop.PetDepositFee != "")
                                        || (prop.PetDepositDesc && prop.PetDepositDesc != "")) ? "block" : "hidden"
                                        }`} id='schools'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Pets</h1>
                                        <div className='w-full mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 *:py-4 *:border-b *:border-gray-300'>
                                            {
                                                (prop.Pets && prop.Pets != "") &&
                                                <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>Pets</div>
                                                    <div className='font-normal text-base text-right'>{prop.Pets}</div>
                                                </div>
                                            }

                                            {
                                                (prop.PetsLimitMaxNumber && prop.PetsLimitMaxNumber != "") &&
                                                <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>Maximum Number of Pets</div>
                                                    <div className='font-normal text-base text-right'>{prop.PetsLimitMaxNumber}</div>
                                                </div>
                                            }

                                            {
                                                (prop.PetLimitBreed && prop.PetLimitBreed != "") &&
                                                <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>Pet Breed Limit</div>
                                                    <div className='font-normal text-base text-right'>{prop.PetLimitBreed}</div>
                                                </div>
                                            }

                                            {
                                                (prop.PetDepositFee && prop.PetDepositFee != "") &&
                                                <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>Pet Deposit Fee</div>
                                                    <div className='font-normal text-base text-right'>{prop.PetDepositFee}</div>
                                                </div>
                                            }

                                            {
                                                (prop.PetDepositDesc && prop.PetDepositDesc != "") &&
                                                <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>Pet Deposit Description</div>
                                                    <div className='font-normal text-base text-right'>{prop.PetDepositDesc}</div>
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    <div className={`w-full mt-14 ${((prop.ElementarySchool && prop.ElementarySchool != "")
                                        || (prop.HighSchool && prop.HighSchool != "")
                                        || (prop.MiddleSchool && prop.MiddleSchool != "")) ? "block" : "hidden"
                                        }`} id='schools'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Schools</h1>
                                        <div className='w-full mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 *:py-4 *:border-b *:border-gray-300'>
                                            {
                                                (prop.ElementarySchool && prop.ElementarySchool != "") &&
                                                <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>Elementary School</div>
                                                    <div className='font-normal text-base text-right'>{prop.ElementarySchool}</div>
                                                </div>
                                            }

                                            {
                                                (prop.HighSchool && prop.HighSchool != "") &&
                                                <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>High School</div>
                                                    <div className='font-normal text-base text-right'>{prop.HighSchool}</div>
                                                </div>
                                            }

                                            {
                                                (prop.MiddleSchool && prop.MiddleSchool != "") &&
                                                <div className='flex justify-between'>
                                                    <div className='font-semibold text-base'>Middle School</div>
                                                    <div className='font-normal text-base text-right'>{prop.MiddleSchool}</div>
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    <div className={`w-full mt-14 ${((prop.Restrictions && prop.Restrictions != "")) ? "block" : "hidden"
                                        }`} id='interior'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Additional Information</h1>
                                        <div className='w-full mt-4 *:py-4 *:border-b *:border-gray-300'>

                                            {
                                                (prop.Restrictions && prop.Restrictions != "") && <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
                                                    <div className='w-full font-semibold text-base'>Restrictions</div>
                                                    {
                                                        prop.Restrictions.split(",").map((interior: any, index: number) => {
                                                            return <div key={index} className='flex mr-2 mb-2 rounded items-center 
                                                            justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer 
                                                            hover:drop-shadow-lg'>{interior}</div>
                                                        })
                                                    }
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    <div className='w-full mt-14'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Walk Score</h1>
                                        <div className='w-full mt-16 grid grid-cols-3'>
                                            <div className='flex flex-col justify-items-center items-center'>
                                                <div className=''><BsPersonWalking size={50} /></div>
                                                <div className='text-2xl font-medium mt-3'>Walk Score<sup>&reg;</sup></div>
                                                <div className='mt-3'>
                                                    <CircularProgressBar percentage={walk_score.percentage || 0}
                                                        description={walk_score.description || "Not available"} />
                                                </div>
                                            </div>

                                            <div className='flex flex-col justify-items-center items-center'>
                                                <div><PiTrain size={50} /></div>
                                                <div className='text-2xl font-medium mt-3'>Transit Score<sup>&reg;</sup></div>
                                                <div className='mt-3'>
                                                    <CircularProgressBar percentage={transit_score.percentage || 0}
                                                        description={transit_score.description || "Not available"} />
                                                </div>
                                            </div>

                                            <div className='flex flex-col justify-items-center items-center'>
                                                <div><IoBicycle size={50} /></div>
                                                <div className='text-2xl font-medium mt-3'>Bike Score<sup>&reg;</sup></div>
                                                <div className='mt-3'>
                                                    <CircularProgressBar percentage={bike_score.percentage || 0}
                                                        description={bike_score.description || "Not available"} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='section w-full mt-14' id='map_area'>
                                        <h1 className='w-full font-play-fair-display text-4xl'>Listing Map</h1>
                                        <div className='w-full mt-2 h-[450px]'>
                                            {
                                                !isMapLoaded && <div className='w-full h-full flex justify-center items-center'>
                                                    <AiOutlineLoading3Quarters size={35} className='animate-spin' />
                                                </div>
                                            }

                                            {
                                                isMapLoaded && <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={12} options={mapOptions}>
                                                    <OverlayView position={{ lat: mapCenter.lat, lng: mapCenter.lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                                                        <div className='relative animate-bounce'>
                                                            <Image src={`/its-here.png`} width={50} height={50} alt='' />
                                                        </div>
                                                    </OverlayView>
                                                </GoogleMap>
                                            }
                                        </div>
                                    </div>


                                    <div className='section w-full mt-14 mx-auto max-w-[650px] lg:max-w-[100%]' id='request_info'>
                                        <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Request a Showing</h1>
                                        <div className='w-full mt-2 bg-gray-100 p-3 sm:p-7'>

                                            <div className='w-full'>
                                                <label className='w-full flex items-center font-normal' htmlFor='fullname'>
                                                    <span>Full Name</span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                                </label>
                                                <input className='w-full h-12 border border-gray-300 px-2 outline-0 hover:border-sky-600 
                                        font-normal focus:shadow-md' placeholder='MLS Name' value={formData.fullname} name='fullname'
                                                    onChange={(e) => handleChange(e)} />
                                            </div>

                                            <div className='w-full mt-8'>
                                                <label className='w-full flex items-center font-normal' htmlFor='phone_number'>
                                                    <span>Phone Number </span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                                </label>
                                                <input className='w-full h-12 border border-gray-300 px-2 outline-0 hover:border-sky-600 
                                        font-normal focus:shadow-md' placeholder='MLS Name' value={formData.phone_number} name='phone_number'
                                                    onChange={(e) => handleChange(e)} />
                                            </div>

                                            <div className='w-full mt-8'>
                                                <label className='w-full flex items-center font-normal' htmlFor='email'>
                                                    <span>Email </span> <span className='ml-2'><FaAsterisk className='text-red-700' size={10} /></span>
                                                </label>
                                                <input className='w-full h-12 border border-gray-300 px-2 outline-0 hover:border-sky-600 
                                        font-normal focus:shadow-md' type='email' placeholder='MLS Name' value={formData.email} name='email'
                                                    onChange={(e) => handleChange(e)} />
                                                <small className='w-full text-red-600'>Your email will not be shared with any third party</small>
                                            </div>


                                            <div className='w-full mt-8'>
                                                <label className='w-full flex items-center font-normal'>
                                                    <span>When would you like to view this property?</span>
                                                </label>

                                                <div className='w-full grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-3 *:bg-white *:border *:border-gray-400 *:flex 
                                        *:items-center *:justify-center *:flex-col *:cursor-pointer *:select-none'>
                                                    <div className='py-6 hover:shadow-xl' onClick={() => setPreferDate("ASAP")}>
                                                        <div>
                                                            {formData.prefer_date == "ASAP"
                                                                ? <HiCheck size={30} className='font-bold text-green-700' />
                                                                : <IoCloseSharp size={30} className='font-bold text-gray-500' />}
                                                        </div>
                                                        <div className='font-normal'>ASAP</div>
                                                    </div>

                                                    <div className='py-6 hover:shadow-xl' onClick={() => setPreferDate("This Week")}>
                                                        <div>
                                                            {formData.prefer_date == "This Week"
                                                                ? <HiCheck size={30} className='font-bold text-green-700' />
                                                                : <IoCloseSharp size={30} className='font-bold text-gray-500' />}
                                                        </div>
                                                        <div className='font-normal'>This Week</div>
                                                    </div>

                                                    <div className='py-6 hover:shadow-xl' onClick={() => setPreferDate("Next Week")}>
                                                        <div>
                                                            {formData.prefer_date == "Next Week"
                                                                ? <HiCheck size={30} className='font-bold text-green-700' />
                                                                : <IoCloseSharp size={30} className='font-bold text-gray-500' />}
                                                        </div>
                                                        <div className='font-normal'>Next Week</div>
                                                    </div>

                                                    <div className='relative'>
                                                        <div className='py-6 hover:shadow-xl w-full flex items-center justify-center flex-col'
                                                            onClick={handleSelectADay}>
                                                            <div>
                                                                {formData.prefer_date == "Exact Day"
                                                                    ? <HiCheck size={30} className='font-bold text-green-700' />
                                                                    : <IoCloseSharp size={30} className='font-bold text-gray-500' />}
                                                            </div>
                                                            <div className='font-normal'>
                                                                {
                                                                    formData.exact_date != "Select a Day" ?
                                                                        moment(formData.exact_date).format('MMMM DD, YYYY') : formData.exact_date
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className={`w-auto absolute top-[105px] right-0 ${isDatePickerOpen ? 'block' : 'hidden'}`}>
                                                            <DatePicker
                                                                selected={selectedDate ? new Date(selectedDate) : null}
                                                                onChange={(date: Date) => handleDateChange(moment(date).format('YYYY-MM-DD'))}
                                                                minDate={new Date()}
                                                                dateFormat="YYYY-MM-DD"
                                                                isClearable={false}
                                                                placeholderText="Select a date"
                                                                showPopperArrow={false}
                                                                inline
                                                                shouldCloseOnSelect={false}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='w-full mt-8'>
                                                <label className='w-full flex items-center font-normal' htmlFor='notes'>
                                                    <span>Do you have any other Notes? </span>
                                                </label>
                                                <textarea className='w-full h-[155px] resize-none border border-gray-300 p-2 outline-0 hover:border-sky-600 
                                        font-normal focus:shadow-md' placeholder='e.g Preferes afternoons...' value={formData.notes} name='notes'
                                                    onChange={(e) => handleChange(e)} />
                                            </div>

                                            <div className='mt-6 w-full flex justify-end'>

                                                {
                                                    !isShowingReqLoading
                                                        ? <button className='test_btn bg-primary py-3 px-8 text-white float-right 
                                                hover:drop-shadow-md  ml-3 flex items-center hover:bg-primary/90 font-normal'
                                                            onClick={handleShowingRequest}> <span>Request Showing</span> </button>
                                                        : <button disabled className='test_btn bg-primary/50 py-3 px-8 text-white float-right ml-3 
                                                flex items-center font-normal'>
                                                            <AiOutlineLoading3Quarters size={18} className='mr-2 animate-spin' /> <span>Please Wait...</span>
                                                        </button>
                                                }


                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className='lg:col-span-2'>
                                    <div className='w-full relative h-full mx-auto max-w-[650px] lg:max-w-[100%]'>

                                        <div className='w-full p-6 bg-gray-50 lg:sticky lg:top-24 lg:z-[2]'>

                                            <div className='w-full flex flex-col *:text-white *:flex *:items-center *:px-2 *:py-3 
                                            *:justify-center *:font-normal'>
                                                <button className='w-full bg-sky-700 hover:shadow-lg' onClick={handleVideoTour}>
                                                    <MdOutlineOndemandVideo size={18} />
                                                    <span className='ml-2'>Video Tour From Home</span>
                                                </button>

                                                <button className='w-full bg-primary hover:shadow-lg mt-5' onClick={() => handleInfo("Question 2")}>
                                                    <BiUserVoice size={18} />
                                                    <span className='ml-2'>Contact Agent</span>
                                                </button>
                                            </div>

                                            <div className='mt-4 w-full font-medium'>Share Page:</div>
                                            <div className='w-full flex items-center *:!p-2 *:!flex *:!items-center *:!justify-center 
                                            *:!bg-primary text-white *:!cursor-pointer *:!rounded-md space-x-2 flex-wrap *:mb-2'>
                                                <FacebookShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <FaSquareFacebook size={22} />
                                                </FacebookShareButton>

                                                <TwitterShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <BsTwitterX size={22} />
                                                </TwitterShareButton>

                                                <EmailShareButton url={page_url} subject={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <MdOutlineMarkEmailUnread size={22} />
                                                </EmailShareButton>

                                                <LinkedinShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <FaLinkedin size={22} />
                                                </LinkedinShareButton>

                                                <WhatsappShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <FaWhatsapp size={22} />
                                                </WhatsappShareButton>

                                                <button className='hover:shadow-xl hover:bg-sky-700' onClick={() => window.print()}>
                                                    <GrPrint size={22} />
                                                </button>

                                            </div>
                                        </div>

                                        <div className='w-full p-5 bg-gray-50 mt-8'>

                                            <h3 className='w-full font-semibold'>PAYMENT CALCULATOR</h3>

                                            <div className='w-full mt-6'>
                                                <div className='w-full'>
                                                    <label className='w-full flex items-center font-semibold' htmlFor='property_price'>
                                                        <span>Property Price</span>
                                                    </label>
                                                    <div className='flex items-center'>
                                                        <div className='py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700'>$</div>
                                                        <div className='flex-grow'>
                                                            <input className='w-full h-11 border border-gray-300 px-2 outline-0 
                                                                hover:border-sky-600 font-normal focus:shadow-md' type='number'
                                                                placeholder='Property Price' value={calc_data.property_price} name='property_price'
                                                                onChange={(e) => handleCalcChange(e)} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='w-full grid grid-cols-5 gap-0 mt-5'>
                                                    <div className='col-span-3'>
                                                        <label className='w-full flex items-center font-semibold' htmlFor='downpay_dollar'>
                                                            <span>Downpayment</span>
                                                        </label>
                                                        <div className='flex items-center'>
                                                            <div className='py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700'>$</div>
                                                            <div className='flex-grow'>
                                                                <input className='w-full h-11 border border-gray-300 px-2 outline-0 
                                                                    hover:border-sky-600 font-normal focus:shadow-md appearance-none'
                                                                    type='number' placeholder='In Dollar' value={calc_data.downpay_dollar}
                                                                    name='downpay_dollar' id='downpay_dollar' onChange={(e) => handleDpChange(e)} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className='col-span-2'>
                                                        <label className='w-full flex items-center font-semibold' htmlFor='downpay_percent'>
                                                            <span className='text-white select-none'>-</span>
                                                        </label>
                                                        <div className='flex items-center'>
                                                            <div className='flex-grow'>
                                                                <input className='w-full h-11 border border-gray-300 px-2 outline-0 
                                                                    hover:border-sky-600 font-normal focus:shadow-md'
                                                                    type='number appearance-none' placeholder='In Percentage' value={calc_data.downpay_percent}
                                                                    name='downpay_percent' id="downpay_percent" onChange={(e) => handleDpChange(e)} />
                                                            </div>
                                                            <div className='py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700'>%</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='w-full mt-5'>
                                                    <label className='w-full flex items-center font-semibold' htmlFor='length_of_mortgage'>
                                                        <span>Length of Mortgage</span>
                                                    </label>
                                                    <input className='w-full h-11 border border-gray-300 px-2 outline-0 
                                                        hover:border-sky-600 font-normal focus:shadow-md' type='number appearance-none'
                                                        placeholder='First Name' value={calc_data.length_of_mortgage}
                                                        name='length_of_mortgage' onChange={(e) => handleCalcChange(e)} />
                                                </div>

                                                <div className='w-full mt-5'>
                                                    <label className='w-full flex items-center font-semibold' htmlFor='interest_rate'>
                                                        <span>Annual Interest Rate</span>
                                                    </label>
                                                    <div className='flex items-center'>
                                                        <div className='flex-grow'>
                                                            <input className='w-full h-11 border border-gray-300 px-2 outline-0 
                                                                hover:border-sky-600 font-normal focus:shadow-md' type='number appearance-none'
                                                                placeholder='Annual Interest Rate' value={calc_data.interest_rate}
                                                                name='interest_rate' onChange={(e) => handleCalcChange(e)} />
                                                        </div>
                                                        <div className='py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700'>%</div>
                                                    </div>
                                                </div>

                                                <div className='w-full mt-4 flex justify-end'>
                                                    <button className='bg-primary text-white px-5 py-3 font-normal hover:bg-primary/90'
                                                        onClick={CalculateMortagage}>
                                                        Calculate
                                                    </button>
                                                </div>

                                                <div className='w-full flex flex-col items-center justify-center mt-4'>
                                                    <h1 className='text-4xl font-bold'>{monthly_payment}</h1>
                                                    <h2 className='font-medium mt-2 text-lg'>Your estimated monthly payment.</h2>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>

                            </div>

                            <div className='w-full mt-16'>
                                <h1 className='w-full font-play-fair-display text-3xl md:text-4xl'>Similar properties to <span className='capitalize'>{prop.FullAddress}</span></h1>
                                <div className='w-full mt-2 grid grid-cols-2 xs:grid-cols-3 sm:flex gap-3 max-w-[100%]'>

                                    <div className={`bg-white border-2 text-primary border-primary hover:bg-primary/80
                                     hover:text-white py-[6px] px-8 font-normal cursor-pointer flex items-center 
                                     ${similar_by == "Price" ? "!bg-primary !text-white" : null}`} onClick={() => SimilarBy("Price")}>
                                        <MdAttachMoney size={18} /> <span className='ml-2'>Price</span>
                                    </div>

                                    <div className={`bg-white border-2 text-primary border-primary hover:bg-primary/80
                                     hover:text-white py-[6px] px-8 font-normal cursor-pointer flex items-center 
                                     ${similar_by == "Beds" ? "!bg-primary !text-white" : null}`} onClick={() => SimilarBy("Beds")}>
                                        <IoBedOutline size={18} /> <span className='ml-2'>Beds</span>
                                    </div>

                                    <div className={`bg-white border-2 text-primary border-primary hover:bg-primary/80
                                     hover:text-white py-[6px] px-8 font-normal cursor-pointer flex items-center 
                                     ${similar_by == "Baths" ? "!bg-primary !text-white" : null}`} onClick={() => SimilarBy("Baths")}>
                                        <FaShower size={18} /> <span className='ml-2'>Baths</span>
                                    </div>

                                    <div className={`bg-white border-2 text-primary border-primary hover:bg-primary/80
                                     hover:text-white py-[6px] px-8 font-normal cursor-pointer flex items-center 
                                     ${similar_by == "Location" ? "!bg-primary !text-white" : null}`} onClick={() => SimilarBy("Location")}>
                                        <RiMapPinLine size={18} /> <span className='ml-2'>Location</span>
                                    </div>

                                </div>

                                <div className='w-full mt-2 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3'>
                                    {
                                        isLoadingSimilarProps && <>
                                            <div className='w-full bg-white flex items-center justify-center h-[300px] col-span-4'>
                                                <AiOutlineLoading3Quarters size={30} className='animate-spin' />
                                            </div>
                                        </>
                                    }

                                    {(!isLoadingSimilarProps && isSimilarPropsLoaded) && (
                                        similar_props.length > 0 ?
                                            similar_props.map((prop: any) => {
                                                return <PropertyCard prop={prop} />
                                            })
                                            : <div className='w-full col-span-4 text-red-600 flex justify-center items-center min-h-80'>
                                                No similar properties found.
                                            </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            )
            }

            {
                (!isLoadingInfo && page_error && page_error != "") && (
                    <div className='w-full bg-red-100 text-red-600 flex justify-center items-center min-h-80'>
                        {page_error}
                    </div>
                )
            }
            {/** <ToastContainer /> **/}
            <Modal show={showModal} children={modal_children} width={600} closeModal={closeModal} title={modal_title} />

            <Gallery show={showGallery} photos={prop.Images} closeGallery={closeGallery} initialSlide={initialSlide} />

        </>
    )
}

export default PropertyDetails