import config from '../config.js';
import { pool } from '../db.js';

// Save chat history to the database
async function saveChatHistory(userId, scenario, prompt, response) {
    const now = new Date();
    
    try {
        // Insert prompt and response into the database
        await pool.query(
            `INSERT INTO chat_history (user_id, scenario, role, content, is_deleted, timestamp) VALUES 
             ($1, $2, $3, $4, $5, $6), ($1, $2, $7, $8, $5, $6)`,
            [userId, scenario, 'user', prompt, false, now, 'assistant', response]
        );

        // Clean up expired history
        await cleanupExpiredHistory();
    } catch (err) {
        console.error('Error saving chat history:', err);
    }
}

// Retrieve chat history from the database
async function getChatHistory(userId, scenario) {
    try {
        // Delete expired history
        await cleanupExpiredHistory();

        // Fetch the user's chat history
        const res = await pool.query(
            `SELECT role, content FROM chat_history 
             WHERE user_id = $1 
             AND scenario = $2
             AND is_deleted = $3
             ORDER BY timestamp ASC`,
            [userId, scenario, false]
        );
        
        return res.rows.map(row => ({ role: row.role, content: row.content }));
    } catch (err) {
        console.error('Error fetching chat history:', err);
        return [];
    }
}

// Clear chat history by user id and scenario
async function clearChatHistory(userId, scenario) {
    try {            
        await pool.query(
            `UPDATE chat_history 
             SET is_deleted = $1 
             WHERE user_id = $2 
             AND scenario = $3`,
            [true, userId, scenario]
        );            
    } catch (err) {
        console.error('Error clearing chat history:', err);        
    }
}

// Remove expired chat history (older than 24 hours)
async function cleanupExpiredHistory() {
    try {
        await pool.query(
            `UPDATE chat_history SET is_deleted = $1 
             WHERE timestamp < NOW() - INTERVAL '${config.chat.history.expiration_hours || 24} HOURS'`,
             [true]
        );
    } catch (err) {
        console.error('Error cleaning up expired chat history:', err);
    }
}

export { saveChatHistory, getChatHistory, clearChatHistory };