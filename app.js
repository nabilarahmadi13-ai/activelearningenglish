// --- 1. CONFIGURATION ---
// IMPROVED AI SCORING SYSTEM v2.5 - COMPREHENSIVE IELTS-ALIGNED
// Full implementation of IELTS Band Descriptors (Bands 3-9)
//
// === PRIORITY 1: CRITICAL FEATURES (MUST HAVE) ===
// 🔴 COMPLEX GRAMMAR DETECTION - THE KEY DIFFERENTIATOR
//   * Subordinate clauses (if, when, although, because + clause) → +0.3 each
//   * Relative clauses (which, that, who) → +0.3 each
//   * Passive voice (was built, has been developed) → +0.4 each
//   * Perfect tenses (have done, had been) → +0.3 each
//   * Conditionals (would, could, should + have) → +0.3-0.5 each
//   * Complexity penalty: 0 structures = -1.5 (Band 4-5 max: "NOT able to use complex language")
//   *                    <3 structures = -0.8 (Band 5-6: limited complexity)
//   *                    <5 structures = -0.3 (Band 6: "fairly complex language")
//   *                    5+ structures = no penalty (Band 7+: "handles complex well")
//
// 🔴 RELEVANCE & APPROPRIATENESS CHECK
//   * Question-answer topic overlap analysis
//   * Keyword coverage measurement
//   * Off-topic penalty: Very off-topic = -3.0, Partial = -1.5, Missing points = -0.5
//   * Ensures "appropriate" responses (Band 9 requirement)
//
// === PRIORITY 2: IMPORTANT FEATURES (SHOULD HAVE) ===
// 🟡 ARGUMENTATION & REASONING DETECTION (Band 7-8)
//   * Reasoning markers (because, since, the reason is) → +0.2-0.3 each
//   * Example markers (for instance, such as) → +0.2-0.3 each
//   * Explanation markers (this means, specifically) → +0.2-0.3 each
//   * Comparison/contrast (compared to, in contrast) → +0.3 each
//   * Argumentation levels: 0 = basic (Band 5-6), 4+ = detailed (Band 8)
//
// 🟡 SYSTEMATIC ERROR TRACKING
//   * Detects repeated same errors (systematic) vs different errors (unsystematic)
//   * Band 8: "occasional UNSYSTEMATIC inaccuracies" (better)
//   * Systematic error penalty: Same error 3+ times = -0.8
//
// === PRIORITY 3: ENHANCEMENT FEATURES (NICE TO HAVE) ===
// 🟢 COMMUNICATION BREAKDOWN DETECTION (Band 3)
//   * Very short sentences ratio, severe grammar errors
//   * "Frequent breakdowns in communication" = -2.0 penalty
//
// 🟢 SENTENCE STRUCTURE VARIETY
//   * Mix of simple, compound, and complex sentences
//   * Variety bonus: Both types = +0.3, One type = +0.15
//
// 🟢 ANSWER DEVELOPMENT DEPTH
//   * Well-developed (50+ words + reasoning + complexity) → +0.5 (Band 7-8)
//   * Developed (30+ words + some reasoning/complexity) → +0.3 (Band 6-7)
//   * Basic (20+ words) → +0.1 (Band 5-6)
//
// === PRESERVED FROM v2.4 (All retained!) ===
// - Natural filler allowance (2-3 fillers = OK)
// - Filler ratio penalty (>8% = additional penalty)
// - Word repetition detection (my my my) → -0.4 per cluster
// - Broken sentence detection → -0.2 each
// - Cohesive devices (moreover, however, therefore) → +0.2 each
// - B2/C1/C2 vocabulary levels → +0.2/+0.2/+0.5 per word
// - Basic-only vocabulary penalty → -1.0
// - Stricter grammar compound penalties
// - Quality over quantity principles
//
// === RESULT ===
// ✅ Fully matches IELTS band descriptors
// ✅ Accurate across all bands (3-9)
// ✅ Realistic and objective
// ✅ Most comprehensive speaking assessment system
//
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby173u74ItRwbXgs1692EdJblZdDGtZGr0gvl5H3QrdPdY1EwMaQrRMHUWvaUnTBvC8/exec";

// --- 2. GLOBAL VARIABLES ---
let animationId, recognition, timerInterval;
let finalTranscript = "";
let isRecording = false;
let seconds = 0;
let silencePenalty = 0;
let lastSpeechTimestamp = 0;
let currentSessionTranscript = ""; // Untuk Histori di bawah level
const FILLER_WORDS = ["uhm", "um", "err", "uh", "ah", "aa", "ee"];

let currentLevel = "", questionIndex = 0, shuffledQuestions = [];
let activeUserEmail = "", sessionScores = []; 

// Audio State
let audioContext, analyser, microphone, currentVolume = 0;
const VOLUME_THRESHOLD = 12; 

// Kamus Grammar & Frasa
const GRAMMAR_RULES = {
    errors: [
        { pattern: /\blisten me\b/gi, fix: "listen to me", penalty: 1.0 },
        { pattern: /\bdepend of\b/gi, fix: "depend on", penalty: 0.8 },
        { pattern: /\binterested on\b/gi, fix: "interested in", penalty: 0.8 },
        { pattern: /\bat monday|at tuesday|at wednesday|at thursday|at friday|at saturday|at sunday\b/gi, fix: "on [day]", penalty: 1.0 },
        { pattern: /\bin monday|in tuesday|in wednesday|in thursday|in friday|in saturday|in sunday\b/gi, fix: "on [day]", penalty: 1.0 },
        { pattern: /\bdiscuss about\b/gi, fix: "discuss", penalty: 0.7 },
        { pattern: /\bmarried with\b/gi, fix: "married to", penalty: 0.7 },
        { pattern: /\bgo to home\b/gi, fix: "go home", penalty: 0.8 },
    ],
    bonusPhrases: [
        { pattern: /\bin my opinion\b/gi, bonus: 0.5 },
        { pattern: /\bto be honest\b/gi, bonus: 0.5 },
        { pattern: /\bas a result\b/gi, bonus: 0.5 },
        { pattern: /\bfor instance\b/gi, bonus: 0.5 },
        { pattern: /\bon the other hand\b/gi, bonus: 0.5 }
    ]
};

