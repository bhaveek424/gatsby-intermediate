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