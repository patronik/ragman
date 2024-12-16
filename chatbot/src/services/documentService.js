import dotenv from 'dotenv';
dotenv.config();

import axios  from 'axios';

async function getDocuments(query, category) {
    const url = `${process.env.EMBEDDING_API_URL}/vector/search`;
    const response = await axios.post(url, {
            prompt: query,
            category: category,
            limit: process.env.DOCUMENT_SEARCH_LIMIT      
        }, 
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }    
    );
    return response.data;
}

export { getDocuments };