const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const authors = require('./authors.js');
const books = require('./books.js');

const typeDefs = gql `
type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int!
}

type Book {
    title: String!
    published: Int!
    author: String!
    id: ID!
    genres: [String!]!
}

type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
}

type Mutation {
    addBook(
    title: String!
    author: String!
    published: Int
    genres: [String!]!
    ): Book

    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author
}
`

const resolvers = {
    Query: {
        bookCount: () => books.length,
        authorCount: () => authors.length,
        allBooks: (root, args) => {
            const temp = args.author ? books.filter(b => b.author === args.author) : books;
            return args.genre ? temp.filter(b => b.genres.includes(args.genre)) : temp;
        },
        allAuthors: () => authors
    },
    Author: {
        bookCount: (root) => books.filter(b => b.author === root.name).length
    },
    Book: {
        author: (root) => authors.find(a => a.name === root.author).name
    },
    Mutation: {
        addBook: (root, args) => {
            const book = { ...args, id: uuid() };
            if (!authors.find(a => a.name === args.author)) {
                authors.push({
                    name: args.author,
                    id: uuid()
                });
            }

            books.push(book);
            return book;
        },
        editAuthor: (root, args) => {
            const author = authors.find(a => a.name === args.name);

            if (author && args.setBornTo !== undefined) {
                author.born = args.setBornTo;

                return author;
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})