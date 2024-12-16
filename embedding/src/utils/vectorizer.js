import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import XRegExp  from 'xregexp';

function normalizeText(text) {
  return text.replace(
      XRegExp("[^\\p{L}\\p{N}\\s.,!?:;-]+", "gu"),
       " "
    ).replace(
      XRegExp("(?<!\\d)[.,!?:;-]{2,}(?!\\d)", "gu"),
      " "
    ).replace(
      XRegExp("\\s{2,}", "gu"),
      " "
    ).trim();
}

export const splitIntoParagraphChunks = (text, overlapSentences, metadata) => {
  const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '');
  let chunks = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const currentChunk = [paragraphs[i]];
    // Add overlap sentences from subsequent paragraphs if possible
    if (overlapSentences > 0 && i + 1 < paragraphs.length) {
      const subsequentSentences = paragraphs[i + 1].split(/(?<=[.!?])\s+/);
      if (subsequentSentences.length >= overlapSentences) {
        currentChunk.push(...subsequentSentences.slice(0, overlapSentences));      
      }
    }    
    chunks.push(currentChunk.join('\n'));
  }

  return chunks.map((chunk, index) => ({
    content: normalizeText(chunk),
    metadata: {
        ...metadata,
        "Chunk number": index + 1,
        "Total chunks": chunks.length
    }
  })); 
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