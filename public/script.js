
// Global variables to manage chat state
let currentChatId = localStorage.getItem('currentChatId');
let chatData = localStorage.getItem('chatData') ? JSON.parse(localStorage.getItem('chatData')) : null;
let editingMessageIndex = null;

function openEditMessageModal(index, currentContent) {
  editingMessageIndex = index;
  const editMessageTextarea = document.getElementById('editMessageTextarea');
  editMessageTextarea.value = currentContent;
  const editMessageModal = new bootstrap.Modal(document.getElementById('editMessageModal'));
  editMessageModal.show();
}

async function saveEditedMessage() {
  const newContent = document.getElementById('editMessageTextarea').value;
  if (editingMessageIndex !== null) {
    chatData.history[editingMessageIndex].content = newContent;

    try {
      const response = await fetch(`/history/${currentChatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ history: chatData.history })
      });

      await response.json();
      updateChat(false);
    } catch (error) {
      console.error('Error communicating with server:', error);
    }

    editingMessageIndex = null;
  }
  const editMessageModal = bootstrap.Modal.getInstance(document.getElementById('editMessageModal'));
  editMessageModal.hide();
}


async function deployCommand(deployButton, content) {
  try {
    console.log(content)
    const commandJson = JSON.parse(content);

    if (commandJson.cmd === "read") {
      let response = await fetch(`/history/${currentChatId}/file/${encodeURIComponent(commandJson.path)}`);
      if (!response.ok) {
        throw new Error('File could not be retrieved');
      }
      const { message } = await response.json();

      const userInput = document.getElementById('chat-input');
      const currentText = userInput.value;
      userInput.value = message.content;
      sendMessage(true);
      userInput.value = currentText;

    } else if (commandJson.cmd === "write" || commandJson.cmd === "rm") {
      const deployText = `//${commandJson.path}\n${commandJson.content}`;

      callCommand(commandJson.cmd, deployText).then(async (msg) => {
        deployButton.textContent = msg;

        const response = await fetch(`/history/${currentChatId}`);
        chatData = await response.json();
        localStorage.setItem('chatData', JSON.stringify(chatData));
        filesList(chatData.files); // update files
        setTimeout(() => {
          deployButton.textContent = 'Deploy';
        }, 2000);
      });
    } else {
      alert(`Error: Ask for file commands`);
    }
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

function cloneChat() {
  const chatName = prompt('Enter chat name:');
  if (chatName) {
    callCommand("clone", chatName).then(() => loadChatList())
  }
}

function deleteChat() {
  const userConfirmed = confirm('Are you sure you want to delete this chat?');
  if (userConfirmed) {
    callCommand("delete", currentChatId).then(() => {
      localStorage.removeItem('currentChatId');
      localStorage.removeItem('chatData');
      window.location.reload();
    });
  }
}

function renameChat() {
  const chatName = prompt('Enter chat name:');
  if (chatName) {
    callCommand("rename", chatName).then(() => loadChatList())
  }
}

function buildFileTree(files) {
  const tree = {};

  files.forEach(file => {
    const pathParts = file.content.split(/[\/\\]/);
    let current = tree;

    pathParts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = (index === pathParts.length - 1) ? file.content : {};
      }
      current = current[part];
    });
  });

  return tree;
}

function generateHtmlTree(node, isNested = false) {
  let html = '<ul class="files-list">';
  for (const key in node) {
    const value = node[key];
    if (typeof value === 'string') {
      html += `<li class="file-item">
        <input class="file-check" type="checkbox" data-filename="${value}"">
        <label class="file-name" data-filename="${value}">${value.split('/').pop().trim()}</label>
      </li>`;
    } else {
      html += `<li class="directory-item">
        <span class="directory-toggle collapsed" data-directory="${key}">${key}</span>
        <div class="directory-contents">
          ${generateHtmlTree(value, true)}
        </div>
      </li>`;
    }
  }
  html += '</ul>';
  return html;
}

function addDirectoryToggleListeners() {
  const toggles = document.querySelectorAll('.directory-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', function () {
      const contents = this.nextElementSibling;
      if (contents.style.display === "none" || contents.style.display === "") {
        contents.style.display = "block";
        this.classList.remove('collapsed');
        this.classList.add('expanded');
      } else {
        contents.style.display = "none";
        this.classList.remove('expanded');
        this.classList.add('collapsed');
      }
    });
  });
}

