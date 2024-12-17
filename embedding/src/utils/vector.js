import config from '../config.js';
import axios from 'axios';

export const vectorizeText = async (text) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: config.openai.embedding_model || 'text-embedding-ada-002',
      },
      {
        headers: {
          Authorization: `Bearer ${config.openai.api_key}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data[0].embedding;
  } catch (err) {
    // Check if it's an Axios error
    if (err.response) {
      // The server responded with a status code outside of the 2xx range
      console.error('OpenAI API error:', err.response.data);
      throw new Error(
        `OpenAI API error: ${err.response.data.error?.message || 'Unknown error'}`
      );
    } else if (err.request) {
      // The request was made but no response was received
      console.error('No response from OpenAI API:', err.request);
      throw new Error('No response from OpenAI API. Please try again later.');
    } else {
      // Something else happened during the request
      console.error('Error during vectorization:', err.message);
      throw new Error('Failed to vectorize text. Please try again.');
    }
  }
};