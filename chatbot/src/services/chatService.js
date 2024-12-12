import dotenv from 'dotenv';
dotenv.config();
import { OpenAI }  from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function getChatMessages(history, prompt, documents) {
     // Combine documents into a single context string
    const documentContext = documents
    .map((doc) => {
      let metadata = [];
      for (let key in doc.metadata) {
        metadata.push(`${capitalizeFirstLetter(key)}: ${doc.metadata[key]}`);
      }
      return metadata.join("\n") + `\nContent: ${doc.content}`;
    })
    .join("\n\n");
    
    return [
        ...history,
        {
          role: "system",
          content: process.env.OPENAI_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: `User Query: ${prompt}`,
        },
        {
          role: "system",
          content: `Retrieved Documents:\n\n${documentContext}\n\nUse this information to respond to the user's query.`,
        }
    ];
}

async function getChatResponse({ history, prompt, documents }) {
    const messages = getChatMessages(history, prompt, documents);
    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_COMPLETION_MODEL,
        messages
    });
    return response.choices[0].message.content;
}

export { getChatResponse };