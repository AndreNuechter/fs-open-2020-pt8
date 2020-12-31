import React from 'react';
import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../queries/queries.js';
import UpdateAuthor from './UpdateAuthor.jsx';

export default ({ show }) => {
    if (!show) {
        return null;
    }

    const authors = useQuery(ALL_AUTHORS);

    if (authors.loading) {
        return <div>loading...</div>;
    }

    return (
        <div>
            <h2>authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th>name</th>
                        <th>born</th>
                        <th>books</th>
                    </tr>
                    {authors.data.allAuthors.map(a =>
                        <tr key={a.id}>
                            <td>{a.name}</td>
                            <td>{a.born}</td>
                            <td>{a.bookCount}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <UpdateAuthor authors={authors.data.allAuthors} />
        </div>
    );
};