"use client"

import React, { useEffect, useRef, useState } from 'react'
import { GiModernCity } from 'react-icons/gi';
import SearchItem from '../SearchItem';
import { APIResponseProps } from '../types';
import { TbMapPin } from 'react-icons/tb';
import { GrMapLocation } from 'react-icons/gr';

const LocationComponent = ({ location, setLocation }: { location: string, setLocation: React.Dispatch<React.SetStateAction<string>> }) => {

    const [isSrchOpen, setIsSrchOpenOpen] = useState(false);
    const searchBoxRef = useRef<HTMLDivElement>(null);
    const [cities_results, setCitiesResults] = useState<any[]>([]);
    const [address_results, setAddressResults] = useState<any[]>([]);
    const [postal_results, setPostalResults] = useState<any[]>([]);
    const [payload, setPayload] = useState<{ [key: string]: any }>({});
    const [abortController, setAbortController] = useState(new AbortController());

    /** Live location search **/
    useEffect(() => {

        if (location != "") {

            setIsSrchOpenOpen(true);

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
                body: JSON.stringify({ "keyword": location, "search_by": "City" }),
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

                    setCitiesResults(cities);
                    setAddressResults(addresses);
                    setPostalResults(postals);
                    // setListingsResults(listings);

                }

            });

            // Cleanup function to abort the request if the component unmounts or the dependency changes
            return () => {
                controller.abort();
            };
        } else {
            setIsSrchOpenOpen(false);
        }

    }, [location]);
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


    return (
        <div className='flex-grow mr-auto h-full relative'>
            <input type='text' placeholder='City, Address, Zip' value={location} onChange={(e) => setLocation(e.target.value)}
                className='w-full h-full border border-transparent focus:border-sky-500 focus:shadow-md focus:outline-none px-3 py-2' />

            <div className={`w-[400px] bg-white absolute top-[46px] drop-shadow-2xl border border-gray-200 z-10 ${isSrchOpen ? "block" :
                "hidden"} max-h-[450px] overflow-x-hidden overflow-y-auto`} ref={searchBoxRef}>
                <div className='w-full flex flex-col'>
                    {
                        (cities_results.length > 0) && (
                            <SearchItem items={cities_results} type="CityValue" value={location} setValue={setLocation}
                                setIsSrchOpenOpen={setIsSrchOpenOpen} header={<><GiModernCity size={14} /> <span className='ml-2'>Cities</span></>} />
                        )
                    }

                    {
                        (address_results.length > 0) && (
                            <SearchItem items={address_results} type="AddressValue" value={location} setValue={setLocation}
                                setIsSrchOpenOpen={setIsSrchOpenOpen} header={<><TbMapPin size={16} /> <span className='ml-2'>Property Address</span></>} />
                        )
                    }

                    {
                        (postal_results.length > 0) && (
                            <SearchItem items={postal_results} type="PostalCodeValue" value={location} setValue={setLocation}
                                setIsSrchOpenOpen={setIsSrchOpenOpen} header={<><GrMapLocation size={16} /> <span className='ml-2'>Postal Codes</span></>} />
                        )
                    }
                </div>
            </div>

        </div>
    )
}

export default LocationComponent