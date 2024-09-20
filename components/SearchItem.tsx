import { NonEmptyArray } from 'ckeditor5/src/core';
import React from 'react'

const SearchItem = ({ header, items, type, setPayload, setIsSrchOpenOpen, payload, value, setValue, formData, setFormData }: {
    header: React.JSX.Element, items: any[], type: string,
    setIsSrchOpenOpen: React.Dispatch<React.SetStateAction<boolean>>,
    payload?: { [key: string]: any; },
    setPayload?: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>,
    value?: string,
    setValue?: React.Dispatch<React.SetStateAction<string>>,
    formData?: any,
    setFormData?: any,//React.Dispatch<React.SetStateAction<{ city_info?: string, mls_name: string; friendly_name: string; slug: string; excerpt: string; post_body: string; }>>
}) => {

    const handleClick = (loc: string) => {

        if (type == "City" || type == "Address" || type == "PostalCode") {

            const new_payload = { ...payload }
            new_payload.location = loc;
            if (setPayload) {
                setPayload(new_payload);
            }

        } else if (type == "CityValue" || type == "AddressValue" || type == "PostalCodeValue") {

            if (setValue && loc) {
                setValue(loc);
            }

        } else if (type == "MlsCityValue") {

            if (setFormData && loc) {
                const location = loc.trim();
                const comm_slug = location.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

                setFormData({
                    ...formData,
                    mls_name: location,
                    ["slug"]: comm_slug
                });
            }

        }

        const to = setTimeout(() => {
            setIsSrchOpenOpen(false);
        }, 350);

        return () => {
            clearTimeout(to);
        }
    }

    return (
        <div className='w-full'>
            <div className='w-full font-medium flex items-center py-2 px-2 border-b border-gray-200'>
                {header}
            </div>
            <div className='w-full'>
                {
                    items.map((item, index) => {
                        return <div key={index} className='pl-8 pr-2 py-2 hover:bg-gray-50 font-normal cursor-pointer text-base border-b 
                      border-gray-100' onClick={() => handleClick(item.location)}>{item.location}</div>
                    })
                }
            </div>
        </div>
    )
}

export default SearchItem