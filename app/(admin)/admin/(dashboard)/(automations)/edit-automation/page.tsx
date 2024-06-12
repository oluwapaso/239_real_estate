"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/user/userSlice';
import PageTitle from '../../../_components/PageTitle';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { APIResponseProps, AutomationDetails, AutomationInfoAndStep, Automations } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Modal from '@/components/Modal';
import moment from 'moment';
import { BiExpand, BiTrash } from 'react-icons/bi';
import { FaCopy, FaExpand, FaTrafficLight, FaUserPlus } from 'react-icons/fa6';
import { FaEdit, FaHistory, FaPlusCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import EditDripNameModal from '../../../_components/EditDripNameModal';
import { GrTrigger } from 'react-icons/gr';
import ReactDOM, { createPortal } from 'react-dom';

const helpers = new Helpers();
const EditAutomation = () => {

    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const router = useRouter();
    const automation_id = parseInt(searchParams?.get("automation_id") as string);
    const param_version = parseInt(searchParams?.get("version") as string) || Math.floor(moment().unix() * 1000);

    const [automation_info, setAutomationInfoSteps] = useState<AutomationInfoAndStep>({} as AutomationInfoAndStep);
    const [drip_fetched, setDripFetched] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modal_children, setModalChildren] = useState({} as React.ReactNode);
    const [refresh_page, setRefreshPage] = useState(true);
    const [version, setVersion] = useState(param_version);
    const [update_name_resp, setUpdateNameResponse] = useState<any>({});

    const closeModal = () => {
        setShowModal(false);
    }

    useEffect(() => {

        const fetchAutomationInfoSteps = async () => {

            try {

                const detailsPromise: Promise<AutomationInfoAndStep> = helpers.LoadAutomationInfoStep(automation_id);
                const detailsResp = await detailsPromise;

                setAutomationInfoSteps(detailsResp);
                setDripFetched(true);
                setRefreshPage(false);
                dispatch(hidePageLoader());
                BuildTriggers(detailsResp.trigger);

                if (detailsResp.automation_status == "Active") {
                    const edit_btn = document.querySelector(".edit_btn") as HTMLElement;
                    if (edit_btn) {
                        edit_btn.style.display = "block";
                    }

                    const recall_btn = document.querySelector(".recall_btn") as HTMLElement;
                    if (recall_btn) {
                        recall_btn.style.display = "flex";
                    }

                    const publish_btn = document.querySelector(".publish_btn") as HTMLElement;
                    if (publish_btn) {
                        publish_btn.style.display = "none";
                    }
                } else {
                    const edit_btn = document.querySelector(".edit_btn") as HTMLElement;
                    if (edit_btn) {
                        edit_btn.style.display = "none";
                    }

                    const recall_btn = document.querySelector(".recall_btn") as HTMLElement;
                    if (recall_btn) {
                        recall_btn.style.display = "none";
                    }

                    const publish_btn = document.querySelector(".publish_btn") as HTMLElement;
                    if (publish_btn) {
                        publish_btn.style.display = "block";
                    }
                }

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchAutomationInfoSteps();

    }, [automation_id, version]);

    const FilterVersion = (value: any) => {
        router.push(`/admin/edit-automation?automation_id=${value}`);
    }

    const DuplicateDrip = (type: string) => {

        dispatch(showPageLoader());
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/(automations)/duplicate-drip`, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ automation_id: automation_id, type: type })
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to duplicate drip.")
            }

            return resp.json();
        }).then(async response => {

            if (response.success == true) {
                var new_autom_id = response.data.automation_id;
                router.push(`/admin/edit-automation?automation_id=${new_autom_id}`);
            } else {
                dispatch(hidePageLoader());
                toast.error(`${response.message}`, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        }).catch((err: any) => {
            dispatch(hidePageLoader());
            toast.error(`${err.message}`, {
                position: "top-center",
                theme: "colored"
            })
        });

    }

    const RecallDrip = async () => {

        const result = await Swal.fire({
            title: "Are you sure you want to recall this automation?",
            text: "This will cancel all running drips",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Recall',
        });

        if (result.isConfirmed) {
            ChangePublishStatus("No");
        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    const ChangePublishStatus = (value: string) => {

        if (value == "Yes") {
            // var trigger_event = $("#trigger_event").val().trim();
            // if (!trigger_event || trigger_event == "") {
            //     $.notify({ icon: 'la la-warning', message: "Error: trigger event is missing." }, { type: 'danger', timer: 4000, placement: { from: "top", align: "center" } });
            //     return false;
            // }

            // var unsaved_actions = $('div[data-unsaved="Yes"]').length;
            // if (unsaved_actions > 0) {
            //     $.notify({ icon: 'la la-warning', message: "You have an unsaved action. Please save all actions to continue." }, { type: 'danger', timer: 4000, placement: { from: "top", align: "center" } });
            //     return false;
            // }
        }

        const action_containers = document.querySelectorAll(".action_container");
        if (action_containers) {
            action_containers.forEach(_containers => {
                let containers = _containers as HTMLElement
                containers.classList.remove("autom_missing_error");
            })
        }

        toast.dismiss();
        dispatch(showPageLoader());
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/(automations)/update-published-status`, {
            method: 'PATCH',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ automation_id: automation_id, is_published: value })
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to update drip's status.")
            }

            return resp.json();
        }).then(async response => {

            if (response.success == true) {

                if (value == "No") {
                    var msg = "recalled";
                } else {
                    var msg = "published";
                }

                setVersion(Math.floor(moment().unix() * 1000));
                toast.success(`Step successfully ${msg}.`, {
                    position: "top-center",
                    theme: "colored"
                })

            } else if (response.message == "Missing required field.") {

                var step_uid = response.data.step_uid;
                toast.error(`${response.message}.`, {
                    position: "top-center",
                    theme: "colored"
                });

                const action_container = document.querySelector(`.action_container#${step_uid}`) as HTMLElement;
                if (action_container) {
                    action_container.classList.add("autom_missing_error border border-red-500 shadow-xl")
                }

            } else {
                dispatch(hidePageLoader());
                toast.error(`${response.message}.`, {
                    position: "top-center",
                    theme: "colored"
                });
            }

        }).catch((error: any) => {
            dispatch(hidePageLoader());
            toast.error(`${error.message}.`, {
                position: "top-center",
                theme: "colored"
            });
        });

    }

    const handleEditName = () => {

        setModalChildren(<EditDripNameModal closeModal={closeModal} curr_name={automation_info.automation_name}
            automation_id={automation_id} setUpdateNameResponse={setUpdateNameResponse} setRefreshPage={setRefreshPage} />);
        setShowModal(true);
    }

    useEffect(() => {

        if (update_name_resp.success) {
            toast.success(`${update_name_resp.message}`, {
                position: "top-center",
                theme: "colored"
            });

            setAutomationInfoSteps((prev_val) => {
                return {
                    ...prev_val,
                    automation_name: update_name_resp.data?.new_name
                }
            })
            //setVersion(Math.floor(moment().unix() * 1000));
        } else {

            if (update_name_resp.message) {
                toast.error(`${update_name_resp.message}`, {
                    position: "top-center",
                    theme: "colored"
                });
            }

        }

    }, [update_name_resp]);

    const BuildTriggers = (dripTrigger: any) => {

        if (dripTrigger) {

            var trigger = dripTrigger.trigger;
            let icon = <></>;
            if (trigger == "New Account Created") {
                icon = <FaUserPlus size={45} />
            }

            const trigger_icon = document.getElementById("trigger_icon");
            if (trigger_icon) {
                ReactDOM.render(icon, trigger_icon);
            }

            const slctd_trgr_icon = document.getElementById("slctd_trgr_icon");
            if (slctd_trgr_icon) {
                ReactDOM.render(icon, slctd_trgr_icon);
            }

            const trigger_out = document.getElementById("trigger_out");
            if (trigger_out) {
                trigger_out.innerHTML = `1. ${dripTrigger.name}`;
            }

            const selected_trigger_name = document.getElementById("selected_trigger_name");
            if (selected_trigger_name) {
                selected_trigger_name.innerHTML = trigger;
            }

            if (dripTrigger.name != "A trigger is an event that starts your Node") {
                const trigger_event = document.getElementById("trigger_event") as HTMLInputElement;
                if (trigger_event) {
                    trigger_event.value = dripTrigger.name;
                }
            }

            const trigger_val = document.getElementById("trigger_val") as HTMLInputElement;
            if (trigger_val) {
                trigger_val.value = trigger;
            }

            if (dripTrigger.value) {
                const trigger_event_val = document.getElementById("trigger_event_val") as HTMLInputElement;
                if (trigger_event_val) {
                    trigger_event_val.value = JSON.stringify(dripTrigger.value);
                }
            }

            const trigger_body = document.getElementById("trigger_body");
            if (trigger_body) {
                trigger_body.innerHTML = "";

                ReactDOM.render(<div className="flex items-center w-full border-dashed border-[#eed7d7] hover:bg-[#F3F3F3] 
                    hover:shadow-lg py-1 px-1"onClick={() => ListTriggerEvents('New Account Created')}>
                    <div className="size-8 flex items-center justify-center rounded p-[5px]">
                        <FaUserPlus size={22} className='text-[#006B9F]' />
                    </div>
                    <div className="w-auto mr-auto flex-grow text-left pl-[5px] text-base font-medium text-[#303030] cursor-pointer">
                        New Account Created
                    </div>
                </div>, trigger_body);
            }

        }

    }

    const ListTriggerEvents = (type: string) => {

        // $("#trigger_val").val(trigger); 
        // $(".selected_trigger_name").html(trigger);
        // $(".trigger_loader").show();
        // $(".trigger_body").hide(); 

        const trigger_loader = document.getElementById("trigger_loader");
        if (trigger_loader) {
            trigger_loader.classList.remove("hidden");
            trigger_loader.classList.add("flex");
        }

        let icon = <></>;
        if (type == "New Account Created") {
            icon = <FaUserPlus size={45} />
        }

        const trigger_icon = document.getElementById("trigger_icon");
        if (trigger_icon) {
            ReactDOM.render(icon, trigger_icon);
        }

        const slctd_trgr_icon = document.getElementById("slctd_trgr_icon");
        if (slctd_trgr_icon) {
            ReactDOM.render(icon, slctd_trgr_icon);
        }

        // RenderEventList(trigger);
        // $(".selected_trigger_cont").show();
        // $(".trigger_loader").hide();
        if (trigger_loader) {
            // trigger_loader.classList.remove("flex");
            // trigger_loader.classList.add("hidden");
        }

    }

    return (
        <div className='w-full flex flex-col'>
            <PageTitle text="Edit Automations" show_back={false} />

            <div className='w-full'>
                {/* Loader */}
                {!drip_fetched && <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                    <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                </div>}

                {
                    drip_fetched && (
                        <div className="w-full mt-2">
                            <div className="w-full">
                                <h3 className="fw-bold w-full flex items-center">
                                    <span className='mr-1'>{automation_info.automation_name}</span>
                                    <FaEdit size={18} onClick={handleEditName} className='cursor-pointer text-sky-700' />
                                </h3>

                                <div className="w-full flex justify-between items-center mt-2">

                                    <div className="w-auto flex items-center">
                                        <div className="bg-gray-200 py-2 px-4 rounded-l rounded-bl">
                                            <span className="text-base font-medium">Version:</span>
                                        </div>
                                        <select className="form-control max-w-[220px] h-[40px]" name="version_filter"
                                            value={automation_info.automation_id} onChange={(e) => FilterVersion(e.target.value)}>
                                            {
                                                automation_info.versions && automation_info.versions.length && (
                                                    automation_info.versions.map((version: any, index: number) => {
                                                        return (
                                                            <option key={index} value={version.automation_id}>
                                                                {version.version_number}: &nbsp; {moment(version.last_save).format("MM/DD/YYYY")} - {version.status}
                                                            </option>
                                                        )
                                                    })
                                                )
                                            }
                                        </select>
                                        <div className="flex items-center bg-gray-200">
                                            <button className="publish_btn py-2 px-4 bg-green-600 text-white rounded-r rounded-br"
                                                onClick={() => ChangePublishStatus('Yes')}>
                                                <i className="la la-paper-plane fs-13"></i> Publish
                                            </button>

                                            <button className="edit_btn py-2 px-4 bg-sky-600 text-white rounded-r rounded-br"
                                                onClick={() => DuplicateDrip('Edit')}>
                                                <i className="la la-edit fs-13"></i> Edit
                                            </button>

                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button className="py-2 px-4 bg-sky-600 text-white rounded duplicate_btn flex items-center 
                                        hover:shadow-xl" onClick={() => DuplicateDrip('Duplicate')}>
                                            <FaCopy size={14} /> <span className='ml-2'>Duplicate</span>
                                        </button>

                                        <button className="recall_btn py-2 px-4 bg-orange-600 text-white rounded flex items-center 
                                        hover:shadow-xl" onClick={RecallDrip}>
                                            <FaHistory size={14} /> <span className='ml-2'>Recall</span>
                                        </button>

                                        <button className="py-2 px-4 bg-red-600 text-white rounded flex items-center hover:shadow-xl">
                                            <BiTrash size={14} /> <span className='ml-2'>Delete</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )
                }

                {
                    drip_fetched && (
                        <div className="m-0 relative w-full py-10 mb-[150px]" id="editor">
                            <div className="flex flex-col min-w-[100%] w-[min-content] items-center p-0" data-parentid="x" id="addnewblock_x">
                                <div className="w-[600px] shadow-md relative border border-zinc-700 select-none" id="trigger_container" data-unsaved="No">
                                    <div className="w-full flex items-center bg-gray-700 p-4 cursor-pointer" id="trigger_header" data-editing="No">
                                        <div className="flex items-center justify-center size-16 bg-white" id='trigger_icon'>
                                            <GrTrigger size={45} />
                                        </div>
                                        <div className="trigger_info flex flex-col text-white items-center w-auto mr-auto flex-grow 
                                        text-left pl-5">
                                            <h2 className="w-full text-white capitalize m-1 font-normal text-lg">Trigger</h2>
                                            <div className="w-full font-medium text-xl" id="trigger_out">
                                                1. A trigger is an event that start your Node.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full grid grid-cols-2 gap-5 bg-white p-5" id="trigger_body"></div>

                                    <div className="w-full hidden bg-white h-[200px] items-center justify-center" id="trigger_loader">
                                        <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                                    </div>

                                    <div className="w-full bg-white hidde" id="selected_trigger_cont">
                                        <div className="w-full flex flex-col text-left p-5">
                                            <h3 className="w-full font-semibold text-[#4d4b4b] text-base">Select Trigger Event</h3>
                                            <div className="w-full flex border border-[#E2E2E2] items-center py-1 cursor-pointer" data-on_click="ChangeTrigger();">
                                                <div className="flex flex-grow p-2 bg-white items-center">
                                                    <div className="flex size-8 items-center justify-center bg-white rounded-lg"
                                                        id="slctd_trgr_icon">
                                                        <GrTrigger size={15} />
                                                    </div>
                                                    <div className="w-auto mr-auto flex-grow pl-2 text-left">
                                                        <h2 className="w-full text-[#4d4b4b] font-semibold text-lg mb-0" id="selected_trigger_name"></h2>
                                                    </div>
                                                </div>

                                                <div className="px-2">
                                                    <div className="border border-[#DFDFDF] text-[#0070A6] font-medium py-2 px-4">Change</div>
                                                </div>
                                            </div>

                                            <div className="w-full relative mt-4">
                                                <h3 className="w-full flex items-center">
                                                    <span className='font-semibold'>Event</span>
                                                    <span className='ml-1 text-red-600 font-semibold text-lg' id="required">*</span>
                                                </h3>
                                                <input type="text" className='form-field' name="trigger_event" id="trigger_event"
                                                    placeholder="Choose an event" disabled />
                                                <BiExpand className='absolute right-2 top-10 text-2xl' />
                                                <div className="hidde absolute z-30 h-auto top-[75px] max-h-[300px] overflow-y-auto
                                                bg-white border border-[#D1D1D1] w-full shadow-2xl"></div>
                                            </div>

                                            <div className="w-full mt-4 flex justify-end">
                                                <div className="py-2 px-5 font-normal bg-gray-700 text-white cursor-pointer 
                                                rounded w-auto" data-onclick="SaveTrigger();">Continue</div>
                                            </div>
                                            <div className='w-full mt-4 flex justify-end flex-wrap'>
                                                <input type="hidde" name="trigger_val" id="trigger_val" />
                                                <input type="hidde" name="trigger_event_val" id="trigger_event_val" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full flex flex-col items-center justify-center absolute  z-10 border border-red-600" id="trigger_new_block_btn">
                                        <div className='h-[30px] border border-zinc-700'></div>
                                        <div className=" flex items-center justify-center cursor-pointer rounded-full"
                                            data-step-id="0" data-parent-id="-1" data-children=""
                                            data-parent-uid="none" data-parent-type="container">
                                            <FaPlusCircle size={27} className='hover:drop-shadow-lg hover:scale-[1.2] duration-200' />
                                        </div>
                                        <div className='h-[30px] border border-zinc-700'></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>

            <ToastContainer />
            <Modal show={showModal} children={modal_children} width={550} closeModal={closeModal} title={<>Edit Automation Name</>} />
        </div>
    )
}

export default EditAutomation