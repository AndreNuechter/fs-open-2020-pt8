import React, { useState, useEffect } from 'react';
import { useApolloClient, useSubscription, useMutation } from '@apollo/client';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Login from './components/Login';
import Log from './components/Log';
import Recommendations from './components/Recommendations';
import { BOOK_ADDED, ALL_AUTHORS, ALL_BOOKS, RECOMMENDED_BOOKS, LOGOUT, LOGGED_OUT } from './queries.js';

export default () => {
    const [page, setPage] = useState('authors');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const client = useApolloClient();
    const [logoutMutation] = useMutation(LOGOUT);
    const logout = async () => {
        await logoutMutation({
            variables: { name: 'foo' }
        });
    };

    useEffect(() => {
        setToken(localStorage.getItem('library-app-user-token') || '');
    }, []);

    useSubscription(LOGGED_OUT, {
        onSubscriptionData: () => {
            setToken(null);
            localStorage.clear();
            client.resetStore();
            setPage('authors');
            setMessage('Logged out');
        }
    });

    useSubscription(BOOK_ADDED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const bookAdded = subscriptionData.data.bookAdded;
            const title = bookAdded.title;
            const author = bookAdded.author.name;
            setMessage(`Added ${title} by ${author}`);

            // TODO login?
            const storedBooks = client.readQuery({ query: ALL_BOOKS });
            if (storedBooks && !storedBooks.allBooks.find(b => b.id === bookAdded.id)) {
                client.writeQuery({
                    query: ALL_BOOKS,
                    data: { allBooks: storedBooks.allBooks.concat(bookAdded) }
                });
            }

            const storedAuthors = client.readQuery({ query: ALL_AUTHORS });
            if (storedAuthors && !storedAuthors.allAuthors.find(a => a.name === author)) {
                client.writeQuery({
                    query: ALL_AUTHORS,
                    data: { allAuthors: storedAuthors.allAuthors.concat(bookAdded.author) }
                });
            }

            const genre = localStorage.getItem('library-app-user-favorite-genre');

            if (bookAdded.genres.includes(genre)) {
                const storedRecommendations = client.readQuery({
                    query: RECOMMENDED_BOOKS,
                    variables: { genre }
                });

                if (storedRecommendations) {
                    client.writeQuery({
                        query: RECOMMENDED_BOOKS,
                        variables: { genre },
                        data: { allBooks: storedRecommendations.allBooks.concat(bookAdded) }
                    });
                }
            }
        }
    });

    return (
        <div>
            <div>
                <button onClick={() => setPage('authors')}>authors</button>
                <button onClick={() => setPage('books')}>books</button>
                {token && <button onClick={() => setPage('recommendations')}>recommendations</button>}
                {token && <button onClick={() => setPage('add')}>add book</button>}
                {token
                    ? <button onClick={logout}>logout</button>
                    : <button onClick={() => setPage('login')}>login</button>
                }
            </div>

            <Log message={message} setMessage={setMessage} />

            <Login show={page === 'login'} setToken={setToken} setPage={setPage} setMessage={setMessage} />
            <Authors show={page === 'authors'} token={token} setMessage={setMessage} />
            <Books show={page === 'books'} />
            <Recommendations show={token && page === 'recommendations'} />
            <NewBook show={token && page === 'add'} setMessage={setMessage} />
        </div>
    );
};