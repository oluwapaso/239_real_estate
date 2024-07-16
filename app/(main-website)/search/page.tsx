"use client"

import MapContainer from '@/components/MapContainer'
import SimpleHeader from '@/components/SimpleHeader'
import { Beds_Baths, Prices, HOA_Fees, Square_Feets, Lot_Sizes, RentPrices } from '@/components/data'
import React, { useEffect, useRef, useState } from 'react'
import { BiRefresh } from 'react-icons/bi'
import { IoCloseSharp, IoSearch } from 'react-icons/io5'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { HiOutlineHomeModern } from "react-icons/hi2";
import { FaRegQuestionCircle, FaTimes } from 'react-icons/fa'
import { GiModernCity } from 'react-icons/gi'
import { TfiSave } from "react-icons/tfi";
import { Helpers } from '@/_lib/helpers'
import { APIResponseProps, srchHmType } from '@/components/types'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchItem from '@/components/SearchItem'
import { TbMapPin } from 'react-icons/tb'
import moment from 'moment'
import numeral from 'numeral'
import PropertyCard from '@/components/PropertyCard'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import Footer from '@/components/Footer'
import Pagination from '@/components/pagination'
import { GrMapLocation } from 'react-icons/gr'
import Modal from '@/components/Modal'
import SaveSearch from '@/app/(admin)/admin/_components/SaveSearch'
import SalesType from '@/components/PropFilters/SalesType'
import PriceRange from '@/components/PropFilters/PriceRange'
import BedsBathsRange from '@/components/PropFilters/BedsBathsRange'
import PropertyTypes from '@/components/PropFilters/PropertyTypes'
import useCurrentBreakpoint from '@/_hooks/useMediaQuery'
import { FaList, FaMap } from 'react-icons/fa6'
import { useSession } from 'next-auth/react'
import { useModal } from '@/app/contexts/ModalContext'
import { hidePageLoader } from '../(main-layout)/GlobalRedux/app/appSlice'
import { select_cities } from '@/_lib/data'

