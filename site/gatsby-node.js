const fetch = require('node-fetch')
const { createRemoteFileNode } = require('gatsby-source-filesystem') // to display images of the book(cover)
const slugify = require('slugify')

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

exports.createPages = async ({ actions, graphql }) => {
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

    const result = await graphql(`
      query GetBooks {
        allBook {
          nodes {
            id
            series
            name
          }
        }
      }   
    `);

    const books = result.data.allBook.nodes;

    books.forEach((book) => {
      const bookSlug = slugify(book.name, { lower: true});

 if (book.series === null) {
      createPage({
        path: `/book/${bookSlug}`,
        component: require.resolve('./src/templates/book.js'),
        context: {
          id: book.id,
        },
      });
      } else {
        const seriesSlug = slugify(book.series, {lower: true})

        createPage({
          path: `/book/${seriesSlug}/${bookSlug}`,
          component: require.resolve('./src/templates/book.js'),
          context: {
            id: book.id,
          }
        })
      }
    })
}

exports.createResolvers = ({ 
    actions,
    cache,
    createNodeId,
    createResolvers,
    store,
    reporter,
 }) => {
    const { createNode } = actions;
    const resolvers = {
        Book: {
            buyLink: {
                type: 'String',
                resolve: (source) => `https://www.powells.com/searchresults?keyword=${source.isbn}`
            },
            cover: {
                type: 'File',
                resolve: async(source) => { //because we are gonna make a request to fetch api so we'll use async
                    const response = await fetch(
                        `https://openlibrary.org/isbn/${source.isbn}.json`
                        )

                        if(!response.ok) {
                            reporter.warn(
                                `Error loading details about ${source.name} - got ${response.status} ${response.statusText}`
                            )
                            return null;
                        }

                        const { covers } = await response.json()

                        if(covers.length) {
                            return createRemoteFileNode({
                                url: `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg`,
                                store,
                                cache,
                                createNode,
                                createNodeId,
                                reporter
                            })
                        } else {
                            return null;
                        }
                } 
            }
        }
    }

    createResolvers(resolvers)
}