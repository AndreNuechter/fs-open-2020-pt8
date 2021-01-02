import { gql } from '@apollo/client';

const AUTHOR_DETAILS = gql `
fragment AuthorDetails on Author {
    name
    born
    bookCount
    id
}`;

const BOOK_DETAILS = gql `
fragment BookDetails on Book {
    title
    published
    author { ...AuthorDetails }
    genres
    id
}
${AUTHOR_DETAILS}
`;

export const ALL_BOOKS = gql `
query {
    allBooks {
        ...BookDetails
    }
}
${BOOK_DETAILS}
`;

export const RECOMMENDED_BOOKS = gql `
query recommendedBooks($genre: String!) {
    allBooks(genre: $genre) {
        ...BookDetails
    }
}
${BOOK_DETAILS}
`;

export const BOOK_ADDED = gql `
subscription {
    bookAdded {
        ...BookDetails
    }
}
${BOOK_DETAILS}
`;

export const ALL_AUTHORS = gql `
query {
    allAuthors {
        ...AuthorDetails
    }
}
${AUTHOR_DETAILS}
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

export const LOGIN = gql `
mutation login($username: String!, $password: String!) {
    login(
        username: $username,
        password: $password
    ) {
        token
        favoriteGenre
    }
}
`;

export const LOGOUT = gql `
mutation logout($name: String!) {
    logout(
        name: $name
    ) {
        username
    }
}
`;

export const LOGGED_OUT = gql `
subscription {
    loggedOut {
        username
    }
}
`;