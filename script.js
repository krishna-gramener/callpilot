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
const getStartedBtn = document.getElementById('get-started-btn');

// File Selection Elements
const selectEmailBtn = document.getElementById('select-email-btn');
const selectRecordingBtn = document.getElementById('select-recording-btn');
const emailFileStatus = document.getElementById('email-file-status');
const downloadCsvBtn = document.getElementById('download-csv');

// Action Buttons
const generatePlanBtn = document.getElementById('generate-plan-btn');
const processRecordingBtn = document.getElementById('process-recording-btn');

// Audio and Transcript Elements
const audioPlayerSection = document.getElementById('audio-player-section');
const audioPlayer = document.getElementById('audio-player');

// Processing Status Elements
const processingStatus = document.getElementById('processing-status');
const processingBar = document.getElementById('processing-bar');
const processingPercentage = document.getElementById('processing-percentage');
const processingStep = document.getElementById('processing-step');

// File paths
const EMAIL_FILE_PATH = 'assets/email.txt';
const RECORDING_FILE_PATH = 'assets/recording.mp3';
const TRANSCRIPT_FILE_PATH = 'assets/transcript.txt';

// Processing Status Management
function updateProcessingStatus(step, percentage) {
    processingStatus.classList.remove('hidden');
    processingBar.style.width = `${percentage}%`;
    processingPercentage.textContent = `${percentage}%`;
    processingStep.textContent = step;
}

function hideProcessingStatus() {
    processingStatus.classList.add('hidden');
    processingBar.style.width = '0%';
    processingPercentage.textContent = '0%';
    processingStep.textContent = '';
}
// Remove duplicate declarations

// Copy buttons
document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', async () => {
        const targetId = button.dataset.target;
        const content = document.getElementById(targetId).textContent;
        try {
            await navigator.clipboard.writeText(content);
            const span = button.querySelector('span');
            const originalText = span.textContent;
            span.textContent = 'Copied!';
            button.classList.add('text-green-600');
            setTimeout(() => {
                span.textContent = originalText;
                button.classList.remove('text-green-600');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    });
});

// Content Elements
const callPlanContent = document.getElementById('call-plan');
const clientEmailContent = document.getElementById('client-email');
const internalEmailContent = document.getElementById('internal-email');
const opportunityTable = document.getElementById('opportunity-table');
const sowDetails = document.getElementById('sow-details');
const callMetrics = document.getElementById('call-metrics');
const performanceAnalysis = document.getElementById('performance-analysis');

// Event Listeners
getStartedBtn.addEventListener('click', () => {
    landingPage.classList.add('opacity-0');
    landingPage.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
        landingPage.classList.add('hidden');
        mainApp.classList.remove('hidden');
        mainApp.classList.add('opacity-100');
        mainApp.style.transition = 'opacity 0.3s ease-in';
    }, 300);
});

// Initialize email selection
selectEmailBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(EMAIL_FILE_PATH);
        if (!response.ok) throw new Error('Failed to load email file');
        
        const emailContent = await response.text();
        
        // Show success indicator
        emailFileStatus.classList.remove('hidden');
        
        // Store content and enable button
        window.emailContent = emailContent;
        generatePlanBtn.disabled = false;
    } catch (error) {
        console.error('Error loading email file:', error);
        alert('Error loading email file. Please try again.');
    }
});

// Initialize recording selection
selectRecordingBtn.addEventListener('click', async () => {
    try {
        // Show audio player and transcript
        audioPlayerSection.classList.remove('hidden');
        processRecordingBtn.disabled = false;

        // Update tab status to show it's active
        updateTabStatus('recording-content', true);
    } catch (error) {
        console.error('Error loading recording/transcript:', error);
        alert('Error loading recording/transcript. Please try again.');
    }
});

// Tab Navigation
document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
        if (!tab.disabled) {
            switchTab(tab.dataset.tab);
        }
    });
});

// Action Buttons
generatePlanBtn.addEventListener('click', generateCallPlan);
processRecordingBtn.addEventListener('click', processRecording);
downloadCsvBtn.addEventListener('click', downloadOpportunityCSV);





