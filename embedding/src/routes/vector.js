import express from 'express';
import { body, validationResult }  from 'express-validator';
import { insertDocument, searchByMetadata, searchSimilar } from '../db.js';
import { splitIntoParagraphChunks } from '../utils/text.js';
import { vectorizeText } from '../utils/vector.js';

const router = express.Router();

// Create a vector entry
router.post('/create',
  body('title').notEmpty().withMessage('Title parameter is required.'),
  body('category').notEmpty().withMessage('Category parameter is required.'),
  body('content').notEmpty().withMessage('Content parameter is required.'),  
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, category, content, metadata } = req.body;

    try {      
      const result = await searchByMetadata({title, category});      
      if (result.rows.length > 0) {
        throw Error(`Document with name "${title}" and category "${category}" already exists.`);
      }
      
      const chunks = splitIntoParagraphChunks(
        content, 
        process.env.CHUNK_SENTENCE_OVERLAP, 
        {
          ...{
            category, 
            title, 
            createdAt : new Date().toISOString()
          }, 
          ...metadata || {}
        }
      );

      if (!(chunks.length > 0)) {
        throw Error(`Document chunking failed. Check your data and try again.`);  
      }

      for (let chunk of chunks) {
        await createEmbedding(chunk.content, chunk.metadata);        
      }      

      res.status(201).send({ message: 'Vector saved.' });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Error saving vector.' });
    }
});

// Search for similar vectors
router.post('/search', 
  body('prompt').notEmpty().withMessage('Prompt parameter is required.'),
  body('category').notEmpty().withMessage('Category parameter is required.'),
  body('limit').notEmpty().withMessage('Limit parameter is required.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { prompt, category, limit } = req.body;
    try {
      const queryVector = await vectorizeText(prompt);
      const result = await searchSimilar(queryVector, category, limit);      
      res.status(200).send(result.rows);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Error searching vectors.' });
    }
});


async function createEmbedding(content, metadata) {
  const embedding = await vectorizeText(content);
  
  if (!Array.isArray(embedding)) {
    throw Error('Wrong embedding type. Array required.');
  }

  if (embedding.length != process.env.EMBEDDING_DIMENSION) {
    throw Error(`Wrong embedding dimension. ${process.env.EMBEDDING_DIMENSION} expected.`);
  }     
    
  await insertDocument(content, embedding, metadata);   
}


export default router;