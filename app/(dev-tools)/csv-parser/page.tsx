"use client"

import React, { useState } from 'react'

const CSV_Parser = () => {

    const [cols, setCols] = useState<any[]>();

    const handleFileUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        const lines = text.split('\n');
        const columnArray = lines.map((line: any) => {
            const columns = line.split(',');
            return { "column": columns[0], "data_length": columns[5], "data_type": columns[6] }; // Assuming the first column is the one you want
        });

        setCols(columnArray);
        console.log(JSON.stringify(columnArray));
    };

    return (
        <div className='w-full'>
            <div className='w-full max-w-[1000px] mx-auto'>
                <div className='w-full'>
                    <input type="file" onChange={handleFileUpload} accept=".csv" />
                </div>

                <div className='w-full flex flex-wrap space-x-4 space-y-4'>
                    {
                        (cols && cols.length) ? <>
                            {
                                cols.map((col: any, i: number) => {
                                    return <div key={i} className='px-6 py-2 bg-gray-100 rounded-md text-primary'>
                                        {col.column} : {col.data_type}
                                    </div>
                                })
                            }
                        </> : ""
                    }
                </div>
            </div>
        </div>
    )
}

export default CSV_Parser