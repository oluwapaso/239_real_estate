import React, { useState } from 'react';
import Image from 'next/image';

const ImageWithFallback = (props: any) => {
    const { src, fallbackSrc, ...rest } = props;
    const [imgSrc, setImgSrc] = useState(src);

    return <img {...rest} src={imgSrc} onError={() => { setImgSrc(fallbackSrc); }} />
};

export default ImageWithFallback;