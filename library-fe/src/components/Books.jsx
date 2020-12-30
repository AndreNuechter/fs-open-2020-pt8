import React from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries/queries.js';

export default ({ show }) => {
    if (!show) {
        return null;
    }

    const books = useQuery(ALL_BOOKS);

    if (books.loading) {
        return <div>loading...</div>;
    }

    return (
        <div>
            <h2>books</h2>

            <table>
                <tbody>
                    <tr>
                        <th>title</th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {books.data.allBooks.map(a =>
                        <tr key={a.title}>
                            <td>{a.title}</td>
                            <td>{a.author.name}</td>
                            <td>{a.published}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};