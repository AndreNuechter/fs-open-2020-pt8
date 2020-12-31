import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../queries/queries.js';

export default ({ authors }) => {
    const placeholder = '-';
    const [author, setAuthor] = useState(placeholder);
    const [dateOfBirth, setDateOfBirth] = useState(placeholder);
    const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
        refetchQueries: [
            { query: ALL_AUTHORS }
        ]
    });

    const selectAuthor = ({ target: { value } }) => {
        const author = authors.find(({ name }) => name === value);
        const born = !author || author.born === null
            ? placeholder
            : author.born;
        setAuthor(value);
        setDateOfBirth(born);
    };
    const submit = async (event) => {
        event.preventDefault();
        if (author === placeholder || !/\d+/.test(dateOfBirth)) return;

        updateAuthor({
            variables: { name: author, born: +dateOfBirth }
        }).catch(console.error);

        setAuthor(placeholder);
        setDateOfBirth(placeholder);
    };

    return (
        <div>
            <form onSubmit={submit}>
                <h2>Set date of birth</h2>
                <div>
                    Author
                    <select onChange={selectAuthor} value={author}>
                        {[{ name: placeholder }, ...authors].map(({ name }) => <option key={name}>{name}</option>)}
                    </select>
                </div>
                <div>
                    Date of birth
                    <input
                        value={dateOfBirth}
                        onChange={({ target: { value } }) => setDateOfBirth(value)}
                    />
                </div>
                <button type='submit'>update author</button>
            </form>
        </div>
    );
};