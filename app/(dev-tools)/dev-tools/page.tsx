"use client"

import Link from 'next/link'
import React from 'react'
import { BsFiletypeXml } from 'react-icons/bs'
import { FaFileCsv, FaFileExcel, FaRegFileExcel } from 'react-icons/fa6'
import { TbBrandMysql } from 'react-icons/tb'

function DevTools() {
    return (
        <div className='w-full'>

            <div className='w-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8'>

                <Link href="/csv-parser">
                    <div className='settings-card'>
                        <FaFileCsv className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>CSV Parser</div>
                    </div>
                </Link>

                <Link href="/create-table">
                    <div className='settings-card'>
                        <TbBrandMysql className='text-7xl' />
                        <div className='w-full text-center text-xl font-semibold mt-3'>Create SQL Table</div>
                    </div>
                </Link>

            </div>
        </div>
    )
}

export default DevTools
