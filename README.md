# Ragman - is an open source AI powered chatbot, that provides the possibility to include your custom documents (RAG) in order to achive context specific question answering. 

## Features
- Document indexing: Documents are sent to specific endpoint where the are chunked into semantic pieces, normalized, and saved to postgresql database as vector data.
- Document search by similarity: User prompt is converted to vector and the search of similar documents is performed.
- Document categorization: Documents are supplied with a category attribute as well as metadata (document attributes like creatiin date, title, etc.) that are supposed to increase the quality of conversational context.
- Document ebedding: Similar documents are embedded into user prompt and sent to OpenAI completion API.
- Chat interface: Simple chat iterface, where you can have your conersation with LLM.
## API

## Installation

## Run

## License
This project is licensed under the MIT License.