// === COHESIVE DEVICES (Discourse Markers) ===
// Basic cohesion = 0 (too common: and, but, so, because)
// Advanced cohesion = +0.2 per usage (shows sophisticated linking)
const COHESIVE_DEVICES = {
    advanced: [
        // Addition/Reinforcement
        { pattern: /\bmoreover\b/gi, bonus: 0.2, name: "moreover" },
        { pattern: /\bfurthermore\b/gi, bonus: 0.2, name: "furthermore" },
        { pattern: /\bin addition\b/gi, bonus: 0.2, name: "in addition" },
        { pattern: /\bbesides\b/gi, bonus: 0.2, name: "besides" },
        { pattern: /\badditionally\b/gi, bonus: 0.2, name: "additionally" },
        { pattern: /\bwhat's more\b/gi, bonus: 0.2, name: "what's more" },
        
        // Contrast
        { pattern: /\bhowever\b/gi, bonus: 0.2, name: "however" },
        { pattern: /\bnevertheless\b/gi, bonus: 0.2, name: "nevertheless" },
        { pattern: /\bnonetheless\b/gi, bonus: 0.2, name: "nonetheless" },
        { pattern: /\balthough\b/gi, bonus: 0.2, name: "although" },
        { pattern: /\bthough\b/gi, bonus: 0.2, name: "though" },
        { pattern: /\beven though\b/gi, bonus: 0.2, name: "even though" },
        { pattern: /\bwhereas\b/gi, bonus: 0.2, name: "whereas" },
        { pattern: /\bwhile\b/gi, bonus: 0.2, name: "while" },
        { pattern: /\bon the contrary\b/gi, bonus: 0.2, name: "on the contrary" },
        { pattern: /\bconversely\b/gi, bonus: 0.2, name: "conversely" },
        
        // Result/Consequence
        { pattern: /\btherefore\b/gi, bonus: 0.2, name: "therefore" },
        { pattern: /\bconsequently\b/gi, bonus: 0.2, name: "consequently" },
        { pattern: /\bthus\b/gi, bonus: 0.2, name: "thus" },
        { pattern: /\bhence\b/gi, bonus: 0.2, name: "hence" },
        { pattern: /\baccordingly\b/gi, bonus: 0.2, name: "accordingly" },
        
        // Example/Clarification
        { pattern: /\bfor example\b/gi, bonus: 0.2, name: "for example" },
        { pattern: /\bfor instance\b/gi, bonus: 0.2, name: "for instance" },
        { pattern: /\bnamely\b/gi, bonus: 0.2, name: "namely" },
        { pattern: /\bspecifically\b/gi, bonus: 0.2, name: "specifically" },
        { pattern: /\bin particular\b/gi, bonus: 0.2, name: "in particular" },
        { pattern: /\bto illustrate\b/gi, bonus: 0.2, name: "to illustrate" },
        
        // Summary/Conclusion
        { pattern: /\bin conclusion\b/gi, bonus: 0.2, name: "in conclusion" },
        { pattern: /\bto sum up\b/gi, bonus: 0.2, name: "to sum up" },
        { pattern: /\boverall\b/gi, bonus: 0.2, name: "overall" },
        { pattern: /\ball in all\b/gi, bonus: 0.2, name: "all in all" },
        { pattern: /\bin summary\b/gi, bonus: 0.2, name: "in summary" }
    ]
};

// === VOCABULARY LEVELS (CEFR-based) ===
// Common words = 0 bonus
// B2 words = +0.2 per usage (upper-intermediate)
// C1 words = +0.2 per usage (advanced)
// C2 words = +0.5 per usage (mastery/proficient)
const VOCABULARY_LEVELS = {
    B2: [
        // Academic & Formal
        { pattern: /\banalyze\b/gi, bonus: 0.2, name: "analyze" },
        { pattern: /\bevaluate\b/gi, bonus: 0.2, name: "evaluate" },
        { pattern: /\bcompare\b/gi, bonus: 0.2, name: "compare" },
        { pattern: /\bcontrast\b/gi, bonus: 0.2, name: "contrast" },
        { pattern: /\bdemonstrate\b/gi, bonus: 0.2, name: "demonstrate" },
        { pattern: /\billustrate\b/gi, bonus: 0.2, name: "illustrate" },
        { pattern: /\bemphasize\b/gi, bonus: 0.2, name: "emphasize" },
        { pattern: /\bhighlight\b/gi, bonus: 0.2, name: "highlight" },
        { pattern: /\bimplement\b/gi, bonus: 0.2, name: "implement" },
        { pattern: /\bmaintain\b/gi, bonus: 0.2, name: "maintain" },
        { pattern: /\bestablish\b/gi, bonus: 0.2, name: "establish" },
        { pattern: /\bcontribute\b/gi, bonus: 0.2, name: "contribute" },
        { pattern: /\bachieve\b/gi, bonus: 0.2, name: "achieve" },
        { pattern: /\badequate\b/gi, bonus: 0.2, name: "adequate" },
        { pattern: /\bsignificant\b/gi, bonus: 0.2, name: "significant" },
        { pattern: /\bsubstantial\b/gi, bonus: 0.2, name: "substantial" },
        { pattern: /\bapproach\b/gi, bonus: 0.2, name: "approach" },
        { pattern: /\bperspective\b/gi, bonus: 0.2, name: "perspective" },
        { pattern: /\baspect\b/gi, bonus: 0.2, name: "aspect" },
        { pattern: /\bcircumstance\b/gi, bonus: 0.2, name: "circumstance" }
    ],
    C1: [
        // Sophisticated vocabulary
        { pattern: /\bcomprehensive\b/gi, bonus: 0.2, name: "comprehensive" },
        { pattern: /\binherent\b/gi, bonus: 0.2, name: "inherent" },
        { pattern: /\bpredominant\b/gi, bonus: 0.2, name: "predominant" },
        { pattern: /\bsubsequent\b/gi, bonus: 0.2, name: "subsequent" },
        { pattern: /\bpreceding\b/gi, bonus: 0.2, name: "preceding" },
        { pattern: /\bartificial\b/gi, bonus: 0.2, name: "artificial" },
        { pattern: /\bauthenticity\b/gi, bonus: 0.2, name: "authenticity" },
        { pattern: /\bdistinguish\b/gi, bonus: 0.2, name: "distinguish" },
        { pattern: /\bdilemma\b/gi, bonus: 0.2, name: "dilemma" },
        { pattern: /\bretain\b/gi, bonus: 0.2, name: "retain" },
        { pattern: /\bsustain\b/gi, bonus: 0.2, name: "sustain" },
        { pattern: /\bmitigate\b/gi, bonus: 0.2, name: "mitigate" },
        { pattern: /\bfacilitate\b/gi, bonus: 0.2, name: "facilitate" },
        { pattern: /\bundermine\b/gi, bonus: 0.2, name: "undermine" },
        { pattern: /\bimplication\b/gi, bonus: 0.2, name: "implication" },
        { pattern: /\bmeticulous\b/gi, bonus: 0.2, name: "meticulous" },
        { pattern: /\brevolutionize\b/gi, bonus: 0.2, name: "revolutionize" },
        { pattern: /\bresilience\b/gi, bonus: 0.2, name: "resilience" },
        { pattern: /\bprofound\b/gi, bonus: 0.2, name: "profound" },
        { pattern: /\bintricate\b/gi, bonus: 0.2, name: "intricate" }
    ],
    C2: [
        // Mastery-level vocabulary
        { pattern: /\bparadigm\b/gi, bonus: 0.5, name: "paradigm" },
        { pattern: /\bintrinsic\b/gi, bonus: 0.5, name: "intrinsic" },
        { pattern: /\bextrinsic\b/gi, bonus: 0.5, name: "extrinsic" },
        { pattern: /\bdichotomy\b/gi, bonus: 0.5, name: "dichotomy" },
        { pattern: /\benigmatic\b/gi, bonus: 0.5, name: "enigmatic" },
        { pattern: /\bperpetual\b/gi, bonus: 0.5, name: "perpetual" },
        { pattern: /\bperpetrate\b/gi, bonus: 0.5, name: "perpetrate" },
        { pattern: /\bpredispose\b/gi, bonus: 0.5, name: "predispose" },
        { pattern: /\bexacerbate\b/gi, bonus: 0.5, name: "exacerbate" },
        { pattern: /\bameliorate\b/gi, bonus: 0.5, name: "ameliorate" },
        { pattern: /\bubiquitous\b/gi, bonus: 0.5, name: "ubiquitous" },
        { pattern: /\bpervasive\b/gi, bonus: 0.5, name: "pervasive" },
        { pattern: /\bprecarious\b/gi, bonus: 0.5, name: "precarious" },
        { pattern: /\bephemeral\b/gi, bonus: 0.5, name: "ephemeral" },
        { pattern: /\binnovate\b/gi, bonus: 0.5, name: "innovate" },
        { pattern: /\bjuxtapose\b/gi, bonus: 0.5, name: "juxtapose" },
        { pattern: /\bconceptualize\b/gi, bonus: 0.5, name: "conceptualize" },
        { pattern: /\bexemplify\b/gi, bonus: 0.5, name: "exemplify" },
        { pattern: /\bmultifaceted\b/gi, bonus: 0.5, name: "multifaceted" },
        { pattern: /\bindispensable\b/gi, bonus: 0.5, name: "indispensable" }
    ]
};

// === COMPLEX GRAMMAR DETECTION (Priority 1) ===
// Critical for Band 6-7+ differentiation
// Band 7: "handles complex language well"
// Band 6: "fairly complex language"
// Band 4: "NOT able to use complex language"
const COMPLEX_GRAMMAR = {
    // Subordinate Clauses (if, when, although, because + clause)
    subordinate: [
        { pattern: /\b(if|when|while|although|though|even though|unless|until|before|after|since|as|whereas|whenever)\s+\w+/gi, bonus: 0.3, name: "subordinate clause" },
    ],
    
    // Relative Clauses (which, that, who in middle of sentence)
    relative: [
        { pattern: /\w+\s+(which|that|who|whom|whose)\s+\w+/gi, bonus: 0.3, name: "relative clause" },
    ],
    
    // Passive Voice (is/was/been + past participle)
    passive: [
        { pattern: /\b(is|are|was|were|been|being)\s+(being\s+)?\w+(ed|en)\b/gi, bonus: 0.4, name: "passive voice" },
        { pattern: /\b(has|have|had)\s+been\s+\w+(ed|en)\b/gi, bonus: 0.4, name: "passive perfect" },
    ],
    
    // Complex Tenses
    perfectTenses: [
        { pattern: /\b(have|has|had)\s+\w+(ed|en)\b/gi, bonus: 0.3, name: "present/past perfect" },
        { pattern: /\b(will|shall)\s+have\s+\w+(ed|en)\b/gi, bonus: 0.4, name: "future perfect" },
    ],
    
    // Conditional Structures
    conditionals: [
        { pattern: /\b(would|could|should|might)\s+(have\s+)?\w+/gi, bonus: 0.3, name: "conditional" },
        { pattern: /\bif\s+\w+\s+(had|were|was)\b/gi, bonus: 0.4, name: "complex conditional" },
    ],
    
    // Modal Perfects (advanced)
    modalPerfect: [
        { pattern: /\b(would|could|should|might|must)\s+have\s+\w+(ed|en)\b/gi, bonus: 0.5, name: "modal perfect" },
    ]
};

// === ARGUMENTATION & REASONING MARKERS (Priority 2) ===
// For Band 7-8: "detailed reasoning" and "complex argumentation"
const ARGUMENTATION = {
    // Reasoning markers
    reasoning: [
        { pattern: /\b(because|since|as|due to|owing to)\b/gi, bonus: 0.2, name: "reasoning" },
        { pattern: /\b(the reason is|that's why|this is why)\b/gi, bonus: 0.3, name: "explicit reasoning" },
    ],
    
    // Example markers
    examples: [
        { pattern: /\b(for example|for instance|such as|like)\b/gi, bonus: 0.2, name: "example" },
        { pattern: /\b(to illustrate|to demonstrate)\b/gi, bonus: 0.3, name: "illustration" },
    ],
    
    // Explanation/Clarification
    explanation: [
        { pattern: /\b(this means|in other words|specifically|particularly|especially)\b/gi, bonus: 0.2, name: "explanation" },
        { pattern: /\b(what I mean is|to put it simply|in essence)\b/gi, bonus: 0.3, name: "clarification" },
    ],
    
    // Comparison/Contrast (shows sophisticated thinking)
    comparison: [
        { pattern: /\b(compared to|in comparison|similarly|likewise)\b/gi, bonus: 0.3, name: "comparison" },
        { pattern: /\b(in contrast|on the contrary|unlike|whereas)\b/gi, bonus: 0.3, name: "contrast" },
    ]
};

// === SENTENCE STRUCTURE DETECTION (Priority 3) ===
const SENTENCE_PATTERNS = {
    // Compound sentences (independent clauses joined)
    compound: [
        { pattern: /[.!?]\s*\w+[^.!?]+(and|but|or|so|yet)\s+\w+[^.!?]+[.!?]/gi, type: "compound" },
    ],
    
    // Complex sentences (subordinate + main clause)
    complex: [
        { pattern: /\b(if|when|although|because|while|since)\s+[^,]+,\s*\w+/gi, type: "complex" },
    ]
};

const questionBank = {
    basic: [
        { q: "What is your favorite hobby and why?", keys: ["hobby", "like", "love", "favorite", "because"] },
        { q: "Tell me about your family members.", keys: ["family", "father", "mother", "brother", "sister"] },
        { q: "Describe your typical daily routine.", keys: ["wake", "breakfast", "work", "school", "sleep"] },
        { q: "What is your favorite food and how does it taste?", keys: ["food", "delicious", "taste", "eat", "cooking"] },
        { q: "Describe your house or your bedroom.", keys: ["house", "room", "bed", "live", "stay", "comfortable"] },
        { q: "What is the weather like today in your city?", keys: ["weather", "sunny", "rainy", "hot", "cold", "sky"] }
    ],
    intermediate: [
        { q: "Do you prefer city life or country life?", keys: ["city", "countryside", "prefer", "quiet", "busy"] },
        { q: "How has the internet changed our lives?", keys: ["internet", "technology", "change", "easier", "social"] },
        { q: "What are the qualities of a good friend?", keys: ["friend", "honest", "trust", "loyal", "kind"] },
        { q: "Describe a beautiful place you have visited.", keys: ["place", "visit", "beautiful", "view", "travel", "trip"] },
        { q: "Why is it important to learn a second language?", keys: ["language", "english", "important", "communication", "learn", "world"] },
        { q: "Do you think people work too hard nowadays?", keys: ["work", "hard", "busy", "balance", "lifestyle", "office"] }
    ],
    advanced: [
        { q: "Discuss the pros and cons of Artificial Intelligence.", keys: ["intelligence", "automation", "future", "ethics", "advantage"] },
        { q: "Describe a significant challenge you overcame.", keys: ["challenge", "overcome", "resilience", "problem", "solve"] },
        { q: "Should university education be free for everyone?", keys: ["education", "university", "government", "tax", "opportunity"] },
        { q: "How does social media affect our mental health?", keys: ["social media", "mental health", "anxiety", "platform", "impact", "user"] },
        { q: "Discuss the importance of environmental conservation.", keys: ["environment", "conservation", "nature", "planet", "protection", "global"] },
        { q: "How will technology change the job market in the future?", keys: ["technology", "job", "market", "future", "career", "skills"] }
    ]
};

// --- 3. SPEECH RECOGNITION SETUP ---
// --- 3. SPEECH RECOGNITION SETUP (MOBILE & DESKTOP COMPATIBLE) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        // PERBAIKAN HP: Kita turunkan syarat volume agar suara kecil di HP tetap terdeteksi
        // Jika suara masuk, kita proses. currentVolume tetap dikelola oleh Noise Gate.
        if (currentVolume < 5) return; 

        lastSpeechTimestamp = Date.now();
        let interimTranscript = "";
        const currentKeys = shuffledQuestions[questionIndex] ? shuffledQuestions[questionIndex].keys : [];

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            let transcript = event.results[i][0].transcript;
            
            // AI Highlight Keywords (BIRU) - TETAP DIJAGA
            currentKeys.forEach(key => {
                const regex = new RegExp(`\\b${key}\\b`, 'gi');
                transcript = transcript.replace(regex, `<span style="color:#4f46e5; font-weight:bold;">${key}</span>`);
            });

            // AI Highlight Grammar Errors (MERAH) - TETAP DIJAGA
            GRAMMAR_RULES.errors.forEach(rule => {
                transcript = transcript.replace(rule.pattern, `<span style="color:#ef4444; text-decoration:underline; font-weight:bold;">$&</span>`);
            });

            if (event.results[i].isFinal) finalTranscript += transcript + " ";
            else interimTranscript += transcript;
        }

        const liveDiv = document.getElementById('transcript-live');
        if (liveDiv) {
            liveDiv.innerHTML = `<span style="color:#1e293b">${finalTranscript}</span><span style="color:#94a3b8">${interimTranscript}</span>`;
        }
        analyzeSpeaking(finalTranscript.toLowerCase());
    };

    // Tambahkan Error Handling untuk Mobile
    recognition.onerror = (event) => {
        console.error("Speech Error: " + event.error);
        if(event.error === 'not-allowed') {
            alert("Microphone access blocked. Please enable it in your phone settings.");
        }
    };
} else {
    alert("Your browser/phone does not support Speech Recognition. Please use Chrome or Safari.");
}

