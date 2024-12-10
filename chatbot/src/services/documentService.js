import dotenv from 'dotenv';
dotenv.config();

import axios  from 'axios';

async function getDocuments(query) {
    const url = `${process.env.EMBEDDING_API_URL}/vector/search`;
    const response = await axios.post(url, {
            prompt: query,
            context: process.env.DOCUMENT_SEARCH_CONTEXT,
            limit: process.env.DOCUMENT_SEARCH_LIMIT      
        }, 
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }    
    );
    return response.data.map(i => i.document);
}

export { getDocuments };