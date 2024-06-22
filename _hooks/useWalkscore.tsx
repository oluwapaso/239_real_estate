import { Helpers } from '@/_lib/helpers';
import { useState, useEffect } from 'react';

const useWalkScore = (lat: string, lon: string, address: string) => {

    const [walkScore, setWalkScore] = useState<any>({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const helper = new Helpers();

    useEffect(() => {

        const fetchWalkScore = async () => {
            try {

                const api_info_prms = helper.FetchAPIInfo();
                const api_info = await api_info_prms
                let apiKey = "";
                if (api_info.success && api_info.data) {
                    apiKey = api_info.data.walkscore_api;
                } else {
                    throw new Error('Walk score API key not found in database');
                }

                const url = `${process.env.NEXT_PUBLIC_PHP_REQUESTS_URL}/next-requests/walk_score.php?address=${address}&lat=${lat}&lon=${lon}&transit=1&bike=1&api_key=${apiKey}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log("data:", data)
                setWalkScore(data);

            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (lat != "" && lon != "" && address != '') {
            fetchWalkScore();
        }

    }, [lat, lon, address]);

    return { walkScore, error, loading };
};

export default useWalkScore;
