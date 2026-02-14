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

// Audio State - PERBAIKAN MOBILE
let audioContext, analyser, microphone, currentVolume = 0;
const VOLUME_THRESHOLD = 0.1; // PERBAIKAN: Diturunkan drastis untuk mobile (dari 5 ke 0.1)

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

// --- 3. SPEECH RECOGNITION SETUP (SUPER DEBUG VERSION) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// DEBUG: Check browser support
console.log("🔍 Browser Check:");
console.log("- SpeechRecognition support:", !!SpeechRecognition);
console.log("- Browser:", navigator.userAgent);

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    console.log("✅ Speech Recognition initialized");

    recognition.onstart = () => {
        console.log("🎤 Recognition STARTED");
        updateDebugInfo("🎤 Recognition STARTED", "success");
        const statusMsg = document.getElementById('status-msg');
        if (statusMsg) {
            statusMsg.innerHTML = "🎤 <strong>LISTENING...</strong> Speak now!";
            statusMsg.style.color = "#22c55e";
        }
    };

    recognition.onresult = (event) => {
        console.log("📝 onResult triggered! Event:", event);
        updateDebugInfo("📝 Transcript received", "success");
        
        lastSpeechTimestamp = Date.now();
        let interimTranscript = "";
        const currentKeys = shuffledQuestions[questionIndex] ? shuffledQuestions[questionIndex].keys : [];

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            let transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            console.log(`📝 Result ${i}:`, {
                text: transcript,
                isFinal: event.results[i].isFinal,
                confidence: confidence
            });
            
            if (event.results[i].isFinal) {
                updateDebugInfo(`✅ FINAL: "${transcript.substring(0, 30)}..."`, "success");
            } else {
                updateDebugInfo(`⏳ INTERIM: "${transcript.substring(0, 20)}..."`, "info");
            }
            
            currentKeys.forEach(key => {
                const regex = new RegExp(`\\b${key}\\b`, 'gi');
                transcript = transcript.replace(regex, `<span style="color:#4f46e5; font-weight:bold;">${key}</span>`);
            });

            GRAMMAR_RULES.errors.forEach(rule => {
                transcript = transcript.replace(rule.pattern, `<span style="color:#ef4444; text-decoration:underline; font-weight:bold;">$&</span>`);
            });

            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
                console.log("✅ FINAL transcript:", transcript);
            } else {
                interimTranscript += transcript;
                console.log("⏳ INTERIM transcript:", transcript);
            }
        }

        // PERBAIKAN: Update simple status instead of showing full transcript
        const wordCount = finalTranscript.trim().split(/\s+/).filter(w => w.length > 0).length;
        const statusDiv = document.getElementById('transcript-live');
        if (statusDiv) {
            // Show simple feedback: word count + encouraging message
            let message = "🎤 <strong>Recording...</strong> Keep speaking!";
            if (wordCount > 0) {
                message = `✅ <strong>${wordCount} words captured</strong> - Great! Continue...`;
            }
            statusDiv.innerHTML = `<div style="text-align:center; padding:20px; background:#f0fdf4; border-radius:12px; border:2px solid #86efac;">${message}</div>`;
            console.log("✅ UI Updated - Word count:", wordCount);
        } else {
            console.error("❌ transcript-live div not found!");
            updateDebugInfo("❌ transcript-live div not found!", "error");
        }
        
        analyzeSpeaking(finalTranscript.toLowerCase());
    };

    recognition.onerror = (event) => {
        console.error("❌ Speech Error:", event.error);
        console.error("Error details:", event);
        updateDebugInfo(`❌ Error: ${event.error}`, "error");
        
        const statusMsg = document.getElementById('status-msg');
        if (statusMsg) {
            let errorMsg = "⚠️ Error: ";
            switch(event.error) {
                case 'no-speech':
                    errorMsg += "No speech detected. Try again.";
                    break;
                case 'audio-capture':
                    errorMsg += "Mic not working!";
                    break;
                case 'not-allowed':
                    errorMsg += "Mic permission denied!";
                    break;
                case 'network':
                    errorMsg += "Network error!";
                    break;
                default:
                    errorMsg += event.error;
            }
            statusMsg.innerHTML = errorMsg;
            statusMsg.style.color = "#ef4444";
        }
    };

    recognition.onend = () => {
        console.log("🛑 Recognition ended");
        updateDebugInfo("🛑 Recognition ended", "warning");
        
        if (isRecording) {
            console.log("🔄 Auto-restarting recognition...");
            updateDebugInfo("🔄 Auto-restarting...", "info");
            setTimeout(() => {
                try {
                    recognition.start();
                    console.log("✅ Recognition restarted");
                    updateDebugInfo("✅ Restarted", "success");
                } catch (e) {
                    console.error("❌ Restart failed:", e);
                    updateDebugInfo("❌ Restart failed: " + e.message, "error");
                }
            }, 100);
        }
    };
    
    recognition.onsoundstart = () => {
        console.log("🔊 Sound detected!");
        updateDebugInfo("🔊 Sound detected!", "success");
        const statusMsg = document.getElementById('status-msg');
        if (statusMsg) {
            statusMsg.innerHTML = "🔊 <strong>SOUND DETECTED!</strong>";
            statusMsg.style.color = "#22c55e";
        }
    };
    
    recognition.onspeechstart = () => {
        console.log("🗣️ Speech started!");
        updateDebugInfo("🗣️ Speech started!", "success");
        const statusMsg = document.getElementById('status-msg');
        if (statusMsg) {
            statusMsg.innerHTML = "🗣️ <strong>SPEECH DETECTED!</strong> Keep going!";
            statusMsg.style.color = "#22c55e";
        }
        // Update live div to show active state
        const liveDiv = document.getElementById('transcript-live');
        if (liveDiv) {
            liveDiv.innerHTML = '<div style="text-align:center; padding:20px; background:#dcfce7; border-radius:12px; border:2px solid #22c55e;"><span style="color:#166534; font-size:15px;">🗣️ <strong>Great! I hear you...</strong> Continue speaking!</span></div>';
        }
    };
    
    recognition.onspeechend = () => {
        console.log("🤐 Speech ended");
        updateDebugInfo("🤐 Speech ended", "info");
    };
    
    recognition.onaudiostart = () => {
        console.log("🎵 Audio capture started");
        updateDebugInfo("🎵 Audio capture started", "info");
    };
    
    recognition.onaudioend = () => {
        console.log("🎵 Audio capture ended");
        updateDebugInfo("🎵 Audio capture ended", "info");
    };
    
} else {
    console.error("❌ Browser does NOT support Speech Recognition!");
    alert("Your browser does not support Speech Recognition. Please use Chrome or Safari.");
}

