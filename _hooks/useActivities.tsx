"use client"

import moment from 'moment';
import { useEffect, useState } from 'react';

export const useLastSeen = (user_id: number, updateInterval = 60000) => {
    const [last_seen, setLastSeen] = useState(new Date());
    const [last_activity, setLastActivity] = useState(new Date());

    const updateLastActivity = () => {
        setLastActivity(new Date());
    };

    useEffect(() => {
        const handleActivity = () => {
            updateLastActivity();
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('keypress', handleActivity);

        if (moment().diff(moment(last_seen), 'minutes') >= 1 && user_id && user_id > 0) {
            setLastSeen(last_activity);
            sendLastSeenToBackend(user_id, last_activity);
        }

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('keypress', handleActivity);
        };
    }, [last_seen, last_activity, updateInterval, user_id]);

    return last_activity;
};

const sendLastSeenToBackend = async (user_id: number, lastSeen: Date) => {
    try {
        console.log("user_id:", user_id, "lastSeen:", lastSeen)
        const response = await fetch('/api/(users)/update-last-seen', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: user_id, last_seen: lastSeen }),
        });
        if (!response.ok) {
            throw new Error('Failed to send last seen timestamp to backend');
        }
    } catch (error) {
        console.error(error);
    }
};
