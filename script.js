// LLM Settings Management
let llmConfig = {
    baseUrl: "",
    token: ""
};

// Load LLM settings from localStorage
function loadLLMSettings() {
    const savedConfig = localStorage.getItem('llmConfig');
    if (savedConfig) {
        llmConfig = JSON.parse(savedConfig);
        document.getElementById('llm-baseurl').value = llmConfig.baseUrl;
        document.getElementById('llm-token').value = llmConfig.token;
    }
}

// Save LLM settings to localStorage
function saveLLMSettings() {
    const baseUrl = document.getElementById('llm-baseurl').value.trim();
    const token = document.getElementById('llm-token').value.trim();
    
    if (!baseUrl || !token) {
        alert('Please enter both Base URL and API Token');
        return;
    }
    
    llmConfig = { baseUrl, token };
    localStorage.setItem('llmConfig', JSON.stringify(llmConfig));
    toggleSettingsModal(false);
    alert('Settings saved successfully!');
}

// Toggle settings modal
function toggleSettingsModal(show) {
    const modal = document.getElementById('settings-modal');
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

// Check for LLM settings on page load
window.addEventListener('load', () => {
    loadLLMSettings();
    if (!llmConfig.token) {
        toggleSettingsModal(true);
    }
});

// Copy to clipboard functionality
document.addEventListener('click', async function(event) {
    const button = event.target.closest('.copy-btn');
    if (!button) return;

    const targetId = button.dataset.target;
    const content = document.getElementById(targetId).innerText;
    
    try {
        await navigator.clipboard.writeText(content);
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i><span class="text-sm">Copied!</span>';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard');
    }
});

// DOM Elements
const landingPage = document.getElementById('landing-page');
const mainApp = document.getElementById('main-app');
const beginBtn = document.getElementById('begin-btn');
const emailFileInput = document.getElementById('email-file');
const audioFileInput = document.getElementById('audio-file');
const transcriptFileInput = document.getElementById('transcript-file');
const emailFileName = document.getElementById('email-file-name');
const audioFileName = document.getElementById('audio-file-name');
const transcriptFileName = document.getElementById('transcript-file-name');
const processBtn = document.getElementById('process-btn');
const resultsSection = document.getElementById('results-section');

// Event Listeners
beginBtn.addEventListener('click', () => {
    landingPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
});

// File upload handlers
emailFileInput.addEventListener('change', handleFileSelect);
audioFileInput.addEventListener('change', handleAudioTranscriptSelect);
transcriptFileInput.addEventListener('change', handleAudioTranscriptSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    emailFileName.textContent = file.name;
    updateProcessButton();
}

function handleAudioTranscriptSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Clear the other input when one is selected
    if (event.target.id === 'audio-file') {
        transcriptFileInput.value = '';
        transcriptFileName.textContent = '';
        audioFileName.textContent = file.name;
    } else {
        audioFileInput.value = '';
        audioFileName.textContent = '';
        transcriptFileName.textContent = file.name;
    }

    updateProcessButton();
}

function updateProcessButton() {
    const hasEmailFile = emailFileInput.files[0];
    const hasAudioOrTranscript = audioFileInput.files[0] || transcriptFileInput.files[0];
    processBtn.disabled = !(hasEmailFile && hasAudioOrTranscript);
}

// Process button handler
processBtn.addEventListener('click', async () => {
    try {
        const emailFile = emailFileInput.files[0];
        const audioFile = audioFileInput.files[0];
        const transcriptFile = transcriptFileInput.files[0];

        // Read email content
        const emailContent = await readFileContent(emailFile);
        
        // Get either audio base64 or transcript content
        let audioOrTranscriptContent;
        if (audioFile) {
            audioOrTranscriptContent = await fileToBase64(audioFile);
        } else if (transcriptFile) {
            audioOrTranscriptContent = await readFileContent(transcriptFile);
        }

        // Process the files
        await processFiles(emailContent, audioOrTranscriptContent);
        
    } catch (error) {
        console.error('Error processing files:', error);
        alert('An error occurred while processing the files. Please try again.');
    }
});

// Utility functions
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

// Main LLM function as provided
async function callLLM(systemPrompt, userMessage) {
    if (!llmConfig.token) {
        alert('Please configure your LLM settings first');
        toggleSettingsModal(true);
        throw new Error('LLM settings not configured');
    }

    try {
        const response = await fetch(llmConfig.baseUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${llmConfig.token}:callPilot`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
            }),
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message || "API error occurred");
        }
        return data.choices?.[0]?.message?.content || "No response received";
    } catch (error) {
        console.error(error);
        throw new Error(`API call failed: ${error.message}`);
    }
}

// Process files and generate results
async function processFiles(emailContent, audioOrTranscriptContent) {
    try {
        // Show loading state
        processBtn.disabled = true;
        processBtn.textContent = 'Processing...';

        // 1. Get transcript (either from audio or directly from file)
        let transcript;
        if (audioFileInput.files[0]) {
            const transcriptSystemPrompt = "You are an expert audio transcriber. Convert the provided audio to text accurately.";
            transcript = await callLLM(transcriptSystemPrompt, audioOrTranscriptContent);
        } else {
            transcript = audioOrTranscriptContent; // This is actually the transcript content
        }
        document.getElementById('transcript-content').innerHTML = marked.parse(transcript);

        // 2. Generate action plan based on email thread
        const actionPlanSystemPrompt = "You are an expert business analyst. Create a detailed action plan based on the email thread.";
        const actionPlan = await callLLM(actionPlanSystemPrompt, emailContent);
        document.getElementById('action-plan-content').innerHTML = marked.parse(actionPlan);

        // 3. Generate client email
        const clientEmailSystemPrompt = "You are a professional business communicator. Create a client-facing email based on the action plan.";
        const clientEmail = await callLLM(clientEmailSystemPrompt, actionPlan);
        document.getElementById('client-email-content').innerHTML = marked.parse(clientEmail);

        // 4. Generate internal team email
        const internalEmailSystemPrompt = "You are a team lead. Create an internal team email with next steps and responsibilities.";
        const internalEmail = await callLLM(internalEmailSystemPrompt, actionPlan);
        document.getElementById('internal-email-content').innerHTML = marked.parse(internalEmail);

        // 5. Generate conversation analysis and improvement tips
        const reviewSystemPrompt = `You are an expert communication coach. Analyze the conversation from the transcript and provide:
1. A brief overview of the conversation style and tone
2. Key strengths demonstrated in the communication
3. Specific areas for improvement
4. Actionable tips for enhancing future conversations
5. Best practices that could have been applied

Format your response in markdown with clear headings and bullet points.`;
        const review = await callLLM(reviewSystemPrompt, transcript);
        document.getElementById('review-content').innerHTML = marked.parse(review);

        // Show results
        resultsSection.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing the files. Please try again.');
    } finally {
        // Reset button state
        processBtn.disabled = false;
        processBtn.textContent = 'Process Files';
    }
}
