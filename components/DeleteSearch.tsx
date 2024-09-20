import React, { useState } from 'react'
import { APIResponseProps } from './types';
import Swal from 'sweetalert2';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const DeleteSearch = ({ search_id, user_id }: { search_id: any, user_id: any }) => {

    const [isDeleting, setIsDeleting] = useState(false);

    const deleteSearch = async () => {
        const result = await Swal.fire({
            title: "Are you sure you want to delete this search?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete',
        });

        if (result.isConfirmed) {

            setIsDeleting(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/(searches)/delete-search`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "search_id": search_id,
                    "user_id": user_id
                }),
            }).then((resp): Promise<APIResponseProps> => {
                setIsDeleting(false);
                return resp.json();
            }).then(data => {
                if (data.success) {
                    document.getElementById(`search_id_${search_id}`)?.remove();
                } else {
                    alert("An error occured");
                }
            });

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    return (
        !isDeleting ? <div className='ml-2 xs:ml-4 py-3 px-3 xs:px-10 bg-white text-primary border border-primary font-light text-base 
        hover:drop-shadow-xl flex items-center justify-center'
            onClick={deleteSearch}>
            Delete Search
        </div> : <div className='ml-2 xs:ml-4 py-3 px-3 xs:px-10 bg-white text-primary border border-primary font-light text-base hover:drop-shadow-xl
        flex items-center justify-center cursor-not-allowed'>
            <AiOutlineLoading3Quarters size={17} className='mr-2' />  <span>Please wait...</span>
        </div>

    )
}

export default DeleteSearch