// --- 4. AUDIO & WAVEFORM (SUPER DEBUG VERSION) ---
async function startNoiseGate() {
    console.log("🎤 startNoiseGate called");
    
    try {
        // Initialize AudioContext
        if (!audioContext) {
            console.log("📍 Creating new AudioContext...");
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("✅ AudioContext created:", audioContext.state);
        }
        
        // Resume if suspended
        if (audioContext.state === 'suspended') {
            console.log("⏸️ AudioContext suspended, resuming...");
            await audioContext.resume();
            console.log("▶️ AudioContext resumed:", audioContext.state);
        }

        // Request microphone access
        console.log("📍 Requesting microphone access...");
        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        };
        console.log("Constraints:", constraints);
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("✅ Microphone access granted!");
        console.log("Stream:", stream);
        console.log("Audio tracks:", stream.getAudioTracks());
        
        // Create analyser
        console.log("📍 Creating audio analyser...");
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        analyser.fftSize = 256;
        microphone.connect(analyser);
        console.log("✅ Audio analyser connected");
        
        console.log("🎉 Audio initialization complete!");
        updateVolumeMeter();
        drawWaveform();
        
    } catch (err) { 
        console.error("❌ Microphone access error:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        
        let errorMsg = "Microphone access failed!\n\n";
        if (err.name === 'NotAllowedError') {
            errorMsg += "Please allow microphone permission in your browser settings.";
        } else if (err.name === 'NotFoundError') {
            errorMsg += "No microphone found on your device.";
        } else {
            errorMsg += "Error: " + err.message;
        }
        alert(errorMsg);
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

// CORE TEST LOGIC - SILENT MODE (NO REAL-TIME FEEDBACK)
function analyzeSpeaking(text) {
    if (text.length < 5) return "too_short";
    
    // Silent analysis - no UI feedback during recording
    // Just log for debugging
    if (/\b(saya|adalah|yang|untuk|dengan|bisa|ini|itu)\b/i.test(text)) {
        console.log("⚠️ Indonesian detected in transcript");
        return "invalid_lang";
    }
    
    console.log("✅ Speech analysis OK");
    return "valid";
}

// TOGGLE RECORDING (SUPER DEBUG VERSION)
async function toggleRecording() {
    const btn = document.getElementById('record-btn');
    const statusMsg = document.getElementById('status-msg');
    
    console.log("🎬 toggleRecording called, isRecording:", isRecording);
    updateDebugInfo(`🎬 Toggle recording (was: ${isRecording})`, "info");
    
    if (!isRecording) {
        // START RECORDING
        console.log("▶️ STARTING RECORDING...");
        updateDebugInfo("▶️ STARTING RECORDING", "success");
        isRecording = true;
        btn.innerHTML = '<i class="fas fa-stop"></i>';
        btn.style.backgroundColor = "#ef4444";
        
        if (statusMsg) {
            statusMsg.innerHTML = "⏳ Initializing microphone...";
            statusMsg.style.color = "#f59e0b";
        }
        
        // STEP 1: Start Audio
        console.log("📍 Step 1: Starting audio...");
        updateDebugInfo("📍 Step 1: Starting audio", "info");
        await startNoiseGate(); 
        console.log("✅ Step 1 complete: Audio initialized");
        updateDebugInfo("✅ Step 1: Audio OK", "success");
        
        // STEP 2: Small delay
        console.log("📍 Step 2: Waiting 500ms...");
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("✅ Step 2 complete");
        
        // STEP 3: Reset variables
        console.log("📍 Step 3: Resetting variables...");
        lastSpeechTimestamp = Date.now();
        silencePenalty = 0;
        finalTranscript = "";
        
        // Update UI
        const liveDiv = document.getElementById('transcript-live');
        if (liveDiv) {
            liveDiv.innerHTML = '<div style="text-align:center; padding:20px; background:#fef3c7; border-radius:12px; border:2px solid #fbbf24;"><span style="color:#92400e; font-size:15px;">🎤 <strong>Listening...</strong> Start speaking now!</span></div>';
        }
        console.log("✅ Step 3 complete");
        
        // STEP 4: Start Speech Recognition
        console.log("📍 Step 4: Starting speech recognition...");
        updateDebugInfo("📍 Step 4: Starting speech recognition", "info");
        try {
            if (recognition) {
                recognition.start();
                console.log("✅ Speech recognition start() called");
                updateDebugInfo("✅ Recognition start() called", "success");
                
                if (statusMsg) {
                    statusMsg.innerHTML = "🎤 <strong>RECORDING!</strong> Start speaking...";
                    statusMsg.style.color = "#22c55e";
                }
            } else {
                console.error("❌ Recognition object is null!");
                updateDebugInfo("❌ Recognition is null!", "error");
                alert("Speech recognition not initialized!");
                return;
            }
        } catch (e) {
            console.error("❌ Recognition start error:", e);
            updateDebugInfo("⚠️ Start error (may be OK): " + e.message, "warning");
            console.log("ℹ️ This might be OK if already running");
        }
        
        // STEP 5: Start timer
        console.log("📍 Step 5: Starting timer...");
        timerInterval = setInterval(() => {
            seconds++;
            const timerEl = document.getElementById('timer');
            if (timerEl) {
                timerEl.innerText = new Date(seconds * 1000).toISOString().substr(14, 5);
            }
            if ((Date.now() - lastSpeechTimestamp) / 1000 > 5) {
                silencePenalty += 0.2;
            }
        }, 1000);
        console.log("✅ Step 5 complete: Timer started");
        
        console.log("🎉 RECORDING STARTED SUCCESSFULLY!");
        updateDebugInfo("🎉 Recording started!", "success");
        
    } else {
        // STOP RECORDING
        console.log("⏹️ STOPPING RECORDING...");
        updateDebugInfo("⏹️ STOPPING RECORDING", "warning");
        isRecording = false;
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        btn.style.backgroundColor = "#4f46e5";
        
        if (statusMsg) {
            statusMsg.innerHTML = "⏹️ Recording stopped. Processing...";
            statusMsg.style.color = "#64748b";
        }
        
        // Stop recognition
        if (recognition) {
            try {
                recognition.stop();
                console.log("✅ Speech recognition stopped");
                updateDebugInfo("✅ Recognition stopped", "success");
            } catch (e) {
                console.error("❌ Recognition stop error:", e);
                updateDebugInfo("❌ Stop error: " + e.message, "error");
            }
        }
        
        // Stop timer
        clearInterval(timerInterval);
        console.log("✅ Timer stopped");
        
        // Stop waveform
        cancelAnimationFrame(animationId);
        console.log("✅ Waveform stopped");
        
        // Close audio
        if (audioContext) {
            audioContext.close().then(() => {
                audioContext = null;
                console.log("✅ AudioContext closed");
            });
        }
        
        // Log final state
        console.log("📊 Final state:");
        console.log("- Final transcript:", finalTranscript);
        const wordCount = finalTranscript.trim().split(/\s+/).filter(w => w.length > 0).length;
        console.log("- Word count:", wordCount);
        console.log("- Duration:", seconds, "seconds");
        updateDebugInfo(`📊 Words: ${wordCount}, Duration: ${seconds}s`, "info");
        
        // Show summary to user
        const liveDiv = document.getElementById('transcript-live');
        if (liveDiv) {
            liveDiv.innerHTML = `
                <div style="text-align:center; padding:20px; background:#dbeafe; border-radius:12px; border:2px solid #3b82f6;">
                    <div style="color:#1e40af; font-size:16px; font-weight:700; margin-bottom:10px;">✅ Recording Complete!</div>
                    <div style="color:#1e40af; font-size:14px;">
                        <strong>${wordCount}</strong> words captured in <strong>${seconds}</strong> seconds
                    </div>
                    <div style="color:#64748b; font-size:12px; margin-top:8px;">Click "Next Question" to continue</div>
                </div>
            `;
        }
        
        if (statusMsg) {
            statusMsg.innerHTML = "✅ Recording complete! Click Next to continue.";
            statusMsg.style.color = "#22c55e";
        }
        
        document.getElementById('next-btn').classList.remove('hidden');
        console.log("🎉 RECORDING STOPPED SUCCESSFULLY!");
        updateDebugInfo("🎉 Recording stopped!", "success");
    }
}

// NEXT QUESTION (LOGIKA PENILAIAN IELTS v2.5 - TETAP UTUH & SAMA)
function nextQuestion() {
    const text = finalTranscript.toLowerCase().trim();
    const cleanText = text.replace(/<[^>]*>/g, ""); 
    
    // PERBAIKAN: Log untuk debug
    console.log("Processing transcript:", cleanText);
    console.log("Word count:", cleanText.split(/\s+/).length);
    
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

    // PERBAIKAN: Simpan transcript dengan format yang lebih baik
    const questionText = currentQ.q;
    const answerText = cleanText || "(no speech detected)";
    currentSessionTranscript += `Q${questionIndex + 1}: ${questionText}\nA: ${answerText}\n\n`;
    
    console.log("Transcript so far:", currentSessionTranscript);

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

    if (questionIndex < 2) { 
        questionIndex++; 
        loadQuestion(); 
    } else { 
        // PERBAIKAN: Pastikan transcript disimpan sebelum finish
        console.log("Saving transcript to localStorage:", currentSessionTranscript);
        localStorage.setItem('last_transcript_history', currentSessionTranscript); 
        finishTest(); 
    }
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
            activeUserEmail = email;
            localStorage.setItem('isLoggedInEmail', email);
            alert("Login Successful!");
            location.reload();
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

function toggleAuthMode() {
    document.getElementById('login-card').classList.toggle('hidden');
    document.getElementById('signup-form').classList.toggle('hidden');
}

async function handleSignUpSheet() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.toLowerCase().trim();
    const wa = document.getElementById('reg-wa').value.trim();
    if (!name || !email || !wa) return alert("Please fill all fields!");
    const btn = document.getElementById('signup-btn');
    btn.innerText = "Saving..."; btn.disabled = true;
    try {
        const params = new URLSearchParams({ action: "addUser", name, email, wa });
        await fetch(WEB_APP_URL + "?" + params.toString(), { mode: 'no-cors' });
        document.getElementById('reg-inputs').classList.add('hidden');
        document.getElementById('reg-success').classList.remove('hidden');
    } catch (err) {
        alert("Failed to save data!");
        btn.innerText = "Register Now";
        btn.disabled = false;
    }
}

function handleSignUpWA() {
    const name = document.getElementById('reg-name').value.trim();
    window.open(`https://wa.me/6281232339403?text=Halo Mr. Adi, saya ${name} sudah daftar.`, '_blank');
}

function showAuth() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('main-footer').classList.add('hidden');
    document.getElementById('nav-login-btn').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
}

async function saveResultToSheet(data) {
    const email = activeUserEmail || localStorage.getItem('isLoggedInEmail');
    const params = new URLSearchParams({ 
        action: "saveResult", 
        email, 
        level: currentLevel,
        overall: data.overall,
        fluency: data.fluency,
        vocab: data.vocab,
        grammar: data.grammar,
        pron: data.pron,
        date: new Date().toISOString().split('T')[0]
    });
    fetch(WEB_APP_URL + "?" + params.toString(), { mode: 'no-cors' });
}

function startTest(level) {
    currentLevel = level;
    const allQuestions = questionBank[level];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    shuffledQuestions = shuffled.slice(0, 3);
    questionIndex = 0;
    sessionScores = [];
    currentSessionTranscript = ""; // PERBAIKAN: Reset transcript
    document.getElementById('level-tag').innerText = level.toUpperCase();
    document.getElementById('level-section').classList.add('hidden');
    document.getElementById('test-section').classList.remove('hidden');
    loadQuestion();
}

function loadQuestion() {
    console.log("📖 Loading question", questionIndex + 1);
    
    seconds = 0;
    finalTranscript = "";
    
    document.getElementById('timer').innerText = "00:00";
    document.getElementById('question-count').innerText = `Question ${questionIndex + 1}/3`;
    document.getElementById('level-tag').innerText = currentLevel.toUpperCase();
    document.getElementById('question-text').innerText = shuffledQuestions[questionIndex].q;
    document.getElementById('required-keywords').innerText = shuffledQuestions[questionIndex].keys.join(', ');
    
    const liveDiv = document.getElementById('transcript-live');
    if (liveDiv) {
        liveDiv.innerHTML = '<div style="text-align:center; padding:20px; background:#f8fafc; border-radius:12px; border:2px dashed #cbd5e1;"><span style="color:#64748b; font-size:15px;">📝 Ready to record. Click the microphone to start!</span></div>';
    }
    
    document.getElementById('next-btn').classList.add('hidden');
    
    // Reset status message
    const statusMsg = document.getElementById('status-msg');
    if (statusMsg) {
        statusMsg.innerHTML = "🎤 Click microphone to start recording";
        statusMsg.style.color = "#64748b";
    }
    
    // Reset grammar status
    const grammarStatus = document.getElementById('grammar-status');
    if (grammarStatus) {
        grammarStatus.style.display = 'none';
    }
    
    console.log("✅ Question loaded:", shuffledQuestions[questionIndex].q);
    console.log("Keywords:", shuffledQuestions[questionIndex].keys);
}

function goBackToLevels() { location.reload(); }
function logout() { localStorage.removeItem('isLoggedInEmail'); location.reload(); }

window.onload = () => {
    console.log("🚀 App loaded!");
    
    // Create debug panel
    createDebugPanel();
    
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
        
        // Display transcript history
        const historyData = localStorage.getItem('last_transcript_history');
        const historyDiv = document.getElementById('history-content');
        if (historyData && historyDiv) {
            const formattedHistory = historyData.replace(/\n/g, '<br>');
            historyDiv.innerHTML = formattedHistory;
            document.getElementById('transcript-history').classList.remove('hidden');
            console.log("✅ Transcript history loaded");
        } else {
            console.log("ℹ️ No transcript history found");
        }
    } else {
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('main-footer').classList.remove('hidden');
        document.getElementById('nav-login-btn').classList.remove('hidden');
    }
};