async function registerFile(filePath) {
  let response = await fetch(`/history/${currentChatId}/file/${encodeURIComponent(filePath)}`);
  if (!response.ok) {
    throw new Error('File could not be retrieved');
  }

  const { message } = await response.json();
  chatData.history.push(message);

  response = await fetch(`/history/${currentChatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ history: chatData.history }),
  });
  await response.json();

  updateChat(true);
}

function saveSelectedFilesState() {
  const selectedFiles = getSelectedFiles();
  localStorage.setItem('selectedFiles', JSON.stringify(selectedFiles));
}

function restoreSelectedFilesState() {
  const selectedFiles = JSON.parse(localStorage.getItem('selectedFiles')) || [];
  const checkboxes = document.querySelectorAll('#file-tree-panel input[type="checkbox"]');

  checkboxes.forEach(checkbox => {
    if (selectedFiles.includes(checkbox.getAttribute('data-filename'))) {
      checkbox.checked = true;
    } else {
      checkbox.checked = false;
    }
  });
}

function addCheckboxEventListeners() {
  const checkboxes = document.querySelectorAll('#file-tree-panel input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', saveSelectedFilesState);
  });
}

function filesList(files) {
  if (!files) {
    files = []
  }

  const fileTreePanel = document.getElementById('file-tree-panel');
  const treeStructure = buildFileTree(files);
  const fileTreeHTML = generateHtmlTree(treeStructure);
  fileTreePanel.innerHTML = fileTreeHTML;

  // Add event listener for file name text
  const fileNameElements = document.querySelectorAll('#file-tree-panel .file-name');
  fileNameElements.forEach(fileNameElement => {
    fileNameElement.addEventListener('click', () => {
      const filePath = fileNameElement.getAttribute('data-filename');
      registerFile(filePath);
    });
  });

  // Restaurar estado dos checkbox
  restoreSelectedFilesState();
  // Adicionar listeners
  addCheckboxEventListeners();

  addDirectoryToggleListeners();

}

// Function to get selected files
function getSelectedFiles() {
  const checkboxes = document.querySelectorAll('#file-tree-panel input[type="checkbox"]');
  const selectedFiles = [];

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedFiles.push(checkbox.getAttribute('data-filename'));
    }
  });

  return selectedFiles;
}

// Function to automatically expand the textarea based on input
function autoExpandTextarea() {
  const textarea = document.getElementById('chat-input');
  textarea.style.height = 'auto';
  const newHeight = textarea.scrollHeight;
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
  const maxHeight = lineHeight * 20;
  textarea.style.height = Math.min(newHeight, maxHeight) + 'px';
}

// Function to check and update scroll position
function checkScrollPosition(chatMessages, button) {
  const isScrolledToBottom = chatMessages.scrollHeight - chatMessages.scrollTop === chatMessages.clientHeight;
  button.style.display = isScrolledToBottom ? 'none' : 'flex';
}

// Create a new chat by sending a request to the server
async function createNewChat(chatName, projectPath) {
  const response = await fetch('/create_chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: chatName, projectPath: projectPath })
  });

  const data = await response.json();
  if (data.success) {
    console.log(`New chat created successfully: ${data.chatId}`);
    loadChatList();
  } else {
    console.error('Error creating chat:', data.error);
  }
}

// Load the list of available chats
async function loadChatList() {
  const response = await fetch('/chats');
  const data = await response.json();

  const chatBtnList = document.getElementById('chat-btn-list');
  chatBtnList.innerHTML = '';

  data.chats.forEach(chat => {
    const chatItem = document.createElement('button');
    chatItem.textContent = `${chat.name}`;
    if (chat.name === chatData?.name) {
      chatItem.classList.add('btn', 'btn-outline-light', 'selected-chat');
    } else {
      chatItem.classList.add('btn', 'btn-outline-light');
    }
    chatItem.style.cursor = 'pointer';
    chatItem.onclick = () => {
      localStorage.removeItem('selectedFiles');

      loadMessages(chat.id);

      const chatButtons = document.querySelectorAll('#chat-btn-list button');
      chatButtons.forEach(button => {
        if (button.textContent.trim() === chat.name) {
          button.classList.add('selected-chat');
        } else {
          button.classList.remove('selected-chat');
        }
      });
    };
    chatBtnList.appendChild(chatItem);
  });
}

// Update chat messages in the chat window
function updateChat(roll = true) {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = '';

  chatData.history.forEach((msg, index) => {
    displayMessage(index, msg.content, msg.role, roll);
  });
}

// Load message history for a specific chat
async function loadMessages(chatId) {
  currentChatId = chatId;
  localStorage.setItem('currentChatId', currentChatId);

  const response = await fetch(`/history/${chatId}`);
  chatData = await response.json();
  localStorage.setItem('chatData', JSON.stringify(chatData));

  updateChat();
  filesList(chatData.files);
}

async function clearAll() {
  if (!currentChatId) {
    console.error('Invalid chat ID or data.');
    return;
  }
  try {
    const response = await fetch(`/history/${currentChatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history: [] }),
    });

    await response.json();
    chatData.history = [];
    updateChat(true);
  } catch (error) {
    console.error('Error communicating with server:', error);
    displayMessage(chatData.history.length, 'Error communicating with server.', 'assistant');
    chatData.history.push({
      role: 'assistant',
      content: 'Error communicating with server.',
    });
  }
}

