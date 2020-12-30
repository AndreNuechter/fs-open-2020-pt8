import { gql } from '@apollo/client';

export const ALL_BOOKS = gql `
query {
    allBooks {
        title
        published
        author { name }
        id
    }
}
`;

export const ALL_AUTHORS = gql `
query {
    allAuthors {
        name
        born
        bookCount
        id
    }
}
`;

export const CREATE_BOOK = gql `
mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
    addBook(
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
    ) {
        title
    }
}
`;

export const UPDATE_AUTHOR = gql `
mutation updateAuthor($name: String!, $born: Int!) {
    editAuthor(
        name: $name,
        setBornTo: $born
    ) {
        name
    }
}
`;