# Codebase Genie
**Codebase Genie** is a Retrieval-Augmented Generation (RAG) tool that enables users to interact with GitHub repositories via natural language queries. With Codebase Genie, you can explore and understand a codebase more efficiently by asking questions about its structure, functionality, and design.

## Features
- **Chat with codebases:** Users can ask questions about a GitHub repository and receive details, contextual answers.
- **Retrieval-Augmented Generation:** Combines embeddings and context retrieval to provide accurate and relevant responses.
- **Supports Multiple Languages:** Works seamlessly with repositories written in various programming languages.
- **Search and Explanation:** Offers explanations for specific functions, classes, files, or general architecture.

![image](https://github.com/user-attachments/assets/325f5479-dbd4-4888-88b5-a6732c9c5063")

## How it Works
1. **Embedding Creation:**
   - Code files are tokenized and converted into vector embeddings for efficient retrieval.
   - Pinecone is used as the vector database to store these embeddings.
2. **Query Processing:**
   - User queries are matched with relevant code snippets or files using similarity search.
   - Llama 3.1 LLM generates human-readable responses to queries based on retrieved .context from Pinecone
3. **Interface:**
   - A simple and intuitive chatbot interface lets users ask questions to repositories.

![image](https://github.com/user-attachments/assets/77119592-09f1-48ee-bb33-48cb77a12488)


## Prerequisites
- Node.js (v16 or higher)
- Pinecone account for embedding storage
- Groq API key for LLM integration

## Installation
1. **Clone the repository:**
2. **Install Dependencies:**
3. **Set Up Environment Variables:**
4. **Run the Application:**

## Usage
1. **Ask Questions:** Interact with chatbot by asking questions about the repository
2. **Retrive Insights:** Get detailed explanations and references to the relevant parts of the codebase

## Architecture

### Backend
- Python to create embeddings in Pinecone
- Node.js to utilize Pinecone SDK andn fetch embeddings

### Frontend
- NextJS and React with Tailwind CSS to provide sleek and simple UI

### Database
- Pinecone to store embeddings
- Supabase to store chat messages

## Future Enhancements
- Add ability for users to input repository URLs and chat with them
  - Need to create embeddings for those repositories and then allow user to chat with them
  - Delete embeddings' namespace to prevent cost/resource accumulation on Pinecone
- Integrate Git webhooks for real-time updates on repository changes

## Contributing
Contributions are welcome! If you find a bug or have a feature request, please create an issue or submit a pull request.

## Contact
For questions and feedback, reach out at parkysood@gmail.com
