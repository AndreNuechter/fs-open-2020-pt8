import React from 'react';
import { useQuery } from '@apollo/client';
import { RECOMMENDED_BOOKS } from '../queries.js';

export default ({ show }) => {
    if (!show) {
        return null;
    }

    const books = useQuery(RECOMMENDED_BOOKS, {
        variables: {
            genre: localStorage.getItem('library-app-user-favorite-genre') || ''
        }
    });

    if (books.loading) {
        return <div>loading...</div>;
    }

    return (
        <div>
            <h2>Books with your favorite genre</h2>

            <table>
                <tbody>
                    <tr>
                        <th>title</th>
                        <th>author</th>
                        <th>published</th>
                        <th>genres</th>
                    </tr>
                    {books.data.allBooks.map(b =>
                        <tr key={b.title}>
                            <td>{b.title}</td>
                            <td>{b.author.name}</td>
                            <td>{b.published}</td>
                            <td>{b.genres.join(', ')}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};