// Register chat files and update the history
async function registerAll() {
  if (!currentChatId || !chatData || !chatData.files) {
    console.error('Invalid chat ID or data.');
    return;
  }

  try {
    const fetchfilesPromises = chatData.files.map(async (file) => {
      if (!file.content || !file.name) return;
      try {
        const response = await fetch(`/history/${currentChatId}/file/${encodeURIComponent(file.content)}`);
        if (!response.ok) {
          throw new Error(`Error fetching file: ${file.content}`);
        }

        const { message } = await response.json();
        chatData.history.push(message);
      } catch (error) {
        console.error('Error fetching file content:', error);
        displayMessage(chatData.history.length, `Error fetching file: ${file.content}`, 'assistant');
        chatData.history.push({
          role: 'assistant',
          content: `Error fetching file: ${file.content}`,
        });
      }
    });

    await Promise.all(fetchfilesPromises);

    const response = await fetch(`/history/${currentChatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history: chatData.history }),
    });

    await response.json();
    updateChat(true);
  } catch (error) {
    console.error('Error communicating with server:', error);
    displayMessage(chatData.history.length, 'Error communicating with server.', 'assistant');
    chatData.history.push({
      role: 'assistant',
      content: 'Error communicating with server.',
    });
  }
}

async function sendMessage(shouldSend) {
  const userInput = document.getElementById('chat-input');
  const sendMessageButton = document.getElementById('sendMessageButtonFalse');
  const message = userInput.value;

  if (!currentChatId || !message.trim()) return; // Ensure message is not empty

  // Display sending state
  sendMessageButton.disabled = true;
  sendMessageButton.textContent = 'Sending...';

  displayMessage(chatData.history.length, message, 'user');
  chatData.history.push({
      role: 'user',
      content: message
  });

  userInput.value = '';
  autoExpandTextarea();

  const files = getSelectedFiles();

  try {
      const response = await fetch(`/post_msg/${currentChatId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message, shouldSend, files })
      });

      const data = await response.json();
      const botResponse = data.botResponse;

      if (botResponse) {
          displayMessage(chatData.history.length, botResponse, 'assistant');
          chatData.history.push({
              role: 'assistant',
              content: botResponse
          });
      }
  } catch (error) {
      console.error('Error sending message:', error);
      displayMessage(chatData.history.length, 'Error communicating with server.', 'assistant');
      chatData.history.push({
          role: 'assistant',
          content: 'Error communicating with server.'
      });
  } finally {
      // Restore button state
      sendMessageButton.disabled = false;
      sendMessageButton.textContent = 'Send';
  }
}

// Handle the creation of a new chat via user prompt
function handleCreateChat() {
  const chatName = prompt('Enter chat name:');
  if (chatName) {
    const projectPath = prompt('Enter project directory:');
    createNewChat(chatName, projectPath);
  }
}

// Function to delete a message from chat history
async function deleteMessage(index) {
  chatData.history = chatData.history.filter((_, i) => i !== index);

  try {
    const response = await fetch(`/history/${currentChatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ history: chatData.history })
    });

    await response.json();
    updateChat(false);
  } catch (error) {
    console.error('Error communicating with server:', error);
    displayMessage(chatData.history.length, 'Error communicating with server.', 'assistant');
    chatData.history.push({
      role: 'assistant',
      content: 'Error communicating with server.'
    });
  }
}

// Execute a command for the chat
async function callCommand(command, content) {
  try {
    const response = await fetch(`/command/${currentChatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: currentChatId, command, content })
    });

    const data = await response.json();
    const message = data.message ? data.message : `Error: ${data.error} ${data.success}`;
    if (response.status !== 200) {
      alert(`Command error ${message}`);
    }
    return message;
  } catch (err) {
    console.log(err)
    alert(`Command error ${err.message}`);
    return "Error"
  }
}

