const authors = require('./src/data/authors.json')
const books = require('./src/data/books.json')

exports.sourceNodes = ({ actions, createNodeId, createContentDigest}) => {
    const { createNode, createTypes } = actions; // create nodes which we'll pull out from actions object

    createTypes(`
        type Author implements Node {
            books: [Book!]! @link(from: "slug" by: "author.slug")
        }

        type Book implements Node {
            author: Author! @link(from: "author" by: "slug")
        }
    `)

    authors.forEach((author) => {
        createNode({
            ...author,
            id: createNodeId(`author-${author.slug}`),
            parent: null,
            children: [],
            internal: {
                type: 'Author',
                content: JSON.stringify(author),
                contentDigest: createContentDigest(author),// the other way of validating of files content match what they did at the time of publishing
            }
        })
    })
        
    books.forEach((book) => {
        createNode({
            ...book,
            id: createNodeId(`book-${book.isbn}`),
            parent: null,
            children: [],
            internal: {
                type: 'Book',
                content: JSON.stringify(book),
                contentDigest: createContentDigest(book),// the other way of validating of files content match what they did at the time of publishing
            }
        })
    })

} // to load up data into gatsby

exports.createPages = ({ actions }) => {
    const { createPage } = actions;

    // We'll pass createPage as an object
    createPage({
        path: '/custom',
        component: require.resolve('./src/templates/custom.js'), // look for a react component file that it'll use to render the page
        context: {
            title: 'A Custom Page!',
            meta: {
                description: 'A custom page with context',
            }
        } // whatever we pass here is gonna be available to our gatsby site


    })
}