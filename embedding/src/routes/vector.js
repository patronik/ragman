import express from 'express';
import { body, validationResult }  from 'express-validator';
import { insertDocument, searchByTitleAndCategory, searchSimilar } from '../db.js';
import { normalizeText, vectorizeText } from '../utils/vectorizer.js';

const router = express.Router();

// Create a vector entry
router.post('/create',
  body('title').notEmpty().withMessage('Title parameter is required'),
  body('category').notEmpty().withMessage('Category parameter is required'),
  body('content').notEmpty().withMessage('Content parameter is required'),  
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, category, metadata } = req.body;

    try {
      const content = normalizeText(req.body.content);
      if (content.length > process.env.MAX_DOCUMENT_SIZE) {
        throw Error(`Document '${title}' is too big. Max size is ${process.env.MAX_DOCUMENT_SIZE} of words.`);  
      }
      
      const result = await searchByTitleAndCategory(title, category);      
      if (result.rows.length > 0) {
        throw Error(`Document with name ${title} already exists`);
      }

      const embedding = await vectorizeText(content);
  
      if (!Array.isArray(embedding)) {
        throw Error('Wrong embedding type. Array required.');
      }

      if (embedding.length != 1536) {
        throw Error('Wrong embedding dimension. 1536 expected.');
      }      

      await insertDocument(content, embedding, {...{category, title}, ...metadata || {}});   

      res.status(201).send({ message: 'Vector saved.' });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Error saving vector.' });
    }
});

// Search for similar vectors
router.post('/search', 
  body('prompt').notEmpty().withMessage('Prompt parameter is required'),
  body('category').notEmpty().withMessage('Category parameter is required'),
  body('limit').notEmpty().withMessage('Limit parameter is required'),
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

export default router;