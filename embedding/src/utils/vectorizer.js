import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

// Helper function to normalize text
export const normalizeText = (text) => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/[^a-zA-Z0-9.,!?; ]/g, '') // Remove special characters
    .trim();
}

export const vectorizeText = async (text) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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