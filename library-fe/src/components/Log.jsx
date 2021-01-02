import React, { useEffect } from 'react';

let timeoutId;

export default ({ message, setMessage }) => {
    if (!message) return null;

    useEffect(() => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setMessage(''), 5000);
    }, [setMessage]);

    return <p> {message}</p >;
};