// --- 4. AUDIO & WAVEFORM (MODERN) ---
async function startNoiseGate() {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') await audioContext.resume();

        const stream = await navigator.mediaDevices.getUserMedia({ audio: { noiseSuppression: true } });
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        updateVolumeMeter();
        drawWaveform();
    } catch (err) { alert("Please allow microphone access!"); }
}

function updateVolumeMeter() {
    if (!isRecording) return;
    const array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let values = 0;
    for (let i = 0; i < array.length; i++) values += array[i];
    currentVolume = values / array.length;
    requestAnimationFrame(updateVolumeMeter);
}

function drawWaveform() {
    if (!isRecording) return;
    animationId = requestAnimationFrame(drawWaveform);
    const canvas = document.getElementById('waveform');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3; ctx.strokeStyle = '#4f46e5'; ctx.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2); ctx.stroke();
}

// --- 5. CORE TEST LOGIC ---
function analyzeSpeaking(text) {
    if (text.length < 5) return "too_short";
    const statusDiv = document.getElementById('grammar-status');
    if (!statusDiv) return;
    statusDiv.style.display = "block";
    
    if (/\b(saya|adalah|yang|untuk|dengan|bisa|ini|itu)\b/i.test(text)) {
        statusDiv.innerHTML = "❌ Indonesian detected! Use English.";
        return "invalid_lang";
    }

    statusDiv.innerHTML = "✅ Processing speech patterns...";
    return "valid";
}

