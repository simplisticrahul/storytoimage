let chatHistory = []; // Stores chat history

// Handles user message and bot response
async function sendMessage() {
  const promptInput = document.getElementById('promptInput');
  const prompt = promptInput.value.trim();
  const model = document.getElementById('modelSelect').value; // Get selected model

  if (!prompt) {
    alert('Please enter a message.');
    return;
  }

  // Display user message
  addMessage(prompt, "user-message");
  addToHistory("User", prompt);
  promptInput.value = "";

  try {
    // Generate context from chat history
    const context = generateContext();
    const fullPrompt = `${context}\nUser: ${prompt}`;

    console.log("Prompt Sent:", fullPrompt); // Debugging
    console.log("Prompt Length:", fullPrompt.length);

    // Fetch bot response based on model
    const botResponse = await getBotResponse(fullPrompt, model);
    console.log("Response Length:", botResponse.length); // Debugging

    const botMessageDiv = addMessage("", "bot-message");

    // Display formatted bot response dynamically
    await displayFormattedText(botResponse, botMessageDiv, 50);

    addToHistory("Bot", botResponse); // Save bot response to history
  } catch (error) {
    console.error("Error:", error.message); // Log error
    const errorMessage = "Sorry, I couldn't process your request. Please try again.";
    addMessage(errorMessage, "bot-message");
    addToHistory("Bot", errorMessage);
  }
}

// Generates context from chat history
function generateContext() {
  let context = "";
  const maxLength = 10000; // Limit context length

  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const entry = `${chatHistory[i].role}: ${chatHistory[i].text}`;
    if ((context.length + entry.length) > maxLength) break;
    context = entry + "\n" + context;
  }
  return context;
}

// Adds messages to the chatbox
function addMessage(message, className) {
  const chatbox = document.getElementById('chatbox');
  const div = document.createElement('div');
  div.classList.add(className);
  div.innerHTML = message; // Add message with HTML formatting
  chatbox.appendChild(div);
  return div; // Return the div for updates
}

// Displays text dynamically with formatting
async function displayFormattedText(text, element, delay) {
  const chatbox = document.getElementById('chatbox'); // Needed for scrolling
  const maxLength = 10000; // Instant render if text exceeds this length

  // Format bold and underlined text
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // **Bold**
    .replace(/###(.*?)###/g, "<u>$1</u>"); // ###Underlined###

  if (formattedText.length > maxLength) {
    element.innerHTML = formattedText.replace(/\n/g, "<br>"); // Render instantly
    chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });
    return;
  }

  const paragraphs = formattedText.split('\n\n'); // Split into paragraphs

  for (const para of paragraphs) {
    const sentences = para.split(/(?<=[.?!])\s+/); // Split into sentences
    for (const sentence of sentences) {
      await appendWithDelay(sentence + " ", element, delay);
    }
    await appendWithDelay("<br><br>", element, delay);
  }

  // Smooth scroll after rendering
  chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });
}

// Appends text with delay for typing effect
function appendWithDelay(text, element, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      element.innerHTML += text.replace(/\n/g, "<br>"); // Replace newline with HTML break
      resolve();
    }, delay);
  });
}

// Fetches bot response based on model selection
async function getBotResponse(prompt, model) {
  
  const randomSeed = Math.floor(Math.random() * 100000000); // Generate a random seed between 0 and 99999999
  const baseUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${randomSeed}&json=false&model=${model}&system=Dear assistance, I'm planning to launch a YouTube channel where I put video of  Moral Stories animation. I want you to become all Purpose story writer. 

Start: generate youself

ending: generate yourself

Plot: genrerate logical 

Don't talk about: illogical things

Setting: generate yourself.

word count: 3000.

Format: First Write teh word count then Charcter list with gender age and then Story

Writing style: story is being Narrated by Narrator and with character dialouges in between. 

Point of view: Third person Narration.

Suspension build-up: slow.

Language: Hindi`;

  try {
    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch bot response.");
    }

    const text = await response.text(); // Assume plain text response
    return text || "No response received.";
  } catch (error) {
    console.error("API Error:", error.message); // Debugging
    return "Sorry, I couldn't process your request. Please try again later.";
  }
}

// Saves messages to chat history
function addToHistory(role, text) {
  chatHistory.push({ role, text });
  if (chatHistory.length > 20) chatHistory.shift(); // Keep last 20 messages
}

// Starts a new chat and clears history
function startNewChat() {
  chatHistory = [];
  const chatbox = document.getElementById('chatbox');
 //chatbox.innerHTML = " "; // Clear chatbox
  // Reset the model selection to default
//  const modelSelect = document.getElementById('modelSelect');
//  modelSelect.selectedIndex = 0; // Reset to the first option
}

// Saves chat history to a text file
function saveChat() {
  let chatContent = chatHistory
    .map(item => `${item.role}: ${item.text}`)
    .join("\n\n"); // Format messages with double line breaks

  // Create a Blob object with chat content
  const blob = new Blob([chatContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  // Set download filename
  link.download = `chat_history_${new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "_")}.txt`;

  // Append link to the body
  document.body.appendChild(link);
  link.click(); // Trigger download
  document.body.removeChild(link); // Remove link
}