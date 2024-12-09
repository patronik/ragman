import axios  from 'axios';

async function getJobDocuments(query) {
    const url = `${process.env.EMBEDDING_API_URL}/vector/search`;
    const response = await axios.post(url, {
            prompt: query      
        }, 
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }    
    );

    console.log(response.data);

    return response.data;
}

export { getJobDocuments };