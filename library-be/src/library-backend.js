const { ApolloServer, gql, UserInputError } = require('apollo-server');
const { PubSub } = require('apollo-server');
const jwt = require('jsonwebtoken');
const Book = require('./model/Book.js');
const Author = require('./model/Author.js');
const User = require('./model/User.js');

const pubsub = new PubSub();
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
    token: String!
    favoriteGenre: String
}

type Subscription {
    bookAdded: Book!
    loggedOut: User
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

    logout(name: String): User
}
`;

const resolvers = {
    Query: {
        bookCount: async () => await Book.countDocuments({}),
        authorCount: async () => await Author.countDocuments({}),
        allBooks: async (root, args) => {
            const books = await Book.find({}).populate('author');
            const temp = args.author ? books.filter(b => b.author.name === args.author) : books;
            return args.genre ? temp.filter(b => b.genres.includes(args.genre)) : temp;
        },
        allAuthors: async () => await Author.find({}),
        me: (root, args, { currentUser }) => currentUser._doc
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

            author.bookCount += 1;
            await author.save();

            pubsub.publish('BOOK_ADDED', {
                bookAdded: {
                    author,
                    title: newBook.title,
                    published: newBook.published,
                    genres: newBook.genres,
                    id: newBook._id
                }
            });

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
            const favoriteGenre = user.toObject().favoriteGenre;

            return { token: jwt.sign(userForToken, JWT_SECRET), favoriteGenre };
        },
        logout: (root, args, { currentUser }) => {
            pubsub.publish('LOGGED_OUT', {
                loggedOut: {
                    ...currentUser._doc
                }
            });
            return currentUser._doc;
        }
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        },
        loggedOut: {
            subscribe: () => pubsub.asyncIterator(['LOGGED_OUT'])
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

server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`Server ready at ${url}`);
    console.log(`Subscriptions ready at ${subscriptionsUrl}`);
});