const helper = new Helpers();
const SearchPage = () => {

    const { is1Xm, is2Xm, isXs, isSm, isMd, isTab } = useCurrentBreakpoint();
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user as any;
    const searchParams = useSearchParams();
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    const page_size = 12;

    const [abortController, setAbortController] = useState(new AbortController());
    const [mapSrchController, setMapSrchController] = useState(new AbortController());
    const searchBoxRef = useRef<HTMLDivElement>(null);
    const [mapAddress, setMapAddress] = useState("");
    const [initialLoad, setInitialLoad] = useState(true);
    const [poly_list, setPolyLists] = useState<string[]>([]);
    const [total_record, setTotalRecord] = useState(0);
    const [total_page, setTotalPage] = useState(0);
    const [total_filters, setTotalFilters] = useState(0);
    const [url_path, setUrlPath] = useState("");
    const [payloadBuilt, setPayloadBuilt] = useState(false);
    const [is_loaded, setIsLoaded] = useState(false);
    const [googleMapKey, setGoogleMapKey] = useState("");
    const { closeModal: close_auth_modal } = useModal();

    let mobile_view = "Map";
    if (is1Xm || is2Xm || isXs || isSm || isMd) {
        mobile_view = "List";
    }
    const [mobileView, setMobileView] = useState(mobile_view);

    const BoxStates = {
        "price_shown": false,
        "sales_type_shown": false,
        "beds_bath_shown": false,
        "prop_type_shown": false,
        "more_shown": false,
        "sort_shown": false,
    }

    const init_payload = {
        search_by: "Map",
        location: searchParams?.get("location") || "",
        sales_type: "For Sale",
        min_price: 0,
        max_price: 0,
        min_bed: 0,
        max_bed: 0,
        min_bath: 0,
        max_bath: 0,
        max_hoa: -1,
        include_incomp_hoa_data: true,
        virtual_tour: false,
        garage: false,
        basement: false,
        pool: false,
        view: false,
        waterfront: false,
        photos: false,
        // city_view: false,
        // mountain_view: false,
        // park_view: false,
        // water_view: false,
        min_square_feet: 0,
        max_square_feet: 0,
        min_lot: 0,
        max_lot: 0,
        min_year: "",
        max_year: "",
        parking_spots: 0,
        home_type: {
            Any: "Yes",
            House: "No",
            Condo: "No",
            SingleFamily: "No",
            CoOp: "No",
            ResIncome: "No",
            Dock: "No",
            Land: "No",
            Commercial: "No",
        },
        map_bounds: { north: 26.760979157255296, south: 25.801786319915113, east: -81.17107039746094, west: -82.40840560253906 },
        zoom: 10,
        page: curr_page,
        limit: page_size,
        sort_by: "Price-DESC",
        mobile_view: mobileView
    }

    const [box_state, setBoxStates] = useState<{ [key: string]: boolean }>(BoxStates);
    const [payload, setPayload] = useState<{ [key: string]: any }>(init_payload);
    const [prices, setPrices] = useState(Prices);
    const [properties, setProperties] = useState<any[]>([]);
    const [prop_lists, setPropLists] = useState<any[]>([]);
    const [isPropsLoading, setIsPropsLoading] = useState(true);
    const [cities_results, setCitiesResults] = useState<any[]>(select_cities);
    const [address_results, setAddressResults] = useState<any[]>([]);
    const [postal_results, setPostalResults] = useState<any[]>([]);
    const [listings_results, setListingsResults] = useState<any[]>([]);
    const [curr_url, setURL] = useState("");
    const [isSrchOpen, setIsSrchOpenOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modal_children, setModalChildren] = useState({} as React.ReactNode);

    const [filters, setFilters] = useState({
        maxPrices: prices,
        minPrices: prices,
        maxBeds: Beds_Baths,
        minBeds: Beds_Baths,
        maxBaths: Beds_Baths,
        minBaths: Beds_Baths,
        minSqFt: Square_Feets,
        maxSqFt: Square_Feets,
        minLot: Lot_Sizes,
        maxLot: Lot_Sizes,
        hoaFees: HOA_Fees,
    });

    const handleMenuBox = (menu_key: string) => {
        setBoxStates((prev_states) => {

            for (let key in prev_states) {
                if (key != menu_key) {
                    prev_states[key] = false;
                }
            }

            return {
                ...prev_states,
                [menu_key]: !box_state[menu_key],
            }
        });
    }

    const handleCommonChange = (e: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>) => {
        setPayload((prev_val) => {
            let value: string | number = "";
            if (e.target.value && e.target.value != "" && e.target.name != "location") {
                value = parseInt(e.target.value);
            } else if (e.target.name == "location") {
                value = e.target.value;
                if (value != "") {
                    setIsSrchOpenOpen(true);
                } else {
                    setIsSrchOpenOpen(false);
                }
            }

            return {
                ...prev_val,
                [e.target.name]: value,
            }
        });
    }

    const handleHOA = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPayload((prev_val) => {
            return {
                ...prev_val,
                include_incomp_hoa_data: !payload.include_incomp_hoa_data,
            }
        })
    }

    const handleMustHaves = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setPayload((prev_val) => {
            return {
                ...prev_val,
                [e.target.name]: !payload[field],
            }
        });
    }

    const setMinMaxPrice = (price_start: string, type: string) => {
        const priceStart = parseInt(price_start)


        if (type == "Max") {

            if (priceStart > 0) {
                const max_prices = prices.filter((price) => {
                    return price.value >= priceStart
                })
                //setMaxPrices(max_prices);
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxPrices: max_prices,
                    }
                });
            } else {
                //setMaxPrices(Prices);
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxPrices: Prices,
                    }
                });
            }

        } else if (type == "Min") {

            if (priceStart > 0) {
                const min_prices = prices.filter((price) => {
                    return price.value <= priceStart
                })
                //setMinPrices(min_prices)
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minPrices: min_prices,
                    }
                });
            } else {
                //setMinPrices(Prices);
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minPrices: Prices,
                    }
                });
            }

        }
    }

    const setMinMaxBeds = (bed_start: string, type: string) => {
        const bedStart = parseInt(bed_start)

        if (type == "Max") {

            if (bedStart > 0) {
                const max_bed = Beds_Baths.filter((bed) => {
                    return bed.value >= bedStart
                })
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxBeds: max_bed,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxBeds: Beds_Baths,
                    }
                });
            }

        } else if (type == "Min") {

            if (bedStart > 0) {
                const min_bed = Beds_Baths.filter((bed) => {
                    return bed.value <= bedStart
                })
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minBeds: min_bed,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minBeds: Beds_Baths,
                    }
                });
            }


        }
    }

    const setMinMaxBath = (bath_start: string, type: string) => {
        const bathStart = parseInt(bath_start)

        if (type == "Max") {

            if (bathStart > 0) {
                const max_bath = Beds_Baths.filter((bath) => {
                    return bath.value >= bathStart
                });
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxBaths: max_bath,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxBaths: Beds_Baths,
                    }
                });
            }

        } else if (type == "Min") {

            if (bathStart > 0) {
                const min_bath = Beds_Baths.filter((bath) => {
                    return bath.value <= bathStart
                })
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minBaths: min_bath,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minBaths: Beds_Baths,
                    }
                });
            }

        }
    }

    const setMinMaxSqFt = (sqft_start: string, type: string) => {
        const sqftStart = parseInt(sqft_start)

        if (type == "Max") {

            if (sqftStart > 0) {
                const max_sqft = Square_Feets.filter((sqft) => {
                    return sqft.value >= sqftStart;
                });
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxSqFt: max_sqft,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxSqFt: Square_Feets,
                    }
                });
            }

        } else if (type == "Min") {

            if (sqftStart > 0) {
                const min_sqft = Square_Feets.filter((sqft) => {
                    return sqft.value <= sqftStart;
                })
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minSqFt: min_sqft,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minSqFt: Square_Feets,
                    }
                });
            }

        }
    }

    const setMinMaxLot = (lot_start: string, type: string) => {
        const lotStart = parseInt(lot_start)

        if (type == "Max") {

            if (lotStart > 0) {
                const max_lot = Lot_Sizes.filter((lot) => {
                    return lot.value >= lotStart;
                });
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxLot: max_lot,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        maxLot: Lot_Sizes,
                    }
                });
            }

        } else if (type == "Min") {

            if (lotStart > 0) {
                const min_lot = Lot_Sizes.filter((lot) => {
                    return lot.value <= lotStart;
                })
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minLot: min_lot,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        minLot: Lot_Sizes,
                    }
                });
            }

        }
    }

    const handleSalesType = (salesType: string) => {

        setPriceRange("Price");
        setPayload((prev_val) => {
            return {
                ...prev_val,
                min_price: 0,
                max_price: 0,
            }
        });

        setPayload((prev_val) => {
            return {
                ...prev_val,
                sales_type: salesType,
            }
        });
    }

    const handlePropertyType = (type: string) => {

        const keysWithYesValue: string[] = [];
        for (const key in payload.home_type) {
            if (payload.home_type[key as keyof srchHmType] === 'Yes') {
                keysWithYesValue.push(key);
            }
        }

        let new_type = "No";
        if (payload.home_type[type] == "Yes") {
            new_type = "No"
        } else {
            new_type = "Yes"
        }

        let any_val = "Yes"; //Always yes unless, other type is clicked
        if (type != "Any" && keysWithYesValue.length > 0) {
            any_val = "No";
        }

        if (any_val == "Yes") { //All other values must be no 
            payload.home_type = {
                House: "No",
                Condo: "No",
                SingleFamily: "No",
                CoOp: "No",
                ResIncome: "No",
                Dock: "No",
                Land: "No",
                Commercial: "No",
            }
            new_type = "No";
        }

        setPayload((prev_val) => {
            return {
                ...prev_val,
                home_type: {
                    ...payload.home_type,
                    [type]: new_type,
                    Any: any_val,//Need to come after [type]
                }
            }
        });
    }

    /** Set prices type **/
    useEffect(() => {
        if (payload.sales_type == "For Rent") {
            setPrices(RentPrices);
            setFilters((prev_val) => {
                return {
                    ...prev_val,
                    minPrices: RentPrices,
                    maxPrices: RentPrices,
                }
            });
        } else {
            setPrices(Prices);
            setFilters((prev_val) => {
                return {
                    ...prev_val,
                    minPrices: Prices,
                    maxPrices: Prices,
                }
            });
        }
    }, [payload.sales_type]);
    /** Set prices type **/

    /** Price range **/
    const [price_range, setPriceRange] = useState("Price");
    useEffect(() => {

        if (payload.min_price > 0 && payload.max_price <= 0) {
            setPriceRange(`$${helper.formatPrice(payload.min_price)}+`);
        } else if (payload.min_price <= 0 && payload.max_price > 0) {
            setPriceRange(`Up to $${helper.formatPrice(payload.max_price)}`);
        } else if (payload.min_price > 0 && payload.max_price > 0) {
            if (payload.min_price == payload.max_price) {
                setPriceRange(`$${helper.formatPrice(payload.min_price)}`);
            } else {
                setPriceRange(`$${helper.formatPrice(payload.min_price)}-$${helper.formatPrice(payload.max_price)}`);
            }
        } else {
            setPriceRange("Price");
        }

    }, [payload.min_price, payload.max_price]);
    /** Prices range **/

    /** Beds & Baths range **/
    const [beds_baths_range, setBedsBathsRange] = useState("Beds & Baths");
    useEffect(() => {

        let beds_range = "";
        let baths_range = "";
        let beds_baths_range = "Beds & Baths";

        if (payload.min_bed > 0 && payload.max_bed <= 0) {
            beds_range = `${payload.min_bed}+ bd`;
        } else if (payload.min_bed <= 0 && payload.max_bed > 0) {
            beds_range = `Up to ${payload.max_bed} bd`;
        } else if (payload.min_bed > 0 && payload.max_bed > 0) {
            if (payload.min_bed == payload.max_bed) {
                beds_range = `${payload.min_bed} bd`;
            } else {
                beds_range = `${payload.min_bed}-${payload.max_bed} bd`;
            }
        }

        if (payload.min_bath > 0 && payload.max_bath <= 0) {
            baths_range = `${payload.min_bath}+ ba`;
        } else if (payload.min_bath <= 0 && payload.max_bath > 0) {
            baths_range = `Up to ${payload.max_bath} ba`;
        } else if (payload.min_bath > 0 && payload.max_bath > 0) {
            if (payload.min_bath == payload.max_bath) {
                baths_range = `${payload.min_bath} ba`;
            } else {
                baths_range = `${payload.min_bath}-${payload.max_bath} ba`;
            }
        }

        if (beds_range != "" && baths_range != "") {
            beds_baths_range = `${beds_range}, ${baths_range}`;
        } else if (beds_range != "" && baths_range == "") {
            beds_baths_range = `${beds_range}`;
        } else if (beds_range == "" && baths_range != "") {
            beds_baths_range = `${baths_range}`;
        }

        setBedsBathsRange(beds_baths_range);

    }, [payload.min_bed, payload.max_bed, payload.min_bath, payload.max_bath]);
    /** Beds & Baths range **/

    /** Property Type Range**/
    const [ppty_type_range, setPropertyTypeRange] = useState("Home Type");
    useEffect(() => {
        if (payload.home_type?.Any == "Yes") {
            setPropertyTypeRange("Home Type");
        } else {

            const keysWithYesValue: string[] = [];
            for (const key in payload.home_type) {
                if (payload.home_type[key as keyof srchHmType] === 'Yes') {
                    keysWithYesValue.push(key);
                }
            }

            if (keysWithYesValue.length < 1 || keysWithYesValue.length == 7) {
                handlePropertyType("Any");
            }

            if (keysWithYesValue.length == 1) {
                setPropertyTypeRange(keysWithYesValue[0])
            } else if (keysWithYesValue.length > 1) {
                setPropertyTypeRange(`${keysWithYesValue.length} selected`);
            }

        }

    }, [payload.home_type]);
    /** Property Type Range **/

    /** More Filters Range **/
    const [more_range, setMoreRange] = useState("More Filters");
    useEffect(() => {
        const totalFilters = Object.entries(payload).reduce((acc: any[], [key, value]) => {
            if (!["include_incomp_hoa_data", "sales_type", "min_price", "max_price", "min_bed", "max_bed", "min_bath", "max_bath",
                "home_type", "map_bounds", "zoom", "page", "limit"].includes(key)) {

                if (key == "max_hoa") {
                    if (parseInt(value) > -1) {
                        acc.push(key);
                    }
                } else if ((key == "min_year" || key == "max_year") && (value.toString().length === 4)) {
                    acc.push(key);
                } else {
                    if (value && (typeof value === 'number')) {
                        acc.push(key);
                    } else if (typeof value === 'boolean' && value) {
                        acc.push(key);
                    }
                }
            }
            return acc;
        }, []);

        setMoreRange(totalFilters.length > 0 ? `More (${totalFilters.length})` : "More Filters");
    }, [payload]);
    /** More Filters Range **/

    const handleSearch = () => {

        let url = "/search?";
        for (const [key, value] of Object.entries(payload)) {
            if (key != "home_type" && key != "min_year" && key != "max_year" && key != "map_bounds") {
                url += `${key}=${value}&`;
            } else if (key == "home_type" || key == "map_bounds") {
                url += `${key}=${JSON.stringify(value)}&`;
            } else if (key == "min_year" || key == "max_year") {
                if (value.toString().length == 4) {
                    url += `${key}=${value}&`;
                } else {
                    url += `${key}=&`;
                }
            }
        }

        url += `version=${moment().valueOf()}`;

        // Split the URL at '?'
        let parts = url.split('?');
        if (parts.length > 1) {
            // Split the query parameters
            let params = parts[1].split('&');
            // Filter out the 'page' parameter
            params = params.filter(param => !param.startsWith('page='));
            // Reconstruct the URL
            url = parts[0] + (params.length > 0 ? '?' + params.join('&') : '');
            setUrlPath(url);
        }

        if (curr_url != url) {

            setProperties([]);
            setPropLists([]);
            setIsPropsLoading(true);
            setURL(url);
            router.push(url);

            setBoxStates({ ...BoxStates });

        } else {
            console.log("window.location.reload():", url)
            //window.location.reload();
        }
    }

    useEffect(() => {
        if ((initialLoad && payloadBuilt) || (initialLoad && mobileView)) {
            handleSearch();
        }
    }, [initialLoad, payloadBuilt, mobileView]);

    /** Build URL **/
    useEffect(() => {

        let updatedPayload = { ...payload }; // Create a copy of the payload object
        let totalFilters = 0;

        if (searchParams?.size && searchParams?.size > 0) {
            searchParams?.forEach((val, key) => {
                if (key != "home_type" && key != "map_bounds") {
                    if (["view", "basement", "city_view", "garage", "include_incomp_hoa_data", "mountain_view", "park_view", "pool",
                        "virtual_tour", "water_view", "waterfront", "photos"].includes(key)) {
                        updatedPayload[key] = helper.stringToBoolean(val);
                        if (key != "include_incomp_hoa_data" && val == "true") {
                            totalFilters++;
                        }
                    } else if (["min_bed", "max_bed", "min_bath", "max_bath", "max_hoa", "max_lot", "max_price", "max_square_feet",
                        "min_lot", "min_price", "min_square_feet", "parking_spots"].includes(key)) {
                        updatedPayload[key] = parseInt(val);
                        if (parseInt(val) > 0) {
                            totalFilters++;
                        }
                    } else if (["location", "sales_type", "min_year", "max_year", "sort_by"].includes(key)) {
                        updatedPayload[key] = val;
                        if (key != "sales_type" && key != "location" && key != "sort_by" && val != "") {
                            totalFilters++;
                        }
                    }
                } else if ((key == "home_type" || key == "map_bounds") && val) {
                    const this_val = JSON.parse(val);
                    updatedPayload[key] = this_val;
                    if (key == "home_type" && this_val.Any != "Yes") {
                        totalFilters++;
                    }
                }
            });
        } else {
            updatedPayload = { ...init_payload }
        }

        setPayload(updatedPayload);
        setTotalFilters(totalFilters);
        setPayloadBuilt(true);

        // Create a new AbortController for each effect
        const controller = new AbortController();
        setMapSrchController(controller);

        try {
            // Cancel previous API request
            if (mapSrchController) {
                mapSrchController.abort();
            }
        } catch (e: any) {
            console.log(e)
        }

        setTotalRecord(0);
        setTotalPage(0);
        setIsPropsLoading(true);
        const screen_width = window.innerWidth;

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/(listings)/load-properties`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...updatedPayload,
                poly_list: poly_list,
                page: curr_page,
                screen_width: screen_width,
                "log_search": "Yes",
                "user_id": user?.user_id,
            }),
            signal: controller.signal, // Use the current controller's signal
        }).then((resp): Promise<APIResponseProps> => {
            setInitialLoad(false);
            return resp.json();
        }).then(data => {

            if (data.success && data.data?.properties?.map_data?.length || data.data?.properties?.list_data?.length) {

                setProperties(data.data?.properties?.map_data);
                setPropLists(data.data?.properties?.list_data);

                if (data.data?.properties?.list_data?.length) {
                    const total_records = data.data?.properties?.list_data[0].total_records;
                    setTotalRecord(total_records);
                    setTotalPage(Math.ceil(total_records / page_size));
                    setIsPropsLoading(false);
                } else {
                    setIsPropsLoading(false);
                }

            } else {
                setIsPropsLoading(false);
            }

        });

    }, [searchParams, searchParams?.size]);
    /** Build URL **/

    /** Live location search **/
    useEffect(() => {

        if (payload.location != "") {
            // Create a new AbortController for each effect
            const controller = new AbortController();
            setAbortController(controller);

            // Cancel previous API request
            abortController.abort();

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/(listings)/live-search`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "keyword": payload.location, "search_by": "City" }),
                signal: controller.signal, // Use the current controller's signal
            }).then((resp): Promise<APIResponseProps> => {
                return resp.json();
            }).then(data => {

                if (data.success && data.data?.results.length) {

                    const cities: any[] = [];
                    const addresses: any[] = [];
                    const postals: any[] = [];
                    const listings: any[] = [];

                    data.data?.results.map((item: any) => {

                        if (item.TABLE_NAME == "City") {
                            cities.push({ "location": item.location, "listing_key": item.ListingKey });
                        } else if (item.TABLE_NAME == "Address") {
                            addresses.push({ "location": item.location, "listing_key": item.ListingKey });
                        } else if (item.TABLE_NAME == "PostalCode") {
                            postals.push({ "location": item.location, "listing_key": item.ListingKey });
                        } else if (item.TABLE_NAME == "MLSNumber") {
                            listings.push({ "location": item.location, "listing_key": item.ListingKey });
                        }

                    });

                    //setCitiesResults(cities);
                    setAddressResults(addresses);
                    setPostalResults(postals);
                    setListingsResults(listings);

                }

            });

            // Cleanup function to abort the request if the component unmounts or the dependency changes
            return () => {
                controller.abort();
            };
        }

    }, [payload.location]);
    /** Live location search **/

    useEffect(() => {

        const handleClickOutside = (e: MouseEvent) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
                setIsSrchOpenOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [searchBoxRef]);

    useEffect(() => {

        const Get_API_Info = async () => {
            const api_info_prms = helper.FetchAPIInfo();
            const api_info = await api_info_prms
            let google_map_key = "";
            if (api_info.success && api_info.data) {
                google_map_key = api_info.data.google_map_key;
                setGoogleMapKey(api_info.data.google_map_key);
            } else {
                throw new Error('Google map API key not found in database');
            }
        }

        if (!is_loaded) {
            Get_API_Info();
        }

    }, [is_loaded]);

    useEffect(() => {
        if (googleMapKey) {
            setIsLoaded(true);
        }
    }, [googleMapKey]);

    let reslt_hdr = "Real Estate & Homes For Sale";
    if (searchParams?.get("sales_type") == "For Rent") {
        reslt_hdr = "Rental Listings";
    } else if (searchParams?.get("sales_type") == "Sold") {
        reslt_hdr = "Recently Sold Homes";
    }

    const handleClearFilters = () => {

        setPayload(() => {
            return {
                ...init_payload,
                location: searchParams?.get("location") || "",
                sales_type: searchParams?.get("sales_type") || "For Sale",
            }
        });

        setInitialLoad(true);

    }

    let filter_by = ""
    if (payload.sort_by == "Price-DESC") {
        filter_by = "Price (High to Low)"
    } else if (payload.sort_by == "Price-ASC") {
        filter_by = "Price (Low to High)"
    } else if (payload.sort_by == "Date-DESC") {
        filter_by = "Newest Firsts"
    } else if (payload.sort_by == "Date-ASC") {
        filter_by = "Oldest Firsts"
    } else if (payload.sort_by == "Beds-DESC") {
        filter_by = "Bedrooms"
    } else if (payload.sort_by == "Baths-DESC") {
        filter_by = "Bathrooms"
    } else if (payload.sort_by == "SqFt-DESC") {
        filter_by = "Square Feet"
    } else if (payload.sort_by == "Lots-DESC") {
        filter_by = "Lot Size"
    }

    const handleSort = (sort_by: string) => {

        setPayload((prev_states) => {
            return {
                ...prev_states,
                sort_by: sort_by,
            }
        });

        setBoxStates((prev_states) => {
            return {
                ...prev_states,
                sort_shown: false,
            }
        });

        setInitialLoad(true);

    }

    const closeModal = () => {
        const nav = document.querySelector(".nav") as HTMLElement;
        if (nav) {
            nav.style.zIndex = "200";
            document.body.style.overflowY = 'auto';
        }
        setShowModal(false);
    }

    const handleSaveModal = () => {
        const nav = document.querySelector(".nav") as HTMLElement;
        if (nav) {
            nav.style.zIndex = "0";
            document.body.style.overflowY = 'hidden';
        }
        setModalChildren(<SaveSearch closeModal={closeModal} payload={payload} city={payload.location} />);
        setShowModal(true);
    }

    const updateView = (view: string) => {
        const curr_payload = { ...payload }
        setPayload(() => {
            return {
                ...curr_payload,
                mobile_view: view
            }
        })
        setMobileView(view);
    }

    let overflow_filters = "";
    let mobile_filters = "";
    let page_cols = "grid-cols-5";
    let map_view_cntrl = "";
    let list_view_cntrl = "";

    if (is1Xm || is2Xm || isXs || isSm || isMd) {
        overflow_filters = "overflow-x-auto overflow-y-hidden";
        mobile_filters = "right-0 top-0";
        page_cols = "grid-cols-1";

        if (isSm || isMd) {
            mobile_filters = "right-[0] top-[135px]";
        }

        if (isMd) {
            mobile_filters = "right-[100%] translate-x-[150%] top-[135px]";
        }

        map_view_cntrl = "hidden";
        list_view_cntrl = "hidden";
        if (mobileView == "Map") {
            map_view_cntrl = "block";
        } else {
            list_view_cntrl = "block";
        }
    }

    //Close modal if it's opened, this usually happen after returning from property details page without signing in
    useEffect(() => {

        if (close_auth_modal) {
            close_auth_modal();
        }

        //dispatch(hidePageLoader())
    }, [])

    const win_width = window.innerWidth
    return (
        <>
            <SimpleHeader page="Search" />
            <section className='w-full bg-white h-[calc(100vh-80px)] relative'>
                <div className='w-full h-full overflow-y-hidden relative flex flex-col'>

                    <div className={`w-full border-t relative z-[100] ${overflow_filters}`}>
                        { /**
                         * ${is1Xm && "min-w-[700px]"} ${(is2Xm || isXs || isSm || isMd) && "min-w-[840px]"}
                         */}
                        <div className={`py-2 px-2 sm:px-4 tab:min-w-full flex items- border-b border-gray-300`}>
                            <div className='flex-grow min-w-[200px] 2xs:min-w-[260px] xs:min-w-[320px] md:max-w-[320px] relative'
                                ref={searchBoxRef}>
                                <div className='w-full flex'>
                                    <input type='text' placeholder='Location...' className='form-control flex-grow' name='location' autoComplete="off"
                                        value={payload.location} onChange={(e) => handleCommonChange(e)} onFocus={() => setIsSrchOpenOpen(true)} />
                                    <div className='md:hidden h-[42px] w-[45px] flex items-center justify-center bg-primary text-white'
                                        onClick={() => { setInitialLoad(true); }}>
                                        <IoSearch size={15} />
                                    </div>
                                </div>

                                <div className={`w-[400px] bg-white absolute top-[46px] drop-shadow-2xl border border-gray-200 z-[100]
                                ${isSrchOpen ? "block" : "hidden"} max-h-[450px]
                                    overflow-x-hidden overflow-y-auto`}>
                                    <div className='w-full flex flex-col'>
                                        {
                                            (cities_results.length > 0) && (
                                                <SearchItem items={cities_results} type="City" payload={payload} setPayload={setPayload} setIsSrchOpenOpen={setIsSrchOpenOpen}
                                                    header={<><GiModernCity size={14} /> <span className='ml-2'>Cities</span></>} />
                                            )
                                        }

                                        {
                                            (address_results.length > 0) && (
                                                <SearchItem items={address_results} type="Address" payload={payload} setPayload={setPayload} setIsSrchOpenOpen={setIsSrchOpenOpen}
                                                    header={<><TbMapPin size={16} /> <span className='ml-2'>Property Address</span></>} />
                                            )
                                        }

                                        {
                                            (listings_results.length > 0) && (
                                                <SearchItem items={listings_results} type="Listings" payload={payload} setPayload={setPayload} setIsSrchOpenOpen={setIsSrchOpenOpen}
                                                    header={<><HiOutlineHomeModern size={16} /> <span className='ml-2'>Listings</span></>} />
                                            )
                                        }

                                        {
                                            (postal_results.length > 0) && (
                                                <SearchItem items={postal_results} type="PostalCode" payload={payload} setPayload={setPayload} setIsSrchOpenOpen={setIsSrchOpenOpen}
                                                    header={<><GrMapLocation size={16} /> <span className='ml-2'>Postal Codes</span></>} />
                                            )
                                        }

                                    </div>
                                </div>
                            </div>

                            <div className='sm:px-4 flex items-center space-x-2 z-[100]'>
                                <div className='relative z-[100] hidden tab:block'>
                                    <button className='h-[40px] p-2 bg-white border border-gray-500 rounded-md flex items-center justify-center'
                                        onClick={() => handleMenuBox("sales_type_shown")}>
                                        <span>{payload.sales_type}</span>
                                        <span className={`ml-2 ${box_state.sales_type_shown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={20} /></span>
                                    </button>
                                    <div className={`w-[250px] absolute bg-transparent ${box_state.sales_type_shown ? "block" : "hidden"}`}>
                                        <SalesType payload={payload} handleSalesType={handleSalesType} />
                                    </div>
                                </div>

                                <div className='relative z-[100] hidden lg:block'>
                                    <button className='h-[40px] p-2 bg-white border border-gray-500 rounded-md flex items-center justify-center'
                                        onClick={() => handleMenuBox("price_shown")}>
                                        <span>{price_range}</span>
                                        <span className={`ml-2 ${box_state.price_shown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={20} /></span>
                                    </button>
                                    <div className={`w-[350px] absolute bg-transparent ${box_state.price_shown ? "block" : "hidden"}`}>
                                        <PriceRange payload={payload} handleCommonChange={handleCommonChange} setMinMaxPrice={setMinMaxPrice}
                                            filters={filters} />
                                    </div>
                                </div>

                                <div className='relative z-[100] hidden xl:block'>
                                    <button className='h-[40px] p-2 bg-white border border-gray-500 rounded-md flex items-center justify-center'
                                        onClick={() => handleMenuBox("beds_bath_shown")}>
                                        <span>{beds_baths_range}</span>
                                        <span className={`ml-2 ${box_state.beds_bath_shown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={20} /></span>
                                    </button>
                                    <div className={`w-[350px] absolute bg-transparent ${box_state.beds_bath_shown ? "block" : "hidden"}`}>
                                        <BedsBathsRange payload={payload} handleCommonChange={handleCommonChange}
                                            setMinMaxBeds={setMinMaxBeds} setMinMaxBath={setMinMaxBath} filters={filters} />
                                    </div>
                                </div>

                                <div className={`relative z-[100] hidden lgScrn:block ${payload.sales_type == "For Rent" && "!hidden"}`}>
                                    <button className='h-[40px] p-2 bg-white border border-gray-500 rounded-md flex items-center justify-center'
                                        onClick={() => handleMenuBox("prop_type_shown")}>
                                        <span>{ppty_type_range}</span>
                                        <span className={`ml-2 ${box_state.prop_type_shown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={20} /></span>
                                    </button>
                                    <div className={`w-[450px] absolute bg-transparent ${box_state.prop_type_shown ? "block" : "hidden"}`}>
                                        <PropertyTypes payload={payload} handlePropertyType={handlePropertyType} />
                                    </div>
                                </div>

                                <div className='relative z-[100] overflow-visible'>
                                    <button className='h-[40px] p-2 bg-white border border-gray-500 rounded-md flex items-center justify-center'
                                        onClick={() => handleMenuBox("more_shown")}>
                                        <span>{more_range}</span>
                                        <span className={`ml-2 ${box_state.more_shown ? "rotate-180" : null}`}><MdOutlineKeyboardArrowDown size={20} /></span>
                                    </button>
                                    <div className={`w-full sm:w-[450px] fixed tab:absolute ${mobile_filters} bg-transparent ${box_state.more_shown ? "block" : "hidden"}`}>
                                        <div className='w-full bg-white m-0 tab:mt-1 shadow-xl relative'>
                                            <div className='bg-gray-100 py-3 px-3 h-[48px] flex justify-between'>
                                                <span>More Filters</span>
                                                <FaTimes size={22} className='sm:hidden' onClick={() => handleMenuBox("more_shown")} />
                                            </div>
                                            <div className='w-full py-4 px-4 h-[calc(100vh-220px)] sm:h-[calc(100vh-225px)] tab:h-[calc(100vh-225px)] max-h-[100%] md:max-h-[70vh] lg:max-h-[650px] overflow-y-scroll'>

                                                <div className='w-full mb-6 tab:hidden'>
                                                    <SalesType payload={payload} handleSalesType={handleSalesType} />
                                                </div>

                                                <div className='w-full mb-6 lg:hidden'>
                                                    <PriceRange payload={payload} handleCommonChange={handleCommonChange}
                                                        setMinMaxPrice={setMinMaxPrice} filters={filters} />
                                                </div>

                                                <div className='w-full mb-6 xl:hidden'>
                                                    <BedsBathsRange payload={payload} handleCommonChange={handleCommonChange}
                                                        setMinMaxBeds={setMinMaxBeds} setMinMaxBath={setMinMaxBath} filters={filters} />
                                                </div>
                                                <div className={`w-full mb-6 lgScrn:hidden ${payload.sales_type == "For Rent" && "hidden"}`}>
                                                    <PropertyTypes payload={payload} handlePropertyType={handlePropertyType} />
                                                </div>

                                                <div className={`w-full hidden ${payload.sales_type == "For Rent" && "!hidden"}`}>
                                                    <label className='w-full flex items-center mb-1'>
                                                        <span>Max HOA</span>
                                                        <span className='group ml-2 cursor-pointer'>
                                                            <FaRegQuestionCircle size={14} />
                                                            <div className='hidden group-hover:block w-[350px] left-[-175px] absolute 
                                                            z-10 bg-white shadow-2xl font-normal tracking-wide top-[85px]'>
                                                                <div className='bg-gray-100 py-3 px-3'>Homeowners Association (HOA)</div>
                                                                <div className='w-full p-4'>
                                                                    HOA fees are monthly or annual charges that cover the costs of maintaining and
                                                                    improving shared spaces. HOA fees are common within condos and some single-family
                                                                    home neighborhoods. Co-ops also have monthly fees (Common Charges and Maintenance
                                                                    Fees), which may also include real estate taxes and a portion of the building's
                                                                    underlying mortgage.
                                                                </div>
                                                            </div>
                                                        </span>
                                                    </label>
                                                    <select className='form-control' name='max_hoa' value={payload.max_hoa}
                                                        onChange={(e) => { handleCommonChange(e); }}>
                                                        <option value="-1">Any</option>
                                                        <option value="0">No HOA Fee</option>
                                                        {filters.hoaFees.map(({ value, text }) => {
                                                            return <option value={value} key={value}>{text}</option>
                                                        })}
                                                    </select>
                                                </div>
                                                <div className={`w-full ${(payload.max_hoa >= 0 && payload.sales_type != "For Rent") ? "block-- hidden mt-2" : "hidden"}`} id='inc_incom_hoa_data_cont'>
                                                    <input type='checkbox' className='styled-checkbox' name='include_incomp_hoa_data' id='include_incomp_hoa_data'
                                                        checked={payload.include_incomp_hoa_data} onChange={(e) => { handleHOA(e); }} />
                                                    <label className='' htmlFor="include_incomp_hoa_data">
                                                        <span className='font-normal'>Include homes with incomplete HOA data</span>
                                                    </label>
                                                </div>

                                                <div className={`w-full mt-4 ${payload.sales_type == "For Rent" && "!mt-0"}`}>
                                                    <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center'>
                                                        <div className=''>
                                                            <label className='w-full'>Square feet</label>
                                                            <select className='form-control' name='min_square_feet' value={payload.min_square_feet}
                                                                onChange={(e) => {
                                                                    handleCommonChange(e);
                                                                    setMinMaxSqFt(e.target.value, "Max")
                                                                }}>
                                                                <option value="0">No Min</option>
                                                                {filters.minSqFt.map(({ value, text }) => {
                                                                    return <option value={value} key={value}>{text}</option>
                                                                })}
                                                            </select>
                                                        </div>
                                                        <div className='px-4'>
                                                            <label className='w-full text-white'>-</label>
                                                            <div>-</div>
                                                        </div>
                                                        <div className=''>
                                                            <label className='w-full text-white'>-</label>
                                                            <select className='form-control' name='max_square_feet' value={payload.max_square_feet}
                                                                onChange={(e) => {
                                                                    handleCommonChange(e);
                                                                    setMinMaxSqFt(e.target.value, "Min")
                                                                }}>
                                                                <option value="0">No Max</option>
                                                                {filters.maxSqFt.map(({ value, text }) => {
                                                                    return <option value={value} key={value}>{text}</option>
                                                                })}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='w-full mt-4'>
                                                    <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center'>
                                                        <div className=''>
                                                            <label className='w-full'>Lot size</label>
                                                            <select className='form-control' name='min_lot' value={payload.min_lot}
                                                                onChange={(e) => {
                                                                    handleCommonChange(e);
                                                                    setMinMaxLot(e.target.value, "Max")
                                                                }}>
                                                                <option value="0">No Min</option>
                                                                {filters.minLot.map(({ value, text }) => {
                                                                    return <option value={value} key={value}>{text}</option>
                                                                })}
                                                            </select>
                                                        </div>
                                                        <div className='px-4'>
                                                            <label className='w-full text-white'>-</label>
                                                            <div>-</div>
                                                        </div>
                                                        <div className=''>
                                                            <label className='w-full text-white'>-</label>
                                                            <select className='form-control' name='max_lot' value={payload.max_lot}
                                                                onChange={(e) => {
                                                                    handleCommonChange(e);
                                                                    setMinMaxLot(e.target.value, "Min")
                                                                }}>
                                                                <option value="0">No Max</option>
                                                                {filters.maxLot.map(({ value, text }) => {
                                                                    return <option value={value} key={value}>{text}</option>
                                                                })}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='w-full mt-4'>
                                                    <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center'>
                                                        <div className=''>
                                                            <label className='w-full'>Year Built</label>
                                                            <input type='number' className='form-control !appearance-none' name='min_year' value={payload.min_year}
                                                                onChange={(e) => { handleCommonChange(e); }} maxLength={4} placeholder='No Min' />
                                                        </div>
                                                        <div className='px-4'>
                                                            <label className='w-full text-white'>-</label>
                                                            <div>-</div>
                                                        </div>
                                                        <div className=''>
                                                            <label className='w-full text-white'>-</label>
                                                            <input type='number' className='form-control !appearance-none' name='max_year' value={payload.max_year}
                                                                onChange={(e) => { handleCommonChange(e); }} maxLength={4} placeholder='No Max' />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='w-full mt-4'>
                                                    <label className='w-full flex items-center mb-1'>Parking Spots</label>
                                                    <select className='form-control' name='parking_spots' value={payload.parking_spots}
                                                        onChange={(e) => { handleCommonChange(e); }}>
                                                        <option value="0">Any</option>
                                                        <option value="1">1+</option>
                                                        <option value="2">2+</option>
                                                        <option value="3">3+</option>
                                                        <option value="4">4+</option>
                                                    </select>
                                                </div>

                                                <div className='w-full mt-4 relative mb-4'>
                                                    <label className='w-full flex items-center mb-1'>Must Have</label>
                                                    <div className='w-full mt-2'>
                                                        <input type='checkbox' className='styled-checkbox' name='virtual_tour' id='virtual_tour'
                                                            checked={payload.virtual_tour as boolean} onChange={(e) => { handleMustHaves(e, "virtual_tour"); }} />
                                                        <label className='' htmlFor="virtual_tour">
                                                            <span className='font-normal'>Must have 3D Tour {payload.virtual_tour as boolean}</span>
                                                        </label>
                                                    </div>

                                                    <div className='w-full mt-2'>
                                                        <input type='checkbox' className='styled-checkbox' name='garage' id='garage'
                                                            checked={payload.garage as boolean} onChange={(e) => { handleMustHaves(e, "garage"); }} />
                                                        <label className='' htmlFor="garage">
                                                            <span className='font-normal'>Must have garage {payload.garage as boolean}</span>
                                                        </label>
                                                    </div>

                                                    <div className='w-full mt-2'>
                                                        <input type='checkbox' className='styled-checkbox' name='basement' id='basement'
                                                            checked={payload.basement} onChange={(e) => { handleMustHaves(e, "basement"); }} />
                                                        <label className='' htmlFor="basement">
                                                            <span className='font-normal'>Must have basement</span>
                                                        </label>
                                                    </div>

                                                    <div className='w-full mt-2'>
                                                        <input type='checkbox' className='styled-checkbox' name='pool' id='pool'
                                                            checked={payload.pool} onChange={(e) => { handleMustHaves(e, "pool"); }} />
                                                        <label className='' htmlFor="pool">
                                                            <span className='font-normal'>Must have pool</span>
                                                        </label>
                                                    </div>

                                                    <div className='w-full mt-2'>
                                                        <input type='checkbox' className='styled-checkbox' name='view' id='view'
                                                            checked={payload.view} onChange={(e) => { handleMustHaves(e, "view"); }} />
                                                        <label className='' htmlFor="view">
                                                            <span className='font-normal'>Must have view</span>
                                                        </label>
                                                    </div>

                                                    <div className='w-full mt-2'>
                                                        <input type='checkbox' className='styled-checkbox' name='waterfront' id='waterfront'
                                                            checked={payload.waterfront} onChange={(e) => { handleMustHaves(e, "waterfront"); }} />
                                                        <label className='' htmlFor="waterfront">
                                                            <span className='font-normal'>Must have waterfront</span>
                                                        </label>
                                                    </div>

                                                    <div className='w-full mt-2'>
                                                        <input type='checkbox' className='styled-checkbox' name='photos' id='photos'
                                                            checked={payload.photos} onChange={(e) => { handleMustHaves(e, "photos"); }} />
                                                        <label className='' htmlFor="photos">
                                                            <span className='font-normal'>Must have photos</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='w-full grid grid-cols-3 gap-1 *:text-sm *:font-light'>
                                                <button className='h-[40px] py-2 px-2 border border-primary text-primary 
                                                hover:bg-primary hover:text-white flex items-center justify-center font-light'
                                                    onClick={() => { setInitialLoad(true) }}>
                                                    <IoSearch size={15} /> <span className='ml-1'>Search</span>
                                                </button>

                                                <button className='h-[40px] py-2 px-2 border border-primary text-primary 
                                                hover:bg-primary hover:text-white flex items-center justify-center font-light'
                                                    onClick={handleSaveModal}>
                                                    <TfiSave size={12} /> <span className='ml-1'>Save</span>
                                                </button>

                                                <button className='h-[40px] py-2 px-2 border border-primary text-primary 
                                                hover:bg-primary hover:text-white flex items-center justify-center font-light'
                                                    onClick={handleClearFilters}>
                                                    <BiRefresh size={15} /> <span className='ml-1'>Reset</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='relative z-[99] hidden md:block'>
                                    <button className='h-[40px] py-2 px-5 bg-primary border border-primary rounded-md text-white 
                                    hover:drop-shadow-xl flex items-center justify-center font-normal' onClick={() => {
                                            setInitialLoad(true);
                                        }}>
                                        <IoSearch size={15} /> <span className='ml-1'>Search</span>
                                    </button>
                                </div>

                                <div className='relative z-[99] hidden md:block'>
                                    <button className='h-[40px] py-2 px-5 bg-primary border border-primary rounded-md text-white 
                                    hover:drop-shadow-xl flex items-center justify-center font-normal' onClick={handleSaveModal}>
                                        <TfiSave size={12} /> <span className='ml-1'>Save Search</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`w-full grid grid-cols-1 tab:grid-cols-5 lg:grid-cols-6 lgScrn:grid-cols-5 flex-grow h-[calc(100vh-139px)] 
                        relative z-[99]`}>
                            <div className={`h-full col-span-full tab:col-span-3 lg:col-span-4 lgScrn:col-span-3 ${map_view_cntrl}`}>
                                {(mobileView == "Map" && googleMapKey != "") && <MapContainer zoom={payload.zoom} setPayload={setPayload} handleSearch={handleSearch} payload={payload}
                                    properties={properties} mapAddress={mapAddress} initialLoad={initialLoad} setInitialLoad={setInitialLoad}
                                    setPolyLists={setPolyLists} api_key={googleMapKey} />
                                }
                            </div>
                            <div className={`h-full col-span-full tab:col-span-2 border-l border-gray-400 overflow-x-hidden overflow-y-scroll ${list_view_cntrl}`}>
                                <div className='px-2 sm:px-4 py-4 shadow bg-white'>
                                    <div className='w-full font-bold text-lg'>{reslt_hdr}</div>
                                    <div className='w-full mt-1 flex flex-col sm:flex-row justify-between items-start sm:items-center'>
                                        <div className='flex items-center'>
                                            <span>{numeral(total_record).format("0,0")} Result{total_record > 1 ? "s" : null}</span>
                                            {
                                                total_filters > 0 && (
                                                    <span className='text-red-600 flex items-center cursor-pointer p-1 ml-1 hover:bg-gray-100'
                                                        onClick={handleClearFilters}>
                                                        <IoCloseSharp size={17} />
                                                        <span className=' text-sm'>Clear {total_filters} Filter{total_filters > 1 ? "s" : null}</span>
                                                    </span>
                                                )
                                            }
                                        </div>
                                        <div className='relative z-[99]'>
                                            <div className='flex items-center'>
                                                <span className='mr-2'>Sort:</span>
                                                <button onClick={() => handleMenuBox("sort_shown")} className='flex items-center text-sky-700'>
                                                    <span className=''>{filter_by}</span>
                                                    <span className={`ml-1 ${box_state.sort_shown ? "rotate-180" : null}`}>
                                                        <MdOutlineKeyboardArrowDown size={22} />
                                                    </span>
                                                </button>
                                            </div>

                                            <div className={`w-[250px] left-0 sm:right-0 absolute bg-transparent ${box_state.sort_shown ? "block" : "hidden"}`}>
                                                <div className='w-full bg-white m-0 mt-1 drop-shadow-lg rounded-lg *:cursor-pointer *:py-3 *:px-3'>
                                                    <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Price-DESC")}>Price (High to Low)</div>
                                                    <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Price-ASC")}>Price (Low to High)</div>
                                                    <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Date-DESC")}>Newest Firsts</div>
                                                    <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Date-ASC")}>Oldest Firsts</div>
                                                    <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Beds-DESC")}>Bedrooms</div>
                                                    <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Baths-DESC")}>Bathrooms</div>
                                                    <div className="w-full hover:bg-gray-50" onClick={() => handleSort("SqFt-DESC")}>Square Feet</div>
                                                    <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Lots-DESC")}>Lot Size</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='w-full mt-2 grid grid-cols-1 xs:grid-cols-2 tab:grid-cols-1 lgScrn:grid-cols-2 gap-y-4 gap-2 sm:gap-4 mx-auto 
                                max-w-[410px] xs:!max-w-[100%]'>
                                        {
                                            isPropsLoading && (<div className='w-full flex justify-center items-center min-h-60 sm:col-span-full'>
                                                <AiOutlineLoading3Quarters size={35} className='animate-spin' />
                                            </div>)
                                        }

                                        {
                                            !isPropsLoading ?
                                                prop_lists.length > 0
                                                    ? (prop_lists.map((prop) => <PropertyCard key={prop.listing_id} prop={prop} page="Map" />))
                                                    : (<div className='w-full flex justify-center items-center min-h-60 sm:col-span-full'>
                                                        No results found.
                                                    </div>)
                                                : ""
                                        }

                                        <div className='w-full mt-3 col-span-1 sm:col-span-full'>
                                            {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`${url_path}&`} /> : null}
                                        </div>
                                    </div>
                                </div>

                                <div className='p-8 px-3 md:px-8 bg-primary'>
                                    <Footer page='Search' />
                                </div>
                            </div>
                        </div>

                        <div className='w-full absolute bottom-10 flex justify-center *:flex *:px-4 *:py-3 *:bg-gray-100 text-sm 
                                z-[99] *:drop-shadow-md *:items-center pointer-events-none tab:hidden'>
                            <button className={`${mobileView == "Map" && "!bg-primary text-white"} rounded-l-md pointer-events-auto`}
                                onClick={() => { updateView("Map"); setInitialLoad(true); }}><FaMap size={14} /> <span className='ml-1'>Map</span></button>
                            <button className={`${mobileView == "List" && "!bg-primary text-white"} rounded-r-md pointer-events-auto`}
                                onClick={() => { updateView("List"); setInitialLoad(true); }}>
                                <FaList size={14} /> <span className='ml-1'>List</span></button>
                        </div>
                    </div>



                </div>
            </section>

            <Modal show={showModal} children={modal_children} width={600} closeModal={closeModal} title={<>SAVE THIS SEARCH</>} />
        </>
    )
}

export default SearchPage