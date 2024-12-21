import config from '../config.js';
import axios  from 'axios';

async function getSimilarDocuments(prompt, category, limit) {
    const url = `${config.embedding.api_url}/vector/search`;
    const response = await axios.post(url, {prompt, category, limit }, 
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }    
    );
    return response.data;
}

export { getSimilarDocuments };