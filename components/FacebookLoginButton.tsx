import { useEffect, useState } from 'react';

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

interface FacebookLoginButtonProps {
    onLoginSuccess: (shortLivedUserToken: string) => void;
    fb_app_id: string;
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({ onLoginSuccess, fb_app_id }) => {

    console.log("fb_app_id", fb_app_id)
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);
    useEffect(() => {

        console.log("Preping!!!!")

        // Load the Facebook SDK for JavaScript
        const fbAsyncInit = function () {
            window.FB.init({
                appId: fb_app_id, // Ensure this is available in your .env.local file
                cookie: true,
                xfbml: true,
                version: 'v15.0',
            });
            setIsSdkLoaded(true); // SDK is ready
            console.log("SDK Ready!!!!")
        };

        // Dynamically load the Facebook SDK script
        if (!window.FB) {
            (function (d, s, id) {
                const fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;

                // Cast to HTMLScriptElement to access the 'src' property
                const js = document.createElement(s) as HTMLScriptElement;
                js.id = id;
                js.src = 'https://connect.facebook.net/en_US/sdk.js';
                js.onload = fbAsyncInit; // Ensure the SDK is loaded before initializing
                fjs.parentNode!.insertBefore(js, fjs);
            })(document, 'script', 'facebook-jssdk');
        } else {
            // SDK already loaded, initialize it
            fbAsyncInit();
        }
    }, []);

    const handleLogin = () => {
        if (isSdkLoaded) {
            window.FB.login(
                function (response: any) {
                    if (response.authResponse) {
                        const shortLivedUserToken = response.authResponse.accessToken;
                        // Send the short-lived token to the parent component for further processing
                        onLoginSuccess(shortLivedUserToken);
                    } else {
                        console.error('User cancelled login or did not fully authorize.');
                    }
                },
                { scope: 'pages_manage_posts,pages_read_engagement' } // Request necessary permissions
            );
        } else {
            console.error('Facebook SDK is not yet initialized.');
        }
    };

    return (
        <div onClick={handleLogin} className=' mt-6 py-3 px-5 flex items-center justify-center w-52 cursor-pointer bg-primary 
        text-white hover:bg-gray-400 hover:border-primary hover:text-primary hover:shadow-2xl rounded-md'>
            Get New Token
        </div>
    );
};

export default FacebookLoginButton;