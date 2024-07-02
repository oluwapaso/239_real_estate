"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import PageTitle from '../../../_components/PageTitle';
import CustomLink from '@/components/CustomLink';
import { BiAddToQueue } from 'react-icons/bi';
import { ToastContainer } from 'react-toastify';
import Pagination from '@/components/pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import { TemplateLists, User } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import TemplateListsCard from '@/components/TemplateListsCard';

const helpers = new Helpers();
const AllTemplates = () => {

    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [total_page, setTotalPage] = useState(0);

    const page_size = 20;
    const curr_page = parseInt(searchParams?.get("page") as string) || 1;
    const type = searchParams?.get("type") as string || "any";

    const [templates, setTemplates] = useState<TemplateLists[]>([]);
    const [temp_fetched, setTempFetched] = useState(false);
    const [template_type, setTempType] = useState(type);

    const payload = {
        paginated: true,
        search_type: "Template Lists",
        template_type: type,
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchTemplates = async () => {

            try {

                const tempPromise: Promise<TemplateLists[]> = helpers.LoadTemplates(payload);
                const tempResp = await tempPromise;

                if (tempResp && tempResp.length) {
                    const total_records = tempResp[0].total_records;
                    setTotalPage(Math.ceil(total_records / page_size));
                }

                setTemplates(tempResp);
                setTempFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchTemplates();

    }, [type, curr_page]);

    const handleTypeSwitch = (type: string) => {
        setTempType(type);
        router.push(`/admin/all-templates?type=${type}&page=1`);
    }

    const add_new_comp = <div className='flex items-center'>
        <div className='mr-1'>
            <select name='template_type' value={template_type} className='form-field !h-[40px] rounded-md !py-0 !px-2'
                onChange={(e) => handleTypeSwitch(e.target.value)}>
                <option value='any'>All Templates</option>
                <option value='Email'>Email</option>
                <option value='SMS'>SMS</option>
            </select>
        </div>
        <CustomLink href={`/admin/add-new-template`} className='bg-primary text-white flex items-center justify-center ml-2 py-1 
        h-10 px-4 text-sm font-medium cursor-pointer hover:drop-shadow-xl rounded-md shadow-lg hover:shadow-2xl'>
            <BiAddToQueue className='mr-1 !text-xl' /> <span>Add New <span className='hidden xs:inline-block'>Template</span></span>
        </CustomLink>
    </div>

    return (
        <div className='w-full flex flex-col'>
            <div className='w-full container mx-auto max-w-[1000px]'>
                <PageTitle text="Templates" show_back={false} right_component={add_new_comp} />

                <div className='!w-full !max-w-[100%] h-[auto] relative box-border pb-10'>

                    <div className="w-full mt-3 border border-gray-200 rounded-md overflow-hidden shadow-xl">
                        {/* Header */}
                        <div className=" bg-gray-100 grid grid-cols-[1fr_minmax(150px,150px)_minmax(100px,100px)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                            <div className="cell-header">Name</div>
                            <div className="cell-header">Type</div>
                            <div className="cell-header">Actions</div>
                        </div>

                        <div className='w-full divide-y divide-gray-200'>
                            {/* Loader */}
                            {!temp_fetched && <div className=' col-span-full h-[250px] bg-white flex items-center justify-center'>
                                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                            </div>}
                            {/* Rows */}
                            {
                                temp_fetched && (
                                    (templates.length && templates.length > 0)
                                        ? (templates.map((temp) => {
                                            return (<TemplateListsCard key={temp.template_id} prop={temp} />)
                                        }))
                                        : <div className=' col-span-full h-[250px] bg-white flex items-center justify-center'>
                                            No templates added yet.
                                        </div>)
                            }

                        </div>
                    </div>

                    <div className='w-full h-[90px]'>
                        {temp_fetched && total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page}
                            url_path={`/admin/all-templates?type=${template_type}&`} /> : null}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default AllTemplates