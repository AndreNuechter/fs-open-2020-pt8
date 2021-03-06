import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries.js';

export default ({ show }) => {
    if (!show) {
        return null;
    }

    const [filter, setFilter] = useState('');
    const books = useQuery(ALL_BOOKS);

    if (books.loading) {
        return <div>loading...</div>;
    }

    const genres = [...new Set(books.data.allBooks.flatMap(b => b.genres))];

    return (
        <div>
            <h2>Books</h2>

            {<p>Showing {
                filter
                    ? `only books in the genre ${filter}`
                    : 'all books'}</p>}

            <table>
                <tbody>
                    <tr>
                        <th>title</th>
                        <th>author</th>
                        <th>published</th>
                        <th>genres</th>
                    </tr>
                    {books.data.allBooks.filter(b => !filter || b.genres.includes(filter)).map(b =>
                        <tr key={b.title}>
                            <td>{b.title}</td>
                            <td>{b.author.name}</td>
                            <td>{b.published}</td>
                            <td>{b.genres.join(', ')}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {genres.map(g => <button key={g} onClick={() => setFilter(g)}>{g}</button>)}
            {filter && <button onClick={() => setFilter('')}>clear filter</button>}
        </div>
    );
};