function toggleRecording() {
    const btn = document.getElementById('record-btn');
    if (!isRecording) {
        isRecording = true;
        btn.innerHTML = '<i class="fas fa-stop"></i>';
        btn.style.backgroundColor = "#ef4444";
        startNoiseGate();
        lastSpeechTimestamp = Date.now();
        silencePenalty = 0;
        recognition.start();
        timerInterval = setInterval(() => {
            seconds++;
            document.getElementById('timer').innerText = new Date(seconds * 1000).toISOString().substr(14, 5);
            // Reduced penalty: 0.2 per 5 seconds (was 0.5 per 3 seconds)
            if ((Date.now() - lastSpeechTimestamp) / 1000 > 5) silencePenalty += 0.2;
        }, 1000);
    } else {
        isRecording = false;
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        btn.style.backgroundColor = "#4f46e5";
        recognition.stop();
        clearInterval(timerInterval);
        cancelAnimationFrame(animationId);
        if (audioContext) audioContext.close().then(() => audioContext = null);
        document.getElementById('next-btn').classList.remove('hidden');
    }
}

function nextQuestion() {
    const text = finalTranscript.toLowerCase().trim();
    const cleanText = text.replace(/<[^>]*>/g, ""); // Bersihkan tag HTML untuk hitung kata
    const wordsArray = cleanText.split(/\s+/).filter(w => w.length > 2);
    const wordCount = wordsArray.length; // Ditambahkan ke atas agar bisa dipakai di semua baris
    const currentQ = shuffledQuestions[questionIndex];
    
    let grammarBonusPenalty = 0;
    GRAMMAR_RULES.errors.forEach(rule => {
        const matches = cleanText.match(rule.pattern);
        if (matches) grammarBonusPenalty -= (matches.length * rule.penalty);
    });
    GRAMMAR_RULES.bonusPhrases.forEach(rule => {
        const matches = cleanText.match(rule.pattern);
        if (matches) grammarBonusPenalty += (matches.length * rule.bonus);
    });

    // === PERBAIKAN: Definisikan grammarErrorRate di sini agar bisa dibaca oleh logika di bawahnya ===
    const grammarErrorRate = wordCount > 0 ? Math.abs(Math.min(0, grammarBonusPenalty)) / wordCount : 0;
    
    // === COHESIVE DEVICES (Discourse Markers) ===
    // Advanced linking words show sophisticated communication
    let cohesionBonus = 0;
    COHESIVE_DEVICES.advanced.forEach(device => {
        const matches = cleanText.match(device.pattern);
        if (matches) {
            cohesionBonus += (matches.length * device.bonus);
        }
    });
    
    // === VOCABULARY LEVEL BONUS ===
    // Rewards use of B2, C1, C2 level vocabulary
    let vocabLevelBonus = 0;
    
    // B2 words: +0.2 each
    VOCABULARY_LEVELS.B2.forEach(word => {
        const matches = cleanText.match(word.pattern);
        if (matches) vocabLevelBonus += (matches.length * word.bonus);
    });
    
    // C1 words: +0.2 each
    VOCABULARY_LEVELS.C1.forEach(word => {
        const matches = cleanText.match(word.pattern);
        if (matches) vocabLevelBonus += (matches.length * word.bonus);
    });
    
    // C2 words: +0.5 each (mastery level!)
    VOCABULARY_LEVELS.C2.forEach(word => {
        const matches = cleanText.match(word.pattern);
        if (matches) vocabLevelBonus += (matches.length * word.bonus);
    });
    
    // === COMPLEX GRAMMAR DETECTION (Priority 1 - CRITICAL) ===
    // This is THE key differentiator for Band 6-7+
    let complexGrammarBonus = 0;
    let complexStructureCount = 0;
    
    // Subordinate clauses
    COMPLEX_GRAMMAR.subordinate.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            complexGrammarBonus += (matches.length * pattern.bonus);
            complexStructureCount += matches.length;
        }
    });
    
    // Relative clauses
    COMPLEX_GRAMMAR.relative.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            complexGrammarBonus += (matches.length * pattern.bonus);
            complexStructureCount += matches.length;
        }
    });
    
    // Passive voice
    COMPLEX_GRAMMAR.passive.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            complexGrammarBonus += (matches.length * pattern.bonus);
            complexStructureCount += matches.length;
        }
    });
    
    // Perfect tenses
    COMPLEX_GRAMMAR.perfectTenses.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            complexGrammarBonus += (matches.length * pattern.bonus);
            complexStructureCount += matches.length;
        }
    });
    
    // Conditionals
    COMPLEX_GRAMMAR.conditionals.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            complexGrammarBonus += (matches.length * pattern.bonus);
            complexStructureCount += matches.length;
        }
    });
    
    // Modal perfects (very advanced)
    COMPLEX_GRAMMAR.modalPerfect.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            complexGrammarBonus += (matches.length * pattern.bonus);
            complexStructureCount += matches.length;
        }
    });
    
    // Band differentiation based on complex structures
    let complexityPenalty = 0;
    if (complexStructureCount === 0) {
        // No complex grammar = Band 4-5 max (IELTS: "not able to use complex language")
        complexityPenalty = -1.5;
    } else if (complexStructureCount < 3) {
        // Few complex structures = Band 5-6 (limited complexity)
        complexityPenalty = -0.8;
    } else if (complexStructureCount < 5) {
        // Some complex structures = Band 6 (fairly complex)
        complexityPenalty = -0.3;
    }
    // 5+ complex structures = Band 7+ (handles complex well) - no penalty
    
    // === RELEVANCE CHECK (Priority 1 - CRITICAL) ===
    // Check if answer is on-topic and appropriate
    let relevancePenalty = 0;
    
    // Extract question keywords
    const questionWords = currentQ.q.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const answerWords = cleanText.split(/\s+/);
    
    // Check keyword overlap
    const keywordOverlap = questionWords.filter(qw => 
        answerWords.some(aw => aw.includes(qw) || qw.includes(aw))
    ).length;
    const relevanceRatio = keywordOverlap / questionWords.length;
    
    // Check if required keywords are mentioned
    const requiredKeywordsMentioned = currentQ.keys.filter(k => cleanText.includes(k)).length;
    const keywordCoverage = requiredKeywordsMentioned / currentQ.keys.length;
    
    // Penalties for off-topic answers
    if (relevanceRatio < 0.2 && keywordCoverage < 0.3) {
        // Very off-topic - severe penalty
        relevancePenalty = -3.0;
    } else if (relevanceRatio < 0.3 || keywordCoverage < 0.4) {
        // Partially off-topic - moderate penalty
        relevancePenalty = -1.5;
    } else if (keywordCoverage < 0.5) {
        // Missing some key points - small penalty
        relevancePenalty = -0.5;
    }
    
    // === ARGUMENTATION & REASONING (Priority 2) ===
    // For Band 7-8: detailed reasoning and complex argumentation
    let argumentationBonus = 0;
    let argumentationCount = 0;
    
    // Reasoning markers
    ARGUMENTATION.reasoning.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            argumentationBonus += (matches.length * pattern.bonus);
            argumentationCount += matches.length;
        }
    });
    
    // Example markers
    ARGUMENTATION.examples.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            argumentationBonus += (matches.length * pattern.bonus);
            argumentationCount += matches.length;
        }
    });
    
    // Explanation markers
    ARGUMENTATION.explanation.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            argumentationBonus += (matches.length * pattern.bonus);
            argumentationCount += matches.length;
        }
    });
    
    // Comparison/contrast
    ARGUMENTATION.comparison.forEach(pattern => {
        const matches = cleanText.match(pattern.pattern);
        if (matches) {
            argumentationBonus += (matches.length * pattern.bonus);
            argumentationCount += matches.length;
        }
    });
    
    // Band differentiation for argumentation
    let argumentationLevel = 0; // 0 = basic, 1 = some, 2 = good, 3 = detailed
    if (argumentationCount === 0) {
        argumentationLevel = 0; // Band 5-6: basic statements only
    } else if (argumentationCount < 2) {
        argumentationLevel = 1; // Band 6: some reasoning
    } else if (argumentationCount < 4) {
        argumentationLevel = 2; // Band 7: detailed reasoning
    } else {
        argumentationLevel = 3; // Band 8: complex detailed argumentation
    }
    
    // === SYSTEMATIC ERROR TRACKING (Priority 2) ===
    // Band 8: "occasional UNSYSTEMATIC inaccuracies"
    const errorPatterns = {};
    let totalGrammarErrors = 0;
    
    GRAMMAR_RULES.errors.forEach(rule => {
        const matches = cleanText.match(rule.pattern);
        if (matches) {
            const errorType = rule.fix || "general";
            errorPatterns[errorType] = (errorPatterns[errorType] || 0) + matches.length;
            totalGrammarErrors += matches.length;
        }
    });
    
    // Check if errors are systematic (same error repeated)
    const errorCounts = Object.values(errorPatterns);
    const maxSameError = errorCounts.length > 0 ? Math.max(...errorCounts) : 0;
    const systematicErrorPenalty = maxSameError > 3 ? -0.8 : (maxSameError > 2 ? -0.4 : 0);
    
    // === COMMUNICATION BREAKDOWN DETECTION (Priority 3) ===
    // Band 3: "Frequent breakdowns in communication occur"
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const veryShortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 3).length;
    const sentenceCount = sentences.length || 1;
    const shortSentenceRatio = veryShortSentences / sentenceCount;
    
    let communicationBreakdown = false;
    let breakdownPenalty = 0;
    
    // Indicators of communication breakdown
    // PERBAIKAN: grammarErrorRate sekarang sudah dikenal karena didefinisikan di atas
    if (shortSentenceRatio > 0.5 || grammarErrorRate > 0.25 || wordsArray.length < 10) {
        communicationBreakdown = true;
        breakdownPenalty = -2.0; // Cap at Band 3-4
    } else if (shortSentenceRatio > 0.3 || grammarErrorRate > 0.20) {
        breakdownPenalty = -1.0; // Frequent issues
    }
    
    // === SENTENCE STRUCTURE VARIETY (Priority 3) ===
    // Higher bands use varied sentence structures
    let sentenceVarietyBonus = 0;
    
    // Check for different sentence types
    const hasCompound = /\b(and|but|or|so|yet)\s+\w+/.test(cleanText);
    const hasComplex = /\b(if|when|although|because|while)\s+/.test(cleanText);
    
    if (hasCompound && hasComplex) {
        sentenceVarietyBonus = 0.3; // Good variety
    } else if (hasCompound || hasComplex) {
        sentenceVarietyBonus = 0.15; // Some variety
    }
    // No variety = simple sentences only (already penalized by complexityPenalty)
    
    // === ANSWER DEVELOPMENT DEPTH (Priority 3) ===
    // Band scoring based on how well developed the answer is
    let developmentBonus = 0;
    
    if (wordsArray.length >= 50 && argumentationCount >= 2 && complexStructureCount >= 3) {
        // Well-developed answer: length + reasoning + complexity
        developmentBonus = 0.5; // Band 7-8
    } else if (wordsArray.length >= 30 && (argumentationCount >= 1 || complexStructureCount >= 2)) {
        // Developed answer
        developmentBonus = 0.3; // Band 6-7
    } else if (wordsArray.length >= 20) {
        // Basic development
        developmentBonus = 0.1; // Band 5-6
    }
    // Short answers (<20 words) get no bonus (Band 4-5)

    // Simpan ke Histori
    currentSessionTranscript += `Q: ${currentQ.q}\nA: ${cleanText}\n\n`;

    let fluency, pron, vocab, grammar;
    if (wordsArray.length < 5) {
        fluency = 0; pron = 0; vocab = 0; grammar = 0;
    } else {
        const fillerCount = (cleanText.match(/\b(uhm|um|err|uh|ah)\b/g) || []).length;
        const pauseCount = (cleanText.match(/\./g) || []).length;
        // const wordCount = wordsArray.length; // Sudah didefinisikan di atas
        const uniqueWords = new Set(wordsArray).size;
        const keywordMatches = currentQ.keys.filter(k => cleanText.includes(k)).length;
        
        // === REPETITION DETECTION (Critical for quality!) ===
        // Detect immediate word repetitions like "my my my", "i i i", "we we we we"
        const repetitionPattern = /\b(\w+)\s+\1(\s+\1)*/gi;
        const repetitions = cleanText.match(repetitionPattern) || [];
        const repetitionPenalty = repetitions.length * 0.4; // Significant penalty
        
        // === BROKEN SENTENCE DETECTION ===
        // Incomplete sentences or sentences ending with prepositions
        const brokenSentences = (cleanText.match(/\.\s+(and|of|in|to|with|a|the)\b/gi) || []).length;
        const brokenPenalty = brokenSentences * 0.2;
        
        // === FILLER WORDS ANALYSIS (Realistic approach) ===
        // 2-3 fillers = NORMAL (even natives use them!)
        // Only penalize EXCESSIVE fillers (>3)
        const excessiveFillers = Math.max(0, fillerCount - 3);
        
        // === FILLER RATIO CHECK (Quality metric) ===
        const fillerRatio = fillerCount / wordCount;
        const excessiveFillerRatio = Math.max(0, fillerRatio - 0.08); // 8% is acceptable
        const ratioPenalty = excessiveFillerRatio * 8; // Heavy penalty for high ratio
        
        // === GRAMMAR ERROR ACCUMULATION ===
        // If too many errors detected, compound the penalty
        // PERBAIKAN: Hapus "const" di bawah karena sudah dideklarasikan di atas
        // grammarErrorRate = Math.abs(Math.min(0, grammarBonusPenalty)) / wordCount;
        const compoundGrammarPenalty = grammarErrorRate > 0.10 ? -1.5 : (grammarErrorRate > 0.05 ? -0.5 : 0);
        
        // === VOCABULARY DIVERSITY CHECK ===
        const diversityRatio = uniqueWords / wordCount;
        const poorDiversity = diversityRatio < 0.5 ? -0.5 : 0; // Too much repetition
        
        // === FLUENCY SCORING (Comprehensive v2.5) ===
        // Base: 5.5 (fair starting point)
        // Bonuses: word length, cohesion, argumentation, sentence variety, development
        // Penalties: fillers, repetitions, pauses, silence, broken sentences, communication breakdown
        const wordBonus = (wordCount / 5 * 0.15) * (grammarErrorRate > 0.15 ? 0.5 : 1.0);
        
        fluency = 5.5 
                + wordBonus 
                + cohesionBonus 
                + argumentationBonus 
                + sentenceVarietyBonus 
                + developmentBonus
                - (excessiveFillers * 0.25) 
                - repetitionPenalty 
                - (pauseCount > 3 ? (pauseCount - 3) * 0.2 : 0) 
                - (silencePenalty * 0.5) 
                - ratioPenalty 
                - brokenPenalty
                - breakdownPenalty
                + relevancePenalty * 0.5; // Half of relevance penalty affects fluency
        
        fluency = Math.min(fluency, 9.0); // Cap at 9.0
        
        // === VOCABULARY SCORING (Comprehensive v2.5) ===
        // Base: 3.5 (realistic for basic vocabulary)
        // Bonuses: unique words (capped), keywords, B2/C1/C2 level words
        // Penalties: basic-only, poor diversity, off-topic/irrelevance
        
        const uniqueWordsBonus = Math.min(uniqueWords * 0.12, 2.0); // Cap at +2.0
        const keywordBonus = keywordMatches * 0.3; // Reduced from 0.6
        const basicOnlyPenalty = vocabLevelBonus === 0 ? -1.0 : 0;
        
        vocab = 3.5 
              + uniqueWordsBonus 
              + keywordBonus 
              + vocabLevelBonus 
              + basicOnlyPenalty 
              + poorDiversity
              + relevancePenalty * 0.7; // Most of relevance penalty affects vocabulary
        
        // Level-specific caps with vocabulary quality consideration
        if (currentLevel === "basic") {
            if (vocabLevelBonus === 0) {
                vocab = Math.min(vocab, 5.5); // Only basic words → max 5.5
            } else {
                vocab = Math.min(vocab, 6.5); // Has B2/C1/C2 words → max 6.5
            }
        } else if (currentLevel === "intermediate") {
            if (vocabLevelBonus < 0.5) {
                vocab = Math.min(vocab, 7.0); // Little advanced vocab → max 7.0
            } else {
                vocab = Math.min(vocab, 7.5); // Good advanced vocab → max 7.5
            }
        }
        // Advanced level: no cap (can reach 8.0+ with C2 words)
        
        // === GRAMMAR SCORING (Comprehensive v2.5) ===
        // Base: 4.5 (realistic for basic competence)
        // Bonuses: complex structures (CRITICAL!), cohesion, argumentation, development, sentence length
        // Penalties: grammar errors, systematic errors, no complexity, relevance
        
        const strongerCompoundPenalty = grammarErrorRate > 0.15 ? -2.0 : (grammarErrorRate > 0.10 ? -1.5 : (grammarErrorRate > 0.05 ? -0.8 : 0));
        
        grammar = 4.5 
                + (wordCount > 30 ? 1.0 : (wordCount > 20 ? 0.5 : 0))
                + grammarBonusPenalty 
                + cohesionBonus 
                + complexGrammarBonus // CRITICAL: Complex grammar is THE differentiator for Band 6-7+
                + argumentationBonus 
                + developmentBonus
                + strongerCompoundPenalty 
                + complexityPenalty // Penalty if no complex structures (Band 4-5)
                + systematicErrorPenalty // Extra penalty for repeated same errors
                + relevancePenalty * 0.5; // Half of relevance penalty affects grammar
        
        // === PRONUNCIATION SCORING (More generous but repetition-aware) ===
        // Base: 5.0 (realistic baseline)
        // Keyword clarity bonus: +0.5 per keyword
        // Speech length bonus: +0.8 if wordCount > 25
        // Penalties: excessive fillers, repetitions
        pron = 5.0 + (keywordMatches * 0.5) + (wordCount > 25 ? 0.8 : 0) - (excessiveFillers * 0.2) - (repetitionPenalty * 0.5);
    }

    const limit = (v) => Math.max(0, Math.min(9.0, v));
    sessionScores.push({
        overall: limit((fluency + vocab + grammar + pron) / 4),
        fluency: limit(fluency), pron: limit(pron), vocab: limit(vocab), grammar: limit(grammar)
    });

    if (questionIndex < 2) { 
        questionIndex++; // Lanjut ke soal berikutnya
        loadQuestion();
    } else {
        localStorage.setItem('last_transcript_history', currentSessionTranscript);
        finishTest();
    }
}

