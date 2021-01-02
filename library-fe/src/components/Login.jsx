import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../queries';

export default ({ show, setToken, setPage, setMessage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [login, result] = useMutation(LOGIN);
    useEffect(() => {
        if (result.data) {
            const { token, favoriteGenre } = result.data.login;
            setToken(token);
            localStorage.setItem('library-app-user-token', token);
            localStorage.setItem('library-app-user-favorite-genre', favoriteGenre);
        }
    }, [result.data, setToken]);
    const submit = async (event) => {
        event.preventDefault();
        login({ variables: { username, password } })
            .then(() => {
                setPage('authors');
                setUsername('');
                setPassword('');
                setMessage(`Hello ${username}`);
            })
            .catch((error) => setMessage(error.message));
    };

    if (!show) return null;

    return (
        <div>
            <form onSubmit={submit}>
                <h2>Login</h2>
                <div>
                    username <input
                        value={username}
                        onChange={({ target: { value } }) => setUsername(value)}
                    />
                </div>
                <div>
                    password <input
                        type='password'
                        value={password}
                        onChange={({ target: { value } }) => setPassword(value)}
                    />
                </div>
                <button>login</button>
            </form>
        </div>
    );
};