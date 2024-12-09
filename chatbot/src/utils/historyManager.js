import { pool } from '../db.js';

const EXPIRATION_TIME_HOURS = 24;

// Save chat history to the database
async function saveChatHistory(userId, prompt, response) {
    const now = new Date();
    
    try {
        // Insert prompt and response into the database
        await pool.query(
            `INSERT INTO chat_history (user_id, role, content, timestamp) VALUES 
             ($1, $2, $3, $4), ($1, $5, $6, $4)`,
            [userId, 'user', prompt, now, 'assistant', response]
        );

        // Clean up expired history
        await cleanupExpiredHistory();
    } catch (err) {
        console.error('Error saving chat history:', err);
    }
}

// Retrieve chat history from the database
async function getChatHistory(userId) {
    try {
        // Delete expired history
        await cleanupExpiredHistory();

        // Fetch the user's chat history
        const res = await pool.query(
            `SELECT role, content FROM chat_history 
             WHERE user_id = $1 
             ORDER BY timestamp ASC`,
            [userId]
        );
        
        return res.rows.map(row => ({ role: row.role, content: row.content }));
    } catch (err) {
        console.error('Error fetching chat history:', err);
        return [];
    }
}

// Remove expired chat history (older than 24 hours)
async function cleanupExpiredHistory() {
    try {
        await pool.query(
            `DELETE FROM chat_history 
             WHERE timestamp < NOW() - INTERVAL '${EXPIRATION_TIME_HOURS} HOURS'`
        );
    } catch (err) {
        console.error('Error cleaning up expired chat history:', err);
    }
}

export { saveChatHistory, getChatHistory };