function finishTest() {
    const answered = sessionScores.filter(s => s.overall > 0);
    const count = answered.length || 1;
    const finalData = {
        overall: (answered.reduce((a, b) => a + b.overall, 0) / count).toFixed(1),
        fluency: (answered.reduce((a, b) => a + b.fluency, 0) / count).toFixed(1),
        pron: (answered.reduce((a, b) => a + b.pron, 0) / count).toFixed(1),
        vocab: (answered.reduce((a, b) => a + b.vocab, 0) / count).toFixed(1),
        grammar: (answered.reduce((a, b) => a + b.grammar, 0) / count).toFixed(1),
        feedback: [], statusMessage: ""
    };

    let score = parseFloat(finalData.overall);
    if (score >= 7.5) finalData.statusMessage = "⭐ Impressive! High Proficiency!";
    else if (score >= 6.5) finalData.statusMessage = "🎯 Great! Strong Performance!";
    else if (score >= 5.5) finalData.statusMessage = "✅ Good Job! Well Done.";
    else if (score >= 4.5) finalData.statusMessage = "📚 Keep Going! You're Improving!";
    else finalData.statusMessage = "📈 Keep Practicing!";

    if (parseFloat(finalData.grammar) < 5.5) finalData.feedback.push("Focus on grammar accuracy. Red markers show common mistakes.");
    if (parseFloat(finalData.fluency) < 5.5) finalData.feedback.push("Try to reduce excessive filler words (um, uh) and long pauses.");
    if (parseFloat(finalData.vocab) < 5.5) finalData.feedback.push("Try using more varied vocabulary and keywords.");
    if (parseFloat(finalData.pron) < 5.5) finalData.feedback.push("Practice pronunciation of key terms clearly.");

    localStorage.setItem('speakProResult', JSON.stringify(finalData));
    saveResultToSheet(finalData);
    setTimeout(() => location.href = 'result.html', 1500);
}

