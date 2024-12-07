
# Vector Storage and Search API

This application is a Node.js-based Express API designed to store and search vectorized data in a PostgreSQL database. It utilizes OpenAI's `text-embedding-ada-002` model to vectorize text and `pgvector` for vector operations.

## Features

- **CRUD Operations**: Create, read, update, and delete vectorized data.
- **Vector Search**: Search for similar vectors using a query prompt.
- **PostgreSQL Integration**: Store vectors in a `pgvector`-enabled PostgreSQL database.
- **Dockerized**: Easy to set up and run with Docker.

## Setup

### Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (for local development)
- OpenAI API key

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Create a `.env` file in the root directory and add your OpenAI API key:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Build and start the application with Docker:

   ```bash
   docker-compose up --build
   ```

4. Access the API at `http://localhost:3000`.

## API Endpoints

### Vector Operations

1. **Create Vector**
   - **URL**: `POST /api/vectors`
   - **Body**:
     ```json
     {
       "name": "Example Name",
       "text": "Sample text to be vectorized"
     }
     ```

2. **Read All Vectors**
   - **URL**: `GET /api/vectors`

3. **Search Vectors**
   - **URL**: `POST /api/vectors/search`
   - **Body**:
     ```json
     {
       "prompt": "Text to search for similar vectors"
     }
     ```

4. **Update Vector**
   - **URL**: `PUT /api/vectors/:id`
   - **Body**:
     ```json
     {
       "name": "Updated Name",
       "text": "Updated text to be vectorized"
     }
     ```

5. **Delete Vector**
   - **URL**: `DELETE /api/vectors/:id`

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with `pgvector`
- **Vectorization**: OpenAI's `text-embedding-ada-002` model
- **Containerization**: Docker

## License

This project is licensed under the MIT License. See the LICENSE file for details.
