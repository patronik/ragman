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

function getChatMessages(history, prompt, documents, scenario) {        
    const documentContext = prepareDocuments(documents);    

    if (!config.chat.messages[scenario].system
        || !config.chat.messages[scenario].prompt
        || !config.chat.messages[scenario].document
    ) {
      throw new Error('Chat configuration is missing.');  
    }

    let messages = [
        ...history,
        {
          role: "system",
          content: sprintf(config.chat.messages[scenario].system),
        },
        {
          role: "user",
          content: sprintf(config.chat.messages[scenario].prompt, prompt),
        }        
    ];

    if (documentContext.length > 0) {
      messages.push(
        {
          role: "system",
          content: sprintf(config.chat.messages[scenario].document, documentContext),
        }  
      );  
    }

    return messages;
}

async function getChatResponse({ history, prompt, documents, scenario }) {
    const messages = getChatMessages(history, prompt, documents, scenario);
    const response = await openai.chat.completions.create({
        model: config.openai.completion_model,
        messages
    });
    return response.choices[0].message.content;
}

export { getChatResponse };