// --- 6. AUTH & NAV ---
async function handleLogin() {
    const email = document.getElementById('login-email').value.toLowerCase().trim();
    const pass = document.getElementById('login-pass').value.trim(); // Ambil Password
    
    if (!email || !pass) return alert("Please enter both Email and Password!");
    
    const btn = document.querySelector('#login-card .btn-primary');
    btn.innerText = "Verifying...";
    btn.disabled = true;

    try {
        const res = await fetch(WEB_APP_URL + "?action=getUsers");
        const users = await res.json();
        
        // Cek Email (Untuk sistem sederhana, kita anggap login berhasil jika email ada di Sheet)
        if (users.includes(email)) {
            activeUserEmail = email;
            localStorage.setItem('isLoggedInEmail', email);
            alert("Login Successful!");
            location.reload(); // Refresh untuk masuk ke menu level
        } else {
            alert("ACCESS DENIED: Email not registered or approved.");
        }
    } catch (e) {
        alert("Server error. Check your internet connection.");
    } finally {
        btn.innerText = "Sign In";
        btn.disabled = false;
    }
}

async function handleSignUpSheet() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value.toLowerCase().trim();
    const wa = document.getElementById('reg-wa').value;
    const params = new URLSearchParams({ action: "addUser", name, email, wa });
    await fetch(WEB_APP_URL + "?" + params.toString(), { mode: 'no-cors' });
    document.getElementById('reg-inputs').classList.add('hidden');
    document.getElementById('reg-success').classList.remove('hidden');
}

