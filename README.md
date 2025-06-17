# Real-Time Conversational Co-Pilot

## Project Vision

Real-Time Conversational Co-Pilot is a desktop application designed to act as an AI pair programmer, providing real-time assistance, code suggestions, and answers to queries during live coding sessions or technical interviews. It aims to be an unobtrusive yet powerful assistant that understands the context of your work and offers relevant help through a conversational interface.

## MVP Plan

The Minimum Viable Product (MVP) will focus on delivering the core conversational AI assistance capabilities integrated with the user's local development environment.

### Core Features (MVP):

1.  **Conversational Interface:**
    *   A clean, simple chat interface (similar to ChatGPT) where users can type questions or make requests.
    *   Support for markdown rendering in responses (code blocks, lists, etc.).
    *   History of conversation.

2.  **Real-Time Contextual Awareness (Initial Version - Manual Context):**
    *   Users can manually paste code snippets or describe their current problem/task to the AI.
    *   The AI will use this provided context to answer questions, explain code, or suggest solutions.
    *   (Future Enhancement beyond MVP: Automatic context gathering from active IDE/editor).

3.  **AI-Powered Assistance:**
    *   **Code Explanation:** Explain provided code snippets.
    *   **Code Generation/Suggestion:** Generate code snippets based on user requests (e.g., "write a Python function to sort a list of dictionaries").
    *   **Debugging Help:** Offer suggestions for debugging based on pasted error messages and code.
    *   **Conceptual Questions:** Answer general programming questions (e.g., "what is a closure in JavaScript?").
    *   **Language/Framework Support:** Initially focus on popular languages like Python, JavaScript, and TypeScript.

4.  **Desktop Application Shell:**
    *   Leverage the existing Electron foundation for a cross-platform desktop app.
    *   Basic window management (toggle visibility, always on top - configurable).
    *   Minimalist UI to avoid distraction.

5.  **Backend/AI Integration:**
    *   Integrate with a powerful LLM (e.g., via OpenAI API, or a local model if feasible for MVP).
    *   Secure API key management (user provides their own API key initially).

### Non-Goals for MVP:

*   Automatic IDE integration for context gathering.
*   Voice input/output.
*   Advanced project-wide code analysis.
*   Team collaboration features.
*   Screenshot processing (shifting away from the old app's core feature).

### Key Technologies:

*   **Frontend:** React, TypeScript, Tailwind CSS (existing stack)
*   **Desktop Shell:** Electron (existing stack)
*   **Backend (for AI interaction proxy/orchestration, if needed):** Node.js with Express/FastAPI (Python) - TBD based on complexity. Initially, direct client-to-LLM API calls might be sufficient if security and rate-limiting are handled appropriately by the LLM provider for client-side keys.
*   **AI Model:** GPT-3.5/GPT-4 or similar.

### Architecture Overview (MVP):

1.  **Electron Main Process:** Handles window creation, global shortcuts, and basic app lifecycle.
2.  **Electron Renderer Process (React App):**
    *   UI for the chat interface.
    *   Manages conversation state.
    *   Makes API calls to the LLM (either directly or via a lightweight backend).
3.  **LLM API:** The external service providing the AI capabilities.

### Backend Endpoints (to be documented as created):

*   This section will be populated as backend services are developed.
    *   Example: `POST /api/v1/converse` - Takes user input and conversation history, returns AI response.

## Development Plan & Next Steps:

1.  **Setup Basic Chat UI:** Create the React components for the chat interface.
2.  **Integrate LLM API:** Implement the logic to send requests to the chosen LLM and display responses.
3.  **Context Handling:** Allow users to input context (code/problem description) manually.
4.  **Refine UI/UX:** Ensure the application is user-friendly and non-intrusive.
5.  **Testing & Iteration:** Gather feedback and iterate on features.

## Keyboard Shortcuts

*   **Cmd/Ctrl + Shift + A**: Toggle window visibility (tentative, can be refined)
*   **Cmd/Ctrl + Q**: Quit the application (standard)

## Running the Application

### Prerequisites

*   Node.js (v16 or higher)
*   npm or yarn
*   An API key for the chosen LLM provider (e.g., OpenAI)

### Installation

1.  Clone the repository:
    ```
    git clone <your-repo-url>
    cd <your-repo-name>
    ```

2.  Install dependencies:
    ```
    npm install
    # or
    yarn
    ```

3.  Set up your environment variables:
    *   Create a `.env` file in the root directory.
    *   Add your LLM API key: `VITE_OPENAI_API_KEY=your_api_key_here` (example for OpenAI)
    *   Ensure `electron/main.ts` or a similar configuration loader loads this into the renderer environment securely if direct client-side calls are made, or handles it server-side if a backend proxy is used.

4.  Run the application in development mode:
    ```
    npm run dev
    # or
    yarn dev
    ```

5.  Build the application for production:
    ```
    npm run build
    # or
    yarn build
    ```

## License

This project is licensed under the ISC License.
