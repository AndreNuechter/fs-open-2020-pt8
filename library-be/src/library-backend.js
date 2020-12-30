const { ApolloServer, gql } = require('apollo-server');
const Book = require('./model/Book.js');
const Author = require('./model/Author.js');

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
    author: Author!
    genres: [String!]!
    id: ID!
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
`;

const resolvers = {
    Query: {
        bookCount: async () => await Book.find({}).count(),
        authorCount: async () => await Author.find({}).count(),
        allBooks: async (root, args) => {
            const books = await Book.find({}).populate('author');
            // const temp = args.author ? books.filter(b => b.author === args.author) : books;
            return args.genre ? books.filter(b => b.genres.includes(args.genre)) : books;
        },
        allAuthors: async () => await Author.find({})
    },
    Author: {
        bookCount: async (root) => await Book.find({ author: root._id }).count()
    },
    Mutation: {
        addBook: async (root, args) => {
            let author = await Author.findOne({ name: args.author });

            if (!author) {
                author = await new Author({ name: args.author, bookCount: 0 }).save();
            }

            const newBook = await new Book({ ...args, author: author._id }).save();

            await Author.updateOne({ _id: author._id }, { bookCount: author.bookCount + 1 }, { runValidators: true });
            return newBook;
        },
        editAuthor: async (root, args) => {
            const author = await Author.findOne({ name: args.name });

            if (author && args.setBornTo !== undefined) {
                await Author.updateOne({ _id: author._id }, { born: args.setBornTo }, { runValidators: true });

                return author;
            }
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
});