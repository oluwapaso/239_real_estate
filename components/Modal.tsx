"use client";

import { MdClose } from "react-icons/md";

function Modal({ children, show, width, closeModal, title }:
    { children: React.ReactNode, show: boolean, width: number, closeModal: () => void, title: React.JSX.Element }) {

    return (
        show && (
            <dialog className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-[150] overflow-auto backdrop-blur flex 
            justify-center items-center">
                <div style={{ width: `${width}px` }} className={`bg-white m-auto relative rounded overflow-visible max-w-[95%]`}>
                    <div className="w-full px-6 py-4 flex justify-between items-center relative bg-gray-50">
                        <h2 className="font-semibold text-md ">{title}</h2>
                        <div className="text-black flex justify-center items-center cursor-pointer self-start "
                            onClick={closeModal}>
                            <MdClose size={25} className="font-bold text-red-600 hover:scale-125 duration-300" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center w-full px-6 py-3 mt-2 mb-2">
                        {children}
                    </div>
                </div>
            </dialog>
        )
    );
}

export default Modal;