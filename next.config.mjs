/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'www.cloudinary.com', 's3.amazonaws.com', 'www.amazonaws.com', 'amazonaws.com', 
        "yaimalamela.com", "www.yaimalamela.com", "local.first1.us"],
    },
    webpack: (config) => {
        config.resolve = {
        ...config.resolve,
            fallback: {
                fs: false,
            },
        };
        return config;
    },
};

export default nextConfig;