// Function to display a message in chat
function displayMessage(index, message, role, roll = true) {
  const chatMessages = document.getElementById('chat-messages');
  const messageWrapper = document.createElement('div');
  const messageBubble = document.createElement('div');
  const messageContent = document.createElement('div');

  messageWrapper.classList.add(role === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper');
  messageBubble.classList.add(role === 'user' ? 'user-message' : 'bot-message');

  const messageHtml = marked.parse(message);

  const copyMessageButton = document.createElement('button');
  copyMessageButton.textContent = 'Copy';
  copyMessageButton.classList.add('btn', 'btn-sm', 'mt-2', 'chat-small-btn', 'btn-outline-light');

  copyMessageButton.addEventListener('click', () => {
    navigator.clipboard.writeText(message).then(() => {
      copyMessageButton.textContent = 'Copied!';
      setTimeout(() => { copyMessageButton.textContent = 'Copy Message'; }, 2000);
    }).catch(err => {
      console.error('Error copying message text:', err);
    });
  });

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="bi bi-trash">Delete</i>';
  deleteButton.classList.add('btn', 'btn-sm', 'mt-2', 'btn-danger', 'chat-small-btn', 'delete-btn');
  deleteButton.style.float = 'right';

  deleteButton.onclick = () => {
    deleteMessage(index);
    messageWrapper.remove();
  };

  const editButton = document.createElement('button');
  editButton.innerHTML = '<i class="bi bi-pencil">Edit</i>';
  editButton.classList.add('btn', 'btn-sm', 'mt-2', 'btn-warning', 'chat-small-btn', 'edit-btn');
  editButton.style.float = 'right';
  editButton.onclick = () => openEditMessageModal(index, message);

  messageContent.innerHTML = `<div class="user-message-mark">${messageHtml}</div>`;
  messageBubble.appendChild(messageContent);
  messageBubble.appendChild(deleteButton);
  messageBubble.appendChild(editButton);  // Add the edit button here
  messageBubble.appendChild(copyMessageButton);
  messageWrapper.appendChild(messageBubble);
  chatMessages.appendChild(messageWrapper);

  const codeBlocks = messageWrapper.querySelectorAll('pre code');

  codeBlocks.forEach((block) => {
    hljs.highlightBlock(block);

    const deployButton = document.createElement('button');
    deployButton.textContent = 'Deploy';
    deployButton.classList.add('copy-btn', 'btn', 'btn-sm', 'btn-outline-light');
    deployButton.style.marginRight = '80px';
    deployButton.style.float = 'right';

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.classList.add('copy-btn', 'btn', 'btn-sm', 'btn-outline-light');

    block.parentElement.style.position = 'relative';
    block.parentElement.insertBefore(copyButton, block);
    block.parentElement.insertBefore(deployButton, block);

    deployButton.addEventListener('click', () => {
      const codeText = block.innerText;
      deployCommand(deployButton, codeText);
    });

    copyButton.addEventListener('click', () => {
      const codeText = block.innerText;
      navigator.clipboard.writeText(codeText).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
      }).catch(err => {
        console.error('Error copying text:', err);
      });
    });
  });

  if (roll) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  window.onload = () => {
    if (currentChatId) {
      loadMessages(currentChatId);
    }
    loadChatList();

    const chatMessages = document.getElementById('chat-messages');
    const scrollToBottomButton = document.getElementById('scrollToBottom');

    chatMessages.addEventListener('scroll', () => checkScrollPosition(chatMessages, scrollToBottomButton));

    scrollToBottomButton.addEventListener('click', function () {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    checkScrollPosition(chatMessages, scrollToBottomButton);

    const chatInput = document.getElementById('chat-input');

    // Adiciona o evento de input para auto-expandir a text area
    chatInput.addEventListener('input', autoExpandTextarea);

    // Send message on Enter key press
    chatInput.addEventListener('keydown', function (event) {
      autoExpandTextarea();
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage(true);
      }
    });
  };
});


