import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, ShieldCheck, Bell, Activity, Thermometer, Wind, Eye, ClipboardCheck, Phone, Zap, Shield, Users, Share2, QrCode, Check, Copy, Stethoscope, Flame, Send, ShieldAlert, Mic } from 'lucide-react';
import { EmergencyResponse, AssistanceRequest } from '../types';
import EvacuationMap from './EvacuationMap';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../context/ToastContext';

interface GuestDashboardProps {
  response: EmergencyResponse;
  onUpdateRouting?: (preference: 'safest' | 'fastest') => void;
  currentPreference?: 'safest' | 'fastest';
  onLogout: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ response, onUpdateRouting, currentPreference = 'fastest', onLogout }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const handlePreferenceToggle = (newPref: 'safest' | 'fastest') => {
    if (onUpdateRouting) {
      onUpdateRouting(newPref);
    }
  };

  const inviteLink = `https://resqai.emergency/join/${response.group_tracking?.invite_code || 'RQ-DEFAULT'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [language, setLanguage] = useState<'en' | 'te' | 'hi'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');

  const translations = {
    en: { 
      alert: "Emergency Alert Issued", 
      sub: "Follow instructions to safety.", 
      distance: "30m to Exit B — Use stairs on right", 
      smoke: "Smoke detected — Stay low, cover mouth", 
      normal: "Proceed to evacuation assembly point",
      critical: "Critical Action Required",
      evac: "Immediate Evacuation Protocols in Effect",
      ack: "Acknowledge & Proceed to Map",
      silence: "Silence Audio Alert",
      silenced: "Alert Silenced",
      tactical: "Tactical Feed",
      intel: "Local Intelligence",
      checklist: "Resilience Checklist",
      broadcasts: "Official Broadcasts",
      assistance: "One-Tap Emergency Assistance",
      safetyCheck: "Safety Check-In",
      markedSafe: "Status: Marked Safe & Located",
      markSafe: "I Am Safe - Mark Verified",
      helpEnRoute: "Help En-Route",
      voiceActive: "Voice Support Active",
      tapToSpeak: "Tap to Speak",
      listening: "Listening...",
      stop: "Stop",
      medical: "Medical",
      fire: "Fire",
      security: "Security",
      groupSync: "Tactical Group Sync",
      tracking: "Active Family & Friend Tracking",
      mapHeader: "Real-Time Tactical Evacuation Plot",
      inviteTitle: "Invite to Your Safety Group",
      inviteSub: "Ensure your loved ones are tracked by the central AI. Share this link instantly.",
      copyLink: "Copy Link",
      copied: "Copied!",
      scanJoin: "Scan to Join Group",
      primaryRoute: "Primary Evacuation Route",
      hazardAvoidance: "Hazard Zone Avoidance",
      assistanceHub: "Crisis Assistance Hub",
      fastest: "Fastest",
      safest: "Safest",
      groupId: "Group ID",
      SPOUSE: "Spouse",
      SON: "Son",
      DAUGHTER: "Daughter",
      PARENT: "Parent",
      FRIEND: "Friend",
      SAFE: "SAFE",
      EVACUATING: "EVACUATING",
      NORMAL: "NORMAL",
      CLEAR: "CLEAR",
      LOW: "LOW",
      HIGH: "HIGH",
      "SMOKE DETECTED": "SMOKE DETECTED",
      typing: "Responder is typing...",
      lastLocation: "Last Known Location",
      syncTime: "Sync Timestamp",
      priorityLabel: "Priority",
      CRITICAL: "CRITICAL",
      IMPORTANT: "IMPORTANT",
      INFO: "INFO",
      "AUTOMATED BROADCAST": "AUTOMATED BROADCAST",
      "EVACUATION PROTOCOL ENGAGED": "Evacuation protocol engaged. Please use the stairs. Emergency responders have been dispatched.",
      LOBBY: "Lobby",
      "NORTH ATRIUM": "North Atrium",
      "FLOOR 1 - UTILITY PATH": "Floor 1 - Utility Path",
      welcomeMsg: "Hello, this is {responder}. We have received your request and a unit is being dispatched to {location}. Please stay where you are if safe.",
      medicalResponder: "First Responder - Medical",
      fireResponder: "Fire Response Unit",
      securityResponder: "Site Security",
      coordResponder: "Response Coordinator"
    },
    te: { 
      alert: "ఆపత్కాల హెచ్చరిక జారీ చేయబడింది", 
      sub: "భద్రత కోసం సూచనలను పాటించండి.", 
      distance: "ఎగ్జిట్ B కి 30 మీటర్లు — కుడివైపు మెట్లు వాడండి", 
      smoke: "పొగ గుర్తించబడింది — కిందికి ఉండండి, నోరు మూసుకోండి", 
      normal: "తరలింపు అసెంబ్లీ పాయింట్‌కు వెళ్లండి",
      critical: "క్లిష్టమైన చర్య అవసరం",
      evac: "తక్షణ తరలింపు ప్రోటోకాల్‌లు అమలులో ఉన్నాయి",
      ack: "అంగీకరించి మ్యాప్‌కు వెళ్లండి",
      silence: "ఆడియో హెచ్చరికను ఆపివేయి",
      silenced: "హెచ్చరిక ఆపివేయబడింది",
      tactical: "టాక్టికల్ ఫీడ్",
      intel: "స్థానిక సమాచారం",
      checklist: "భద్రతా చెక్ లిస్ట్",
      broadcasts: "అధికారిక ప్రసారాలు",
      assistance: "ఒక-ట్యాప్ అత్యవసర సహాయం",
      safetyCheck: "భద్రతా తనిఖీ",
      markedSafe: "స్థితి: సురక్షితంగా గుర్తించబడింది",
      markSafe: "నేను సురక్షితంగా ఉన్నాను - ధృవీకరించు",
      helpEnRoute: "సహాయం వస్తోంది",
      voiceActive: "వాయిస్ సపోర్ట్ యాక్టివ్",
      tapToSpeak: "మాట్లాడటానికి నొక్కండి",
      listening: "వింటున్నాను...",
      stop: "ఆపు",
      medical: "వైద్య సహాయం",
      fire: "అగ్నిమాపక",
      security: "భద్రత",
      groupSync: "టాక్టికల్ గ్రూప్ సింక్",
      tracking: "కుటుంబం & స్నేహితుల ట్రాకింగ్",
      mapHeader: "రియల్ టైమ్ తరలింపు ప్లాట్",
      inviteTitle: "మీ భద్రతా సమూహానికి ఆహ్వానించండి",
      inviteSub: "మీ ప్రియమైన వారు సెంట్రల్ AI ద్వారా ట్రాక్ చేయబడ్డారని నిర్ధారించుకోండి.",
      copyLink: "లింక్ కాపీ చేయండి",
      copied: "కాపీ చేయబడింది!",
      scanJoin: "గ్రూప్‌లో చేరడానికి స్కాన్ చేయండి",
      primaryRoute: "ప్రాథమిక తరలింపు మార్గం",
      hazardAvoidance: "ప్రమాద ప్రాంతం నివారణ",
      assistanceHub: "సంక్షోభ సహాయ కేంద్రం",
      fastest: "వేగవంతమైన",
      safest: "సురక్షితమైన",
      groupId: "గ్రూప్ ID",
      SPOUSE: "జీవిత భాగస్వామి",
      SON: "కుమారుడు",
      DAUGHTER: "కుమార్తె",
      PARENT: "తల్లిదండ్రులు",
      FRIEND: "స్నేహితుడు",
      SAFE: "సురక్షితం",
      EVACUATING: "తరలింపు",
      NORMAL: "సాధారణం",
      CLEAR: "స్పష్టంగా ఉంది",
      LOW: "తక్కువ",
      HIGH: "ఎక్కువ",
      "SMOKE DETECTED": "పొగ గుర్తించబడింది",
      "SECURE ALL PERSONAL BELONGINGS": "వ్యక్తిగత వస్తువులన్నీ భద్రపరచుకోండి",
      "FOLLOW THE CYAN FLOOR MARKERS": "సయాన్ ఫ్లోర్ మార్కర్లను అనుసరించండి",
      "AVOID USING ELEVATORS": "ఎలివేటర్లను వాడవద్దు",
      "STAY UPDATED VIA THIS DASHBOARD": "ఈ డాష్‌బోర్డ్ ద్వారా అప్‌డేట్ గా ఉండండి",
      "AMBIENT TEMP": "పరిసర ఉష్ణోగ్రత",
      "AIR QUALITY": "గాలి నాణ్యత",
      "VISIBILITY": "దృశ్యత",
      typing: "రెస్పాండర్ టైప్ చేస్తున్నారు...",
      lastLocation: "చివరిగా తెలిసిన ప్రాంతం",
      syncTime: "సమకాలీకరణ సమయం",
      priorityLabel: "ప్రాధాన్యత",
      CRITICAL: "క్లిష్టమైన",
      IMPORTANT: "ముఖ్యమైన",
      INFO: "సమాచారం",
      "AUTOMATED BROADCAST": "ఆటోమేటెడ్ బ్రాడ్‌కాస్ట్",
      "EVACUATION PROTOCOL ENGAGED": "తరలింపు ప్రోటోకాల్ ప్రారంభించబడింది. దయచేసి మెట్లు వాడండి. అత్యవసర సిబ్బంది పంపబడ్డారు.",
      LOBBY: "లాబీ",
      "NORTH ATRIUM": "ఉత్తర ప్రాంగణం",
      "FLOOR 1 - UTILITY PATH": "ఫ్లోర్ 1 - యుటిలిటీ మార్గం",
      welcomeMsg: "నమస్కారం, ఇది {responder}. మేము మీ అభ్యర్థనను అందుకున్నాము మరియు ఒక బృందాన్ని {location} కు పంపిస్తున్నాము. సురక్షితంగా ఉంటే మీరు ఉన్న చోటే ఉండండి.",
      medicalResponder: "వైద్య బృందం",
      fireResponder: "అగ్నిమాపక బృందం",
      securityResponder: "భద్రతా బృందం",
      coordResponder: "ప్రతిస్పందన సమన్వయకర్త"
    },
    hi: { 
      alert: "आपातकालीन चेतावनी", 
      sub: "सुरक्षा निर्देशों का पालन करें।", 
      distance: "Exit B से 30m — दाईं ओर सीढ़ियों का उपयोग करें", 
      smoke: "धुआं मिला — नीचे रहें, मुंह ढकें", 
      normal: "निकासी असेंबली बिंदु पर जाएँ",
      critical: "महत्वपूर्ण कार्रवाई आवश्यक",
      evac: "तत्काल निकासी प्रोटोकॉल प्रभावी",
      ack: "स्वीकार करें और मानचित्र पर जाएं",
      silence: "आडियो अलर्ट चुप करें",
      silenced: "अलर्ट चुप कर दिया गया",
      tactical: "सामरीक फीड",
      intel: "स्थानीय खुफिया",
      checklist: "सुरक्षा चेकलिस्ट",
      broadcasts: "आधिकारिक प्रसारण",
      assistance: "एक-टैप आपातकालीन सहायता",
      safetyCheck: "सुरक्षा चेक-इन",
      markedSafe: "स्थिति: सुरक्षित चिह्नित",
      markSafe: "मैं सुरक्षित हूँ - सत्यापित करें",
      helpEnRoute: "सहायता रास्ते में है",
      voiceActive: "वॉयस सपोर्ट सक्रिय",
      tapToSpeak: "बोलने के लिए टैप करें",
      listening: "सुन रहे हैं...",
      stop: "रोकें",
      medical: "चिकित्सा",
      fire: "आग",
      security: "सुरक्षा",
      groupSync: "सामरिक समूह सिंक",
      tracking: "सक्रिय परिवार और मित्र ट्रैकिंग",
      mapHeader: "रियल-टाइम सामरिक निकासी प्लॉट",
      inviteTitle: "अपने सुरक्षा समूह में आमंत्रित करें",
      inviteSub: "सुनिश्चित करें कि आपके प्रियजनों को केंद्रीय एआई द्वारा ट्रैक किया गया है।",
      copyLink: "लिंक कॉपी करें",
      copied: "कॉपी किया गया!",
      scanJoin: "ग्रुप में शामिल होने के लिए स्कैन करें",
      primaryRoute: "प्राथमिक निकासी मार्ग",
      hazardAvoidance: "खतरा क्षेत्र परिहार",
      assistanceHub: "संकट सहायता केंद्र",
      fastest: "सबसे तेज़",
      safest: "सबसे सुरक्षित",
      groupId: "ग्रुप आईडी",
      SPOUSE: "जीवनसाथी",
      SON: "बेटा",
      DAUGHTER: "बेटी",
      PARENT: "माता-पिता",
      FRIEND: "मित्र",
      SAFE: "सुरक्षित",
      EVACUATING: "निकासी",
      NORMAL: "सामान्य",
      CLEAR: "साफ",
      LOW: "कम",
      HIGH: "उच्च",
      "SMOKE DETECTED": "धुआं मिला",
      "SECURE ALL PERSONAL BELONGINGS": "सभी व्यक्तिगत सामान सुरक्षित करें",
      "STAY UPDATED VIA THIS DASHBOARD": "इस डैशबोर्ड के माध्यम से अपडेट रहें",
      "AMBIENT TEMP": "परिवेश का तापमान",
      "AIR QUALITY": "वायु की गुणवत्ता",
      "VISIBILITY": "दृश्यता",
      typing: "प्रतिक्रियादाता टाइप कर रहा है...",
      lastLocation: "पिछली ज्ञात स्थिति",
      syncTime: "सिंक समय",
      priorityLabel: "प्राथमिकता",
      CRITICAL: "गंभीर",
      IMPORTANT: "महत्वपूर्ण",
      INFO: "जानकारी",
      "NORTH ATRIUM": "उत्तर प्रांगण",
      "FLOOR 1 - UTILITY PATH": "फ्लोर 1 - उपयोगिता पथ",
      "FOLLOW THE CYAN FLOOR MARKERS": "सियान फ्लोर मार्करों का पालन करें",
      "AVOID USING ELEVATORS": "लिफ्ट के इस्तेमाल से बचें",
      "AUTOMATED BROADCAST": "स्वचालित प्रसारण",
      "EVACUATION PROTOCOL ENGAGED": "निकासी प्रोटोकॉल लागू। कृपया सीढ़ियों का उपयोग करें। आपातकालीन बचावकर्मी भेजे गए हैं।",
      LOBBY: "लॉबी",
      welcomeMsg: "नमस्ते, यह {responder} है। हमें आपका अनुरोध प्राप्त हो गया है और एक टीम {location} को भेजी जा रही है। यदि सुरक्षित है तो कृपया वहीं रहें।",
      medicalResponder: "चिकित्सा दल",
      fireResponder: "अग्नि शमन दल",
      securityResponder: "सुरक्षा दल",
      coordResponder: "प्रतिक्रिया समन्वयक"
    }
  };

  const localize = (str: string) => {
    if (!str) return str;
    const t = translations[language] as any;
    const upperStr = str.toUpperCase().replace(/\s+/g, '_');
    return t[upperStr] || t[str] || t[str.toUpperCase()] || str;
  };

  const getTacticalGuidance = () => {
    const t = translations[language];
    if (response.guest_features?.localized_sensors.visibility === 'SMOKE DETECTED') return t.smoke;
    if (response.guest_features?.localized_sensors.temp && parseInt(response.guest_features.localized_sensors.temp) > 40) return t.smoke;
    return t.distance;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ResQAI Safety Group',
          text: `Join my emergency safety group on ResQAI. Group ID: ${response.group_tracking?.group_id}`,
          url: inviteLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      addToast('Sharing not supported on this device. Link copied to clipboard.', 'info');
    }
  };

  const [activeAssistance, setActiveAssistance] = useState<AssistanceRequest | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [alertPriority, setAlertPriority] = useState<'CRITICAL' | 'IMPORTANT' | 'INFO'>('CRITICAL');
  const [showCriticalOverlay, setShowCriticalOverlay] = useState(true);
  const [isSilenced, setIsSilenced] = useState(false);

  const triggerUrgency = () => {
    if (isSilenced) return;
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  };

  const multilingualSpeak = (keys: (keyof typeof translations['en'])[]) => {
    const langs: ('en' | 'te' | 'hi')[] = ['en', 'te', 'hi'];
    langs.forEach((l) => {
      const text = keys.map(k => (translations[l] as any)[k]).join('. ');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = l === 'te' ? 'te-IN' : l === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (alertPriority === 'CRITICAL' && showCriticalOverlay && !isSilenced) {
      triggerUrgency();
      multilingualSpeak(['alert', 'evac', 'normal']);
    }
  }, [alertPriority, response.guest_features?.localized_sensors.visibility, showCriticalOverlay, isSilenced]);

  const speak = (text: string) => {
    if (isSilenced || !text) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.lang = langCode;

    // Async voice selection
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase() || v.lang.toLowerCase().startsWith(language.toLowerCase()));
    if (voice) utterance.voice = voice;
    
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast("Speech recognition not supported on this device.", "alert");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsSpeaking(true);
    recognition.onend = () => setIsSpeaking(false);
    
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processVoiceMessage(text);
    };

    recognition.start();
  };

  const processVoiceMessage = (message: string) => {
    const userMsg = { 
      sender: 'user' as const, 
      message, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setActiveAssistance((prev: AssistanceRequest | null) => {
      if (!prev) return null;
      return {
        ...prev,
        chat_log: [...(prev.chat_log || []), userMsg]
      };
    });

    const lowerMsg = message.toLowerCase();
    let responseMsg = translations[language].normal;
    
    // Keyword detection for Medical/Pain
    if (lowerMsg.includes('pain') || lowerMsg.includes('hurt') || lowerMsg.includes('వైద్య') || lowerMsg.includes('నొప్పి') || lowerMsg.includes('గాయం') || lowerMsg.includes('దెబ్బ')) {
      responseMsg = language === 'te' ? "వైద్య బృందం వస్తోంది. నిశ్చలంగా ఉండండి. సహాయం 2 నిమిషాల్లో అందుతుంది." : "Medical unit assigned. Help is 2 minutes out. Please stay still.";
    } 
    // Keyword detection for Fire/Smoke
    else if (lowerMsg.includes('fire') || lowerMsg.includes('smoke') || lowerMsg.includes('మంటలు') || lowerMsg.includes('పొగ') || lowerMsg.includes('కాల్పులు')) {
      responseMsg = language === 'te' ? "అగ్నిమాపక బృందం అప్రమత్తమైంది. కిందకు ఉండండి మరియు పొగకు దూరంగా వెళ్ళండి." : "Fire response updated. Move away from the source and stay low.";
    }
    // Keyword detection for "What to do?" / Instructions
    else if (lowerMsg.includes('what to do') || lowerMsg.includes('help') || lowerMsg.includes('చేయాలి') || lowerMsg.includes('సహాయం') || lowerMsg.includes('దారి')) {
      responseMsg = language === 'te' ? "తరలింపు మార్గాన్ని అనుసరించండి. ఎగ్జిట్ B వైపు వెళ్ళండి." : "Follow the evacuation markers. Proceed towards Exit B immediately.";
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responderMsg = { 
        sender: 'responder' as const, 
        message: responseMsg, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setActiveAssistance((prev: AssistanceRequest | null) => {
        if (!prev) return null;
        return {
          ...prev,
          chat_log: [...(prev.chat_log || []), responderMsg]
        };
      });
    }, 1500);

    // Speak the response immediately for emergency speed
    speak(responseMsg);
  };

  const formatChatMessage = (msg: string) => {
    if (!msg) return msg;
    const welcomeRegex = /Hello, this is (.*)\. We have received your request and a unit is being dispatched to (.*)\. Please stay where you are if safe\./;
    const match = msg.match(welcomeRegex);
    
    if (match) {
      const responder = match[1];
      const location = match[2];
      
      let localizedResponder = responder;
      if (responder.includes('Medical')) localizedResponder = (translations[language] as any).medicalResponder;
      else if (responder.includes('Fire')) localizedResponder = (translations[language] as any).fireResponder;
      else if (responder.includes('Security')) localizedResponder = (translations[language] as any).securityResponder;
      else if (responder.includes('Coordinator')) localizedResponder = (translations[language] as any).coordResponder;
      
      return (translations[language] as any).welcomeMsg
        .replace('{responder}', localizedResponder)
        .replace('{location}', localize(location));
    }
    
    return localize(msg);
  };

  const handleRequestHelp = async (type: 'medical' | 'fire' | 'security') => {
    setIsRequesting(true);
    try {
      const resp = await fetch('http://localhost:8000/request-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, location: response.log.input.location })
      });
      const data = await resp.json();
      setActiveAssistance(data);
      speak(formatChatMessage(data.chat_log[0].message));
    } catch (err) {
      console.error('Error requesting assistance:', err);
    } finally {
      setIsRequesting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-blue-500/30 transition-colors duration-500 overflow-x-hidden relative">
      
      {/* 1. REFINED CRITICAL FULLSCREEN OVERLAY */}
      {alertPriority === 'CRITICAL' && showCriticalOverlay && (
        <div className="fixed inset-0 z-[500] bg-[#202124]/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="max-w-md w-full bg-[var(--bg-secondary)] rounded-2xl p-8 border border-[var(--glass-border)] text-center shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#fce8e6] rounded-full mx-auto mb-6 flex items-center justify-center">
                   <ShieldAlert className="w-8 h-8 text-[#ea4335]" />
                </div>
                
                <h2 className="text-2xl font-medium text-[var(--text-primary)] mb-2">{translations[language].critical}</h2>
                <p className="text-[var(--text-secondary)] text-sm mb-8">{translations[language].evac} // AREA 02-NORTH</p>
                
                <div className="space-y-4">
                   <button 
                     onClick={() => {
                       window.speechSynthesis.cancel();
                       setShowCriticalOverlay(false);
                     }}
                     className="w-full py-3 bg-[#ea4335] hover:bg-[#d93025] text-white text-sm font-medium rounded-lg transition-colors"
                   >
                     {translations[language].ack}
                   </button>
                   <button 
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        setIsSilenced(true);
                      }}
                      className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-full py-2"
                    >
                      {isSilenced ? translations[language].silenced : translations[language].silence}
                    </button>
                </div>
              </div>
           </div>
        </div>
      )}

      <div className={`space-y-8 pb-32 max-w-full mx-auto px-6 pt-12 transition-all duration-700 ${showCriticalOverlay ? 'blur-xl opacity-20 scale-95' : 'blur-0 opacity-100 scale-100'}`}>
        
        {/* TACTICAL MODE SELECTOR */}
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center space-x-2 bg-transparent">
              {(['CRITICAL', 'IMPORTANT', 'INFO'] as const).map((p) => (
                <button 
                  key={p}
                  onClick={() => setAlertPriority(p)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    alertPriority === p 
                      ? (p === 'CRITICAL' ? 'bg-[#feecee] text-[#d93025] dark:bg-[#3c4043] dark:text-white' : p === 'IMPORTANT' ? 'bg-[#fef7e0] text-[#f29900] dark:bg-[#3c4043] dark:text-white' : 'bg-[#e8f0fe] text-[#1967d2] dark:bg-[#3c4043] dark:text-white')
                      : 'text-[var(--text-secondary)] hover:bg-[var(--glass-border)]'
                  }`}
                >
                  {localize(p)}
                </button>
              ))}
           </div>
           
           <div className="flex items-center space-x-4">
               <div className="flex bg-[var(--glass-border)] p-1 rounded-lg">
                  {(['en', 'te', 'hi'] as const).map((lang) => (
                    <button 
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        language === lang 
                          ? 'bg-[var(--bg-secondary)] dark:bg-[#3c4043] text-[var(--text-primary)] shadow-sm' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
               </div>
               <ThemeToggle />
               <button 
                 onClick={onLogout}
                 className="text-sm text-[var(--text-secondary)] hover:text-[#d93025] font-medium transition-colors"
               >
                  Sign Out
               </button>
            </div>
        </div>

        {/* HERO GUIDANCE */}
        <div className="card relative overflow-hidden text-center py-8 px-6 mb-6">
          <div className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl transition-all duration-500  ${
            response.guest_features?.localized_sensors.visibility === 'SMOKE DETECTED' ? 'bg-[#fce8e6] text-[#ea4335] dark:bg-[#2a2f36]' : 'bg-[#fef7e0] text-[#fbbc05] dark:bg-[#2a2f36]'
          }`}>
             <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-medium text-[var(--text-primary)] tracking-tight mb-2">
            {translations[language].alert}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-8">{translations[language].sub}</p>

          <button className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-700 font-medium text-sm hover:opacity-90 ${
            response.guest_features?.localized_sensors.visibility === 'SMOKE DETECTED' 
              ? 'bg-[#ea4335] text-white' 
              : 'bg-[#e6f4ea] text-[#137333] dark:bg-[#1e8e3e] dark:text-white'
          }`}>
             <Zap className="w-4 h-4 fill-current" />
             <span>{getTacticalGuidance()}</span>
             <span className="ml-2 font-bold text-lg leading-none">→</span>
          </button>
        </div>

        {/* ASSISTANCE RADAR */}
        <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] mb-6 shadow-sm">
           {!activeAssistance ? (
             <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 bg-[#ef4444]/10 rounded-2xl flex items-center justify-center border border-[#ef4444]/20 ">
                      <ShieldAlert className="w-8 h-8 text-[#f87171]" />
                   </div>
                   <div>
                      <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">{translations[language].assistance}</h3>
                      <p className="text-sm text-[#f87171] font-medium  mt-1">{translations[language].voiceActive}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                   {[
                     { id: 'medical', icon: Stethoscope, color: 'text-[#f87171]', label: translations[language].medical },
                     { id: 'fire', icon: Flame, color: 'text-orange-400', label: translations[language].fire },
                     { id: 'security', icon: Shield, color: 'text-[#3b82f6]', label: translations[language].security }
                   ].map(btn => (
                     <button 
                       key={btn.id}
                       onClick={() => handleRequestHelp(btn.id as any)}
                       className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer group active:scale-95"
                     >
                        <btn.icon className={`w-6 h-6 ${btn.color} mb-2 group-hover:scale-110 transition-transform`} />
                        <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{btn.label}</span>
                     </button>
                   ))}
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-[var(--glass-border)]">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                         <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <h3 className="font-medium text-[var(--text-primary)] text-sm">{translations[language].helpEnRoute}</h3>
                         <p className="text-sm text-emerald-600 font-bold">Responder Assigned // {activeAssistance.id}</p>
                      </div>
                   </div>
                   <button 
                      onClick={() => setActiveAssistance(null)}
                      className="btn-secondary px-4 py-2 text-sm"
                   >
                      Cancel
                   </button>
                </div>

                <div className="bg-[var(--bg-tertiary)] rounded-2xl p-6 h-80 overflow-y-auto space-y-4 custom-scrollbar">
                   {activeAssistance.chat_log?.map((msg: any, i: number) => (
                     <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          onClick={() => speak(formatChatMessage(msg.message))}
                          className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm transition-all cursor-pointer hover:ring-2 hover:ring-blue-500/20 active:scale-[0.98] ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-primary)] rounded-tl-none'
                        }`}>
                           {formatChatMessage(msg.message)}
                           <p className={`text-sm mt-2 font-medium opacity-60 ${msg.sender === 'user' ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{msg.time}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="flex items-center space-x-4">
                   <button 
                     onClick={isSpeaking ? () => {} : startListening}
                     className={`flex-1 flex items-center justify-center space-x-3 py-5 rounded-2xl font-medium  text-sm transition-all ${
                       isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20'
                     }`}
                   >
                      <Mic className="w-5 h-5" />
                      <span>{isSpeaking ? translations[language].listening : translations[language].tapToSpeak}</span>
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* MAP & ROUTE */}
        <div className="card mb-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-4">
                 <div className="p-2 bg-[#3b82f6]/10 rounded-xl border border-[#3b82f6]/20">
                    <MapPin className="w-6 h-6 text-[#3b82f6]" />
                 </div>
                 <h2 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">{translations[language].mapHeader}</h2>
              </div>
              <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--glass-border)]">
                 <button 
                   onClick={() => handlePreferenceToggle('fastest')}
                   className={`px-5 py-2.5 rounded-lg text-sm font-medium  transition-all ${currentPreference === 'fastest' ? 'bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/20' : 'text-[#6b7280] hover:text-[var(--text-secondary)]'}`}
                 >
                    {translations[language].fastest}
                 </button>
                 <button 
                   onClick={() => handlePreferenceToggle('safest')}
                   className={`px-5 py-2.5 rounded-lg text-sm font-medium  transition-all ${currentPreference === 'safest' ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/20' : 'text-[#6b7280] hover:text-[var(--text-secondary)]'}`}
                 >
                    {translations[language].safest}
                 </button>
              </div>
           </div>

           <div className="h-[500px] rounded-2xl overflow-hidden border border-[var(--glass-border)] mb-8 relative group/map">
              <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#1f2937]/20 to-transparent"></div>
              <div className="h-full transition-all duration-700 ">
                 <EvacuationMap response={response} />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--glass-border)] transition-all hover:border-[#3b82f6]/30">
                 <span className="text-sm text-[#6b7280] font-medium ">{translations[language].primaryRoute}</span>
                 <p className="text-2xl font-medium text-[var(--text-primary)] mt-2 leading-none tracking-tight">{localize(response.route)}</p>
              </div>
              <div className="p-6 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-2xl transition-all">
                 <span className="text-sm text-[#f87171] font-medium ">{translations[language].hazardAvoidance}</span>
                 <p className="text-2xl font-medium text-[#f87171] mt-2 leading-none tracking-tight">{localize(response.log.input.location)}</p>
              </div>
           </div>
        </div>

        {/* FAMILY SYNC */}
        <div className="card mb-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                    <Users className="w-6 h-6 text-indigo-400" />
                 </div>
                 <div>
                    <h2 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">{translations[language].groupSync}</h2>
                    <p className="text-sm text-[#6b7280] font-medium  mt-1">{translations[language].tracking}</p>
                 </div>
              </div>
              <div className="bg-[var(--bg-tertiary)] px-4 py-2 rounded-xl border border-[var(--glass-border)] text-sm font-medium text-indigo-400 ">
                 {translations[language].groupId}: {response.group_tracking?.group_id}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {response.group_tracking?.members?.map(member => (
                <div key={member.id} className="p-5 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl flex items-center justify-between transition-all hover:border-[#3b82f6]/20">
                   <div className="flex items-center space-x-4">
                      <img src={member.avatar} alt="" className="w-11 h-11 rounded-xl border-2 border-[#1f2937] shadow-lg" />
                      <div>
                         <p className="text-sm font-medium text-[var(--text-primary)]">{member.name}</p>
                         <p className="text-sm font-medium text-[#6b7280]  mt-0.5">{localize(member.relation)}</p>
                      </div>
                   </div>
                   <div className={`px-3 py-1.5 rounded-lg text-sm font-medium  ${member.status === 'safe' ? 'bg-emerald-500/10 text-[#34d399]' : 'bg-rose-500/10 text-[#f87171] animate-pulse'}`}>
                      {localize(member.status)}
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-[var(--bg-tertiary)] border border-[var(--glass-border)] p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                 <h3 className="text-sm font-medium text-[var(--text-primary)]  mb-2">{translations[language].inviteTitle}</h3>
                 <p className="text-sm text-[#6b7280] font-medium leading-relaxed">{translations[language].inviteSub}</p>
              </div>
              <button 
                onClick={handleCopy}
                className={`h-14 px-8 rounded-2xl flex items-center space-x-3 text-sm font-medium  transition-all ${copied ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#3b82f6]/50'}`}
              >
                 {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                 <span>{copied ? translations[language].copied : translations[language].copyLink}</span>
              </button>
           </div>
        </div>

        {/* CHECKLIST & INTEL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
           <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm p-8">
              <div className="flex items-center space-x-4 mb-6">
                 <div className="p-2 bg-[#e6f4ea] dark:bg-[#2a2f36] rounded-xl">
                    <ClipboardCheck className="w-5 h-5 text-[#34a853]" />
                 </div>
                 <h2 className="text-lg font-medium text-[var(--text-primary)]">{translations[language].checklist}</h2>
              </div>
              <div className="space-y-0">
                  {response.guest_features?.safety_checklist?.map(item => (
                   <div key={item.id} className="py-4 border-b border-[var(--glass-border)] last:border-0 flex items-start space-x-4 transition-colors hover:bg-[var(--bg-tertiary)] -mx-4 px-4 rounded-lg cursor-pointer">
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0  ${item.priority === 'CRITICAL' ? 'bg-[#ea4335] animate-pulse' : 'bg-[#34a853]'}`}></div>
                      <p className="text-[15px] font-medium text-[var(--text-secondary)] leading-relaxed tracking-wide">{localize(item.task)}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm p-8">
              <div className="flex items-center space-x-4 mb-6">
                 <div className="p-2 bg-[#e8f0fe] dark:bg-[#2a2f36] rounded-xl">
                    <Activity className="w-5 h-5 text-[#1a73e8]" />
                 </div>
                 <h2 className="text-lg font-medium text-[var(--text-primary)]">{translations[language].intel}</h2>
              </div>
              <div className="space-y-0">
                 {[
                   { label: 'Ambient Temp', val: response.guest_features?.localized_sensors?.temp, icon: Thermometer, color: 'text-orange-400' },
                   { label: 'Air Quality', val: response.guest_features?.localized_sensors?.air_quality, icon: Wind, color: 'text-[#34a853]' },
                   { label: 'Visibility', val: response.guest_features?.localized_sensors?.visibility, icon: Eye, color: 'text-[#1a73e8]' }
                 ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-[var(--glass-border)] last:border-0 transition-colors hover:bg-[var(--bg-tertiary)] -mx-4 px-4 rounded-lg cursor-pointer">
                       <div className="flex items-center space-x-4">
                          <s.icon className={`w-5 h-5 ${s.color} opacity-80`} />
                          <span className="text-[15px] font-medium text-[var(--text-secondary)] ">{localize(s.label)}</span>
                       </div>
                       <span className="text-base font-medium text-[var(--text-primary)] ">{localize(s.val || 'N/A')}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* FOOTER CHECK-IN */}
        <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] text-center shadow-sm mb-12">
           <div className="flex items-center justify-center space-x-4 mb-8">
              <ShieldCheck className={`w-10 h-10 transition-all duration-1000 ${isCheckedIn ? 'text-[#34d399]' : 'text-[var(--text-secondary)]'}`} />
              <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">{translations[language].safetyCheck}</h2>
           </div>
           {isCheckedIn ? (
              <div className="bg-[#e6f4ea] dark:bg-[#1e8e3e] border border-[#ceead6] dark:border-[#1e8e3e] text-[#137333] dark:text-white py-4 mx-auto max-w-md rounded-xl font-medium text-base animate-in zoom-in-95 duration-500">
                 ✓ {translations[language].markedSafe}
              </div>
           ) : (
              <div className="max-w-md mx-auto">
                <button 
                  onClick={() => setIsCheckedIn(true)}
                  className="w-full h-[44px] btn-primary rounded-lg font-medium text-base transition-all transform active:scale-95"
                >
                   {translations[language].markSafe}
                </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