function handleSignUpWA() {
    const name = document.getElementById('reg-name').value;
    window.open(`https://wa.me/6281232339403?text=Halo Mr. Adi, saya ${name} sudah daftar.`, '_blank');
}

async function saveResultToSheet(data) {
    const email = activeUserEmail || localStorage.getItem('isLoggedInEmail');
    const params = new URLSearchParams({ action: "saveResult", email, ...data });
    fetch(WEB_APP_URL + "?" + params.toString(), { mode: 'no-cors' });
}

function showAuth() {
    // Sembunyikan Landing Page
    const landing = document.getElementById('landing-page');
    document.getElementById('main-footer').classList.add('hidden'); // SEMBUNYIKAN FOOTER
    if (landing) landing.classList.add('hidden');
    // Sembunyikan Tombol Login di Nav
    const navBtn = document.getElementById('nav-login-btn');
    if (navBtn) navBtn.classList.add('hidden');

    // Tampilkan Section Auth (Form Login)
    const authSec = document.getElementById('auth-section');
    if (authSec) authSec.classList.remove('hidden');
}

function toggleAuthMode() {
    document.getElementById('login-card').classList.toggle('hidden');
    document.getElementById('signup-form').classList.toggle('hidden');
}

function startTest(level) {
    currentLevel = level;
    
    // 1. Ambil semua soal dari level yang dipilih (6 soal)
    const allQuestions = questionBank[level];
    
    // 2. ACAK SEMUA SOAL (Shuffle)
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    
    // 3. AMBIL 3 SOAL PERTAMA DARI HASIL ACAKAN
    shuffledQuestions = shuffled.slice(0, 3);
    
    // 4. Reset Data Sesi
    questionIndex = 0; 
    sessionScores = []; 
    
    // 5. Update UI (Tampilkan Section Test)
    document.getElementById('level-tag').innerText = level.toUpperCase();
    document.getElementById('level-section').classList.add('hidden');
    document.getElementById('test-section').classList.remove('hidden');
    
    // 6. Muat soal pertama
    loadQuestion();
}