// Tab Management
function switchTab(tabId) {
    // Allow switching to recording-content tab after plan-content is complete
    if (tabId === 'recording-content' && contentStatus['plan-content']) {
        // This is okay - we want to allow this transition
    } else if (!contentStatus[tabId] && tabId !== 'email-content') {
        console.warn('Attempting to switch to tab with incomplete content:', tabId);
        return;
    }

    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.classList.remove('border-blue-600', 'text-blue-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    
    selectedTab.classList.remove('hidden');
    tabButton.classList.remove('border-transparent', 'text-gray-500');
    tabButton.classList.add('border-blue-600', 'text-blue-600');
    
    currentTab = tabId;
}

// Enable next tab in sequence
function enableNextTab() {
    const currentIndex = tabOrder.indexOf(currentTab);
    if (currentIndex < tabOrder.length - 1) {
        const nextTabId = tabOrder[currentIndex + 1];
        const nextTab = document.querySelector(`[data-tab="${nextTabId}"]`);
        nextTab.disabled = false;
        switchTab(nextTabId);
    }
}

// Update tab status and visibility
function updateTabStatus(tabId, isReady) {
    contentStatus[tabId] = isReady;
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    const nextTabId = tabOrder[tabOrder.indexOf(tabId) + 1];

    if (isReady) {
        // Update current tab style
        tabButton.classList.remove('text-gray-400', 'opacity-50', 'cursor-not-allowed');
        tabButton.classList.add('text-gray-700', 'hover:text-blue-600', 'hover:border-blue-600');

        // Enable next tab if exists
        if (nextTabId) {
            const nextTab = document.querySelector(`[data-tab="${nextTabId}"]`);
            nextTab.disabled = false;
            nextTab.classList.remove('text-gray-400', 'opacity-50', 'cursor-not-allowed');
            nextTab.classList.add('text-gray-700', 'hover:text-blue-600', 'hover:border-blue-600');
        }
    }
}

// Tab management
let currentTab = 'email-content';
const tabOrder = ['email-content', 'plan-content', 'recording-content', 'emails-content', 'opportunity-content', 'coaching-content'];

// Track content readiness
const contentStatus = {
    'email-content': false,
    'plan-content': false,
    'recording-content': false,
    'emails-content': false,
    'opportunity-content': false,
    'coaching-content': false
};

// Main Processing Functions
async function generateCallPlan() {
    try {
        generatePlanBtn.disabled = true;
        generatePlanBtn.textContent = 'Generating...';
        updateProcessingStatus('Loading email thread...', 10);

        // Load email content
        const response = await fetch(EMAIL_FILE_PATH);
        if (!response.ok) throw new Error('Failed to load email file');
        const emailContent = await response.text();

        updateProcessingStatus('Analyzing email thread...', 25);
        const callPlanSystemPrompt = `You are an expert sales strategist. Create a detailed yet concise call plan based on the email thread. Include:
            1. Agenda (3-5 bullet points)
            2. Qualification hypotheses
            3. Discovery questions grouped by: Scope, Timeline, Compliance, Budget, Decision process
            4. Watch-outs (likely objections + competitor angles)`;

        updateProcessingStatus('Generating call plan...', 50);
        const callPlan = await callLLM(callPlanSystemPrompt, emailContent);
        callPlanContent.innerHTML = marked.parse(callPlan);
        
        updateProcessingStatus('Finalizing call plan...', 90);
        // Update tab status and move to next tab
        updateTabStatus('plan-content', true);
        updateTabStatus('recording-content', false); // Initialize next tab
        enableNextTab();
        
        hideProcessingStatus();

                // Reset recording state
        processRecordingBtn.disabled = true;
        audioPlayerSection.classList.add('hidden');

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating call plan. Please try again.');
    } finally {
        generatePlanBtn.disabled = false;
        generatePlanBtn.textContent = 'Generate Call Plan';
    }
}

async function processRecording() {
    try {
        processRecordingBtn.disabled = true;
        processRecordingBtn.textContent = 'Processing...';
        updateProcessingStatus('Loading transcript...', 10);

        // Load transcript
        const response = await fetch(TRANSCRIPT_FILE_PATH);
        if (!response.ok) throw new Error('Failed to load transcript');
        const transcript = await response.text();
        window.transcriptContent = transcript; // Store for later use
        
        updateProcessingStatus('Analyzing transcript...', 30);
        // Format and display transcript
        const transcriptHtml = `<div class="p-4 text-gray-600 whitespace-pre-wrap font-mono">${transcript}</div>`;

        

        if (!transcript) {
            throw new Error('No transcript content available');
        }

        // Show transcript in the recording tab
        const transcriptSection = document.createElement('div');
        transcriptSection.className = 'mt-6 bg-white p-6 rounded-lg border border-gray-200';
        transcriptSection.innerHTML = transcriptHtml
        document.getElementById('recording-content').appendChild(transcriptSection);

        // Update recording tab status
        updateTabStatus('recording-content', true);

        updateProcessingStatus('Generating follow-up emails...', 50);
        // Generate emails with safe content checking
        const [clientEmail, internalEmail] = await Promise.all([
            generateClientEmail(transcript),
            generateInternalEmail(transcript)
        ]);

        clientEmailContent.innerHTML = marked.parse(clientEmail || 'Error generating client email');
        internalEmailContent.innerHTML = marked.parse(internalEmail || 'Error generating internal email');
        updateTabStatus('emails-content', true);
        updateProcessingStatus('Processing opportunity details...', 70);

        // Generate opportunity details
        await generateOpportunityDetails(transcript);
        updateTabStatus('opportunity-content', true);
        updateProcessingStatus('Generating coaching feedback...', 90);

        // Generate coaching feedback
        await generateCoachingFeedback(transcript);
        updateTabStatus('coaching-content', true);

        enableNextTab();
        hideProcessingStatus();

    } catch (error) {
        console.error('Error:', error);
        alert('Error processing recording. Please try again.');
    } finally {
        processRecordingBtn.disabled = false;
        processRecordingBtn.textContent = 'Process Recording';
    }
}

async function generateClientEmail(transcript) {
    const clientEmailPrompt = "Generate a concise, professional client follow-up email based on the call transcript. Keep it focused and action-oriented.";
    return await callLLM(clientEmailPrompt, transcript);
}

async function generateInternalEmail(transcript) {
    const internalEmailPrompt = "Generate a concise internal team email with key action items and next steps based on the call transcript.";
    return await callLLM(internalEmailPrompt, transcript);
}

async function generateOpportunityDetails(transcript) {
    try {
        // First, get opportunity details in JSON format
        const opportunityPrompt = `Extract the following details from the call transcript and return them in this exact JSON format:
{
    "opportunityName": "name of the opportunity",
    "serviceLine": "primary service line",
    "stage": "current stage of the opportunity",
    "amount": "deal amount with currency",
    "closeDate": "expected close date",
    "nextStep": "next action items",
    "competitors": "list of competitors",
    "keyObjections": "main objections raised",
    "scientificArea": "scientific area or therapeutic area",
    "tags": ["relevant", "tags", "for", "the", "opportunity"]
}`;

        updateProcessingStatus('Extracting opportunity details...', 75);
        const opportunityResponse = await callLLM(opportunityPrompt, transcript);
        const opportunityDetails = JSON.parse(opportunityResponse);
        
        // Then, get SOW details separately
        const sowPrompt = `Based on the call transcript, provide a detailed Statement of Work (SOW) breakdown with the following sections. Format in markdown with clear headers and bullet points:

# Scope
- Indication/Therapeutic Area
- Modality
- Models/Species involved

# Technical Details
- Key endpoints
- Volume requirements
- Quality standards (GLP/GMP requirements)

# Timeline
- Project milestones
- Start date
- Key deliverables

# Additional Specifications
- Any specific requirements
- Special considerations
- Technical constraints`;

        updateProcessingStatus('Generating SOW details...', 85);
        const sowResponse = await callLLM(sowPrompt, transcript);

        // Update the UI
        updateOpportunityTable(opportunityDetails);
        sowDetails.innerHTML = marked.parse(sowResponse);

        return opportunityDetails; // Return for potential use in CSV export
    } catch (error) {
        console.error('Error generating opportunity details:', error);
        sowDetails.innerHTML = marked.parse('Error generating opportunity details. Please try again.');
        throw error;
    }

}

async function generateCoachingFeedback(transcript) {
    const coachingPrompt = `Analyze the call and provide feedback in the following JSON format:
        {
            "metrics": {
                "talkListenRatio": "ratio",
                "questionCoverage": "percentage",
                "objectionHandling": "score",
                "competitorResponses": "score",
                "nextStepClarity": "score"
            },
            "analysis": {
                "strengths": "key strengths",
                "missedProbes": "missed opportunities",
                "suggestedPhrasing": "improvement suggestions"
            }
        }`;

    try {
        const feedback = await callLLM(coachingPrompt, transcript);
        const parsedFeedback = JSON.parse(feedback);
        
        // Update metrics with safe content checking
        updateCallMetrics(parsedFeedback.metrics || {});
        
        // Update analysis with safe content checking
        updatePerformanceAnalysis(parsedFeedback.analysis || {});
    } catch (error) {
        console.error('Error generating coaching feedback:', error);
        callMetrics.innerHTML = '<div class="text-red-500">Error generating metrics</div>';
        performanceAnalysis.innerHTML = '<div class="text-red-500">Error generating analysis</div>';
    }
}

// Utility Functions
async function fetchFileContent(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load file from ${path}`);
    return response.text();
}

function updateOpportunityTable(details) {
    const fields = [
        { key: 'opportunityName', label: 'Opportunity' },
        { key: 'serviceLine', label: 'Service Line' },
        { key: 'stage', label: 'Stage' },
        { key: 'amount', label: 'Amount' },
        { key: 'closeDate', label: 'Close Date' },
        { key: 'nextStep', label: 'Next Steps' },
        { key: 'competitors', label: 'Competitors' },
        { key: 'keyObjections', label: 'Key Objections' },
        { key: 'scientificArea', label: 'Scientific Area' }
    ];

    // Clear existing table
    opportunityTable.innerHTML = '';

    // Create table row
    const row = document.createElement('tr');
    fields.forEach(field => {
        const td = document.createElement('td');
        td.className = 'px-3 py-2 text-sm';
        td.textContent = details[field.key] || 'N/A';
        row.appendChild(td);
    });
    opportunityTable.appendChild(row);

    // Store the data for CSV export
    window.opportunityData = {
        fields: fields,
        details: details
    };
}

function formatKey(key) {
    // Convert camelCase or snake_case to Title Case with spaces
    return key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim();
}

function updateCallMetrics(metrics) {
    callMetrics.innerHTML = Object.entries(metrics)
        .map(([key, value]) => `<div class="flex justify-between p-2 border-b border-gray-100 last:border-0">
            <span class="font-medium text-gray-700">${formatKey(key)}:</span>
            <span class="text-gray-600">${value}</span>
        </div>`)
        .join('');
}

function updatePerformanceAnalysis(analysis) {
    performanceAnalysis.innerHTML = Object.entries(analysis)
        .map(([key, value]) => `<div class="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
            <div class="font-medium text-gray-900 mb-1">${formatKey(key)}</div>
            <div class="text-gray-600 text-sm">${value}</div>
        </div>`)
        .join('');
}

function downloadOpportunityCSV() {
    if (!window.opportunityData) {
        console.error('No opportunity data available');
        return;
    }

    const { fields, details } = window.opportunityData;
    
    // Create CSV content
    const headers = fields.map(f => f.label);
    const values = fields.map(f => details[f.key] || 'N/A');
    
    let csvContent = [
        headers.join(','),
        values.map(v => `"${v.replace(/"/g, '""')}"`).join(',')
    ].join('\n');

    // Add SOW section if available
    if (sowDetails.textContent) {
        csvContent += '\n\nStatement of Work\n' + sowDetails.textContent.replace(/\n/g, ' ').replace(/,/g, ';');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `opportunity_details_${timestamp}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    // Show success message
    const downloadBtn = document.getElementById('download-csv');
    const btnText = downloadBtn.textContent;
    downloadBtn.textContent = '✓ Downloaded';
    downloadBtn.classList.remove('bg-green-600');
    downloadBtn.classList.add('bg-green-500');
    
    setTimeout(() => {
        downloadBtn.textContent = btnText;
        downloadBtn.classList.remove('bg-green-500');
        downloadBtn.classList.add('bg-green-600');
    }, 2000);
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
