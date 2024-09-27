"use client"

import { Helpers } from '@/_lib/helpers';
import FacebookLoginButton from '@/components/FacebookLoginButton';
import { useEffect, useState } from 'react';
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/user/userSlice';
import { useDispatch } from 'react-redux';
import moment from 'moment';

const helpers = new Helpers();
export default function Home() {
    const [short_token, setShortToken] = useState(null);
    const [long_token, setLongToken] = useState(null);
    const [error, setError] = useState(null);
    const [info_fetched, setInfoFetched] = useState(false);
    const [fb_app_id, setFBappID] = useState("");
    const [comp_info, setCompInfo] = useState<any>({});
    const [token_expires_in, setTokenExpiresIn] = useState(0);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetch_info = async () => {
            const comp_info_prms = helpers.FetchCompanyInfo();
            const comp_info = await comp_info_prms;

            if (comp_info.success && comp_info.data) {
                if (comp_info.data.privacy_policy != "") {
                    setLongToken(comp_info.data.facebook_short_token);
                    setShortToken(comp_info.data.facebook_long_token);
                    setFBappID(comp_info.data.facebook_page_app_id);
                    setCompInfo(comp_info.data);
                    setTokenExpiresIn(moment(comp_info.data.facebook_long_token_expiry).diff(moment(), 'days'));
                    setInfoFetched(true);
                }
                dispatch(hidePageLoader())
            }
        }

        dispatch(showPageLoader())
        fetch_info();
    }, [])


    // Handle successful login
    const handleLoginSuccess = async (shortLivedUserToken: any) => {
        setError(null);
        try {
            const response = await fetch('/api/facebook/facebook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    short_token: shortLivedUserToken,
                    facebook_page_app_id: comp_info?.facebook_page_app_id,
                    facebook_page_app_secret: comp_info?.facebook_page_app_secret,
                }),
            });

            const resp = await response.json();

            if (response.ok) {
                setCompInfo((prev_state: any) => {
                    return {
                        ...prev_state,
                        facebook_long_token: resp.data.long_token,
                        facebook_short_token: resp.data.short_token,
                        facebook_long_token_expiry: resp.data.expiry_date
                    }
                });

                setShortToken(resp.data.short_token);
                setLongToken(resp.data.long_token);
                setTokenExpiresIn(moment(resp.data.expiry_date).diff(moment(), 'days'));

            } else {
                setError(resp.data.message);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className='w-full max-w-[1000px] break-words flex flex-col'>
            <h1>Facebook Page Credentiasl</h1>

            {short_token && <div className=' pr-4 mt-4'><strong>short Token: </strong> {short_token}</div>}
            {long_token && <div className=' pr-4 mt-5'><strong>Long Token: </strong> {long_token}</div>}
            {long_token && <div className='mt-4'><strong>Long Token Expires In: </strong>
                {token_expires_in > 0
                    ? `${token_expires_in} Days`
                    : <span className='text-red-500 font-semibold'>Expired</span>}
            </div>}
            {error && <div className=' text-red-600 mt-4'><strong>Error:</strong> {error}</div>}

            {info_fetched && <FacebookLoginButton onLoginSuccess={handleLoginSuccess} fb_app_id={fb_app_id} />}
        </div>
    );
}
