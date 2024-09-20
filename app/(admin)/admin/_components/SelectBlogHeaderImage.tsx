import React from 'react'

const SelectBlogHeaderImage = ({ selectedImage, setSelectedImage, setSelectedFile, headerImage }:
    {
        selectedImage: string, setSelectedImage: (value: React.SetStateAction<string>) => void,
        setSelectedFile: (value: React.SetStateAction<File | undefined>) => void, headerImage?: any
    }) => {

    let header_image = ""
    if (headerImage && headerImage != "") {
        header_image = headerImage?.image_loc;
    }

    return (
        <div className='w-full mt-2'>

            {(selectedImage || header_image) && (
                <div className="w-full rounded mb-2 flex items-center justify-center border-2 border-dashed cursor-pointer">
                    <img src={selectedImage || header_image} alt="" />
                </div>)
            }

            <label>
                <input type='file' hidden onChange={({ target }) => {
                    if (target.files) {
                        const file = target.files[0];
                        setSelectedImage(URL.createObjectURL(file));
                        setSelectedFile(file);
                    }
                }} />
                <div className="w-full mt-2 py-3 flex items-center justify-center border-2 border-dashed cursor-pointer">
                    Select an Image
                </div>
            </label>
        </div>
    )
}

export default SelectBlogHeaderImage