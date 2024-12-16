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

export const searchByMetadata = async (metadata) =>
{
  if (Object.keys(metadata).length === 0) {
    throw new Error('Metadata object has no properties.');     
  }

  let argIndex = 1;
  let whereSql = [];
  let whereArgs = [];
  for (let key in metadata) {
    whereSql.push(
      `metadata ->> '${key}' = $${argIndex}`
    );
    whereArgs.push(metadata[key]);
    argIndex++;
  }

  const result = await pool.query(
    `SELECT * FROM vectors WHERE ${whereSql.join(' AND ')};`, whereArgs
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
    