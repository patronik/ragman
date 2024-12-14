import dotenv from 'dotenv';
dotenv.config();
import { OpenAI }  from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function ucFirst(str) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function getChatMessages(history, prompt, documents) {
     // Combine documents into a single context string
    const documentContext = documents
    .map((document) => {
      let metadata = [];
      if (document.id != undefined) {
        metadata.push(`Document Id: ${document.id}`);  
      }      
      for (let key in document.metadata) {
        metadata.push(`${ucFirst(key)}: ${document.metadata[key]}`);
      }
      return metadata.join("\n") + `\nContent: ${document.content}`;
    })
    .join("\n\n");
    
    let messages = [
        ...history,
        {
          role: "system",
          content: process.env.OPENAI_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: `User Query: ${prompt}`,
        }        
    ];

    if (documentContext.length > 0) {
      messages.push(
        {
          role: "system",
          content: `Retrieved Documents:\n\n${documentContext}\n\nUse this information to respond to the user's query.`,
        }  
      );  
    }

    return messages;
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