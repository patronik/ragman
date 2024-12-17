import config from '../config.js';
import axios  from 'axios';

async function getDocuments(query, category) {
    const url = `${config.embedding.api_url}/vector/search`;
    const response = await axios.post(url, {
            prompt: query,
            category: category,
            limit: config.chat.document.limit  
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