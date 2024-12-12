import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const insertDocument = async (content, embedding, metadata) =>
{
  await pool.query(
    `
      INSERT INTO vectors (content, embedding, metadata) 
      VALUES ($1, '${JSON.stringify(embedding)}', '${JSON.stringify(metadata)}')
    `,
    [content]
  );
};

export const searchByTitleAndCategory = async (title, category) =>
{
    const result = await pool.query(
      `
        SELECT * FROM vectors 
        WHERE metadata ->> 'title' = $1 
        AND metadata ->> 'category' = $2;
      `, 
      [title, category]
    );    
    return result;
};
  

export const searchSimilar = async (queryVector, category, limit) =>
  {
    const result = await pool.query(
      `
        SELECT id, content, metadata, embedding <-> '${JSON.stringify(queryVector)}' AS distance
        FROM vectors
        WHERE metadata ->> 'category' = $1
        ORDER BY distance ASC
        LIMIT $2;
      `, 
      [category, limit]        
    );
    return result;
  };
    