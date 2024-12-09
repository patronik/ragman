import express from 'express';
import { body, validationResult }  from 'express-validator';
import { pool } from '../db.js';
import { vectorizeText } from '../utils/vectorizer.js';

const router = express.Router();

// Create a vector entry
router.post('/create',
  body('name').notEmpty().withMessage('Name parameter is required'),
  body('text').notEmpty().withMessage('Text parameter is required'),
  body('category').notEmpty().withMessage('Category parameter is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, text, category } = req.body;
    try {
      const embedding = await vectorizeText(text);

      // console.log('embedding:', embedding);
  
      if (!Array.isArray(embedding)) {
        throw Error('Wrong embedding type. Array required.');
      }

      if (embedding.length != 1536) {
        throw Error('Wrong embedding dimension. 1536 expected.');
      }

      const result = await pool.query('SELECT * FROM vectors WHERE name = $1 AND category = $2;', [name, category]);
      if (result.rows.length > 0) {
        throw Error(`Embedding with name ${name} already exists`);
      }

      await pool.query(
        `INSERT INTO vectors (name, category, embedding) VALUES ($1, $2, '${JSON.stringify(embedding)}')`,
        [name, category]
      );

      res.status(201).send({ message: 'Vector saved.' });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Error saving vector.' });
    }
});

// Search for similar vectors
router.post('/search', 
  body('prompt').notEmpty().withMessage('Prompt parameter is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { prompt } = req.body;
    try {
      const queryVector = await vectorizeText(prompt);
      const result = await pool.query(
        `
        SELECT id, name, embedding, embedding <-> '${JSON.stringify(queryVector)}' AS distance
        FROM vectors
        ORDER BY distance ASC
        LIMIT 5;
      `        
      );
      res.status(200).send(result.rows);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Error searching vectors.' });
    }
});

// Update a vector
router.post('/update', 
  body('name').notEmpty().withMessage('Name parameter is required'),
  body('category').notEmpty().withMessage('Category parameter is required'),
  body('text').notEmpty().withMessage('Text parameter is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, category, text } = req.body;
    try {
      const embedding = await vectorizeText(text);

      if (Array.isArray(embedding)) {
        throw Error('Wrong embedding type. Array required.');
      }

      if (embedding.length != 1536) {
        throw Error('Wrong embedding dimension. 1536 expected.');
      }

      await pool.query(
        `UPDATE vectors SET embedding = '${JSON.stringify(embedding)}' WHERE name = $1 AND category = $2`,
        [name, category]
      );

      res.status(200).send({ message: 'Vector updated.' });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Error updating vector.' });
    }
});

// Delete a vector
router.post('/delete', 
  body('name').notEmpty().withMessage('Name parameter is required'),
  body('category').notEmpty().withMessage('Category parameter is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
      await pool.query('DELETE FROM vectors WHERE name = $1 AND category = $2', [id, category]);
      res.status(200).send({ message: 'Vector deleted.' });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Error deleting vector.' });
    }
});

// Read all vectors
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vectors;');
    res.status(200).send(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'Error fetching vectors.' });
  }
});

export default router;