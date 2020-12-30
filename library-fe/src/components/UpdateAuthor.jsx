import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../queries/queries.js';

export default ({ authors }) => {
    const [author, setAuthor] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
        refetchQueries: [
            { query: ALL_AUTHORS }
        ]
    });
    const placeholder = '-';

    const submit = async (event) => {
        event.preventDefault();
        if (author === placeholder) return;

        updateAuthor({
            variables: { name: author, born: dateOfBirth }
        }).catch(console.log);

        setAuthor(placeholder);
        setDateOfBirth('');
    };

    return (
        <div>
            <form onSubmit={submit}>
                <h2>Set date of birth</h2>
                <div>
                    Author
                    <select onChange={({ target: { value } }) => {
                        setAuthor(value);
                        const author = authors.find(({ name }) => name === value);
                        setDateOfBirth(author ? author.born : placeholder);
                    }} value={author}>
                        {[{ name: placeholder }, ...authors].map(({ name }) => <option key={name}>{name}</option>)}
                    </select>
                </div>
                <div>
                    Date of birth
                    <input
                        value={dateOfBirth || placeholder}
                        onChange={({ target: { value } }) => setDateOfBirth(+value)}
                    />
                </div>
                <button type='submit'>update author</button>
            </form>
        </div>
    );
};