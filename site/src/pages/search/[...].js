import * as React from 'react'; 
import { navigate } from 'gatsby'

import {form, input, button } from '../../styles/search.module.css'

export default function SearchClientOnly({ params }) {
    const query = decodeURIComponent(params['*'])
    const [currentQuery, setCurrentQuerry] = React.useState(query)
    const [result, setResult] = React.useState(null)
    const [status, setStatus] = React.useState('IDLE')

    function handleSearch(event) {
        event.preventDefault(); // prevent form from actually submitting and let us deal with it

        const form = new FormData(event.target) //build in browser form data api to get the data
        const query = form.get('search')

        setCurrentQuerry(query);
        navigate(`/search/${encodeURIComponent(query)}`)
    }

    function handleSearchReset() {
        setCurrentQuerry("")
        navigate(`/search/`)
    }

    async function bookSearch(query) {
        //TODO actually look up a book
        setStatus('LOADING')
        const res = await fetch(`https://openlibrary.org/search.json?q=${query}`)

        if(!res.ok) {
            throw new Error(`Search failed: ${res.status}`)
        }

        const result = await res.json()

        setResult(result)
        setStatus('IDLE')
    }

    React.useEffect(() => {
        if(currentQuery === '' ){
            setResult(null);
            return;
        }

        bookSearch(currentQuery)
    }, [currentQuery])    // we want to watch for whenever the current query changes

    return (
        <>
            <h1>Search for a Book</h1>
            <form className={form} onSubmit={handleSearch}>
                <input className={input} type="search" name="search" />
                <button className={button}>search</button>
                <button className={button} type="reset" onClick={handleSearchReset}>reset</button>
            </form>

            {status === 'LOADING' && <p>Loading results...</p>}

            {status === 'IDLE' && currentQuery !== "" ? (
                <>
                    <h2>Search results for "{currentQuery}"</h2>
                    <ul>
                        {result && result.docs.map((doc) => (
                            <li key={doc.key}>
                                <strong>{doc.title}</strong> {doc.author_name && `by ${doc.author_name?.[0]}`}
                            </li>
                        ))}
                    </ul>
                </>
            ): null}
        </>
    )
}