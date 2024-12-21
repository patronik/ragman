## Ragman - is an open source AI powered chatbot, that provides the possibility to include your custom documents (RAG) in order to achive context specific question answering.

### See how the response to the same question changed after single document has been indexed to vector database.

<p align="center">
<img src="https://voinatech.com/images/ragman.png" height="410px" width="700px" alt="Chat demo" />
</p>

## Tech Stack

### This project utilizes a robust and modern tech stack to deliver high performance, scalability, and seamless integration of advanced AI capabilities. Below is an overview of the core technologies and tools employed:

### Backend Technologies

- Node.js: A powerful, event-driven JavaScript runtime, ensuring efficient and scalable server-side execution.

- Express.js: A lightweight and flexible web application framework for Node.js, enabling robust API development and middleware support.

### Database

- PostgreSQL: A highly reliable and advanced relational database system used for managing and storing project data.

- pgvector Extension: Extends PostgreSQL with vector similarity search capabilities, allowing for efficient handling of AI-powered features such as embedding comparisons.

### AI Integration

- OpenAI API: Integrated to leverage state-of-the-art language models for tasks such as text generation, summarization, and other AI-driven functionalities.

## Features
### Documents
- Document indexing: Documents are sent to specific endpoint where the are chunked into semantic pieces, normalized, and saved to postgresql database as vector data.
- Document search by similarity: User prompt is converted to vector and the search of similar documents is performed.
- Document categorization: Documents are supplied with a category attribute as well as metadata (attributes like creation date, title, audience, etc.) that will conversational context and response quality.
- Document embedding: Similar documents are embedded into user prompt and sent to OpenAI completion API.
### Chat
- Chat interface: Simple chat iterface, where you can have your conersation with LLM.
- Coversation history: The app keeps conversation history in database that is sent to LLM along with last received promp.   
- Topic specific conversation: You can configure a conversation category to filter out non relevant documents from conversation.

## Installation

### 1. Prerequisites
- Obtain an API Key from OpenAI at https://platform.openai.com.
- Make sure you OpenAIs [credit balance](https://platform.openai.com/settings/organization/billing/overview) is positive.

### 2. Clone repo
If using GitHub:
```bash
git clone https://github.com/patronik/ragman.git
cd ragman
```
### 3. Configure the Environment
Add top level configuration to root `.env` file
```
EMBEDDING_APP_PORT=<YOUR EMBEDDING APP PORT NUMBER>
CHATBOT_APP_PORT=<YOUR CHATBOT APP PORT NUMBER>
POSTGRESS_USERNAME=<YOUR POSTGRESS_USERNAME>
POSTGRESS_PASSWORD=<YOUR POSTGRESS_PASSWORD>
POSTGRESS_DBNAME=<YOUR POSTGRESS_DBNAME>
```
Configure `./embedding/src/config/default.yml` according to template.
```yml
port: <YOUR EMBEDDING APP PORT NUMBER>
openai:
  api_key: "<YOUR API KEY>"  
  embedding_model: "text-embedding-ada-002"
embedding_dimension: 1536
chunk_overlap: <SIZE OF CHUNK OVERLAP IN NUMBER OF SENTENCES>
http_auth:
  username: '<YOUR HTTP AUTH USERNAME>'
  password: '<YOUR HTTP AUTH PASSWORD>'
postgres:
  hostname: "<YOUR POSTGRESQL DB HOSTNAME>"
  port: "<YOUR POSTGRESQL DB PORT>"
  username: "<YOUR POSTGRESQL DB USERNAME>"
  password: "<YOUR POSTGRESQL DB PASSWORD>"
  dbname: "<YOUR POSTGRESQL DB NAME>"
```
Configure `./chatbot/src/config/default.yml` according to template.
```yml
port: <YOUR CHATBOT APP PORT NUMBER>
embedding:
  api_url: "http://embedding-app:<EMBEDDING APP PORT NUMBER>"
openai:
  api_key: "<YOUR OPENAI API KEY>"
  completion_model: "gpt-4"
chat:
  name: 'Ragman | Demo'
  scenarios:
    - key: "default"
      label: "Default"
    - key: "scenario1"
      label: "Scenario 1"
    - key: "scenario2"
      label: "Scenario 2"
  messages:
    default:
      system: |
        You are a professional assistant designed to help users find answers to their general questions. 
        Your primary task is to combine retrieved information from the document database with your knowledge 
        to provide comprehensive and accurate answers.
        Follow these guidelines:
        - Utilize Retrieved Documents: Whenever documents are retrieved, prioritize their content to ensure responses are grounded in the most relevant and up-to-date information.
        - Blend with Generative Responses: Integrate the retrieved information smoothly into your answers. Use your knowledge to add context, examples, or actionable advice that complements the retrieved content.
        - Do not mention provided documents in response. Use documents only for information lookup.
        - Fallback for Missing Data: If no relevant documents are available, provide a general response based on your knowledge. Clarify that the answer is based on general insights rather than specific retrieved data.
        - Clarify Ambiguities: If the user query doesn’t match the retrieved documents well, either ask clarifying questions or explain the limitations of the retrieved information before proceeding.
        - Refine Relevance: Suggest query modifications to help users retrieve more targeted results from the database if the initial documents don’t address their needs adequately.
        - Please determinte the language of user prompt and respond in that language.
        Always focus on providing practical, actionable, and contextually appropriate advice to support the user's job search goals.
      prompt: "User Query: %s"
      document: "Retrieved Documents:\n\n%s\n\nUse this information to respond to the user's query."           
  rag:
    categories:
      - key: "general"
        label: "General"
      - key: "technical"
        label: "Technical"
      - key: "finance"
        label: "Finance"
  history:
    expiration_hours: 24
session:
  secret: "<YOUR HISTORY SECRET>"
  resave: "false"
  saveUninitialized: "true"
  maxAge: <YOUR SESSION MAX AGE IN MILLISECONDS>
postgres:
  hostname: "<YOUR POSTGRESQL DB HOSTNAME>"
  port: "<YOUR POSTGRESQL DB PORT>"
  username: "<YOUR POSTGRESQL DB USERNAME>"
  password: "<YOUR POSTGRESQL DB PASSWORD>"
  dbname: "<YOUR POSTGRESQL DB NAME>"
```
## Run
### 1.Execute the following command in a project root directory
```
docker-compose up --build
```
or to run in background
```
docker-compose up -d --build
```
### 3. Send your documents to `http://localhost:<YOUR EMBEDDING APP PORT NUMBER>/vector/create` endpoint
```bash
curl -X POST http://localhost:<YOUR EMBEDDING APP PORT NUMBER>/vector/create -H "Content-Type: application/json" -d '{
    "title": "Ragman",
    "content": "Ragman - is an open source AI powered chatbot, that provides the possibility to include your custom documents (RAG) in order to achive context specific question answering.",
    "category": "test",
    "metadata" : {"categories": "Generative AI, AI powered chatbot, RAG chatbot"}
}'
```
Make sure that conversation scenario messages are configured in chatbot app configuration. See example:
```yaml
chat:
  messages:
    scenario: 
      system: "System message that contains general LLM instructions."
      prompt: "User Query: %s."
      document: "Documents: %s."

```
### 2. Go to `http://localhost:<YOUR CHATBOT APP PORT NUMBER>/chat` to start chat conversation
## License
This project is licensed under the MIT License.
