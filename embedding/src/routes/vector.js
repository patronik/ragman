import express from 'express';
import { body, validationResult }  from 'express-validator';
import { pool } from '../db.js';
import { vectorizeText } from '../utils/vectorizer.js';

const router = express.Router();

// Create a vector entry
router.post('/create',
  body('name').notEmpty().withMessage('Name parameter is required'),
  body('context').notEmpty().withMessage('Context parameter is required'),
  body('document').notEmpty().withMessage('Document parameter is required'),  
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, document, context } = req.body;
    try {
      const embedding = await vectorizeText(document);
  
      if (!Array.isArray(embedding)) {
        throw Error('Wrong embedding type. Array required.');
      }

      if (embedding.length != 1536) {
        throw Error('Wrong embedding dimension. 1536 expected.');
      }

      const result = await pool.query('SELECT * FROM vectors WHERE name = $1 AND context = $2;', [name, context]);
      if (result.rows.length > 0) {
        throw Error(`Embedding with name ${name} already exists`);
      }

      await pool.query(
        `INSERT INTO vectors (name, context, document, embedding) VALUES ($1, $2, $3, '${JSON.stringify(embedding)}')`,
        [name, context, document]
      );

      res.status(201).send({ message: 'Vector saved.' });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Error saving vector.' });
    }
});

// TODO implement batch create

// Search for similar vectors
router.post('/search', 
  body('prompt').notEmpty().withMessage('Prompt parameter is required'),
  body('context').notEmpty().withMessage('Context parameter is required'),
  body('limit').notEmpty().withMessage('Limit parameter is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { prompt, context, limit } = req.body;
    try {
      const queryVector = await vectorizeText(prompt);
      const result = await pool.query(
        `
        SELECT id, name, document, embedding <-> '${JSON.stringify(queryVector)}' AS distance
        FROM vectors
        WHERE context = $1
        ORDER BY distance ASC
        LIMIT $2;
      `, [context, limit]        
      );
      res.status(200).send(result.rows);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Error searching vectors.' });
    }
});

export default router;