import dotenv from 'dotenv';
dotenv.config();
import { sprintf } from 'sprintf-js';
import { OpenAI }  from 'openai';

if (!process.env.OPENAI_SYSTEM_MESSAGE
    || !process.env.OPENAI_PROMPT_MESSAGE
    || !process.env.OPENAI_DOCUMENT_MESSAGE
) {
throw new Error('OpenAI configuration is missing.');  
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function ucFirst(str) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function prepareDocuments(documents)
{
  return documents
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
}

function getChatMessages(history, prompt, documents) {        
    const documentContext = prepareDocuments(documents);    
    let messages = [
        ...history,
        {
          role: "system",
          content: sprintf(process.env.OPENAI_SYSTEM_MESSAGE),
        },
        {
          role: "user",
          content: sprintf(process.env.OPENAI_PROMPT_MESSAGE, prompt),
        }        
    ];

    if (documentContext.length > 0) {
      messages.push(
        {
          role: "system",
          content: sprintf(process.env.OPENAI_DOCUMENT_MESSAGE, documentContext),
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