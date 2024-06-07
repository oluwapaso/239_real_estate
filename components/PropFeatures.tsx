import React from 'react'

const PropFeatures = ({ title, features }: { title: string, features: string }) => {
    if (!features || features.trim() === "") return null;

    return (
        <div className='w-full col-span-2 flex items-center flex-wrap !border-transparent'>
            <div className='w-full font-semibold text-base'>{title}</div>
            {features.split(",").map((feature, index) => (
                <div key={index} className='flex mr-2 mb-2 rounded items-center justify-center bg-gray-100 text-primary px-4 py-2 cursor-pointer hover:drop-shadow-lg'>
                    {feature}
                </div>
            ))}
        </div>
    );
};

export default PropFeatures