import config from '../config.js';
import { sprintf } from 'sprintf-js';
import { OpenAI }  from 'openai';

if (!config.openai.api_key
    || !config.openai.completion_model  
) {
  throw new Error('OpenAI configuration is missing.');  
}

const openai = new OpenAI({
    apiKey: config.openai.api_key
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

function getChatMessages(history, prompt, documents, category) {        
    const documentContext = prepareDocuments(documents);    

    if (!config.chat.messages[category].system
        || !config.chat.messages[category].prompt
        || !config.chat.messages[category].document
    ) {
      throw new Error('Chat configuration is missing.');  
    }

    let messages = [
        ...history,
        {
          role: "system",
          content: sprintf(config.chat.messages[category].system),
        },
        {
          role: "user",
          content: sprintf(config.chat.messages[category].prompt, prompt),
        }        
    ];

    if (documentContext.length > 0) {
      messages.push(
        {
          role: "system",
          content: sprintf(config.chat.messages[category].document, documentContext),
        }  
      );  
    }

    return messages;
}

async function getChatResponse({ history, prompt, documents, category }) {
    const messages = getChatMessages(history, prompt, documents, category);
    const response = await openai.chat.completions.create({
        model: config.openai.completion_model,
        messages
    });
    return response.choices[0].message.content;
}

export { getChatResponse };