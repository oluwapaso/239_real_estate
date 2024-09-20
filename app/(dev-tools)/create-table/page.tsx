"use client"

import React, { useEffect, useState } from 'react'

const page = () => {

    const [columns, setCols] = useState<any>();
    const [sql_query, setSQLQuery] = useState("");
    let createTableQuery = `CREATE TABLE properties (
        property_id INT NOT NULL AUTO_INCREMENT,`;

    useEffect(() => {

        if (columns) {

            let cols = columns;
            if (typeof cols == "string") {
                cols = JSON.parse(columns);
            }

            cols.forEach((column: any) => {

                let dataType;
                if (column.data_type === 'Character' && parseInt(column.data_length) <= 20) {
                    dataType = `CHAR(${parseInt(column.data_length)})`;
                } else {
                    switch (column.data_type) {
                        case 'Int':
                        case 'Decimal':
                        case 'Boolean':
                            dataType = `CHAR(${parseInt(column.data_length) + 2})`; //Add 2 to be save
                            break;
                        case 'Date':
                            dataType = 'DATE';
                            break;
                        case 'DateTime':
                            dataType = 'DATETIME';
                            break;
                        case 'Character':
                            dataType = 'TEXT';
                            break;
                        default:
                            dataType = 'TEXT';
                    }
                }

                createTableQuery += `${column.column} ${dataType} NULL, `;
            });

            //createTableQuery = createTableQuery.slice(0, -2); // Remove the last comma and space
            createTableQuery += `
            DefaultPic TEXT NULL,
            Images TEXT NULL,
            AllPixDownloaded ENUM('Yes', 'No') DEFAULT 'No' NULL,
            DateAdded DATE NULL,
            last_image_query DATETIME NULL,
            PRIMARY KEY(property_id));`;

            setSQLQuery(createTableQuery);
        }

    }, [columns]);

    return (
        <div className='w-full'>
            <div className='w-full max-w-[1000px] mx-auto'>
                <div className='w-full'>
                    <textarea value={columns} onChange={(e) => setCols(e.target.value)} className='w-full h-96' />
                </div>

                <div className='w-full p-6'>
                    <textarea value={sql_query} className='w-full h-[660px]' />
                </div>
            </div>
        </div>
    )
}

export default page
