"use client"

import React, { RefAttributes, use, useCallback, useEffect, useRef, useState } from 'react'
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
import { FaCheck, FaClock, FaCommentSms, FaCopy, FaEllipsisVertical, FaExpand, FaGears, FaRegEnvelope, FaTrafficLight, FaUserPlus } from 'react-icons/fa6';
import { FaEdit, FaEllipsisH, FaHistory, FaPlusCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import EditDripNameModal from '../../../_components/EditDripNameModal';
import { GrTrigger } from 'react-icons/gr';
import { TbPointerPlus } from 'react-icons/tb';
import ReactDOM, { createRoot } from 'react-dom/client';
import { MdOutlineEmail, MdOutlineKeyboardArrowUp } from 'react-icons/md';
import dynamic from 'next/dynamic';

const Jquery = dynamic(() => import('jquery'), { ssr: false });
import $ from 'jquery'; // Import jQuery
import { BsClock } from 'react-icons/bs';

const helpers = new Helpers();
let automation_id = 0;
let editing_data: any = {};

const EditAutomation = () => {

    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const router = useRouter();
    automation_id = parseInt(searchParams?.get("automation_id") as string);
    const param_version = parseInt(searchParams?.get("version") as string) || Math.floor(moment().unix() * 1000);

    const [automation_info, setAutomationInfoSteps] = useState<AutomationInfoAndStep>({} as AutomationInfoAndStep);
    const [drip_fetched, setDripFetched] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modal_children, setModalChildren] = useState({} as React.ReactNode);
    const [refresh_page, setRefreshPage] = useState(true);
    const [version, setVersion] = useState(param_version);
    const [update_name_resp, setUpdateNameResponse] = useState<any>({});
    const [trigger, setTriger] = useState("");
    const [trigger_event, setTrigerEvent] = useState<any>({});
    const [trigger_event_val, setTrigerEventVal] = useState<any>({});
    const [actionRefreshTrigger, setActionRefreshTrigger] = useState(0); // Trigger for re-render
    const [is_editing_tigger, setIsEditingTrigger] = useState(false);
    const [trigger_icon, setIcon] = useState(<GrTrigger size={45} />);
    const [is_published, setIsPublished] = useState("No");
    const isPublishedRef = useRef(is_published);

    let trigger_root: any;

    const closeModal = () => {
        setShowModal(false);
    }

    const AddNewStep = async ({ parent_id, parent_uid, parent_type, step_id }: any) => {

        toast.dismiss();
        if (isPublishedRef.current == "Yes") {
            toast.error("Sorry, you can't edit an active published automation step. You need to be in edit mode to update step", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        dispatch(showPageLoader());
        const add_result = await helpers.AddNewStep({ automation_id, parent_id, parent_uid, parent_type, step_id })
        dispatch(hidePageLoader());

        if (add_result.success) {

            toast.success("New step successfully added", {
                position: "top-center",
                theme: "colored"
            });

            const detailsPromise: Promise<AutomationInfoAndStep> = helpers.LoadAutomationInfoStep(automation_id);
            const detailsResp = await detailsPromise;
            setAutomationInfoSteps(detailsResp);

        } else {
            toast.error(`${add_result.message}`, {
                position: "top-center",
                theme: "colored"
            })
        }

    }

    useEffect(() => {

        const fetchAutomationInfoSteps = async () => {

            try {

                const detailsPromise: Promise<AutomationInfoAndStep> = helpers.LoadAutomationInfoStep(automation_id);
                const detailsResp = await detailsPromise;

                const steps = detailsResp.steps;
                setAutomationInfoSteps(detailsResp);
                setDripFetched(true);
                setRefreshPage(false);
                dispatch(hidePageLoader());
                BuildTriggers(detailsResp.trigger);
                setIsPublished(detailsResp.published_version);

                alert(detailsResp.automation_status)
                if (detailsResp.automation_status == "Active") {
                    alert("Is Active")
                    const edit_btn = document.getElementById("edit_btn") as HTMLElement;
                    if (edit_btn) {
                        alert("edit_btn found")
                        edit_btn.style.display = "block";
                    }

                    const recall_btn = document.getElementById("recall_btn") as HTMLElement;
                    if (recall_btn) {
                        recall_btn.style.display = "flex";
                    }

                    const publish_btn = document.getElementById("publish_btn") as HTMLElement;
                    if (publish_btn) {
                        publish_btn.style.display = "none";
                    }
                } else {
                    console.log("Is Not active")
                    const edit_btn = document.getElementById("edit_btn") as HTMLElement;
                    if (edit_btn) {
                        console.log("edit_btn found")
                        edit_btn.style.display = "none";
                    }

                    const recall_btn = document.getElementById("recall_btn") as HTMLElement;
                    if (recall_btn) {
                        recall_btn.style.display = "none";
                    }

                    const publish_btn = document.getElementById("publish_btn") as HTMLElement;
                    if (publish_btn) {
                        publish_btn.style.display = "block";
                    }
                }

                if (Array.isArray(steps) && steps.length > 0) {
                    //RenderUI(steps);
                }

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchAutomationInfoSteps();

    }, [automation_id, version]); //automation_id, version //add this Later [] is for dev testing 

    useEffect(() => {
        isPublishedRef.current = is_published;
    }, [is_published]);

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
                let new_autom_id = response.data.automation_id;
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

        toast.dismiss();
        if (value == "Yes") {

            if (!trigger_event || trigger_event == "") {
                toast.error("Error: trigger event is missing.", {
                    position: "top-center",
                    theme: "colored"
                });
                return false;
            }

            let unsaved_actions = $('div[data-unsaved="Yes"]').length;
            if (unsaved_actions > 0) {
                toast.error("You have an unsaved action. Please save all actions to continue.", {
                    position: "top-center",
                    theme: "colored"
                });
                return false;
            }
        }

        const action_containers = document.querySelectorAll(".action_container");
        if (action_containers) {
            action_containers.forEach(_containers => {
                let containers = _containers as HTMLElement
                containers.classList.remove("autom_missing_error");
            })
        }

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

                window.location.reload();

            } else if (response.message == "Missing required field.") {

                dispatch(hidePageLoader());
                let step_uid = response.data.step_uid;
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

        console.log("dripTrigger", dripTrigger)
        if (dripTrigger) {

            let trigger = dripTrigger.trigger;
            let icon = <GrTrigger size={45} />;
            if (trigger == "New Account Created") {
                icon = <FaUserPlus size={45} />
            } else if (trigger == "Manually Added") {
                icon = <TbPointerPlus size={45} />
            }
            setIcon(icon);

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
                    setTrigerEvent(dripTrigger.name);
                }
            }

            const trigger_val = document.getElementById("trigger_val") as HTMLInputElement;
            if (trigger_val) {
                trigger_val.value = trigger;
                setTriger(trigger);
            }

            if (dripTrigger.value) {
                const trigger_event_val = document.getElementById("trigger_event_val") as HTMLInputElement;
                if (trigger_event_val) {
                    trigger_event_val.value = JSON.stringify(dripTrigger.value);
                    setTrigerEventVal(JSON.stringify(dripTrigger.value));
                }
            }

            const trigger_body = document.getElementById("trigger_body");
            if (trigger_body) {
                trigger_body.innerHTML = "";
                const root = ReactDOM.createRoot(trigger_body);

                root.render(
                    <>
                        <div className="flex items-center w-full border-dashed border-[#eed7d7] hover:bg-[#F3F3F3] 
                            hover:shadow-lg py-1 px-1"onClick={() => ListTriggerEvents('New Account Created')}>
                            <div className="size-8 flex items-center justify-center rounded p-[5px]">
                                <FaUserPlus size={22} className='text-[#006B9F]' />
                            </div>
                            <div className="w-auto mr-auto flex-grow text-left pl-[5px] text-base font-medium text-[#303030] cursor-pointer">
                                New Account Created
                            </div>
                        </div>

                        <div className="flex items-center w-full border-dashed border-[#eed7d7] hover:bg-[#F3F3F3] 
                            hover:shadow-lg py-1 px-1"onClick={() => ListTriggerEvents('Manually Added')}>
                            <div className="size-8 flex items-center justify-center rounded p-[5px]">
                                <TbPointerPlus size={22} className='text-[#006B9F]' />
                            </div>
                            <div className="w-auto mr-auto flex-grow text-left pl-[5px] text-base font-medium text-[#303030] cursor-pointer">
                                Manually Added
                            </div>
                        </div>
                    </>);

                trigger_body.classList.remove("grid");
                trigger_body.classList.add("hidden");
            }


        } else {

            const trigger_body = document.getElementById("trigger_body");
            if (trigger_body) {
                trigger_body.classList.remove("hidden");
                trigger_body.classList.add("grid");
            }

            const selected_trigger_cont = document.getElementById("selected_trigger_cont");
            if (selected_trigger_cont) {
                selected_trigger_cont.classList.remove("hidden");
                selected_trigger_cont.classList.add("block");
            }

        }

    }

    const ListTriggerEvents = (type: string) => {

        // $("#trigger_val").val(trigger); 
        setTriger(type);

        // $(".selected_trigger_name").html(trigger);
        const selected_trigger_name = document.getElementById("selected_trigger_name");
        console.log("type", type)
        if (selected_trigger_name) {
            selected_trigger_name.innerHTML = type;
        }

        // $(".trigger_loader").show();
        const trigger_loader = document.getElementById("trigger_loader");
        if (trigger_loader) {
            trigger_loader.classList.remove("hidden");
            trigger_loader.classList.add("flex");
        }

        let icon = <></>;
        let trigger_text = "";
        if (type == "New Account Created") {
            icon = <FaUserPlus size={45} />
            trigger_text = "1. New Account Created On Main Website";
        } else if (type == "Manually Added") {
            icon = <TbPointerPlus size={45} />
            trigger_text = "1. Drip Manually Added To a Lead";
        }

        const trigger_out = document.getElementById("trigger_out");
        if (trigger_out) {
            trigger_out.innerHTML = trigger_text;
        }

        // $(".trigger_body").hide();
        const trigger_body = document.getElementById("trigger_body");
        if (trigger_body) {
            trigger_body.classList.remove("grid");
            trigger_body.classList.add("hidden");
        }

        // $(".selected_trigger_cont").show();
        const selected_trigger_cont = document.getElementById("selected_trigger_cont");
        if (selected_trigger_cont) {
            selected_trigger_cont.classList.remove("hidden");
            selected_trigger_cont.classList.add("block");
        }

        // $(".trigger_loader").hide();
        if (trigger_loader) {
            trigger_loader.classList.remove("flex");
            trigger_loader.classList.add("hidden");
        }

    }

    const ChangeTrigger = () => {

        toast.dismiss();
        if (isPublishedRef.current == "Yes") {
            toast.error("Sorry, you can't edit an active published automation step. You need to be in edit mode to update step", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const SaveTriggerBtn = document.getElementById("SaveTriggerBtn") as HTMLInputElement;
        if (SaveTriggerBtn) {
            SaveTriggerBtn.classList.remove("hidden");
            SaveTriggerBtn.classList.add("flex");
        }

        //$("#trigger_val").val("");
        const trigger_val = document.getElementById("trigger_val") as HTMLInputElement;
        if (trigger_val) {
            trigger_val.value = "";
            setTriger("");
        }

        //$("#trigger_event").val("");
        const trigger_event = document.getElementById("trigger_event") as HTMLInputElement;
        if (trigger_event) {
            trigger_event.value = "";
            setTrigerEvent("");
        }

        //$("#trigger_event_val").val("");
        const trigger_event_val = document.getElementById("trigger_event_val") as HTMLInputElement;
        if (trigger_event_val) {
            trigger_event_val.value = "";
            setTrigerEventVal("");
        }

        setIcon(<GrTrigger size={45} />);

        //$(".trigger_out").html("1. A trigger is an event that start your Node.");
        const trigger_out = document.getElementById("trigger_out");
        if (trigger_out) {
            trigger_out.innerHTML = "1. A trigger is an event that start your Node.";
        }

        //$(".trigger_event_lists").html("");
        const trigger_event_lists = document.getElementById("trigger_event_lists");
        if (trigger_event_lists) {
            trigger_event_lists.innerHTML = "";
        }

        //$(".trigger_body").show().css("display", "grid");
        const trigger_body = document.getElementById("trigger_body");
        if (trigger_body) {
            trigger_body.classList.remove("hidden");
            trigger_body.classList.add("grid");
        }

        //$(".selected_trigger_cont").hide();
        const selected_trigger_cont = document.getElementById("selected_trigger_cont");
        if (selected_trigger_cont) {
            selected_trigger_cont.classList.remove("block");
            selected_trigger_cont.classList.add("hidden");
        }

        setIsEditingTrigger(true);

        //$this.attr("data-editing", "Yes");
        const trigger_container = document.getElementById("trigger_container");
        if (trigger_container) {
            trigger_container.setAttribute("data-unsaved", "Yes");
        }

    }

    const EditTrigger = async () => {

        const event_trigger = automation_info.trigger.trigger;
        if (!is_editing_tigger) {

            if (!event_trigger || event_trigger == "") {
                toast.error("No trigger added to this automation.", {
                    position: "top-center",
                    theme: "colored"
                });
                return false;
            }

            // $(".trigger_loader").show();
            const trigger_loader = document.getElementById("trigger_loader");
            if (trigger_loader) {
                trigger_loader.classList.remove("hidden");
                trigger_loader.classList.add("flex");
            }

            let icon = <GrTrigger size={45} />;
            if (event_trigger == "New Account Created") {
                icon = <FaUserPlus size={45} />
            } else if (event_trigger == "Manually Added") {
                icon = <TbPointerPlus size={45} />
            }
            setIcon(icon);

            //$("#trigger_val").val(event_trigger);
            const trigger_val = document.getElementById("trigger_val") as HTMLInputElement;
            if (trigger_val) {
                trigger_val.value = event_trigger;
                setTriger(event_trigger);
            }

            //$(".selected_trigger_name").html(event_trigger);
            const selected_trigger_name = document.getElementById("selected_trigger_name");
            if (selected_trigger_name) {
                selected_trigger_name.innerHTML = event_trigger;
            }

            //$("#selected_trigger_cont").show();
            const selected_trigger_cont = document.getElementById("selected_trigger_cont");
            if (selected_trigger_cont) {
                selected_trigger_cont.classList.remove("hidden");
                selected_trigger_cont.classList.add("block");
            }

            //$("#trigger_loader").hide();
            if (trigger_loader) {
                trigger_loader.classList.remove("flex");
                trigger_loader.classList.add("hidden");
            }

            // if (isPublished == "Yes") {
            //     MakeTriggerReadOnly();
            // }

        } else {

            let this_unsaved_trigger = "No";
            const trigger_container = document.getElementById("trigger_container") as HTMLInputElement;
            if (trigger_container) {
                this_unsaved_trigger = trigger_container.getAttribute("data-unsaved") || "No";
            }

            if (this_unsaved_trigger == "Yes") {

                const result = await Swal.fire({
                    title: 'You have an unsaved action. Are you sure you want to continue without saving this trigger event?',
                    text: "This can't be undone",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, Recall',
                });

                if (result.isConfirmed) {

                    setIsEditingTrigger(false);
                    BuildTriggers(automation_info.trigger);
                    //$("#trigger_container").attr("data-unsaved", "No");
                    const trigger_container = document.getElementById("trigger_container") as HTMLInputElement;
                    if (trigger_container) {
                        trigger_container.setAttribute("data-unsaved", "No");
                    }

                    //$("#trigger_header").attr("data-editing", "No");
                    const trigger_header = document.getElementById("trigger_header") as HTMLInputElement;
                    if (trigger_header) {
                        trigger_header.setAttribute("data-editing", "No");
                    }

                    //$("#trigger_loader").hide();
                    const trigger_loader = document.getElementById("trigger_loader");
                    if (trigger_loader) {
                        trigger_loader.classList.remove("flex");
                        trigger_loader.classList.add("hidden");
                    }

                    //$("#trigger_body").hide();
                    const trigger_body = document.getElementById("trigger_body");
                    if (trigger_body) {
                        trigger_body.classList.remove("grid");
                        trigger_body.classList.add("hidden");
                    }

                    //$("#selected_trigger_cont").hide();
                    const selected_trigger_cont = document.getElementById("selected_trigger_cont");
                    if (selected_trigger_cont) {
                        selected_trigger_cont.classList.remove("block");
                        selected_trigger_cont.classList.add("hidden");
                    }

                } else {
                    // Handle cancel action
                    console.log('Canceled');
                }

            } else {

                // $("#trigger_container").attr("data-unsaved", "No");
                const trigger_container = document.getElementById("trigger_container") as HTMLInputElement;
                if (trigger_container) {
                    trigger_container.setAttribute("data-unsaved", "No");
                }

                // $("#trigger_header").attr("data-editing", "No");
                const trigger_header = document.getElementById("trigger_header") as HTMLInputElement;
                if (trigger_header) {
                    trigger_header.setAttribute("data-editing", "No");
                }

                // $("#trigger_loader").hide();
                const trigger_loader = document.getElementById("trigger_loader");
                if (trigger_loader) {
                    trigger_loader.classList.remove("flex");
                    trigger_loader.classList.add("hidden");
                }

                //$("#trigger_body").hide();
                const trigger_body = document.getElementById("trigger_body");
                if (trigger_body) {
                    trigger_body.classList.remove("grid");
                    trigger_body.classList.add("hidden");
                }

                //$("#selected_trigger_cont").hide();
                const selected_trigger_cont = document.getElementById("selected_trigger_cont");
                if (selected_trigger_cont) {
                    selected_trigger_cont.classList.remove("block");
                    selected_trigger_cont.classList.add("hidden");
                }

            }

        }

    }

    const SaveTrigger = () => {

        toast.dismiss();
        if (!trigger) { // || !trigger_event || !trigger_event_val
            toast.error("Please select a valid trigger and event.", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const payload = {
            "resource": "update-trigger",
            "automation_id": automation_id,
            "trigger": trigger,
            // "event_name": trigger_event,
            // "event_value": trigger_event_val
        };

        dispatch(showPageLoader());
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/(automations)/update-automation`, {
            method: 'PATCH',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(payload)
        }).then((resp): Promise<APIResponseProps> => {
            dispatch(hidePageLoader());
            if (!resp.ok) {
                throw new Error("Unable to update trigger.")
            }

            return resp.json();
        }).then(async response => {

            if (response.success == true) {

                let newTrigger = response.data.trigger;
                setIsEditingTrigger(false);

                // $('#trigger_container').attr("data-unsaved", "No");
                const trigger_container = document.getElementById("trigger_container") as HTMLInputElement;
                if (trigger_container) {
                    trigger_container.setAttribute("data-unsaved", "No");
                }

                // $("#trigger_header").attr("data-editing", "No");
                const trigger_header = document.getElementById("trigger_header") as HTMLInputElement;
                if (trigger_header) {
                    trigger_header.setAttribute("data-editing", "No");
                }

                // $(".trigger_loader").hide();

                //$("#trigger_body").hide();
                const trigger_body = document.getElementById("trigger_body");
                if (trigger_body) {
                    trigger_body.classList.remove("grid");
                    trigger_body.classList.add("hidden");
                }

                setTriger(newTrigger.trigger);
                setTrigerEvent(newTrigger.trigger);
                setAutomationInfoSteps((prev_val) => {
                    return {
                        ...prev_val,
                        trigger: newTrigger,
                    }
                });

                toast.success('Trigger successfully updated.', {
                    position: "top-center",
                    theme: "colored"
                })

                const SaveTriggerBtn = document.getElementById("SaveTriggerBtn") as HTMLInputElement;
                if (SaveTriggerBtn) {
                    SaveTriggerBtn.classList.remove("flex");
                    SaveTriggerBtn.classList.add("hidden");
                }

                // $("#selected_trigger_cont").hide();
                const selected_trigger_cont = document.getElementById("selected_trigger_cont");
                if (selected_trigger_cont) {
                    selected_trigger_cont.classList.remove("block");
                    selected_trigger_cont.classList.add("hidden");
                }

                // $("#trigger_out").html(`1. ${event_name}`);
                const trigger_out = document.getElementById("trigger_out");
                if (trigger_out) {
                    trigger_out.innerHTML = `1. ${newTrigger.name}`;
                }

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

    useEffect(() => {
        let icon = <GrTrigger size={45} />;
        if (trigger == "New Account Created") {
            icon = <FaUserPlus size={45} />
        } else if (trigger == "Manually Added") {
            icon = <TbPointerPlus size={45} />
        }
        setIcon(icon);
    }, [trigger])

    const renderSteps = (parentUid: string, isPublishedRef: React.MutableRefObject<string>,
        setAutomationInfoSteps: React.Dispatch<React.SetStateAction<AutomationInfoAndStep>>): React.ReactNode => {
        // Find all steps whose parent_uid matches the given parentUid
        const childSteps = automation_info.steps.filter((step: any) => step.parent_uid === parentUid);

        return childSteps.map((step: any, counter: number) => (
            <>
                <Action key={step.step_id} step={step} counter={counter} isPublishedRef={isPublishedRef} setAutomationInfoSteps={setAutomationInfoSteps}></Action>
                {/* Recursively render children */}
                {renderSteps(step.step_uid, isPublishedRef, setAutomationInfoSteps)}
            </>
        ));
    };

    return (
        <div className='w-full flex flex-col '>
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
                                                id='publish_btn' onClick={() => ChangePublishStatus('Yes')}>
                                                <i className="la la-paper-plane fs-13"></i> Publish
                                            </button>

                                            <button className="edit_btn py-2 px-4 bg-sky-600 text-white rounded-r rounded-br"
                                                id='edit_btn' onClick={() => DuplicateDrip('Edit')}>
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
                                        hover:shadow-xl" id="recall_btn" onClick={RecallDrip}>
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
                                <div className="w-[600px] shadow-md relative border border-zinc-700 select-none"
                                    id="trigger_container" data-unsaved="No">
                                    <div className="w-full flex items-center bg-gray-700 p-4 cursor-pointer" id="trigger_header"
                                        data-editing="No" onClick={EditTrigger}>
                                        <div className="flex items-center justify-center size-16 bg-white" id='trigger_icon'>
                                            {trigger_icon}
                                        </div>
                                        <div className="trigger_info flex flex-col text-white items-center w-auto mr-auto flex-grow 
                                        text-left pl-5">
                                            <h2 className="w-full text-white capitalize m-1 font-normal text-lg">Trigger</h2>
                                            <div className="w-full font-medium text-xl" id="trigger_out">
                                                1. A trigger is an event that start your Node.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full hidden grid-cols-2 gap-5 bg-white p-5" id="trigger_body"></div>

                                    <div className="w-full hidden bg-white h-[200px] items-center justify-center" id="trigger_loader">
                                        <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                                    </div>

                                    <div className="w-full bg-white hidden" id="selected_trigger_cont">
                                        <div className="w-full flex flex-col text-left p-5">
                                            <h3 className="w-full font-semibold text-[#4d4b4b] text-base">Select Trigger Event</h3>
                                            <div className="w-full flex border border-[#E2E2E2] items-center py-1 cursor-pointer" onClick={ChangeTrigger}>
                                                <div className="flex flex-grow p-2 bg-white items-center">
                                                    <div className="flex size-8 items-center justify-center bg-white rounded-lg"
                                                        id="slctd_trgr_icon">
                                                        {trigger_icon}
                                                    </div>
                                                    <div className="w-auto mr-auto flex-grow pl-2 text-left">
                                                        <h2 className="w-full text-[#4d4b4b] font-semibold text-lg mb-0" id="selected_trigger_name"></h2>
                                                    </div>
                                                </div>

                                                <div className="px-2">
                                                    <div className="border border-[#DFDFDF] text-[#0070A6] font-medium py-2 px-4">Change</div>
                                                </div>
                                            </div>

                                            <div className="w-full relative mt-4 hidden">
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

                                            {isPublishedRef.current == "No"
                                                ? <div className="w-full mt-4 hidden justify-end" id="SaveTriggerBtn">
                                                    <div className="py-2 px-5 font-normal bg-gray-700 text-white cursor-pointer 
                                                rounded w-auto" onClick={SaveTrigger}>Continue</div>
                                                </div>
                                                : <div className='text-red-600 mt-3'>
                                                    Sorry, you can't edit an active published automation step. You need to be in edit mode to update step
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    <div className="w-full flex flex-col items-center justify-center absolute z-10" id="trigger_new_block_btn">
                                        <div className='h-[30px] border border-zinc-700'></div>
                                        <div className=" flex items-center justify-center cursor-pointer rounded-full"
                                            data-step-id="0" data-parent-id="-1" data-children="" data-parent-uid="none"
                                            data-parent-type="container"
                                            onClick={() =>
                                                AddNewStep({ parent_id: "-1", parent_uid: "none", parent_type: "container", step_id: "0" })
                                            }>
                                            <FaPlusCircle size={27} className='hover:drop-shadow-lg hover:scale-[1.2] duration-200' />
                                        </div>
                                        <div className='h-[30px] border border-zinc-700'></div>
                                    </div>
                                </div>

                                {
                                    renderSteps("trigger_container", isPublishedRef, setAutomationInfoSteps)
                                }
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


const Action = ({ step, counter, setAutomationInfoSteps, isPublishedRef }:
    {
        step: any, counter: number, isPublishedRef: React.MutableRefObject<string>,
        setAutomationInfoSteps: React.Dispatch<React.SetStateAction<AutomationInfoAndStep>>
    }) => {

    const dispatch = useDispatch();
    const wait_period_ref = useRef<HTMLDivElement>(null);
    const temp_ref = useRef<HTMLDivElement>(null);
    const [is_editing, setIsEditing] = useState("No");
    const isEditingRef = useRef(is_editing);
    const [is_updating, setIsUpdating] = useState(false);
    const [isLoadingActions, setIsLoadingActions] = useState(false);
    const [stepInfo, setStepInfo] = useState<any>();
    const [wait_time, setWaitTime] = useState("");
    const [wait_period, setWaitPeriord] = useState("Hours");
    const [email_templates, SetEmailTemplates] = useState<React.JSX.Element[]>([]);
    const [sms_templates, SetSMSTemplates] = useState<React.JSX.Element[]>([]);
    const [selected_email_template, SetSelectedEmailTemp] = useState("");
    const [selected_email_temp_id, SetSelectedEmailTempID] = useState("");
    const [selected_sms_template, SetSelectedSMSTemp] = useState("");
    const [selected_sms_temp_id, SetSelectedSMSTempID] = useState<any>();
    const [isDelayOpen, setIsDelayOpen] = useState(false);
    const [isTempOpen, setIsTempOpen] = useState(false);

    const handleDelayToggle = () => {
        setIsDelayOpen(!isDelayOpen);
    };

    const handleTempToggle = () => {
        setIsTempOpen(!isTempOpen);
    };

    let step_id = step.step_id;
    let step_uid = step.step_uid;
    let step_type = step.step_type;
    let step_position = step.step_position;
    let parent_id = step.parent_id;
    let parent_uid = step.parent_uid;
    let parent_type = step.parent_type;
    let children = step.children;
    let event_info = step.event_info;
    let event_name = event_info.name;
    let event_trigger = event_info.trigger;

    if (counter == 0) {
        //$("#trigger_new_block_btn").attr("data-children", step_uid);
        const trigger_new_block_btn = document.getElementById("trigger_new_block_btn");
        if (trigger_new_block_btn) {
            trigger_new_block_btn.setAttribute("data-unsaved", step_uid);
        }
    }

    let logo_icon = <></>
    if (event_trigger == "Wait") {
        logo_icon = <FaGears size={45} />;
    } else if (event_trigger == "Send an Email") {
        logo_icon = <MdOutlineEmail size={45} />;
    } else if (event_trigger == "Send an SMS") {
        logo_icon = <FaCommentSms size={45} />;
    }
    const [logo, setLogo] = useState(logo_icon);

    const AddNewStep = async ({ parent_id, parent_uid, parent_type, step_id }: any) => {

        toast.dismiss();
        if (isPublishedRef.current == "Yes") {
            toast.error("Sorry, you can't edit an active published automation step. You need to be in edit mode to update step", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        dispatch(showPageLoader());
        const add_result = await helpers.AddNewStep({ automation_id, parent_id, parent_uid, parent_type, step_id })
        console.log("add_result", add_result)
        dispatch(hidePageLoader());

        if (add_result.success) {

            toast.success("New step successfully added", {
                position: "top-center",
                theme: "colored"
            });

            const detailsPromise: Promise<AutomationInfoAndStep> = helpers.LoadAutomationInfoStep(automation_id);
            const detailsResp = await detailsPromise;
            setAutomationInfoSteps(detailsResp);

        } else {
            toast.error(`${add_result.message}`, {
                position: "top-center",
                theme: "colored"
            })
        }

    }

    let children_container = <></>;
    let addBlckBtn = <></>;
    if (step_type == "Conditional") {
        children_container = <div className="double_action_cont"></div>;
        addBlckBtn = <></>;
    } else if (step_type == "Action") {
        children_container = <></>;
        addBlckBtn = <div className="w-full flex flex-col items-center justify-center absolute z-10"
            id="add_new_block_btn" data-step-id={step_id} data-parent-id={parent_id} data-children={children[0]}
            data-parent-uid={parent_uid} data-parent-type={parent_type}>
            <div className='h-[30px] border border-zinc-700'></div>
            <div className=" flex items-center justify-center cursor-pointer rounded-full"
                data-step-id="0" data-parent-id="-1" data-children=""
                data-parent-uid="none" data-parent-type="container" onClick={() => AddNewStep({ parent_id, parent_uid, parent_type, step_id })}>
                <FaPlusCircle size={27} className='hover:drop-shadow-lg hover:scale-[1.2] duration-200' />
            </div>
            <div className='h-[30px] border border-zinc-700'></div>
        </div>
    }


    const Load_Automation_Step = async ({ automation_id, step_id }: { automation_id: number, step_id: number }) => {

        let payload = {
            "automation_id": automation_id,
            "step_id": step_id
        };

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(automations)/load-single-automation-step`, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(payload)
        }).then(res => {
            return res.json();
        }).then(async response => {
            return response;
        });

    }

    const SetActionTrigger = (step_uid: string, event_name: string, event_trigger: string) => { }

    const SetTemp = (step_uid: string, template_id: number, temp_name: string, type: 'email' | 'sms') => {
        setStepInfo((prev_val: any) => {
            return {
                ...prev_val,
                event_info: {
                    ...prev_val.event_info,
                    value: {
                        ...prev_val.event_info.value,
                        template_id: template_id
                    }
                },
            }
        });

        if (type === 'email') {
            SetSelectedEmailTemp(temp_name);
            SetSelectedEmailTempID(template_id.toString());
        } else if (type === 'sms') {
            SetSelectedSMSTemp(temp_name);
            SetSelectedSMSTempID(template_id);
        }

        setIsEditing("Yes");
        setIsTempOpen(false);
    }

    const SetDelayPeriod = (step_uid: string, delay_period: string) => {
        setWaitPeriord(delay_period);
        setIsDelayOpen(false);
        setIsEditing("Yes");
    }

    const startEditing = async (step_uid: string, step_id: number) => {

        if (isEditingRef.current == "Yes") {
            const result = await Swal.fire({
                title: 'You have an unsaved action. Are you sure you want to continue without saving this step?',
                text: "This can't be undone",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Recall',
            });

            if (result.isConfirmed) {

                setIsEditing("No");
                $("#action_body_" + step_uid).hide();
                $("#selected_action_cont_" + step_uid).hide();

                const detailsPromise: Promise<AutomationInfoAndStep> = helpers.LoadAutomationInfoStep(automation_id);
                const detailsResp = await detailsPromise;
                setAutomationInfoSteps(detailsResp);

            } else {
                // Handle cancel action
                console.log('Canceled');
            }

            return false;
        }

        //$("#action_loader_" + step_uid).show();
        const action_loader = document.getElementById("action_loader_" + step.step_uid);
        if (action_loader) {
            action_loader.classList.remove("hidden");
            action_loader.classList.add("flex");
        }

        $("#selected_action_cont_" + step_uid).hide();

        Load_Automation_Step({ automation_id, step_id }).then(async response => {

            toast.dismiss();
            if ("step_id" in response) {
                setStepInfo(response);
                $("#selected_action_cont_" + step_uid).show();
            }

        }).catch((e: any) => {
            toast.error(`${e.message}`, {
                position: "top-center",
                theme: "colored"
            })
        })
    }

    useEffect(() => {

        if (stepInfo) {
            const response = stepInfo;
            editing_data["value"] = {};
            let event_info = response.event_info;
            let event_name = event_info.name;
            // let wait_time = event_info.wait_time;
            // let wait_period = event_info.wait_period;
            let event_trigger = event_info.trigger;
            setWaitTime(event_info.wait_time);
            setWaitPeriord(event_info.wait_period);

            if (event_trigger == "Wait") {
                setLogo(<FaGears size={25} />);
            } else if (event_trigger == "Send an Email") {
                setLogo(<MdOutlineEmail size={25} />);
            } else if (event_trigger == "Send an SMS") {
                setLogo(<FaCommentSms size={25} />);
            }

            let sub_actions = <></>;
            let action_event_lists = <></>;

            if (event_trigger == "Send an Email") {

                action_event_lists = <div className="event_list" onClick={() => {
                    SetActionTrigger(step_uid, 'Send an Email To Lead', event_trigger);
                }}>
                    <h3 className="w-100">Send an Email To Lead</h3>
                    <div className="w-100">Send an Email To Lead</div>
                    <span className="selected_event_${step_uid}"><i className="icofont icofont-ui-check"></i></span>
                </div>;

                /** Email templates starts **/
                /** Email templates starts **/

                let emailTemps: React.JSX.Element[] = [];
                let evntTempId = "";
                if (event_info.value) {
                    evntTempId = event_info.value.template_id;
                }

                editing_data["value"]["template_id"] = evntTempId;
                let selectedTemp = "";
                if (response.email_templates && response.email_templates.length > 0) {

                    let slctd_temp = response.email_templates.filter((temp: any) => {
                        return temp.template_id == evntTempId;
                    });

                    if (slctd_temp[0] && slctd_temp[0] != null) {
                        selectedTemp = slctd_temp[0].template_name;
                        SetSelectedEmailTempID(slctd_temp[0].template_id);
                    }

                    response.email_templates.forEach((temp: any) => {
                        let temp_name = temp.template_name; //EscapeSingleQuotes()
                        emailTemps.push(
                            <div className="event_list flex flex-col py-4 px-5 border-b border-gray-300 cursor-pointer relative"
                                onClick={() => SetTemp(step_uid, temp.template_id, temp_name, 'email')}>
                                <h3 className="w-full">{temp_name}</h3>
                                <div className="w-full">{temp.email_subject}</div>
                                <span className={`checked_item w-[30px] z-10 absolute top-0 h-full justify-center items-center right-4
                                    ${selectedTemp == temp_name ? "flex" : "hidden"} `}>
                                    <FaCheck size={22} className='text-green-600' />
                                </span>
                            </div>);
                    });

                } else {
                    emailTemps.push(
                        <div className="event_list flex flex-col py-4 px-5 border-b border-gray-300 cursor-pointer relative">
                            <h3 className="w-full text-center">404</h3>
                            <div className="w-full text-center">No email template added yet</div>
                        </div>);
                }

                SetSelectedEmailTemp(selectedTemp);
                SetEmailTemplates(emailTemps);
                /** Email templates ends **/
                /** Email templates ends **/

            } else if (event_trigger == "Send an SMS") {

                action_event_lists = <div className="event_list" onClick={() => {
                    SetActionTrigger(step_uid, 'Send an SMS To Lead', event_trigger);
                }}>
                    <h3 className="w-100">Send an SMS To Lead</h3>
                    <div className="w-100">Send an SMS To Lead</div>
                    <span className="selected_event_${step_uid}"><i className="icofont icofont-ui-check"></i></span>
                </div>;

                /** SMS templates starts **/
                /** SMS templates starts **/

                let smsTemps: React.JSX.Element[] = [];
                let evntTempId = "";
                if (event_info.value) {
                    evntTempId = event_info.value.template_id;
                }

                editing_data["value"]["template_id"] = evntTempId;
                let selectedTemp = "";
                if (response.sms_templates && response.sms_templates.length > 0) {

                    let slctd_temp = response.sms_templates.filter((temp: any) => {
                        return temp.template_id == evntTempId;
                    });

                    if (slctd_temp[0] && slctd_temp[0] != null) {
                        selectedTemp = slctd_temp[0].template_name;
                        SetSelectedSMSTempID(slctd_temp[0].template_id);
                    }

                    response.sms_templates.forEach((temp: any) => {
                        let temp_name = temp.template_name; //EscapeSingleQuotes()
                        smsTemps.push(
                            <div className="event_list flex flex-col py-4 px-5 border-b border-gray-300 cursor-pointer relative"
                                onClick={() => SetTemp(step_uid, temp.template_id, temp_name, 'sms')}>
                                <h3 className="w-full">{temp_name}</h3>
                                <span className={`checked_item w-[30px] z-10 absolute top-0 h-full justify-center items-center right-4
                                    ${selectedTemp == temp_name ? "flex" : "hidden"} `}>
                                    <FaCheck size={22} className='text-green-600' />
                                </span>
                            </div>);
                    });

                } else {
                    smsTemps.push(
                        <div className="event_list flex flex-col py-4 px-5 border-b border-gray-300 cursor-pointer relative">
                            <h3 className="w-full text-center">404</h3>
                            <div className="w-full text-center">No sms template added yet</div>
                        </div>);
                }

                SetSelectedSMSTemp(selectedTemp);
                SetSMSTemplates(smsTemps);
                /** SMS templates ends **/
                /** SMS templates ends **/

            }

            // $("#action_event_cont_" + step_uid).html(action_pannel);
            const action_event_cont = document.getElementById("action_event_cont_" + step.step_uid);
            if (action_event_cont) {
                //action_event_cont.innerHTML = action_pannel;

                const slctd_action_icon = document.getElementById("slctd_action_icon_" + step.step_uid);
                if (slctd_action_icon) {
                    const root = createRoot(slctd_action_icon);
                    root.render(logo);
                }
            }

            // $("#action_loader_" + step_uid).hide();
            const action_loader = document.getElementById("action_loader_" + step_uid);
            if (action_loader) {
                action_loader.classList.remove("flex");
                action_loader.classList.add("hidden");
            }

            // $("#selected_action_cont_" + step_uid).show();
            const selected_action_cont = document.getElementById("selected_action_cont_" + step.step_uid);
            if (selected_action_cont) {
                selected_action_cont.classList.remove("hidden");
                selected_action_cont.classList.add("block");
            }

            const action_event_expand = document.querySelectorAll(".action_event_expand_" + step.step_uid);
            if (action_event_expand.length) {
                action_event_expand.forEach((expand) => {
                    const root = createRoot(expand);
                    root.render(<MdOutlineKeyboardArrowUp />);
                })
            }

            const checked_item = document.querySelectorAll(".checked_item_" + step.step_uid);
            if (checked_item.length) {
                checked_item.forEach((checked) => {
                    const root = createRoot(checked);
                    root.render(<FaCheck size={22} className='text-green-600' />);
                })
            }

            const checked_time = document.querySelectorAll(".checked_time_" + step.step_uid);
            if (checked_time.length) {
                checked_time.forEach((checked) => {
                    const root = createRoot(checked);
                    root.render(<FaCheck size={22} className='text-green-600' />);
                })
            }
        }

    }, [stepInfo]);

    useEffect(() => {
        if (stepInfo && (wait_time || wait_period)) {
            setStepInfo((prev_val: any) => {
                return {
                    ...prev_val,
                    event_info: {
                        ...prev_val.event_info,
                        ...(wait_time && { wait_time }),
                        ...(wait_period && { wait_period }),
                    },
                }
            });
        }
    }, [wait_time, wait_period]);

    useEffect(() => {

        const handleClickOutside = (e: MouseEvent) => {
            if (temp_ref.current && !temp_ref.current.contains(e.target as Node)) {
                setIsTempOpen(false);
            }

            if (wait_period_ref.current && !wait_period_ref.current.contains(e.target as Node)) {
                setIsDelayOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [temp_ref, wait_period_ref]);

    const ChangeAction = (step_id: any, step_uid: any) => {

        toast.dismiss();
        if (isPublishedRef.current == "Yes") {
            toast.error("Sorry, you can't edit an active published automation step. You need to be in edit mode to update step", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const triggerButton = $("#action_body_" + step_uid + " .triger_btn");
        if (triggerButton.length > 0) {
            triggerButton.remove();
        }

        $("#action_body_" + step_uid).show();
        $("#selected_action_cont_" + step_uid).hide();
        setLogo(<FaGears size={45} />)
        setIsEditing("Yes");
        //BuildActions(step_id, step_uid);

    }

    const BuildActionsComponent = ({ step_id, step_uid }: { step_id: any, step_uid: any }) => {

        const handleEmailClick = () => {
            ListActionEvents({ step_id, step_uid, trigger: 'Send an Email' });
        };

        const handleSMSClick = () => {
            ListActionEvents({ step_id, step_uid, trigger: 'Send an SMS' });
        };

        return (
            <div className='w-full action_body'>
                <div className="trigger_btn p-2" onClick={handleEmailClick}>
                    <div className="trigger_btn_icon mr-2">
                        <FaRegEnvelope size={18} />
                    </div>
                    <div className="trigger_btn_name">Send an Email</div>
                </div>

                <div className="trigger_btn p-2" onClick={handleSMSClick}>
                    <div className="trigger_btn_icon mr-2">
                        <FaCommentSms size={18} />
                    </div>
                    <div className="trigger_btn_name">Send an SMS</div>
                </div>

                <div className="trigger_btn p-2 !hidden" onClick={handleSMSClick}>
                    <div className="trigger_btn_icon mr-2">
                        <BsClock size={18} />
                    </div>
                    <div className="trigger_btn_name">Delay</div>
                </div>
            </div>
        );
    };

    const ListActionEvents = async ({ step_id, step_uid, trigger }: { step_id: string, step_uid: string, trigger: string }) => {

        const payload = {
            resource: "change-step-action",
            automation_id: automation_id,
            step_id: step_id,
            step_uid: step_uid,
            trigger,
        };

        toast.dismiss();
        setIsLoadingActions(true);

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const response = await fetch(`${apiBaseUrl}/api/(automations)/update-automation`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            setIsLoadingActions(false);

            const { message, statusCode, success, data } = result;

            if (success) {

                console.log("is_editing 1", is_editing)
                setIsEditing("No");
                $("#action_body_" + step_uid).hide();
                $("#selected_action_cont_" + step_uid).show();

                const detailsPromise: Promise<AutomationInfoAndStep> = helpers.LoadAutomationInfoStep(automation_id);
                const detailsResp = await detailsPromise;
                setAutomationInfoSteps(detailsResp);

                console.log("is_editing 2", is_editing)
                startEditing(step_uid, parseInt(step_id));

            } else {
                toast.error(message, {
                    position: "top-center",
                    theme: "colored"
                });
            }

        } catch (error: any) {
            setIsLoadingActions(false);
            toast.error(error.message || 'An error occurred', {
                position: "top-center",
                theme: "colored"
            });
        }
    };

    const SaveAction = async ({ step_id, step_uid }: { step_id: string, step_uid: string }) => {

        toast.dismiss();
        if (!wait_time || wait_time == "" || !wait_period || wait_period == "") {
            toast.error("Please select a valid waiting time/perior to continue", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        if (parseInt(wait_time) < 1) {
            toast.error("Please select a valid waiting time to continue", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        let payload: any = {
            wait_time: wait_time,
            wait_period: wait_period,
            trigger: event_trigger,
        };

        if (event_trigger == "Send an Email") {

            if (!selected_email_template) {
                toast.error("Please select an email template to continue", {
                    position: "top-center",
                    theme: "colored"
                });
                return false;
            }

            payload["name"] = event_name;
            payload = {
                ...payload,
                //...editing_data,
                email_template: selected_email_temp_id
            }

        } else if (event_trigger == "Send an SMS") {

            if (!selected_sms_template) {
                toast.error("Please select a SMS template to continue", {
                    position: "top-center",
                    theme: "colored"
                });
                return false;
            }

            payload["name"] = event_name;
            payload = {
                ...payload,
                //...editing_data,
                sms_template: selected_sms_temp_id
            }
            console.log("editing_data.template_id", selected_sms_temp_id, payload)
        }

        setIsUpdating(true);
        payload = {
            resource: 'update-step',
            automation_id: automation_id,
            step_id: parseInt(step_id),
            step_uid: step_uid,
            ...payload,
        };

        try {

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const response = await fetch(`${apiBaseUrl}/api/(automations)/update-automation`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            setIsUpdating(false);

            const { message, data, success } = result;

            if (success) {

                toast.success("Step successfully updated.", {
                    position: "top-center",
                    theme: "colored"
                });

                setIsEditing("No");
                $("#action_body_" + step_uid).hide();
                $("#selected_action_cont_" + step_uid).hide();

                const detailsPromise: Promise<AutomationInfoAndStep> = helpers.LoadAutomationInfoStep(automation_id);
                const detailsResp = await detailsPromise;
                setAutomationInfoSteps(detailsResp);

            } else {
                toast.error(message, {
                    position: "top-center",
                    theme: "colored"
                });
            }

        } catch (error: any) {
            setIsUpdating(false);
            toast.error(error.message || 'An error occurred', {
                position: "top-center",
                theme: "colored"
            });
        }
    }

    useEffect(() => {

        isEditingRef.current = is_editing;
        console.log("isEditingRef.current", isEditingRef.current)
        const action_cont = document.getElementById(`action_cont_${step_uid}`) as HTMLInputElement;
        if (action_cont) {
            if (isEditingRef.current == "Yes") {
                action_cont.setAttribute("data-unsaved", "Yes");
            } else {
                action_cont.setAttribute("data-unsaved", "No");
            }
        }

    }, [is_editing, step_uid])

    const DeleteStep = async ({ parent_id, parent_uid, parent_type, step_id }: any) => {

        const result = await Swal.fire({
            title: "Are you sure you want to remove this step?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Recall',
        });

        if (result.isConfirmed) {

            const payload = {
                "resource": "delete-step",
                "automation_id": automation_id,
                "step_id": parseInt(step_id),
                "parent_id": parseInt(parent_id),
                "parent_uid": parent_uid,
                "parent_type": parent_type
            };

            toast.dismiss();
            try {
                dispatch(showPageLoader());
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
                const response = await fetch(`${apiBaseUrl}/api/(automations)/update-automation`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();
                dispatch(hidePageLoader());

                const { message, statusCode, success, data } = result;

                if (success) {

                    const detailsPromise: Promise<AutomationInfoAndStep> = helpers.LoadAutomationInfoStep(automation_id);
                    const detailsResp = await detailsPromise;
                    setAutomationInfoSteps(detailsResp);

                } else {
                    toast.error(message, {
                        position: "top-center",
                        theme: "colored"
                    });
                }

            } catch (error: any) {
                dispatch(hidePageLoader());
                toast.error(error.message || 'An error occurred', {
                    position: "top-center",
                    theme: "colored"
                });
            }

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    return (
        <div className="single_action_cont w-[600px] shadow-md relative border border-zinc-700 select-none"
            id={`action_cont_${step.step_uid}`} data-unsaved="No" data-step-pos={step.step_position}>

            <div className="action_container w-[600px] shadow-md relative border border-zinc-700 select-none" id={step_uid}>
                <div className="action_header w-full flex items-center bg-gray-700 p-4 cursor-pointer" id={`action_header_${step_uid}`}
                    data-editing="No" data-step-id={step_id} data-step-uid={step_uid} onClick={() => startEditing(step_uid, step_id)}>
                    <div className="action_icon flex items-center justify-center size-16 bg-white" id={`action_icon_${step_uid}`}>
                        {logo}
                    </div>
                    <div className="action_info flex flex-col text-white items-center w-auto mr-auto flex-grow text-left pl-5">
                        <h2 className="w-full text-white capitalize m-1 font-normal text-lg" id={`action_name_${step_uid}`}>{step_type}</h2>
                        <div className="action_event_name w-full font-medium text-xl" id={`action_event_name_${step_uid}`}>
                            {step_position}. {event_name}
                        </div>
                    </div>
                    <div className={`action_drop_handle relative group ${isPublishedRef.current == "Yes" ? "hidden" : null}`}
                        id={`action_drop_handle_${step_uid}`} data-step-uid={step_uid}>
                        <FaEllipsisVertical size={45} id={`action_drop_handle_icon_${step_uid}`} className='relative z-10 text-white' />
                        <div className="action_drop_menu w-[150px] hidden absolute top-0 z-20 group-hover:block divide-y overflow-hidden 
                        divide-gray-300 bg-white *:px-4 *:py-4 *:font-medium rounded-md shadow-2xl border border-gray-300 "
                            id={`action_drop_menu_${step_uid}`} data-step-uid={step_uid}>
                            <div className="dropdown-item hover:bg-gray-100" onClick={() => startEditing(step_uid, step_id)}>
                                <i className="la la-edit dd_icon"></i> <span>Edit</span>
                            </div>
                            <div className="dropdown-item hover:bg-gray-100" onClick={() => {
                                DeleteStep({ parent_id, parent_uid, parent_type, step_id })
                            }}>
                                <i className="la la-trash dd_icon"></i> <span>Delete</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-100 hidden" id={`action_body_${step_uid}`}>
                    {isLoadingActions && (
                        <div className="w-full flex bg-white h-[86px] items-center justify-center" id={`action_loader_${step_uid}`}>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>
                    )}

                    {!isLoadingActions && (
                        <BuildActionsComponent step_id={step_id} step_uid={step_uid} />
                    )}
                </div>
                <div className="w-full hidden bg-white h-[200px] items-center justify-center" id={`action_loader_${step_uid}`}>
                    <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                </div>

                <div className="w-full bg-white hidden selected_action_cont" id={`selected_action_cont_${step_uid}`}>
                    <div className="w-full flex flex-col p-5 text-left action_event_cont" id={`action_event_cont_${step_uid}`}>
                        <div className="w-full grid grid-cols-2 gap-5 relative mt-0">
                            <div className="selected_action_event_cont mt-0" id="action_delay_time_cont_${step_uid}">
                                <h3 className="w-full font-semibold">Wait Time <span id="required">*</span></h3>
                                <input type="number" className="action_event" name="wait_time" data-number-input="true"
                                    id="action_delay_time_${step_uid}" placeholder="Enter a value" value={wait_time}
                                    onChange={(e) => {
                                        setWaitTime(e.target.value);
                                        setIsEditing("Yes");
                                    }} />
                            </div>

                            <div className="selected_action_event_cont mt-0 relative" ref={wait_period_ref}>
                                <h3 className="w-full font-semibold">Wait Period <span id="required">*</span></h3>
                                <input type="text" className="action_event" name="action_delay_period" id="action_delay_period_${step_uid}"
                                    readOnly placeholder="Select a delay period" value={wait_period} onClick={handleDelayToggle} />
                                <div className={`size-7 absolute right-2 top-8 text-2xl ${isDelayOpen && "!rotate-180"} transition-all 
                                duration-300`}><MdOutlineKeyboardArrowUp /></div>

                                {isDelayOpen && (
                                    <div className="action_event_lists z-20 absolute h-auto bg-white border 
                                    border-gray-300 shadow-xl w-full" id="action_delay_lists_${step_uid}">
                                        <div className="event_list" onClick={() => SetDelayPeriod(step_uid, 'Minutes')}>
                                            <h3 className="w-100">Minutes</h3>
                                            {wait_period == "Minutes" && (
                                                <span className={`checked_time w-[30px] z-10 flex absolute top-0 h-full justify-center 
                                            items-center right-4`}><FaCheck size={22} className='text-green-600' /></span>
                                            )}
                                        </div>
                                        <div className="event_list" onClick={() => SetDelayPeriod(step_uid, 'Hours')}>
                                            <h3 className="w-100">Hours</h3>
                                            {wait_period == "Hours" && (
                                                <span className={`checked_time w-[30px] z-10 flex absolute top-0 h-full justify-center 
                                            items-center right-4`}><FaCheck size={22} className='text-green-600' /></span>
                                            )}
                                        </div>
                                        <div className="event_list" onClick={() => SetDelayPeriod(step_uid, 'Days')}>
                                            <h3 className="w-100">Days</h3>
                                            {wait_period == "Days" && (
                                                <span className={`checked_time w-[30px] z-10 flex absolute top-0 h-full justify-center 
                                            items-center right-4`}><FaCheck size={22} className='text-green-600' /></span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 className="w-full mt-4 font-semibold">Select To-Do Action</h3>
                        <div className="w-full flex items-center border border-gray-300 p-1 selected_action" id="selected_action_${step_uid}"
                            onClick={() => ChangeAction(step_id, step_uid)}>
                            <div className="flex-grow flex p-2 bg-white items-center" id="selected_action_info_${step_uid}">
                                <div className="bg-white size-7 rounded flex justify-center items-center" id="slctd_action_icon_${step_uid}">{logo}</div>
                                <div className="pl-2 mr-auto flex-grow w-auto text-left" id="slctd_action_info_${step_uid}">
                                    <h2 className="w-full font-normal text-base" id="selected_action_name_${step_uid}">{event_trigger}</h2>
                                </div>
                            </div>

                            <div className="change_action_cont py-2 px-4 hover:shadow-xl font-medium cursor-pointer border border-gray-300">
                                <div className="btn btn-outline no_radius no_shadow">Change</div>
                            </div>
                        </div>

                        <div className="w-full relative mt-4 group hidden hidden-for-239-re" id="selected_action_event_cont_${step_uid}">
                            <h3 className="w-full font-semibold text-base">Event <span id="required">*</span></h3>
                            <input type="text" className="action_event" name="action_event" id="action_event_${step_uid}" readOnly
                                placeholder="Choose an event" value="${event_name}" data-onfocus="ShowActionList('${step_uid}',this);"
                                data-onblur="HideActionList('${step_uid}');" />
                            <div className='size-7 absolute right-2 top-8 text-2xl group-hover:!rotate-180 transition-all 
                            duration-300'><MdOutlineKeyboardArrowUp /></div>

                            <div className="action_event_lists w-full hidden absolute z-10 h-auto max-h-[300px] overflow-y-auto
                            bg-white border border-gray-300 shadow-xl group-hover:block" id="action_event_lists_${step_uid}">
                                {
                                    //action_event_lists
                                }
                            </div>
                        </div>

                        {event_trigger == "Send an Email" && (
                            <div className="w-full relative mt-4 selected_action_event_cont" ref={temp_ref} id={`action_email_temp_cont_${step_uid}`}>
                                <h3 className="w-full font-semibold">Email Template <span id="required">*</span></h3>
                                <input type="text" className="action_event" name="action_email_temp" id="action_email_temp_${step_uid}"
                                    readOnly placeholder="Choose a template" value={selected_email_template} onClick={handleTempToggle} />
                                <div className={`size-7 absolute right-2 top-8 text-2xl ${isTempOpen && "!rotate-180"} transition-all 
                                duration-300`}><MdOutlineKeyboardArrowUp /></div>

                                {isTempOpen && (
                                    <div className="action_event_lists w-full absolute z-20 h-auto max-h-[300px] overflow-y-auto
                                    bg-white border border-gray-300 shadow-xl p-1">
                                        {Array.isArray(email_templates) && (
                                            email_templates.map((temp) => {
                                                return temp;
                                            })
                                        )}
                                    </div>
                                )}
                            </div>)
                        }

                        {event_trigger == "Send an SMS" && (
                            <div className="w-full relative mt-4 selected_action_event_cont" ref={temp_ref} id={`action_sms_temp_cont_${step_uid}`}>
                                <h3 className="w-full font-semibold">SMS Template <span id="required">*</span></h3>
                                <input type="text" className="action_event" name="action_sms_temp" id="action_sms_temp_${step_uid}"
                                    readOnly placeholder="Choose a template" value={selected_sms_template} onClick={handleTempToggle} />
                                <div className={`size-7 absolute right-2 top-8 text-2xl ${isTempOpen && "!rotate-180"} transition-all 
                                duration-300`}><MdOutlineKeyboardArrowUp /></div>

                                {isTempOpen && (
                                    <div className="action_event_lists w-full absolute z-20 h-auto max-h-[300px] overflow-y-auto
                                    bg-white border border-gray-300 shadow-xl p-1">
                                        {Array.isArray(sms_templates) && (
                                            sms_templates.map((temp) => {
                                                return temp;
                                            })
                                        )}
                                    </div>
                                )}
                            </div>)
                        }

                        {isPublishedRef.current == "No"
                            ? <div className="w-full continue_btn_cont mt-4 flex justify-end">
                                {!is_updating
                                    ? <div className="btn w-[130px] py-2 px-5 font-normal bg-gray-700 text-white cursor-pointer 
                                rounded flex items-center justify-center" onClick={() => SaveAction({ step_id, step_uid })}>Continue</div>
                                    : <div className="btn w-[170px] py-2 px-5 font-normal bg-gray-700 text-white cursor-not-allowed 
                                rounded flex items-center justify-center opacity-45">
                                        <AiOutlineLoading3Quarters size={22} className='animate animate-spin mr-2' />
                                        <span>Please wait</span>
                                    </div>}

                                <input type="hidden" name="action_val" id="action_val" />
                                <input type="hidden" name="action_event_val" id="action_event_val" />
                                <textarea className="hidden" value={JSON.stringify(event_info)} />
                            </div>
                            : <div className='text-red-600 mt-2'>
                                Sorry, you can't edit an active published automation step. You need to be in edit mode to update step
                            </div>
                        }

                    </div>
                </div>

                {addBlckBtn}
            </div>

        </div>
    );
};


export default EditAutomation