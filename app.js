// --- 1. CONFIGURATION ---
// IMPROVED AI SCORING SYSTEM v2.5 - COMPREHENSIVE IELTS-ALIGNED
// Full implementation of IELTS Band Descriptors (Bands 3-9)
// ... (Bagian komentar Priority 1-3 tetap dipertahankan sesuai aslinya)

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby173u74ItRwbXgs1692EdJblZdDGtZGr0gvl5H3QrdPdY1EwMaQrRMHUWvaUnTBvC8/exec";

// --- 2. GLOBAL VARIABLES ---
let animationId, recognition, timerInterval;
let finalTranscript = "";
let isRecording = false;
let seconds = 0;
let silencePenalty = 0;
let lastSpeechTimestamp = 0;
let currentSessionTranscript = ""; 
const FILLER_WORDS = ["uhm", "um", "err", "uh", "ah", "aa", "ee"];

let currentLevel = "", questionIndex = 0, shuffledQuestions = [];
let activeUserEmail = "", sessionScores = []; 

// Audio State
let audioContext, analyser, microphone, currentVolume = 0;
const VOLUME_THRESHOLD = 5; // PERBAIKAN: Diturunkan ke 5 agar lebih sensitif di HP

// Kamus Grammar & Frasa (DI-KEEP UTUH)
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