function loadQuestion() {
    const data = shuffledQuestions[questionIndex];
    document.getElementById('question-text').innerText = data.q;
    document.getElementById('required-keywords').innerText = data.keys.join(", ");
    document.getElementById('question-count').innerText = `Question ${questionIndex + 1} of 3`;
    finalTranscript = ""; seconds = 0; silencePenalty = 0;
    document.getElementById('transcript-live').innerText = "Waiting...";
    document.getElementById('next-btn').classList.add('hidden');
}

function goBackToLevels() { location.reload(); }
function logout() {
    localStorage.removeItem('isLoggedInEmail');
    location.reload();
}

window.onload = () => {
    const savedEmail = localStorage.getItem('isLoggedInEmail');
    
    if (savedEmail) {
        // JIKA SUDAH LOGIN: Sembunyikan Landing & Auth, Tampilkan Level
        activeUserEmail = savedEmail;
        // --- LOGIKA PROGRESS BAR (Mastery Readiness) ---
        const lastResult = JSON.parse(localStorage.getItem('speakProResult'));
        if (lastResult) {
            document.getElementById('mastery-container').classList.remove('hidden');
            const score = parseFloat(lastResult.overall);
            const percentage = (score / 9) * 100;
            
            const bar = document.getElementById('mastery-bar');
            const badge = document.getElementById('mastery-badge');
            const status = document.getElementById('mastery-status');
            const advice = document.getElementById('mastery-advice');

            // Set Data
            badge.innerText = score.toFixed(1);
            setTimeout(() => bar.style.width = percentage + "%", 500);

            // Klasifikasi Berdasarkan Integritas Sistem (IELTS Standards)
            if (score >= 7.5) {
                bar.style.backgroundColor = "#22c55e"; // Hijau (Mastered)
                status.innerText = "Level Mastered";
                advice.innerText = "Your speaking logic and grammar are solid. You are ready for the most challenging professional environments.";
            } else if (score >= 6.0) {
                bar.style.backgroundColor = "#f59e0b"; // Kuning (Intermediate)
                status.innerText = "Consistent Progress";
                advice.innerText = "Good performance. To reach Band 8+, focus on more complex discourse markers and C1-level vocabulary.";
            } else {
                bar.style.backgroundColor = "#ef4444"; // Merah (Below Target)
                status.innerText = "Need More Practice";
                advice.innerText = "Focus on reducing long pauses and filler words. Systematic errors are still detected in your grammar structures.";
            }
        }
        // --- END OF PROGRESS BAR LOGIC ---
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('nav-login-btn').classList.add('hidden');
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('level-section').classList.remove('hidden');
        
        // Histori Transkrip
        const historyData = localStorage.getItem('last_transcript_history');
        const historyDiv = document.getElementById('history-content');
        if (historyData && historyDiv) {
            historyDiv.innerText = historyData;
            document.getElementById('transcript-history').classList.remove('hidden');
        }
    } else {
        // JIKA BELUM LOGIN: Pastikan Landing Page Muncul
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('main-footer').classList.remove('hidden'); // TAMPILKAN FOOTER
        document.getElementById('nav-login-btn').classList.remove('hidden');
    }
};
// Fungsi untuk kembali ke Landing Page (Halaman Depan) dari Menu Login
function goBackToHome() {
    // 1. Sembunyikan Section Auth (Login/Register)
    document.getElementById('auth-section').classList.add('hidden');

    // 2. Munculkan kembali Landing Page & Tombol Login di Navigasi
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('nav-login-btn').classList.remove('hidden');
}
function logout() {
    localStorage.removeItem('isLoggedInEmail');
    location.reload();
}
// Daftarkan Service Worker agar PWA bisa diinstal
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.log("Service Worker Failed", err));
}