function createDebugPanel() {
    // Create debug panel HTML
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0,0,0,0.9);
        color: #22c55e;
        padding: 15px;
        border-radius: 10px;
        font-family: monospace;
        font-size: 11px;
        max-width: 300px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 9999;
        display: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    debugPanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom: 1px solid #444; padding-bottom:5px;">
            <strong style="color:#fff;">🐛 DEBUG PANEL</strong>
            <button onclick="toggleDebugPanel()" style="background:#ef4444; color:white; border:none; padding:3px 8px; border-radius:5px; cursor:pointer; font-size:10px;">HIDE</button>
        </div>
        <div id="debug-content"></div>
    `;
    
    document.body.appendChild(debugPanel);
    
    // Add toggle button to test section
    const testSection = document.getElementById('test-section');
    if (testSection) {
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '🐛 DEBUG';
        toggleBtn.onclick = toggleDebugPanel;
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: #4f46e5;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            z-index: 9998;
            box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
        `;
        toggleBtn.id = 'debug-toggle-btn';
        document.body.appendChild(toggleBtn);
    }
    
    console.log("✅ Debug panel created");
}

function toggleDebugPanel() {
    const panel = document.getElementById('debug-panel');
    const btn = document.getElementById('debug-toggle-btn');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        if (btn) btn.style.display = 'none';
    } else {
        panel.style.display = 'none';
        if (btn) btn.style.display = 'block';
    }
}

function updateDebugInfo(message, type = 'info') {
    const debugContent = document.getElementById('debug-content');
    if (!debugContent) return;
    
    const colors = {
        info: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        success: '#10b981'
    };
    
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.style.cssText = `
        padding: 5px 0;
        border-bottom: 1px solid #333;
        color: ${colors[type] || colors.info};
    `;
    entry.innerHTML = `<small style="color:#888;">[${time}]</small> ${message}`;
    
    debugContent.insertBefore(entry, debugContent.firstChild);
    
    // Keep only last 20 entries
    while (debugContent.children.length > 20) {
        debugContent.removeChild(debugContent.lastChild);
    }
}

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