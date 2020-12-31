const { ApolloServer, gql, UserInputError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const Book = require('./model/Book.js');
const Author = require('./model/Author.js');

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'
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

type User {
    username: String!
    favoriteGenre: String!
    id: ID!
}

type Token {
    value: String!
}

type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
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

    createUser(
        username: String!
        favoriteGenre: String!
    ): User

    login(
        username: String!
        password: String!
    ): Token
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
        allAuthors: async () => await Author.find({}),
        me: (root, args, context) => context.currentUser
    },
    Author: {
        bookCount: async (root) => await Book.find({ author: root._id }).count()
    },
    Mutation: {
        addBook: async (root, args, context) => {
            if (!context.currentUser) {
                throw new UserInputError('missing credentials')
            }

            let author = await Author.findOne({ name: args.author });

            if (!author) {
                author = await new Author({ name: args.author, bookCount: 0 }).save();
            }

            const newBook = await new Book({ ...args, author: author._id })
                .save()
                .catch(error => {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    });
                });

            await Author.updateOne({ _id: author._id }, { bookCount: author.bookCount + 1 });
            return newBook;
        },
        editAuthor: async (root, args, context) => {
            if (!context.currentUser) {
                throw new UserInputError('missing credentials')
            }

            const author = await Author.findOne({ name: args.name });

            if (author && args.setBornTo !== undefined) {
                await Author
                    .updateOne({ _id: author._id }, { born: args.setBornTo }, { runValidators: true })
                    .catch(error => {
                        throw new UserInputError(error.message, {
                            invalidArgs: args,
                        });
                    });

                return author;
            }
        },
        createUser: (root, args) => {
            const user = new User({ username: args.username });

            return user.save()
                .catch(error => {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                });
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username });

            if (!user || args.password !== 'secred') {
                throw new UserInputError('wrong credentials');
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            };

            return { value: jwt.sign(userForToken, JWT_SECRET) };
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
            const currentUser = await User.findById(decodedToken.id);
            return { currentUser };
        }
    }
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
});