// COHESIVE DEVICES, VOCABULARY_LEVELS, COMPLEX_GRAMMAR, ARGUMENTATION, SENTENCE_PATTERNS 
// (BAGIAN INI TETAP DI-KEEP SAMA PERSIS SEPERTI KODE ANDA, TIDAK DIHAPUS)
const COHESIVE_DEVICES = { advanced: [ { pattern: /\bmoreover\b/gi, bonus: 0.2, name: "moreover" }, { pattern: /\bfurthermore\b/gi, bonus: 0.2, name: "furthermore" }, { pattern: /\bin addition\b/gi, bonus: 0.2, name: "in addition" }, { pattern: /\bbesides\b/gi, bonus: 0.2, name: "besides" }, { pattern: /\badditionally\b/gi, bonus: 0.2, name: "additionally" }, { pattern: /\bwhat's more\b/gi, bonus: 0.2, name: "what's more" }, { pattern: /\bhowever\b/gi, bonus: 0.2, name: "however" }, { pattern: /\bnevertheless\b/gi, bonus: 0.2, name: "nevertheless" }, { pattern: /\bnonetheless\b/gi, bonus: 0.2, name: "nonetheless" }, { pattern: /\balthough\b/gi, bonus: 0.2, name: "although" }, { pattern: /\bthough\b/gi, bonus: 0.2, name: "though" }, { pattern: /\beven though\b/gi, bonus: 0.2, name: "even though" }, { pattern: /\bwhereas\b/gi, bonus: 0.2, name: "whereas" }, { pattern: /\bwhile\b/gi, bonus: 0.2, name: "while" }, { pattern: /\bon the contrary\b/gi, bonus: 0.2, name: "on the contrary" }, { pattern: /\bconversely\b/gi, bonus: 0.2, name: "conversely" }, { pattern: /\btherefore\b/gi, bonus: 0.2, name: "therefore" }, { pattern: /\bconsequently\b/gi, bonus: 0.2, name: "consequently" }, { pattern: /\bthus\b/gi, bonus: 0.2, name: "thus" }, { pattern: /\bhence\b/gi, bonus: 0.2, name: "hence" }, { pattern: /\baccordingly\b/gi, bonus: 0.2, name: "accordingly" }, { pattern: /\bfor example\b/gi, bonus: 0.2, name: "for example" }, { pattern: /\bfor instance\b/gi, bonus: 0.2, name: "for instance" }, { pattern: /\bnamely\b/gi, bonus: 0.2, name: "namely" }, { pattern: /\bspecifically\b/gi, bonus: 0.2, name: "specifically" }, { pattern: /\bin particular\b/gi, bonus: 0.2, name: "in particular" }, { pattern: /\bto illustrate\b/gi, bonus: 0.2, name: "to illustrate" }, { pattern: /\bin conclusion\b/gi, bonus: 0.2, name: "in conclusion" }, { pattern: /\bto sum up\b/gi, bonus: 0.2, name: "to sum up" }, { pattern: /\boverall\b/gi, bonus: 0.2, name: "overall" }, { pattern: /\ball in all\b/gi, bonus: 0.2, name: "all in all" }, { pattern: /\in summary\b/gi, bonus: 0.2, name: "in summary" } ] };
const VOCABULARY_LEVELS = { B2: [ { pattern: /\banalyze\b/gi, bonus: 0.2, name: "analyze" }, { pattern: /\bevaluate\b/gi, bonus: 0.2, name: "evaluate" }, { pattern: /\bcompare\b/gi, bonus: 0.2, name: "compare" }, { pattern: /\bcontrast\b/gi, bonus: 0.2, name: "contrast" }, { pattern: /\bdemonstrate\b/gi, bonus: 0.2, name: "demonstrate" }, { pattern: /\billustrate\b/gi, bonus: 0.2, name: "illustrate" }, { pattern: /\bemphasize\b/gi, bonus: 0.2, name: "emphasize" }, { pattern: /\bhighlight\b/gi, bonus: 0.2, name: "highlight" }, { pattern: /\bimplement\b/gi, bonus: 0.2, name: "implement" }, { pattern: /\bmaintain\b/gi, bonus: 0.2, name: "maintain" }, { pattern: /\bestablish\b/gi, bonus: 0.2, name: "establish" }, { pattern: /\bcontribute\b/gi, bonus: 0.2, name: "contribute" }, { pattern: /\bachieve\b/gi, bonus: 0.2, name: "achieve" }, { pattern: /\badequate\b/gi, bonus: 0.2, name: "adequate" }, { pattern: /\bsignificant\b/gi, bonus: 0.2, name: "significant" }, { pattern: /\bsubstantial\b/gi, bonus: 0.2, name: "substantial" }, { pattern: /\bapproach\b/gi, bonus: 0.2, name: "approach" }, { pattern: /\bperspective\b/gi, bonus: 0.2, name: "perspective" }, { pattern: /\baspect\b/gi, bonus: 0.2, name: "aspect" }, { pattern: /\bcircumstance\b/gi, bonus: 0.2, name: "circumstance" } ], C1: [ { pattern: /\bcomprehensive\b/gi, bonus: 0.2, name: "comprehensive" }, { pattern: /\binherent\b/gi, bonus: 0.2, name: "inherent" }, { pattern: /\bpredominant\b/gi, bonus: 0.2, name: "predominant" }, { pattern: /\bsubsequent\b/gi, bonus: 0.2, name: "subsequent" }, { pattern: /\bpreceding\b/gi, bonus: 0.2, name: "preceding" }, { pattern: /\bartificial\b/gi, bonus: 0.2, name: "artificial" }, { pattern: /\bauthenticity\b/gi, bonus: 0.2, name: "authenticity" }, { pattern: /\bdistinguish\b/gi, bonus: 0.2, name: "distinguish" }, { pattern: /\bdilemma\b/gi, bonus: 0.2, name: "dilemma" }, { pattern: /\bretain\b/gi, bonus: 0.2, name: "retain" }, { pattern: /\bsustain\b/gi, bonus: 0.2, name: "sustain" }, { pattern: /\bmitigate\b/gi, bonus: 0.2, name: "mitigate" }, { pattern: /\bfacilitate\b/gi, bonus: 0.2, name: "facilitate" }, { pattern: /\bundermine\b/gi, bonus: 0.2, name: "undermine" }, { pattern: /\bimplication\b/gi, bonus: 0.2, name: "implication" }, { pattern: /\bmeticulous\b/gi, bonus: 0.2, name: "meticulous" }, { pattern: /\brevolutionize\b/gi, bonus: 0.2, name: "revolutionize" }, { pattern: /\bresilience\b/gi, bonus: 0.2, name: "resilience" }, { pattern: /\bprofound\b/gi, bonus: 0.2, name: "profound" }, { pattern: /\bintricate\b/gi, bonus: 0.2, name: "intricate" } ], C2: [ { pattern: /\bparadigm\b/gi, bonus: 0.5, name: "paradigm" }, { pattern: /\bintrinsic\b/gi, bonus: 0.5, name: "intrinsic" }, { pattern: /\bextrinsic\b/gi, bonus: 0.5, name: "extrinsic" }, { pattern: /\bdichotomy\b/gi, bonus: 0.5, name: "dichotomy" }, { pattern: /\benigmatic\b/gi, bonus: 0.5, name: "enigmatic" }, { pattern: /\bperpetual\b/gi, bonus: 0.5, name: "perpetual" }, { pattern: /\bperpetrate\b/gi, bonus: 0.5, name: "perpetrate" }, { pattern: /\bpredispose\b/gi, bonus: 0.5, name: "predispose" }, { pattern: /\bexacerbate\b/gi, bonus: 0.5, name: "exacerbate" }, { pattern: /\bameliorate\b/gi, bonus: 0.5, name: "ameliorate" }, { pattern: /\bubiquitous\b/gi, bonus: 0.5, name: "ubiquitous" }, { pattern: /\bpervasive\b/gi, bonus: 0.5, name: "pervasive" }, { pattern: /\bprecarious\b/gi, bonus: 0.5, name: "precarious" }, { pattern: /\bephemeral\b/gi, bonus: 0.5, name: "ephemeral" }, { pattern: /\binnovate\b/gi, bonus: 0.5, name: "innovate" }, { pattern: /\bjuxtapose\b/gi, bonus: 0.5, name: "juxtapose" }, { pattern: /\bconceptualize\b/gi, bonus: 0.5, name: "conceptualize" }, { pattern: /\bexemplify\b/gi, bonus: 0.5, name: "exemplify" }, { pattern: /\bmultifaceted\b/gi, bonus: 0.5, name: "multifaceted" }, { pattern: /\bindispensable\b/gi, bonus: 0.5, name: "indispensable" } ] };
const COMPLEX_GRAMMAR = { subordinate: [ { pattern: /\b(if|when|while|although|though|even though|unless|until|before|after|since|as|whereas|whenever)\s+\w+/gi, bonus: 0.3, name: "subordinate clause" }, ], relative: [ { pattern: /\w+\s+(which|that|who|whom|whose)\s+\w+/gi, bonus: 0.3, name: "relative clause" }, ], passive: [ { pattern: /\b(is|are|was|were|been|being)\s+(being\s+)?\w+(ed|en)\b/gi, bonus: 0.4, name: "passive voice" }, { pattern: /\b(has|have|had)\s+been\s+\w+(ed|en)\b/gi, bonus: 0.4, name: "passive perfect" }, ], perfectTenses: [ { pattern: /\b(have|has|had)\s+\w+(ed|en)\b/gi, bonus: 0.3, name: "present/past perfect" }, { pattern: /\b(will|shall)\s+have\s+\w+(ed|en)\b/gi, bonus: 0.4, name: "future perfect" }, ], conditionals: [ { pattern: /\b(would|could|should|might)\s+(have\s+)?\w+/gi, bonus: 0.3, name: "conditional" }, { pattern: /\bif\s+\w+\s+(had|were|was)\b/gi, bonus: 0.4, name: "complex conditional" }, ], modalPerfect: [ { pattern: /\b(would|could|should|might|must)\s+have\s+\w+(ed|en)\b/gi, bonus: 0.5, name: "modal perfect" }, ] };
const ARGUMENTATION = { reasoning: [ { pattern: /\b(because|since|as|due to|owing to)\b/gi, bonus: 0.2, name: "reasoning" }, { pattern: /\b(the reason is|that's why|this is why)\b/gi, bonus: 0.3, name: "explicit reasoning" }, ], examples: [ { pattern: /\b(for example|for instance|such as|like)\b/gi, bonus: 0.2, name: "example" }, { pattern: /\b(to illustrate|to demonstrate)\b/gi, bonus: 0.3, name: "illustration" }, ], explanation: [ { pattern: /\b(this means|in other words|specifically|particularly|especially)\b/gi, bonus: 0.2, name: "explanation" }, { pattern: /\b(what I mean is|to put it simply|in essence)\b/gi, bonus: 0.3, name: "clarification" }, ], comparison: [ { pattern: /\b(compared to|in comparison|similarly|likewise)\b/gi, bonus: 0.3, name: "comparison" }, { pattern: /\b(in contrast|on the contrary|unlike|whereas)\b/gi, bonus: 0.3, name: "contrast" }, ] };
const SENTENCE_PATTERNS = { compound: [ { pattern: /[.!?]\s*\w+[^.!?]+(and|but|or|so|yet)\s+\w+[^.!?]+[.!?]/gi, type: "compound" }, ], complex: [ { pattern: /\b(if|when|although|because|while|since)\s+[^,]+,\s*\w+/gi, type: "complex" }, ] };

// QUESTION BANK UTUH
const questionBank = { basic: [ { q: "What is your favorite hobby and why?", keys: ["hobby", "like", "love", "favorite", "because"] }, { q: "Tell me about your family members.", keys: ["family", "father", "mother", "brother", "sister"] }, { q: "Describe your typical daily routine.", keys: ["wake", "breakfast", "work", "school", "sleep"] }, { q: "What is your favorite food and how does it taste?", keys: ["food", "delicious", "taste", "eat", "cooking"] }, { q: "Describe your house or your bedroom.", keys: ["house", "room", "bed", "live", "stay", "comfortable"] }, { q: "What is the weather like today in your city?", keys: ["weather", "sunny", "rainy", "hot", "cold", "sky"] } ], intermediate: [ { q: "Do you prefer city life or country life?", keys: ["city", "countryside", "prefer", "quiet", "busy"] }, { q: "How has the internet changed our lives?", keys: ["internet", "technology", "change", "easier", "social"] }, { q: "What are the qualities of a good friend?", keys: ["friend", "honest", "trust", "loyal", "kind"] }, { q: "Describe a beautiful place you have visited.", keys: ["place", "visit", "beautiful", "view", "travel", "trip"] }, { q: "Why is it important to learn a second language?", keys: ["language", "english", "important", "communication", "learn", "world"] }, { q: "Do you think people work too hard nowadays?", keys: ["work", "hard", "busy", "balance", "lifestyle", "office"] } ], advanced: [ { q: "Discuss the pros and cons of Artificial Intelligence.", keys: ["intelligence", "automation", "future", "ethics", "advantage"] }, { q: "Describe a significant challenge you overcame.", keys: ["challenge", "overcome", "resilience", "problem", "solve"] }, { q: "Should university education be free for everyone?", keys: ["education", "university", "government", "tax", "opportunity"] }, { q: "How does social media affect our mental health?", keys: ["social media", "mental health", "anxiety", "platform", "impact", "user"] }, { q: "Discuss the importance of environmental conservation.", keys: ["environment", "conservation", "nature", "planet", "protection", "global"] }, { q: "How will technology change the job market in the future?", keys: ["technology", "job", "market", "future", "career", "skills"] } ] };

// --- 3. SPEECH RECOGNITION SETUP (PERBAIKAN HP) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        // PERBAIKAN: Volume HP sering kecil, ambang diturunkan agar transkrip nulis
        if (currentVolume < 1) return; 

        lastSpeechTimestamp = Date.now();
        let interimTranscript = "";
        const currentKeys = shuffledQuestions[questionIndex] ? shuffledQuestions[questionIndex].keys : [];

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            let transcript = event.results[i][0].transcript;
            
            currentKeys.forEach(key => {
                const regex = new RegExp(`\\b${key}\\b`, 'gi');
                transcript = transcript.replace(regex, `<span style="color:#4f46e5; font-weight:bold;">${key}</span>`);
            });

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

    recognition.onerror = (event) => {
        console.error("Speech Error: " + event.error);
    };
} else {
    alert("Your browser does not support Speech Recognition. Please use Chrome or Safari.");
}

// --- 4. AUDIO & WAVEFORM (PERBAIKAN HP) ---
async function startNoiseGate() {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // KRUSIAL UNTUK HP: AudioContext harus di-resume dalam user gesture
        if (audioContext.state === 'suspended') await audioContext.resume();

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        updateVolumeMeter();
        drawWaveform();
    } catch (err) { 
        alert("Please allow microphone access!"); 
    }
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

// CORE TEST LOGIC UTUH
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

// TOGGLE RECORDING (PERBAIKAN HP)
async function toggleRecording() {
    const btn = document.getElementById('record-btn');
    if (!isRecording) {
        // PERBAIKAN: Di HP, Audio & Recog harus dipicu dalam satu klik
        isRecording = true;
        btn.innerHTML = '<i class="fas fa-stop"></i>';
        btn.style.backgroundColor = "#ef4444";
        
        await startNoiseGate(); 
        
        lastSpeechTimestamp = Date.now();
        silencePenalty = 0;
        finalTranscript = ""; 
        
        if (recognition) recognition.start();
        
        timerInterval = setInterval(() => {
            seconds++;
            document.getElementById('timer').innerText = new Date(seconds * 1000).toISOString().substr(14, 5);
            if ((Date.now() - lastSpeechTimestamp) / 1000 > 5) silencePenalty += 0.2;
        }, 1000);
    } else {
        isRecording = false;
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        btn.style.backgroundColor = "#4f46e5";
        if (recognition) recognition.stop();
        clearInterval(timerInterval);
        cancelAnimationFrame(animationId);
        if (audioContext) audioContext.close().then(() => audioContext = null);
        document.getElementById('next-btn').classList.remove('hidden');
    }
}

// NEXT QUESTION (LOGIKA PENILAIAN IELTS v2.5 - TETAP UTUH & SAMA)
function nextQuestion() {
    const text = finalTranscript.toLowerCase().trim();
    const cleanText = text.replace(/<[^>]*>/g, ""); 
    const wordsArray = cleanText.split(/\s+/).filter(w => w.length > 2);
    const wordCount = wordsArray.length;
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

    const grammarErrorRate = wordCount > 0 ? Math.abs(Math.min(0, grammarBonusPenalty)) / wordCount : 0;
    
    let cohesionBonus = 0;
    COHESIVE_DEVICES.advanced.forEach(device => {
        const matches = cleanText.match(device.pattern);
        if (matches) cohesionBonus += (matches.length * device.bonus);
    });
    
    let vocabLevelBonus = 0;
    VOCABULARY_LEVELS.B2.forEach(word => { const matches = cleanText.match(word.pattern); if (matches) vocabLevelBonus += (matches.length * word.bonus); });
    VOCABULARY_LEVELS.C1.forEach(word => { const matches = cleanText.match(word.pattern); if (matches) vocabLevelBonus += (matches.length * word.bonus); });
    VOCABULARY_LEVELS.C2.forEach(word => { const matches = cleanText.match(word.pattern); if (matches) vocabLevelBonus += (matches.length * word.bonus); });
    
    let complexGrammarBonus = 0; let complexStructureCount = 0;
    COMPLEX_GRAMMAR.subordinate.forEach(p => { const m = cleanText.match(p.pattern); if (m) { complexGrammarBonus += (m.length * p.bonus); complexStructureCount += m.length; } });
    COMPLEX_GRAMMAR.relative.forEach(p => { const m = cleanText.match(p.pattern); if (m) { complexGrammarBonus += (m.length * p.bonus); complexStructureCount += m.length; } });
    COMPLEX_GRAMMAR.passive.forEach(p => { const m = cleanText.match(p.pattern); if (m) { complexGrammarBonus += (m.length * p.bonus); complexStructureCount += m.length; } });
    COMPLEX_GRAMMAR.perfectTenses.forEach(p => { const m = cleanText.match(p.pattern); if (m) { complexGrammarBonus += (m.length * p.bonus); complexStructureCount += m.length; } });
    COMPLEX_GRAMMAR.conditionals.forEach(p => { const m = cleanText.match(p.pattern); if (m) { complexGrammarBonus += (m.length * p.bonus); complexStructureCount += m.length; } });
    COMPLEX_GRAMMAR.modalPerfect.forEach(p => { const m = cleanText.match(p.pattern); if (m) { complexGrammarBonus += (m.length * p.bonus); complexStructureCount += m.length; } });
    
    let complexityPenalty = complexStructureCount === 0 ? -1.5 : (complexStructureCount < 3 ? -0.8 : (complexStructureCount < 5 ? -0.3 : 0));
    
    let relevancePenalty = 0;
    const questionWords = currentQ.q.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const answerWords = cleanText.split(/\s+/);
    const keywordOverlap = questionWords.filter(qw => answerWords.some(aw => aw.includes(qw) || qw.includes(aw))).length;
    const relevanceRatio = keywordOverlap / questionWords.length;
    const requiredKeywordsMentioned = currentQ.keys.filter(k => cleanText.includes(k)).length;
    const keywordCoverage = requiredKeywordsMentioned / currentQ.keys.length;
    
    if (relevanceRatio < 0.2 && keywordCoverage < 0.3) relevancePenalty = -3.0;
    else if (relevanceRatio < 0.3 || keywordCoverage < 0.4) relevancePenalty = -1.5;
    else if (keywordCoverage < 0.5) relevancePenalty = -0.5;
    
    let argumentationBonus = 0; let argumentationCount = 0;
    ARGUMENTATION.reasoning.forEach(p => { const m = cleanText.match(p.pattern); if (m) { argumentationBonus += (m.length * p.bonus); argumentationCount += m.length; } });
    ARGUMENTATION.examples.forEach(p => { const m = cleanText.match(p.pattern); if (m) { argumentationBonus += (m.length * p.bonus); argumentationCount += m.length; } });
    ARGUMENTATION.explanation.forEach(p => { const m = cleanText.match(p.pattern); if (m) { argumentationBonus += (m.length * p.bonus); argumentationCount += m.length; } });
    ARGUMENTATION.comparison.forEach(p => { const m = cleanText.match(p.pattern); if (m) { argumentationBonus += (m.length * p.bonus); argumentationCount += m.length; } });
    
    const errorPatterns = {};
    GRAMMAR_RULES.errors.forEach(rule => { const matches = cleanText.match(rule.pattern); if (matches) { const errorType = rule.fix || "general"; errorPatterns[errorType] = (errorPatterns[errorType] || 0) + matches.length; } });
    const errorCounts = Object.values(errorPatterns);
    const maxSameError = errorCounts.length > 0 ? Math.max(...errorCounts) : 0;
    const systematicErrorPenalty = maxSameError > 3 ? -0.8 : (maxSameError > 2 ? -0.4 : 0);
    
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length || 1;
    const shortSentenceRatio = sentences.filter(s => s.trim().split(/\s+/).length < 3).length / sentenceCount;
    let breakdownPenalty = (shortSentenceRatio > 0.5 || grammarErrorRate > 0.25 || wordsArray.length < 10) ? -2.0 : (shortSentenceRatio > 0.3 || grammarErrorRate > 0.20 ? -1.0 : 0);
    
    let sentenceVarietyBonus = (/\b(and|but|or|so|yet)\s+\w+/.test(cleanText) && /\b(if|when|although|because|while)\s+/.test(cleanText)) ? 0.3 : (/\b(and|but|or|so|yet)\s+\w+/.test(cleanText) || /\b(if|when|although|because|while)\s+/.test(cleanText) ? 0.15 : 0);
    
    let developmentBonus = (wordsArray.length >= 50 && argumentationCount >= 2 && complexStructureCount >= 3) ? 0.5 : (wordsArray.length >= 30 && (argumentationCount >= 1 || complexStructureCount >= 2) ? 0.3 : (wordsArray.length >= 20 ? 0.1 : 0));

    currentSessionTranscript += `Q: ${currentQ.q}\nA: ${cleanText}\n\n`;

    let fluency, pron, vocab, grammar;
    if (wordsArray.length < 5) {
        fluency = 0; pron = 0; vocab = 0; grammar = 0;
    } else {
        const fillerCount = (cleanText.match(/\b(uhm|um|err|uh|ah)\b/g) || []).length;
        const pauseCount = (cleanText.match(/\./g) || []).length;
        const uniqueWords = new Set(wordsArray).size;
        const keywordMatches = currentQ.keys.filter(k => cleanText.includes(k)).length;
        const repetitions = (cleanText.match(/\b(\w+)\s+\1(\s+\1)*/gi) || []).length;
        const brokenSentences = (cleanText.match(/\.\s+(and|of|in|to|with|a|the)\b/gi) || []).length;
        const excessiveFillers = Math.max(0, fillerCount - 3);
        const ratioPenalty = Math.max(0, (fillerCount / wordCount) - 0.08) * 8;
        
        const wordBonus = (wordCount / 5 * 0.15) * (grammarErrorRate > 0.15 ? 0.5 : 1.0);
        fluency = 5.5 + wordBonus + cohesionBonus + argumentationBonus + sentenceVarietyBonus + developmentBonus - (excessiveFillers * 0.25) - (repetitions * 0.4) - (pauseCount > 3 ? (pauseCount - 3) * 0.2 : 0) - (silencePenalty * 0.5) - ratioPenalty - (brokenSentences * 0.2) - breakdownPenalty + (relevancePenalty * 0.5);
        vocab = 3.5 + Math.min(uniqueWords * 0.12, 2.0) + (keywordMatches * 0.3) + vocabLevelBonus + (vocabLevelBonus === 0 ? -1.0 : 0) + (uniqueWords/wordCount < 0.5 ? -0.5 : 0) + relevancePenalty * 0.7;
        if (currentLevel === "basic") vocab = (vocabLevelBonus === 0) ? Math.min(vocab, 5.5) : Math.min(vocab, 6.5);
        else if (currentLevel === "intermediate") vocab = (vocabLevelBonus < 0.5) ? Math.min(vocab, 7.0) : Math.min(vocab, 7.5);
        const strongerCompoundPenalty = grammarErrorRate > 0.15 ? -2.0 : (grammarErrorRate > 0.10 ? -1.5 : (grammarErrorRate > 0.05 ? -0.8 : 0));
        grammar = 4.5 + (wordCount > 30 ? 1.0 : (wordCount > 20 ? 0.5 : 0)) + grammarBonusPenalty + cohesionBonus + complexGrammarBonus + argumentationBonus + developmentBonus + strongerCompoundPenalty + complexityPenalty + systematicErrorPenalty + relevancePenalty * 0.5;
        pron = 5.0 + (keywordMatches * 0.5) + (wordCount > 25 ? 0.8 : 0) - (excessiveFillers * 0.2) - (repetitions * 0.2);
    }

    const limit = (v) => Math.max(0, Math.min(9.0, v));
    sessionScores.push({
        overall: limit((fluency + vocab + grammar + pron) / 4),
        fluency: limit(fluency), pron: limit(pron), vocab: limit(vocab), grammar: limit(grammar)
    });

    if (questionIndex < 2) { questionIndex++; loadQuestion(); } 
    else { localStorage.setItem('last_transcript_history', currentSessionTranscript); finishTest(); }
}

// FINISH TEST, AUTH, NAV, WINDOW ONLOAD TETAP SAMA
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

async function handleLogin() {
    const email = document.getElementById('login-email').value.toLowerCase().trim();
    const pass = document.getElementById('login-pass').value.trim();
    if (!email || !pass) return alert("Please enter both Email and Password!");
    const btn = document.querySelector('#login-card .btn-primary');
    btn.innerText = "Verifying..."; btn.disabled = true;
    try {
        const res = await fetch(WEB_APP_URL + "?action=getUsers");
        const users = await res.json();
        if (users.includes(email)) {
            activeUserEmail = email; localStorage.setItem('isLoggedInEmail', email);
            alert("Login Successful!"); location.reload();
        } else { alert("ACCESS DENIED: Email not registered or approved."); }
    } catch (e) { alert("Server error. Check your internet connection."); }
    finally { btn.innerText = "Sign In"; btn.disabled = false; }
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
    const landing = document.getElementById('landing-page');
    document.getElementById('main-footer').classList.add('hidden');
    if (landing) landing.classList.add('hidden');
    const navBtn = document.getElementById('nav-login-btn');
    if (navBtn) navBtn.classList.add('hidden');
    const authSec = document.getElementById('auth-section');
    if (authSec) authSec.classList.remove('hidden');
}

function toggleAuthMode() {
    document.getElementById('login-card').classList.toggle('hidden');
    document.getElementById('signup-form').classList.toggle('hidden');
}

function startTest(level) {
    currentLevel = level;
    const allQuestions = questionBank[level];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    shuffledQuestions = shuffled.slice(0, 3);
    questionIndex = 0; sessionScores = []; 
    document.getElementById('level-tag').innerText = level.toUpperCase();
    document.getElementById('level-section').classList.add('hidden');
    document.getElementById('test-section').classList.remove('hidden');
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
function logout() { localStorage.removeItem('isLoggedInEmail'); location.reload(); }

window.onload = () => {
    const savedEmail = localStorage.getItem('isLoggedInEmail');
    if (savedEmail) {
        activeUserEmail = savedEmail;
        const lastResult = JSON.parse(localStorage.getItem('speakProResult'));
        if (lastResult) {
            const masteryContainer = document.getElementById('mastery-container');
            if(masteryContainer) {
                masteryContainer.classList.remove('hidden');
                const score = parseFloat(lastResult.overall);
                const percentage = (score / 9) * 100;
                document.getElementById('mastery-badge').innerText = score.toFixed(1);
                const bar = document.getElementById('mastery-bar');
                setTimeout(() => bar.style.width = percentage + "%", 500);
                const status = document.getElementById('mastery-status');
                const advice = document.getElementById('mastery-advice');
                if (score >= 7.5) { bar.style.backgroundColor = "#22c55e"; status.innerText = "Level Mastered"; advice.innerText = "Your speaking logic and grammar are solid."; }
                else if (score >= 6.0) { bar.style.backgroundColor = "#f59e0b"; status.innerText = "Consistent Progress"; advice.innerText = "Good performance. To reach Band 8+, focus more."; }
                else { bar.style.backgroundColor = "#ef4444"; status.innerText = "Need More Practice"; advice.innerText = "Focus on reducing long pauses and filler words."; }
            }
        }
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('nav-login-btn').classList.add('hidden');
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('level-section').classList.remove('hidden');
        const historyData = localStorage.getItem('last_transcript_history');
        const historyDiv = document.getElementById('history-content');
        if (historyData && historyDiv) {
            historyDiv.innerText = historyData;
            document.getElementById('transcript-history').classList.remove('hidden');
        }
    } else {
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('main-footer').classList.remove('hidden');
        document.getElementById('nav-login-btn').classList.remove('hidden');
    }
};

function goBackToHome() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('nav-login-btn').classList.remove('hidden');
}

// Service Worker (Path HP & GitHub Pages FIX)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.log("Service Worker Failed", err));
}