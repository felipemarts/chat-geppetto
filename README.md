# Chat Geppetto

Chat Geppetto is a sophisticated chat application designed to assist users in coding complex software problems, providing guidance, and facilitating implementation using languages such as Node.js, TypeScript, Blockchain, GoLang, and more. This project is built with Express for the backend and a visually appealing frontend using HTML, CSS, and JavaScript.

[Chat Geppetto](https://www.youtube.com/watch?v=2Fo9ZrUxj94)

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Customization](#customization)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Multi-language Support:** Able to assist with multiple programming languages.
- **Chat Management:** Create, clone, delete, and rename chat sessions.
- **File Handling:** Retrieve, update, and deploy code snippets from project files.
- **OpenAI Integration:** Uses GPT-4o to process and generate intelligent responses.
- **User Interface:** Interactive UI built with Bootstrap and custom scripts for smoother navigation and usage.
- **Persistent Data:** Retains chat history and project data across sessions.

## Requirements

- Node.js (v14 or higher)
- npm
- An OpenAI API key for chat completion features using GPT-4o.

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/chat-geppetto.git
   cd chat-geppetto
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the Server:**
   ```bash
   npm start
   ```

6. **Access the Application:**
   Navigate to `http://localhost:3000` in your web browser to use the application.

## Usage

- **Creating Chats:** Use the "New Chat" button to start a new session.
- **File Interaction:** Select files from the list to view and make changes.
- **Send Commands:** Use chat input to send commands to the OpenAI API.
- **Manage History:** Clear chat history or clone sessions as needed.

## Project Structure

- **`src/`**: Contains the backend source code including routes, controllers, and services.
- **`public/`**: Holds frontend assets like HTML, CSS, and JavaScript files.
- **`types/`**: TypeScript type definitions for structured data handling.
- **`chats/`**: Directory where chat data is stored as JSON files.

## Customization

### AI Model Behavior

To customize how the AI behaves in your application, modify the `model.md` file located in the root directory. This file defines the system prompts that shape the AI's interactions. Write your desired model behavior directly into this file.

### .hidebot File

In your project directory, you can utilize a `.hidebot` file to specify patterns of files or directories to be ignored by the application. This functions similarly to a `.gitignore` file, and is used to exclude sensitive or unnecessary files from being processed.

## API Endpoints

- **GET /chats**: List all available chats.
- **POST /create_chat**: Create a new chat session.
- **GET /history/:chatId**: Fetch the history for a chat.
- **POST /history/:chatId**: Save chat history.
- **POST /post_msg/:chatId**: Post a user message and get a response.
- **POST /command/:chatId**: Execute file-related operations based on commands.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have improvements or bug fixes.

## License

This project is licensed under the MIT License.
