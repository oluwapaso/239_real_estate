"use client";

import { MdClose } from "react-icons/md";

function AuthModal({ children, show, closeModal, title }: { children: React.ReactNode, show: boolean, closeModal: () => void, title: string }) {

    return (
        show && (
            <dialog className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-[200] overflow-auto backdrop-blur-sm flex 
            justify-center items-center overflow-y-auto py-3">
                <div className={`bg-white m-auto relative rounded overflow-hidden w-[500px] max-w-[95%]`}>
                    <div className="w-full px-6 py-4 flex justify-between items-center relative bg-gray-50">
                        <h2 className="font-semibold text-md uppercase text-xl">{title}</h2>
                        <div className="text-black flex justify-center items-center cursor-pointer self-start "
                            onClick={closeModal}>
                            <MdClose size={25} className="font-bold text-red-600" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center w-full px-3 xs:px-6 py-3 mt-2 mb-2">
                        {children}
                    </div>
                </div>
            </dialog>
        )
    );
}

export default AuthModal;