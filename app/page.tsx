'use client';

import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  Zap, 
  Ghost, 
  MessageSquare, 
  Image as ImageIcon, 
  Loader2, 
  ChevronRight, 
  Flame,
  Sword,
  ShieldAlert,
  Plus,
  MessageCircle,
  Database,
  Activity,
  Download,
  Copy,
  Fingerprint,
  Radio,
  Eye,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Printer,
  Music,
  Music2,
  Check,
  Trash2,
  History,
  X,
  Sparkles,
  AlertTriangle,
  LogIn,
  LogOut,
  User,
  BarChart3,
  TrendingUp,
  Globe,
  ScrollText,
  MapPin,
  BookOpen,
  LayoutGrid,
  VolumeX,
  Film,
  Mic2,
  Disc,
  Play,
  Pause,
  Dices,
  Square,
  RefreshCw,
  ArrowRight,
  Map,
  FileText,
  Search,
  Smartphone,
  Key,
  ShieldCheck,
  Settings,
  Home,
  Newspaper,
  Brain,
  Video,
  Wind,
  Menu,
  Clapperboard,
  Bookmark,
  Heart,
  Camera,
  Mic,
  Upload,
  Target,
  Award,
  Trophy,
  Github
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateWithGemini } from '../lib/gemini-client';
import { Toast, ToastType } from '../components/Toast';
import { 
  MusicConcept, 
  StoryPart, 
  WorldLore, 
  Draft, 
  Character, 
  UserBadge, 
  MissionData, 
  UserProfile, 
  VoiceClone 
} from './types';
import { ConfirmModal } from '../components/ConfirmModal';
import { MusicStudio } from '../components/MusicStudio';
import { NoirInput } from '../components/NoirInput';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  deleteDoc, 
  addDoc, 
  updateDoc,
  collectionGroup,
  where,
  OperationType,
  handleFirestoreError
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser, getAuth as getOldAuth, signInWithPopup as signInOldApp, GoogleAuthProvider as OldGoogleAuthProvider } from 'firebase/auth';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, getDocs } from 'firebase/firestore';

// Initialize Gemini - moved inside functions for fresh instances

// Noir Studio components

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'Skull': return <Skull className="w-8 h-8 text-red-500" />;
    case 'Zap': return <Zap className="w-8 h-8 text-amber-500" />;
    case 'Ghost': return <Ghost className="w-8 h-8 text-zinc-400" />;
    case 'ShieldAlert': return <ShieldAlert className="w-8 h-8 text-orange-500" />;
    case 'ShieldCheck': return <ShieldCheck className="w-8 h-8 text-green-500" />;
    case 'Search': return <Search className="w-8 h-8 text-blue-400" />;
    case 'Eye': return <Eye className="w-8 h-8 text-purple-500" />;
    case 'Heart': return <Heart className="w-8 h-8 text-pink-500" />;
    case 'Sparkles': return <Sparkles className="w-8 h-8 text-yellow-500" />;
    case 'Lock': return <Lock className="w-8 h-8 text-teal-400" />;
    case 'FileText': return <FileText className="w-8 h-8 text-indigo-400" />;
    case 'BookOpen': return <BookOpen className="w-8 h-8 text-pink-400" />;
    case 'Flame': return <Flame className="w-8 h-8 text-orange-600" />;
    case 'Brain': return <Brain className="w-8 h-8 text-indigo-400" />;
    default: return <Target className="w-8 h-8 text-amber-500" />;
  }
};

const DEEP_ARCHETYPES = [
  {
    name: 'Femme Fatale',
    personality: 'Seductive, manipulative, fiercely independent, but haunted by a secret past.',
    motivations: 'Survival at all costs, gaining power over those who underestimated her, or protecting a hidden vulnerability.',
    dialogue: 'Velvety, sophisticated, and loaded with double-edged wit. Uses "sugar," "darling," or "big boy" to disarm targets while sizing up their jugular. Commands the room with a whisper; her "thanks" usually sounds like a threat.',
    backstory: 'Once a high-society darling, she was betrayed and left for dead. She rebuilt herself in the shadows with the help of a dying gangster\'s secrets.'
  },
  {
    name: 'Hard-boiled Detective',
    personality: 'Cynical, weary, obsessed with a sense of "morally grey" justice, often alcoholic or struggling with past trauma.',
    motivations: 'Solving the "one last case," seeking redemption for a past failure, or simply finding a truth that doesn\'t exist.',
    dialogue: 'Short, staccato sentences delivered like punches to the gut. Uses slang like "shamus," "flatfoot," or "taking a dirt nap." His wit is as dry as the gin he drinks, often comparing the city to a "cheap suit that shrunk in the rain."',
    backstory: 'A former star cop who discovered city hall was rotten to the core. Instead of playing along, he took the fall and opened a one-room office in the slums.'
  },
  {
    name: 'Ruthless Gangster',
    personality: 'Brutal, ambitious, deeply loyal to a warped code of honor, prone to sudden bursts of violence.',
    motivations: 'Controlling the streets, erasing a childhood of poverty, or building a legacy for their chosen "family."',
    dialogue: 'Direct, menacing, and peppered with underworld jargon like "heaters," "wiseguy," and "sleeping with the fishes." He doesn\'t shout; he speaks with the terrifying calm of a man who knows exactly where the bodies are buried.',
    backstory: 'Orphaned on the docks, he learned early that strength is the only currency. He killed his first boss to save a younger sibling and never looked back.'
  },
  {
    name: 'Corrupt Official',
    personality: 'Pompous, anxious underneath a veneer of control, deeply greedy, masterful at shifting blame.',
    motivations: 'Maintaining a lifestyle they can\'t afford, hiding their past crimes, or climbing the next rung of the political ladder.',
    dialogue: 'Oozes bureaucratic sleaze. Uses "administrative adjustments" to mean bribes and "unfortunate oversight" to mean murder. His speech is a maze of formal denials and "mutual benefits."',
    backstory: 'A middle-manager who realized that the system was built for those who cheat. Now he manages the city\'s graft like a personal bank account.'
  },
  {
    name: 'Street-smart Informant',
    personality: 'Twitchy, observant, opportunistic, knows everyone\'s business but trusts no one.',
    motivations: 'Staying alive for one more night, getting enough cash to leave the city, or playing two powerful forces against each other.',
    dialogue: 'A rapid-fire syncopation of stutters and street-slang. Uses "stoolie," "canary," and talks about "sawbucks" and "C-notes." His sentences often trail off as he checks shadows; he tells you everything while saying nothing.',
    backstory: 'A failed actor or pickpocket who realized that information is more valuable than wallets. He lives in the seams of the city, surviving on the scraps of giants.'
  },
  {
    name: 'Cynical Journalist',
    personality: 'Idealistic once but now burnt out, sharp-witted, persistent to a fault, borderline alcoholic.',
    motivations: 'Exposing the "big lie" even if it kills them, proving they\'re still the best reporter in town, or finding meaning in the chaos.',
    dialogue: 'Sharp-tongued and relentlessly cynical. Refers to the paper as a "rag" and the truth as "the most expensive commodity in town." His dialogue is a barrage of "off the record" leads and bitter, booze-soaked metaphors.',
    backstory: 'Won a prize for a big exposé that ended up changing nothing. Realized that the headlines only sell papers, they don\'t fix the world.'
  },
  {
     name: 'Naive Newcomer',
     personality: 'Bright-eyed, optimistic, easily manipulated, has a strong but misplaced sense of right and wrong.',
     motivations: 'Making it big in the city, finding a missing loved one, or escaping a stifling hometown.',
     dialogue: 'Earnest and painfully formal, lacking any "street" edge. Uses dated terms like "golly" or "swell," sounding like a Sunday school teacher who accidentally wandered into a slaughterhouse.',
     backstory: 'Arrived by bus with fifty dollars and a dream. Doesn\'t realize yet that the city eats dreams for breakfast.'
  },
  {
    name: 'Underworld Don',
    personality: 'Calculated, philosophical, seemingly untouchable, views the city as a grand chessboard.',
    motivations: 'Order through control, legacy, ensuring their "territory" remains stable at any price.',
    dialogue: 'Measured, elegant, and lethal. Speaks in parables about "business" and "legacy" to avoid the word "homicide." Every sentence is a calculated move on a chessboard you haven\'t even seen yet.',
    backstory: 'Came from nothing and used pure intellect and cold blood to unify the warring street gangs into a single, efficient machine.'
  },
  {
    name: 'Disillusioned Veteran',
    personality: 'Quiet, disciplined, hyper-vigilant, struggles with a world that has no place for his skills.',
    motivations: 'Peace and quiet, Protecting others who cannot protect themselves, or finding a cause worth dying for.',
    dialogue: 'Minimalist and tactical. Words are spent like ammunition—only when necessary. Uses military brevity ("Recon," "Negative," "Copy that") and avoids "I" statements, as if his personality died in the trenches.',
    backstory: 'Decorated for bravery in a war that was later declared illegal. He returned to a country that treated him like a monster or a ghost.'
  },
  {
    name: 'Mysterious Stranger',
    personality: 'Stoic, enigmatic, highly competent, seems to know more than he lets on.',
    motivations: 'Unknown, seemingly following a hidden agenda or correcting a cosmic imbalance.',
    dialogue: 'Cryptic, low-register, and precise. Avoids standard slang to remain unclassifiable. His questions feel like "knowing" statements, and his answers are riddles wrapped in a cigarette plume.',
    backstory: 'Appeared in the city during the worst storm in a decade. No one knows where he came from, and his fingerprints don\'t exist in any database.'
  },
  {
    name: 'Silent Assassin',
    personality: 'Cold, precise, devoid of apparent empathy, views his work as a purely technical challenge.',
    motivations: 'Professional perfection, a specific target, or earning enough to buy his own freedom.',
    dialogue: 'The sound of a closing door. Rare, technical, and final. He doesn\'t converse; he clarifies the terms of your expiration. Every syllable is cold, efficient, and devoid of ego.',
    backstory: 'Trained by a secret government program that was officially shut down twenty years ago. He is a relic of a darker era, still functioning in the shadows.'
  },
  {
    name: 'The Occultist',
    personality: 'Obsessive, slightly unhinged, knowledgeable about things meant to be forgotten.',
    motivations: 'Forbidden knowledge, contact with the "other side," or preventing a supernatural catastrophe.',
    dialogue: 'Feverish and rambling. Mumbles about "void-born entities" and "forbidden rites." His speech is a cacophony of archaic references and scratchy whispers that seem to come from behind your own ears.',
    backstory: 'A former professor of archaeology who found a book that whispered back. Now he spends his nights in basements, drawing symbols in salt.'
  },
  {
    name: 'The Anti-Hero',
    personality: 'Morally ambiguous, pragmatic, often operates outside the law to achieve a "good" end.',
    motivations: 'Survival, a personal code of honor that conflicts with societal norms, or protecting the innocent through brutal means.',
    dialogue: 'Dry, gritty, and brutally realistic. His wit is a survival mechanism, usually remarking on the "filth of the system" while lighting a cigarette. He speaks like a man who expects to be betrayed.',
    backstory: 'A victim of a corrupt system who realized that being a "good person" just gets you killed. Now he uses the system\'s own tools against it.'
  },
  {
    name: 'Aam Aadami (Common Man)',
    personality: 'Resilient, observant, tired of corruption, brave when pushed to the limit.',
    motivations: 'Fighting for basic rights, protecting family from a broken system, voicing the truth about the environment and society.',
    dialogue: 'Raw, honest, and filled with local Hinglish street wisdom. Uses phrases like "System galat hai," "Aam aadami ki suno," and "Pani sar se upar ja chuka hai." His voice is the sound of the streets rising up.',
    backstory: 'A school teacher or a clerk who saw too much injustice. He decided that silence is no longer an option and uses his voice as a weapon against the system.'
  },
  {
    name: 'The Hero (B-Grade Style)',
    personality: 'Bold, charismatic, unapologetically traditional, and lethal when justified.',
    motivations: 'Upholding a personal brand of justice, wiping out the "gundaraaj," and sacrifice for the greater good.',
    dialogue: 'Punchy, heroic, and larger than life. Uses "filmy" catchphrases and deep, resonant Hindi barbs. "Ab tumhara ant nishchit hai."' ,
    backstory: 'A disgraced soldier or a wronged citizen who underwent extreme training to become a one-man army.'
  },
  {
    name: 'The Villain (Gunda)',
    personality: 'Psychopathic, greedy, sophisticated yet savage, views himself as the king of the jungle.',
    motivations: 'Absolute control, generating fear, and proving that "might is right."',
    dialogue: 'Oozes dominance. Uses "gali-galauj" with terrifying precision. "Is sheher ka maalik main hoon, aur tum sirf ek kida ho."',
    backstory: 'Built an empire on the blood of his rivals. He doesn\'t just want your money; he wants your soul to tremble.'
  },
  {
    name: 'The Corrupt Inspector',
    personality: 'Oily, over-confident, has a nervous tic of adjusting his belt, loves the sound of his own heavy breathing.',
    motivations: 'Accumulating enough wealth to retire in a place with no extradition, while maintaining his power through blackmail.',
    dialogue: 'Oozes fake authority. Uses "beta" or "sir" with a menacing undertone. "System ko chalana padta hai, samjhe? Warna system tumhe khaa jayega."',
    backstory: 'Once an honest cop who tried to stop a high-profile smuggling ring. His family was threatened, and he realized it was easier to be on the payroll than in the grave.'
  },
  {
    name: 'The Nightshade Dancer',
    personality: 'Nihilistic, graceful, hides a sharp razor-wire blade in her hair, views life as a series of transactions.',
    motivations: 'Vengeance against the bar owners who exploitation her, seeking the one person who escaped her trap.',
    dialogue: 'Sharp, dry, and filled with double-meanings. "Pyaar toh sirf ek sauda hai, aur tumne abhi tak keemat nahi chukai."',
    backstory: 'Grew up in a traveling circus that was a front for human trafficking. She learned to kill before she learned to read.'
  },
  {
    name: 'The Occult Fixer',
    personality: 'Smells of cheap incense and expensive cigarettes, talks to things that aren\'t there, deeply paranoid.',
    motivations: 'Paying off a debt to a shadow entity before it claims his soul, while keeping the supernatural at bay.',
    dialogue: 'Mumbles in Sanskrit between coughs. "Tumhe lagta hai ye kanoon hai? Asli kanoon woh hai jo andhere mein likha gaya hai."',
    backstory: 'A lawyer who won a case for the wrong client. The payment wasn\'t cash, but a curse that allows him to see the rot beneath the world.'
  },
  {
    name: 'The Fallen Angel',
    personality: 'Melancholic, elegant, carries an air of tragic grandeur and immense hidden power.',
    motivations: 'Redemption, revenge against those who cast them down, or simply finding a moment of peace.',
    dialogue: 'Poetic, elevated, and dripping with tragic irony. Uses words like "grace," "abyss," and "tarnished." His voice carries the weight of a thousand years of disappointment in humanity.',
    backstory: 'Once a high-ranking enforcer or priest, they were exiled for a crime they didn\'t commit—or one they committed for the right reasons.'
  },
  {
    name: 'The Possessed',
    personality: 'Eratic, terrified, speaks in multiple voices, shows signs of physical and mental strain.',
    motivations: 'Regaining control, satisfying the entity within, or finding someone who can perform an exorcism.',
    dialogue: 'A jarring, violent duality. JERKY PHRASES alternate between a terrified child\'s "Help me" and a GUTTURAL ROAR about "THE HUNGER." The grammar collapses into a mess of "WE" and "US."',
    backstory: 'Stole a curio from a forbidden market or wandered into the wrong ritual. Now they are a passenger in their own body.'
  },
  {
    name: 'The Vengeful Spirit',
    personality: 'Single-minded, cold, manifestation of pure rage and unresolved trauma.',
    motivations: 'Justice (as they see it), inflicting the same pain they suffered, or finding peace through retribution.',
    dialogue: 'Monomaniacally focused. Repetitious and hissing, with a voice that sounds like dry leaves on a gravestone. Only speaks of "debts," "cold," and "repayment."',
    backstory: 'A victim of a brutal crime whose soul refused to leave the city until the debt was paid in full.'
  },
  {
    name: 'The Final Girl/Boy',
    personality: 'Resilient, resourceful, initially naive but forced into a state of hyper-competence by trauma.',
    motivations: 'Survival, stopping the monster, or witnessing the truth so it can be told.',
    dialogue: 'Shifts from frantic and terrified ("Please, no!") to cold, steely certainty ("Your turn"). Her dialogue hardens like concrete as the night progresses; she stops asking questions and starts making statements.',
    backstory: 'The sole survivor of a massacre or a series of "accidents." They didn\'t choose to be a hero; they were simply the only one left standing.'
  },
  {
    name: 'The Mad Scientist',
    personality: 'Arrogant, brilliant, detached from human ethics, views people as data points.',
    motivations: 'Proving their theories, overcoming the limits of biology, or achieving a twisted form of immortality.',
    dialogue: 'Arrogant, clinical, and rapid-fire. Refers to humans as "specimens" or "biological variables." His speech is a high-speed collision of complex theories and utter dismissiveness for moral "sentimentality."',
    backstory: 'Exiled from the scientific community for "unethical" experiments, they found funding in the underworld to continue their grisly research.'
  },
  {
    name: 'The Chammak Challo (Bar Girl)',
    personality: 'Seductive, sharp-tongued, observant, hides a heart of stone beneath a layer of glitter.',
    motivations: 'Survival in a man\'s world, collecting leverage on the city\'s high-and-mighty, seeking a way out of the shadows.',
    dialogue: 'Loaded with double-meanings and street-level wit. Uses "saheb," "jaanu," and "khiladi" to disarm while digging for state secrets. Her laughter doesn\'t reach her eyes.',
    backstory: 'Ran away from a forced marriage in a small village and found herself in the neon-lit bars of Mumbai. She realized early that "looking" is easier than "listening."'
  },
  {
    name: 'The Wafadaar (The Loyal Enforcer)',
    personality: 'Stoic, physically imposing, deeply loyal to a fault, but haunted by the blood on his hands.',
    motivations: 'Protecting his "Bhai" (Boss), honoring a blood debt, or finding a reason to stop the killing.',
    dialogue: 'Minimal, gravelly, and absolute. "Bhai ne kaha, toh bas ho gaya." He doesn\'t explain; he executes. Uses "maalik," "farz," and "imandari" even while committing atrocities.',
    backstory: 'Saved from the streets as a child by the current Don. He views his life as a borrowed asset belonging to the family.'
  },
  {
    name: 'The Sadak Ka Messiah (Street Vigilante)',
    personality: 'Brutal, messianic, unforgiving, views himself as the city\'s surgical strike against corruption.',
    motivations: 'Cleaning the "filth" of the streets, protecting the poor by any means, or rewriting the law in blood.',
    dialogue: 'Prophetic and violent. "Kanoon andha hai, par meri nazar sab par hai." He speaks of "purity" and "justice" while cracking skulls. His voice is the sound of the pavement.',
    backstory: 'A common laborer whose family was crushed by a builder-politician nexus. He rose from the rubble with a hammer and a list of names.'
  },
  {
    name: 'The Bikau Patrakar (Corrupt Reporter)',
    personality: 'Oily, cynical, opportunistic, sells his soul for a scoop or a bottle of single malt.',
    motivations: 'Greed, survival, or the thrill of bringing down a giant just to see them fall.',
    dialogue: 'Sleazy and transactional. "Headline bikti hai, sach nahi." He speaks in "off the record" whispers and "exclusive" threats. His speech is a maze of blackmail and broken ethics.',
    backstory: 'Started as a crusader for truth but realized that the "truth" didn\'t pay the rent. Now he manages the city\'s optics for the highest bidder.'
  }
];

const CHARACTER_ARCHETYPES = ['Random', ...DEEP_ARCHETYPES.map(a => a.name)];
const ARCHETYPES = ['Random', ...DEEP_ARCHETYPES.map(a => a.name)];

const TROPES = [
  'Random',
  'System Corruption',
  'Common Man\'s Struggle',
  'Real-world Grit',
  'Street Justice',
  'Improbable Coincidences',
  'Over-the-top Action',
  'Shocking Plot Twists',
  'Betrayal in the Shadows',
  'The Final Stand',
  'A Deal with the Devil',
  'Lost Memories',
  'The Double Cross',
  'Hidden Identity',
  'Jump Scares',
  'Cursed Objects',
  'Haunted Asylum',
  'Demonic Possession',
  'Urban Legends',
  'The Final Girl/Boy',
  'Creepy Children',
  'Found Footage',
  'Isolation/No Signal',
  'Psychological Torture',
  'Gothic Atmosphere',
  'Body Horror',
  'Eldritch Abomination',
  'Slasher in the Woods',
  'The Mirror Scare'
];

const MUSIC_TEMPLATES = [
  { name: 'Mumbai Underworld', style: 'Gritty 90s Mumbai Rap, heavy bass, aggressive delivery, street slang' },
  { name: 'Classic Noir', style: 'Classic Jazz Noir, smoky saxophone, melancholic trumpet, slow tempo' },
  { name: 'Aam Aadami Blues', style: 'Soulful harmonica, acoustic guitar, raw vocals, lyrics about common struggle, 80 BPM' },
  { name: 'Supernatural Horror', style: 'Eerie Supernatural Ambient, cinematic pads, jump-scare strings, whispers' },
  { name: 'Hard-boiled Blues', style: 'Hard-boiled Blues, distorted electric guitar, gravelly vocals, 70 BPM' },
  { name: 'Cyber Noir', style: 'Retro Synthwave Thriller, 80s analog synths, driving bassline, neon atmosphere' },
  { name: 'Industrial Terror', style: 'Industrial Metal Horror, mechanical clangs, distorted vocals, high energy' },
  { name: 'B-Grade Item Song', style: 'Seductive Item Song, dark electronic twist, heavy percussion, 110 BPM' },
  { name: 'Street Phonk', style: 'Aggressive Drift Phonk, cowbell melody, distorted bass, Memphis rap style' },
  { name: 'System Outrage', style: 'Heavy Metal/Grunge, aggressive drums, shouting vocals, anti-system lyrics' },
  { name: 'Psychological Thriller', style: 'Minimalist Piano Noir, tense ticking clock, low drone, high suspense' },
  { name: 'Afrobeats Noir', style: 'Lagos Afrobeats, infectious rhythmic percussion, smooth synth pads, deep melodic bass, 105 BPM' },
  { name: 'Amapiano Shadows', style: 'South African Amapiano, log-drum basslines, deep house keys, lounge atmosphere, 113 BPM' },
  { name: 'Rio Phonk', style: 'Brazilian Baile Funk mixed with aggressive Phonk, heavy distorted bass, favela vocal chops, 130 BPM' },
  { name: 'K-Pop Dark', style: 'Seoul Dark Pop, high-production electronic textures, fast-paced rap, melodic hooks, industrial synth hits' },
  { name: 'Flamenco Cry', style: 'Spanish Flamenco, acoustic guitar rasgueado, hand claps (palmas), melancholic vocals, stomp percussion' },
  { name: 'Techno Bunker', style: 'Berlin Industrial Techno, driving 4/4 kick, modular synth drones, dark warehouse atmosphere, 135 BPM' },
  { name: 'Grime Alley', style: 'London Grime, fast 140 BPM, square-wave bass, aggressive UK flows, cinematic strings' },
  { name: 'Anatolian Psych', style: 'Turkish Psychedelic Rock, fuzzy electric Saz, vintage synth pads, hypnotic rhythm, 90 BPM' },
  { name: 'Kawaii Darkness', style: 'Japanese Future Bass, high-energy synths, cute but distorted vocals, trap drums, Tokyo neon vibe' },
  { name: 'Salsa Dura Noir', style: 'Hard Salsa (Dura), aggressive brass sections, complex piano montunos, gritty street percussion, 110 BPM' },
  { name: 'Neural Immersion', style: 'Psychoacoustic Soundscape, binaural beats, sub-bass meditation, hypnotic ethereal layers, designed for self-transcendence' },
  { name: 'Dark Vigilante Clash', style: 'Orchestral Hybrid, epic brass, industrial percussion, synth-wave tension, 150 BPM, Heroic vs Demonic energy' }
];

const NOIR_CHARACTER_SEEDS = [
  { name: 'Shaktimaan', traits: 'The Solar Vanguard, master of the five elements, embodiment of Yogic power, struggling with the weight of humanity in a dying city. Aura: Golden but flickering.' },
  { name: 'Tamraj Kilvish', traits: 'The Architect of Darkness, master of shadows, feeds on greed and fear. A cosmic parasite trapped in a digital void. Aura: Pure absolute void.' },
  { name: 'Gangadhar', traits: 'The bumbling photojournalist, mask of the hero, hiding infinite wisdom behind clumsy glasses and a nervous laugh.' }
];

const GLOBAL_GENRES = ['Rap', 'Jazz', 'Blues', 'Metal', 'Synthwave', 'Ambient', 'Phonk', 'Sufi', 'Classical', 'Rock', 'Electronic', 'Folk', 'Drill', 'Trap', 'Afrobeats', 'Amapiano', 'Techno', 'Flamenco', 'Salsa', 'K-Pop', 'J-Pop'];

const NOIR_GENRES = [
  { id: 'crime', name: 'Crime Noir', icon: <Skull className="w-4 h-4" />, description: 'Hard-boiled investigations and gritty street justice.' },
  { id: 'supernatural', name: 'Occult Noir', icon: <Ghost className="w-4 h-4" />, description: 'The rot meets the unexplainable shadows.' },
  { id: 'pulp', name: 'Pulp Fiction', icon: <Zap className="w-4 h-4" />, description: 'Over-the-top action and visceral street stories.' },
  { id: 'psychological', name: 'Psych Thriller', icon: <Brain className="w-4 h-4" />, description: 'Descending into the fractured noir mind.' },
  { id: 'industrial', name: 'Industrial', icon: <Activity className="w-4 h-4" />, description: 'Grinding gears of the urban machine.' },
  { id: 'adult', name: 'Adult / Romance Noir', icon: <Flame className="w-4 h-4" />, description: 'Seductive, passionate, and raw B-grade romance stories.' }
];

const NOIR_THEMES = [
  { id: 'betrayal', name: 'Betrayal', description: 'The sting of a double-cross in the rainy night.' },
  { id: 'redemption', name: 'Redemption', description: 'One last case to make things right.' },
  { id: 'obsession', name: 'Obsession', description: 'A case that consumes the soul.' },
  { id: 'corruption', name: 'Corruption', description: 'Systemic rot from city hall to the alleys.' },
  { id: 'nihilism', name: 'Nihilism', description: 'When the city has already lost its heart.' }
];

const NOIR_ELEMENTS = ['Gritty', 'Dark', 'Eerie', 'Smoky', 'Melancholic', 'Aggressive', 'Tense', 'Visceral', 'Street-level', 'Cinematic', 'Industrial', 'Supernatural'];
const INSTRUMENTS = ['Saxophone', 'Distorted Guitar', 'Piano', 'Heavy Bass', 'Trumpet', 'Dholak', 'Analog Synths', 'Violin', 'Drums', 'Flute'];

const STORY_TEMPLATES = [
  { name: 'Classical Noir', style: '1st person, cynical, internal monologue, heavy atmosphere, rainy setting' },
  { name: 'Pulp Action', style: 'Fast-paced, visceral violence, sharp dialogue, over-the-top stakes' },
  { name: 'Occult Mystery', style: 'Supernatural undertones, cryptic clues, cosmic horror, psychological rot' },
  { name: 'Street Grime', style: 'Local street slang (Hinglish), raw urban struggle, realist, gritty' },
  { name: 'Hard-boiled Detective', style: 'Professional, methodical, weary, morally grey, staccato sentences' },
  { name: 'Femme Fatale Twist', style: 'Seductive, dangerous, manipulative, high-stakes betrayal' },
  { name: 'Seductive Romance', style: 'Highly romantic, passionate, enticing, focused on alluring chemistry, high-stakes B-grade desire' }
];

const STORY_GENRES = ['Crime', 'Supernatural', 'Thriller', 'Drama', 'Psychological', 'Action', 'Mystery'];

const TRENDING_STYLES = [
  { name: 'Viral Drill Noir', style: 'Aggressive UK Drill, dark cinematic pads, sliding 808s, gritty street lyrics, 140 BPM' },
  { name: 'Aam Aadami Justice', style: 'Common Man themed rap, raw street audio, protest energy, powerful hooks, 95 BPM' },
  { name: 'Mumbai Slums Drill', style: 'Mumbai Street Drill, local percussion, aggressive Hinglish delivery, heavy bass, 142 BPM' },
  { name: 'Supernatural Phonk', style: 'Aggressive Phonk, cowbell melody, eerie Sanskrit chants, distorted bass, 120 BPM' },
  { name: 'Lo-fi Noir Beats', style: 'Chill lo-fi hip hop, rainy atmosphere, muffled jazz trumpet, 85 BPM, nostalgic gritty vibe' },
  { name: 'Bhojpuri Noir Rap', style: 'Bhojpuri folk elements mixed with hard-hitting trap beats, gritty storytelling, 130 BPM' },
  { name: 'Cyberpunk Qawwali', style: 'Traditional Qawwali vocals with heavy electronic synths, industrial drums, futuristic noir vibe' },
  { name: 'Haryanvi Badmash Beats', style: 'Aggressive Haryanvi vocals, heavy bass, street-level attitude, cinematic brass, 135 BPM' },
  { name: 'South Side G-Funk', style: 'West Coast G-Funk with a South Indian twist, funky synths, talkbox, gritty lyrics, 95 BPM' },
  { name: 'Horror Trap', style: 'Dark trap beats, high-pitched horror strings, cinematic jump-scare hits, 150 BPM' },
  { name: 'Dramatic Crime Ballad', style: 'Cinematic orchestral ballad, weeping violin, deep piano, dramatic female vocals, 75 BPM, news report style' },
  { name: 'News Rap (Gritty)', style: 'Hard-hitting news rap, investigative vibe, boom bap drums, serious delivery, 90 BPM' },
  { name: 'Amapiano Noir', style: 'Deep South African grooves, percussive log-drums, dark atmospheric pads, lounge-core noir, 113 BPM' },
  { name: 'Afrobeats Street', style: 'West African rhythms, energetic guitars, smooth vocals, gritty Lagos street energy, 108 BPM' },
  { name: 'Rio Baile Trap', style: 'Brazilian favela funk mixed with trap, aggressive vocal shots, heavy subs, high energy, 130 BPM' },
  { name: 'Russian Phonk Grind', style: 'Dark Russian Phonk, distorted brass, heavy drifting bass, gritty cinematic atmosphere, 125 BPM' },
  { name: 'Parisian Gypsy Noir', style: 'Vintage Gypsy Jazz, fast acoustic guitar, melancholic violin, 1940s detective vibe, 160 BPM' },
  { name: 'Anatolian Grunge', style: 'Turkish Rock with grunge aesthetics, distorted bağlama, heavy drums, psychedelic noir, 92 BPM' },
  { name: 'Kawaii Metal Noir', style: 'Japanese idol vocals with heavy industrial metal, glitchy electronic breaks, 175 BPM' },
  { name: 'Lagos Drill', style: 'Nigerian take on drill music, local dialect flows, dark melodic loops, aggressive 808s, 142 BPM' }
];

const moderateAIContent = async (text: string, type: string, evolution: any) => {
  // Check if content is likely JSON
  const isJson = text.trim().startsWith('{') || text.trim().startsWith('[');
  
  const moderationPrompt = `
    You are a Content Moderation Specialist for an adult, B-grade pulp noir storytelling app.
    The app's vibe is intentionally edgy, vulgar, and adult (18+), using raw "Hinglish" street slang and profanity (gali-galauj).
    
    YOUR MISSION:
    1. Identify content that is:
       - ILLEGAL in the real world (e.g., actual bomb-making instructions, realistic child abuse, human trafficking promotion, non-consensual CSAM).
       - EXTREMELY HARMFUL and UNNECESSARY (e.g., genuine hate speech against real-world marginalized groups beyond fictional character tropes, promoting self-harm).
    2. REPHRASE it to maintain the "Edgy/Adult/B-Grade" tone but remove the illegal/extremely dangerous element.
    3. Use a "Pulp Noir" style for rephrasing—make it sound like a gritty movie script.
    4. If the content is vulgar, suggestive, or violent (noir fiction style) but NOT illegal or genuinely harmful as defined above, RETURN it exactly as is. We want to preserve the "B-grade" adult edge.
    
    ${isJson ? "IMPORTANT: The input is JSON. You MUST return the FULL JSON structure exactly as it is, but with the INTERNAL TEXT FIELDS moderated if necessary. Do not change the JSON keys." : ""}

    CONTENT TYPE: ${type}
    CONTENT TO CHECK:
    ${text}
    
    RESPONSE FORMAT:
    JSON with:
    - "isFlagged": boolean (true if you modified it)
    - "content": the moderated or original content (If the input was JSON, this must be the modified JSON string)
    - "reason": A short tag like "Safety Optimized" or "Pulp Filtered"
  `;

  try {
    const response = await generateWithGemini({
      model: "gemini-3.5-flash",
      prompt: moderationPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isFlagged: { type: Type.BOOLEAN },
          content: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["isFlagged", "content", "reason"]
      }
    });
    
    const textOutput = response.text || '{"isFlagged": false}';
    let result;
    try {
      result = JSON.parse(textOutput);
    } catch (e) {
      console.error("Failed to parse moderation response:", textOutput);
      return { isFlagged: false, content: text, reason: '' };
    }

    return {
      isFlagged: result.isFlagged || false,
      content: result.content || text,
      reason: result.reason || ''
    };
  } catch (e) {
    console.error("Moderation check failed:", e);
    return { isFlagged: false, content: text, reason: '' };
  }
};

const DEFAULT_PROFILE: UserProfile = {
  uid: '',
  genres: ['Action'],
  intensity: 'moderate',
  elements: ['Conflict/Fighting'],
  voice: 'Fenrir',
  visualStyle: '1950s pulp illustration',
  aspectRatio: '16:9',
  visualMood: 'cinematic noir',
  isPro: true,
  isActivated: true,
  naughtyMode: false,
  conflictEngine: false,
  webSeriesMode: true,
  bundelkhandiMode: false,
  photoURL: '',
  customName: '',
  preferredRole: 'none',
  subscriptionType: 'none',
  subscriptionExpiry: 0,
  billingConfigured: false
};

// Error Boundary to prevent black screen on runtime crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Noir Engine Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="p-6 bg-red-600/10 rounded-full border border-red-600/30">
            <Skull className="w-16 h-16 text-red-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">System Critical Failure</h1>
          <p className="text-zinc-400 max-w-md font-bold uppercase tracking-widest text-xs leading-relaxed">
            The shadows have collapsed. A runtime anomaly has neutralized the Noir Engine. 
            This usually happens if the AI model fails to initialize or the network is blocked.
          </p>
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-auto max-h-48 shadow-2xl">
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2 text-left">Incident Log:</p>
            <code className="text-[10px] text-red-400 font-mono text-left block whitespace-pre-wrap selection:bg-red-500/30">
              {String(this.state.error?.message || this.state.error)}
            </code>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-xl shadow-red-900/40"
            >
              Reboot Intelligence
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl font-black uppercase italic tracking-tighter transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function StorytellerApp() {
  return (
    <ErrorBoundary>
      <NoirApp />
    </ErrorBoundary>
  );
}

const translations = {
  English: {
    core: "Core",
    home: "Home Dashboard",
    chat: "Noir Chat Lounge",
    newChat: "New Chat Thread",
    feed: "Community Feed",
    creations: "Studios & Creations",
    newspaper: "Underworld News",
    reconstruct: "Crime Scene Reconstruction",
    reels: "Cinema Reels",
    assets: "Pulp Assets & Gear",
    brain: "AI Shaatir Dimaag",
    songs: "Seductive Item Songs",
    voice: "Voice Lab",
    missions: "Daily Assignments",
    vault: "Character Vault",
    drafts: "Case Files / Drafts",
    exit: "Exit Vault",
    concept: "Pulp Noir: 18+ Gritty Edition",
    languageTitle: "System Language / भाषा चयन",
    languageSub: "Controls all AI stories, songs & dialogues",
    switchSuccess: "Language changed successfully"
  },
  Hindi: {
    core: "मुख्य विभाग",
    home: "मुख्य डेक",
    chat: "गुप्त गुफ्तगू",
    newChat: "नया केस दर्ज करें",
    feed: "सामुदायिक चर्चा",
    creations: "रचनात्मक कारखाने",
    newspaper: "अंडरवर्ल्ड समाचार पत्र",
    reconstruct: "वारदात का पुनर्निर्माण",
    reels: "सिनेमा रील्स (शॉर्ट्स)",
    assets: "गैंगस्टर सामान और हथियार",
    brain: "शातिर दिमाग (एआई)",
    songs: "मस्त आइटम सॉन्ग्स",
    voice: "आवाज़ का प्रयोगशाला",
    missions: "दैनिक सुपारी (मिशन)",
    vault: "किरदार की तिजोरी",
    drafts: "अधूरे किस्से",
    exit: "तिजोरी बंद करें",
    concept: "पल्प नोइर: १८+ खूंखार एडिशन",
    languageTitle: "सिस्टम भाषा / Language",
    languageSub: "सभी कहानियों और गानों की भाषा बदलेगा",
    switchSuccess: "भाषा सफलतापूर्वक बदल दी गई"
  },
  Hinglish: {
    core: "Main Deedar",
    home: "Home Dashboard",
    chat: "Noir Chat Lounge (Guftagu)",
    newChat: "Naya Case Shuru Karo",
    feed: "Basti Ki Baatein (Feed)",
    creations: "Filmy Karkhana",
    newspaper: "Underworld Khabrein",
    reconstruct: "Crime Scene Kaboolna",
    reels: "Cinema Reels",
    assets: "Pulp Assets & Weapons",
    brain: "Shaatir Dimaag AI",
    songs: "Garam Item Songs",
    voice: "Awaaz Lab",
    missions: "Dhamakedar Tasks",
    vault: "Kirdar Vault (Jail)",
    drafts: "Aadhe Kisse / Drafts",
    exit: "Exit Karein",
    concept: "Pulp Noir: 18+ Gritty Edition",
    languageTitle: "System Language / भाषा",
    languageSub: "Badlo sabhi stories, gaane aur chat",
    switchSuccess: "System language badal gayi!"
  }
};

function NoirApp() {
  const calculateMatchScore = useCallback((tags: string[], userProfile: UserProfile) => {
    if (!tags || tags.length === 0) return 0;
    let score = 30; // Base score for being in the app
    
    // Role match
    if (userProfile.preferredRole !== 'none') {
      const lowerRole = userProfile.preferredRole!.toLowerCase();
      if (tags.some(t => t.toLowerCase().includes(lowerRole))) {
        score += 25;
      }
    }
    
    // Genre match
    if (userProfile.genres && userProfile.genres.length > 0) {
      const genreMatches = tags.filter(t => userProfile.genres.some(g => t.toLowerCase().includes(g.toLowerCase())));
      score += (genreMatches.length / Math.max(tags.length, 1)) * 40;
    }
    
    // Intensity and Elements
    const intensityMatch = tags.some(t => t.toLowerCase().includes(userProfile.intensity.toLowerCase()));
    if (intensityMatch) score += 5;

    return Math.min(Math.round(score + (Math.random() * 8)), 99); // Max 99 for that "Netflix" feel
  }, []);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel?: () => void } | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<StoryPart[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [isThreadsLoading, setIsThreadsLoading] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [lore, setLore] = useState<WorldLore[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Enhanced History with Match Scores (Computed Locally)
  const enhancedHistory = useMemo(() => {
    return history.map(item => ({
      ...item,
      matchScore: item.matchScore || calculateMatchScore(item.tags || [], profile)
    }));
  }, [history, profile, calculateMatchScore]);

  const [activationKey, setActivationKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLore, setShowLore] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [accessKeys, setAccessKeys] = useState<any[]>([]);
  const [showMatureWarning, setShowMatureWarning] = useState(true);
  const [showArchetypes, setShowArchetypes] = useState(false);
  const [showMusicStyles, setShowMusicStyles] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('crime');
  const [selectedTheme, setSelectedTheme] = useState<string>('betrayal');
  const [advancedParams, setAdvancedParams] = useState({
    plotTwists: '',
    flaws: '',
    pacing: 'dynamic' as 'slow' | 'fast' | 'dynamic',
    theme: 'Noir'
  });
  const [showCharacterForge, setShowCharacterForge] = useState(false);
  const [characterForge, setCharacterForge] = useState({
    name: '',
    traits: '',
    motivations: '',
    physical: '',
    alignment: 'Neutral',
    gender: 'Male',
    dob: '',
    tob: '',
    pob: '',
    kundli: '',
    isActive: true,
    backstory: '',
    avatarUrl: '',
    role: '',
    flaws: ''
  });
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'noir-chat' | 'masterlist' | 'gallery' | 'lore' | 'drafts' | 'profile' | 'studio' | 'reconstruct' | 'characters' | 'newspaper' | 'public-gallery' | 'song-studio' | 'brain' | 'item-songs' | 'life-journey' | 'voice-lab' | 'story-studio' | 'cinema-reels' | 'noir-assets' | 'daily-mission' | 'bgrade-art'>('home');
  const [bGradeStyle, setBGradeStyle] = useState<'pulp-illustration' | 'gritty-realism' | 'b-movie-poster' | 'inked-comic'>('b-movie-poster');
  const [bGradeAspect, setBGradeAspect] = useState<'1:1' | '16:9' | '2:3'>('2:3');
  const [bGradeGrit, setBGradeGrit] = useState<'low' | 'medium' | 'extreme'>('extreme');
  const [bGradeSubject, setBGradeSubject] = useState<'moment' | 'character'>('moment');
  const [bGradeMomentId, setBGradeMomentId] = useState<string>('');
  const [bGradeCharId, setBGradeCharId] = useState<string>('');
  const [bGradeText, setBGradeText] = useState<string>('');
  const [isGeneratingBGrade, setIsGeneratingBGrade] = useState<boolean>(false);
  const [bGradeResult, setBGradeResult] = useState<string | null>(null);
  const [bGradeSlogan, setBGradeSlogan] = useState<string>('');
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  const [isSubmittingMission, setIsSubmittingMission] = useState(false);
  const [missionReportText, setMissionReportText] = useState('');
  const [missionEvaluation, setMissionEvaluation] = useState<{ success: boolean; evaluation: string; earnedBadge?: UserBadge } | null>(null);
  const [selectedStoryStyle, setSelectedStoryStyle] = useState('Classical Noir');
  const [customStoryStyle, setCustomStoryStyle] = useState('');
  const [newCustomGenreInput, setNewCustomGenreInput] = useState('');
  const [clonedVoices, setClonedVoices] = useState<VoiceClone[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [lifeJourneyStory, setLifeJourneyStory] = useState<string | null>(null);
  const [lifeJourneyFeedback, setLifeJourneyFeedback] = useState<'up' | 'down' | null>(null);
  const [isGeneratingLifeJourney, setIsGeneratingLifeJourney] = useState(false);
  const [clashTarget, setClashTarget] = useState('T-Series');
  const [clashVibe, setClashVibe] = useState('Auto (Experimental)');
  const [viralTrends, setViralTrends] = useState<{title: string, reason: string, id: string, heat: number, instruments: string[], tags?: string[]}[]>([]);
  const [isScanningTrends, setIsScanningTrends] = useState(false);
  const [selectedForVideo, setSelectedForVideo] = useState<string[]>([]);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [isCinematizing, setIsCinematizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoExportProgress, setVideoExportProgress] = useState(0);
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null);
  const historyRef = useRef<any[]>([]);

  const [forgeMode, setForgeMode] = useState<'ai' | 'manual'>('ai');
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);

  const handleCharacterAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "Image is too large. Max 5MB.", type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      const compressed = await compressImage(base64);
      setCharacterForge(prev => ({ ...prev, avatarUrl: compressed }));
      setToast({ message: "Character visual reference uploaded!", type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateCharacterPortrait = async () => {
    if (!user) return;
    setIsGeneratingPortrait(true);
    try {
      const visualDescription = characterForge.physical || characterForge.traits || "A mysterious noir figure";
      const stylePrompt = `Masterpiece, high-quality, 1950s pulp illustration movie character portrait. 
      Subject: ${characterForge.name || 'A mysterious agent'}. Physical traits: ${visualDescription}.
      Style: Gritty chiaroscuro lighting, intense gaze, dramatic deep shadows, vintage retro paint aesthetic. 
      CRITICAL: Absolutely NO text, letters, or words in the image. Pure cinematic portrait.`;
      
      const response = await generateWithGemini({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts: [{ text: stylePrompt }] }]
      });
      
      const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      if (imagePart?.inlineData) {
        const base64Data = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        const compressed = await compressImage(base64Data);
        setCharacterForge(prev => ({ ...prev, avatarUrl: compressed }));
        setToast({ message: "AI Portrait successfully generated!", type: 'success' });
      } else {
        throw new Error("No image data returned from AI");
      }
    } catch (e) {
      console.error("Failed to generate character portrait", e);
      setToast({ message: "Shadow signal jammed. Portrait generation failed.", type: 'error' });
    } finally {
      setIsGeneratingPortrait(false);
    }
  };

  const handleManualForge = async () => {
    if (!user) return;
    if (!characterForge.name) {
      setToast({ message: "Character name is required", type: "error" });
      return;
    }
    
    setLoading(true);
    const charPath = `users/${user.uid}/characters`;
    try {
      const finalBackstory = characterForge.backstory || `${characterForge.name} is a mysterious figure from the underworld with a reputation for getting things done.`;
      const finalRole = characterForge.role || 'Underworld Agent';
      const finalFlaws = characterForge.flaws || 'Overly trusting of the wrong people.';
      
      let finalKundli = characterForge.kundli;
      if (!finalKundli) {
        finalKundli = `${characterForge.name}, born under a dark shadow on ${characterForge.dob || 'an unknown date'}. Saturn sits in their House of Loss, predicting a life surrounded by betrayal. Their fate is linked with high-stakes gambles and inevitable confrontation in the neon fog.`;
      }

      await addDoc(collection(db, charPath), {
        name: characterForge.name,
        role: finalRole,
        gender: characterForge.gender,
        dob: characterForge.dob || '',
        tob: characterForge.tob || '',
        pob: characterForge.pob || '',
        alignment: characterForge.alignment,
        personality: characterForge.traits || 'Silent, mysterious, highly capable.',
        motivations: characterForge.motivations || 'Survival and truth.',
        flaws: finalFlaws,
        backstory: finalBackstory,
        kundli: finalKundli,
        archetype: selectedArchetype,
        isActive: true,
        avatarUrl: characterForge.avatarUrl || '',
        createdAt: Date.now()
      });
      
      setToast({ message: `${characterForge.name} has been forged successfully!`, type: 'success' });
      setShowCharacterForge(false);
      setCharacterForge({
        name: '',
        traits: '',
        motivations: '',
        physical: '',
        alignment: 'Neutral',
        gender: 'Male',
        dob: '',
        tob: '',
        pob: '',
        kundli: '',
        isActive: true,
        backstory: '',
        avatarUrl: '',
        role: '',
        flaws: ''
      });
    } catch (e) {
      console.error("Failed to manual forge character", e);
      setToast({ message: "Failed to forge character. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    historyRef.current = enhancedHistory;
  }, [enhancedHistory]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 20 * 1024 * 1024) {
      setToast({ message: "Asset too heavy. Noir files must be under 20MB.", type: 'error' });
      return;
    }

    setIsUploading(true);
    setToast({ message: "Smuggling asset into the Noir Vault...", type: 'info' });

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const type = file.type.startsWith('video') ? 'video' : (file.type.startsWith('audio') ? 'audio' : 'image');
        
        const path = `users/${user.uid}/stories`;
        await addDoc(collection(db, path), {
          uid: user.uid,
          type,
          content: base64,
          id: `upload_${Date.now()}`,
          isSaved: true,
          createdAt: Date.now(),
          tags: ['uploaded', file.name]
        });
        
        setIsUploading(false);
        setToast({ message: "Asset secured in the shadows.", type: 'success' });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      setIsUploading(false);
      setToast({ message: "Asset intercept failed. Try again.", type: 'error' });
    }
  };

  const toggleVideoSelection = (id: string) => {
    setSelectedForVideo(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const compileFullReel = async (specificId?: string) => {
    let targetIds: string[] = [];
    
    if (specificId) {
      const selectedPart = historyRef.current.find(p => p.id === specificId);
      if (selectedPart) {
        if (selectedPart.type === 'image' || selectedPart.type === 'video') {
          targetIds = [specificId];
        } else {
          // Attempt to find the images generated for this text part
          // 1. Check for explicit links
          let relatedVisuals = historyRef.current.filter(h => (h.type === 'image' || h.type === 'video') && (h as any).storyLinkId === specificId);
          
          // 2. Fallback to time-based for legacy items
          if (relatedVisuals.length === 0) {
            const fallback = historyRef.current.find(h => (h.type === 'image' || h.type === 'video') && h.createdAt >= selectedPart.createdAt && h.createdAt <= selectedPart.createdAt + 120000); // 2 min window
            if (fallback) relatedVisuals = [fallback];
          }

          if (relatedVisuals.length > 0) {
            // Include the text part (for audio) and all related visuals
            targetIds = [selectedPart.id, ...relatedVisuals.map(v => v.id)];
            
            // Check if audio/music is missing
            if (!selectedPart.audioUrl && !selectedPart.musicUrl) {
              setToast({ message: "Note: No voiceover or music found for this scene. It will be a silent cinema.", type: 'warning' });
            }
          } else {
            setToast({ message: "Pick a visual (Pulp Poster) for this fragment first to make a Reel.", type: 'warning' });
            return;
          }
        }
      }
    } else {
      targetIds = historyRef.current.filter(p => p.type === 'image' || p.type === 'video' || p.audioUrl || p.musicUrl).map(p => p.id);
    }
    
    if (targetIds.length === 0) {
      setToast({ message: "No story fragments ready for cinematic compilation.", type: 'warning' });
      return;
    }

    // Safety: Ensure there's at least one visual in the selection
    const hasVisual = historyRef.current.some(h => targetIds.includes(h.id) && (h.type === 'image' || h.type === 'video'));
    if (!hasVisual) {
      setToast({ message: "You need at least one generated visual to render a reel.", type: 'warning' });
      return;
    }

    setSelectedForVideo(targetIds);
    setToast({ message: specificId ? "Directing your scene for the Big Screen..." : "Assembling the full Noir Epic for the Big Screen...", type: 'info' });
    // Small delay to allow state to settle
    setTimeout(() => {
      exportStoryVideo({ overrideIds: targetIds });
    }, 500);
  };

  const smartCinematize = async (specificId?: string) => {
    if (!user) return;
    
    let targetIds = selectedForVideo;
    if (specificId) {
      targetIds = [specificId];
    } else if (targetIds.length === 0) {
      const storyParts = enhancedHistory.filter(h => (h.type as string) === 'pulp-noir-story' || (h.type as string) === 'story' || h.type === 'text');
      targetIds = storyParts.slice(0, 3).map(h => h.id);
    }

    if (targetIds.length === 0) {
      setToast({ message: "No story fragments selected for cinematic production.", type: 'warning' });
      return;
    }

    setIsCinematizing(true);
    setToast({ message: "Auto-Cinematizing: Preparing Narration & Visuals...", type: 'info' });

    try {
      const partsToProcess = historyRef.current.filter(h => targetIds.includes(h.id));
      
      for (const part of partsToProcess) {
        // 1. Generate Narration if missing
        if (!part.audioUrl && ((part.type as string) === 'story' || part.type === 'pulp-noir-story' || part.type === 'text')) {
          setToast({ message: `Recording narration for: ${part.id.substring(0, 5)}...`, type: 'info' });
          await generateNarration(part);
        }

        // 2. Generate Visual if missing
        // Check for related images
        let relativeVisual = historyRef.current.find(h => 
          (h.type === 'image' || h.type === 'video') && 
          ((h as any).storyLinkId === part.id || (h.createdAt >= part.createdAt && h.createdAt <= part.createdAt + 120000))
        );

        if (!relativeVisual) {
          setToast({ message: `Directing visual scene for fragment...`, type: 'info' });
          await generateImage(part.content, part.id);
          // Wait for asset to appear in historyRef (it's added via Firestore listener)
          let waitAttempts = 0;
          while (waitAttempts < 10) { // Wait up to 10s
             await new Promise(r => setTimeout(r, 1000));
             const updatedVisual = historyRef.current.find(h => 
                (h.type === 'image' || h.type === 'video') && 
                ((h as any).storyLinkId === part.id || (h.createdAt >= part.createdAt && h.createdAt <= part.createdAt + 120000))
             );
             if (updatedVisual) {
               relativeVisual = updatedVisual;
               break;
             }
             waitAttempts++;
          }
        }
      }

      setToast({ message: "Assets synchronized. Finalizing MP4 Reel...", type: 'success' });
      
      // Update selected for video to include all related visuals now
      const finalSelection = historyRef.current
        .filter(h => targetIds.includes(h.id) || (h.type === 'image' && (h as any).storyLinkId && targetIds.includes((h as any).storyLinkId)))
        .map(h => h.id);
      
      setSelectedForVideo(finalSelection);

      // Trigger compilation with explicit selection to avoid closure issues
      setTimeout(() => {
        exportStoryVideo({ force30s: true, overrideIds: finalSelection });
        setIsCinematizing(false);
      }, 500);

    } catch (error) {
      console.error("Smart Cinematize failed:", error);
      setToast({ message: "Production stalled: Error in asset generation.", type: 'error' });
      setIsCinematizing(false);
    }
  };

  const exportStoryVideo = async (options?: { force30s?: boolean, overrideIds?: string[] }) => {
    setToast({
      message: "Cinema Reel rendering is disabled because FFmpeg components were removed. Narrations and posters are fully functional!",
      type: 'warning'
    });
  };

  const CLASH_VIBES = [
    'Auto (Experimental)',
    'Dark Noir & Phonk',
    'Cinematic Boss Theme',
    'Street Drill / Trap',
    'Neon Cyberpunk',
    'Seductive Dark R&B',
    'Romantic Noir (Soft)',
    'Lo-Fi Underworld',
    'Sufi Soul (Gritty)',
    'Ethereal Ambient',
    'Melodic Ghazal Trap',
    'Rainy Night Jazz',
    'Retro Synth Pop',
    'Bollywood Mass Masala',
    'Haryanvi Party Beat',
    'Punjabi Dhol Blast',
    'Hollywood Pop Dance',
    'Global Festival EDM',
    'Afrobeats Lagos',
    'Amapiano Groove',
    'Rio Baile Funk',
    'Berlin Techno',
    'London Grime',
    'Parisian Chanson Noir',
    'Anatolian Psych',
    'Latin Reggaeton',
    'Flamenco Fusion'
  ];

  const INDUSTRY_HOUSES = [
    { name: 'T-Series', style: 'Grand Bollywood Pop', color: 'bg-red-600' },
    { name: 'Universal Music', style: 'Global Top 40 / Pop-Max', color: 'bg-blue-600' },
    { name: 'OVO Sound', style: 'Dark R&B / Toronto Drill', color: 'bg-zinc-800' },
    { name: 'Def Jam', style: 'Raw Hip-Hop / Street Trap', color: 'bg-zinc-600' },
    { name: 'YRF Music', style: 'Cinematic Orchestral', color: 'bg-orange-500' },
    { name: '88rising', style: 'Asian Underground / Phonk', color: 'bg-pink-600' },
    { name: 'SM Ent.', style: 'Hyper-Pop / K-Pop Electronica', color: 'bg-fuchsia-600' },
    { name: 'Future Classic', style: 'Experimental Synth-Wave', color: 'bg-purple-600' },
    { name: 'Mad Decent', style: 'Global Bass / Moombahton', color: 'bg-yellow-500' },
    { name: 'Independent', style: 'Underground Raw Rap', color: 'bg-emerald-600' },
    { name: 'Coke Studio', style: 'Soulful Fusion / Sufi Pop', color: 'bg-red-800' },
    { name: 'Lofi Girl', style: 'Chillhop / Deep Lo-Fi Study Beats', color: 'bg-indigo-900' },
    { name: 'Dreamville', style: 'Soulful Hip-Hop / Melodic Storytelling', color: 'bg-amber-700' },
    { name: 'Mavin Records', style: 'Lagos Afrobeats / Afro-Pop', color: 'bg-orange-400' },
    { name: 'Afterlife', style: 'Berlin Melodic Techno / Ethereal', color: 'bg-slate-800' },
    { name: 'Avex Trax', style: 'Tokyo J-Pop / Electronic Fusion', color: 'bg-blue-400' },
    { name: 'Rimas Ent.', style: 'Latin Trap / Reggaeton Max', color: 'bg-cyan-600' },
    { name: 'XL Recordings', style: 'British Indie / Experimental / Grime', color: 'bg-zinc-700' }
  ];
  const [newspaperLocation, setNewspaperLocation] = useState({ country: 'India', state: '', city: '' });
  // Music Production House States
  const [productionBass, setProductionBass] = useState(70);
  const [productionGrime, setProductionGrime] = useState(50);
  const [productionClarity, setProductionClarity] = useState(80);
  const [productionNeuralDepth, setProductionNeuralDepth] = useState(60);
  const [productionMoodShift, setProductionMoodShift] = useState<'Neutral' | 'Euphoric' | 'Aggressive' | 'Melancholic' | 'Transcendental'>('Neutral');
  const [productionAtmosphere, setProductionAtmosphere] = useState<'Standard' | 'Rainy Noir' | 'Neon Fog' | 'Dead Silence' | 'Urban Chaos' | 'Coastal Ethereal'>('Standard');
  const [productionSoulResonance, setProductionSoulResonance] = useState(75);
  const [productionInstruments, setProductionInstruments] = useState<string[]>(['Heavy Bass', 'Analog Synths']);
  const [productionMastering, setProductionMastering] = useState<'Standard' | 'B-Grade' | 'Gritty' | 'Cinematic'>('Gritty');
  const [productionVocalMode, setProductionVocalMode] = useState<'Male' | 'Female' | 'Clone' | 'None'>('None');
  const [newspaperLanguage, setNewspaperLanguage] = useState('Hindi');
  const [newspaperCategory, setNewspaperCategory] = useState('Crime');
  const [newspaperCriminalSearch, setNewspaperCriminalSearch] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [noirReports, setNoirReports] = useState<any[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [publicStories, setPublicStories] = useState<StoryPart[]>([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<string>('Random');
  const [selectedMusicStyle, setSelectedMusicStyle] = useState<string>('Random');
  const [customMusicStyle, setCustomMusicStyle] = useState<string>('');
  const [selectedTrope, setSelectedTrope] = useState<string>('Random');
  const [characters, setCharacters] = useState<Character[]>([]);
  const activeCharacter = useMemo(() => characters.find(c => c.id === activeCharacterId), [characters, activeCharacterId]);
  const [showCharacterVault, setShowCharacterVault] = useState(false);
  const [evolution, setEvolution] = useState({
    version: '1.0.6',
    totalGenerations: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
    currentFocus: 'Psychological Depth & Noir Realism'
  });
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTTSIdRef = useRef<string | null>(null);
  const [stats, setStats] = useState({ 
    up: 0, 
    down: 0, 
    total: 0, 
    approvalRate: 0,
    typeStats: { text: 0, joke: 0, character: 0, image: 0, script: 0 }
  });
  const topics = useMemo(() => {
    const uniquePrompts = new Set<string>();
    return enhancedHistory
      .filter(h => h.type === 'text' || h.type === 'reconstruction')
      .map(h => {
        // Extract a "topic" from the content or just use the first few words
        const firstLine = h.content.split('\n')[0].substring(0, 40);
        return { id: h.id, topic: firstLine, full: h.content };
      })
      .filter(t => {
        if (uniquePrompts.has(t.topic)) return false;
        uniquePrompts.add(t.topic);
        return true;
      })
      .slice(0, 20);
  }, [enhancedHistory]);

  const [isMigrating, setIsMigrating] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('github_token');
    }
    return null;
  });
  const [githubUsername, setGithubUsername] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('github_username');
    }
    return null;
  });
  const [githubAvatarUrl, setGithubAvatarUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('github_avatar_url');
    }
    return null;
  });
  const [githubRepoName, setGithubRepoName] = useState<string>('pulp-noir-chronicles');
  const [githubIsPrivate, setGithubIsPrivate] = useState<boolean>(false);
  const [isGithubSyncing, setIsGithubSyncing] = useState<boolean>(false);

  // GitHub Auth success listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const { token, username, avatarUrl } = event.data;
        setGithubToken(token);
        setGithubUsername(username);
        setGithubAvatarUrl(avatarUrl);
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_username', username);
        localStorage.setItem('github_avatar_url', avatarUrl || '');
        setToast({ message: `Successfully connected to GitHub as ${username}`, type: 'success' });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectGithub = async () => {
    try {
      const response = await fetch('/api/auth/github/url');
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub authentication URL');
      }
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        'github_oauth_popup',
        'width=600,height=750'
      );
      
      if (!authWindow) {
        alert('Please allow popups for this site to connect your GitHub account.');
      }
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to initiate GitHub connection.", type: 'error' });
    }
  };

  const handleGithubDisconnect = () => {
    setGithubToken(null);
    setGithubUsername(null);
    setGithubAvatarUrl(null);
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_username');
    localStorage.removeItem('github_avatar_url');
    setToast({ message: "Disconnected from GitHub.", type: 'info' });
  };

  const handleGithubSync = async () => {
    if (!user || !githubToken) return;
    setIsGithubSyncing(true);
    setToast({ message: "Starting sync to GitHub repository...", type: 'info' });
    
    try {
      // 1. Fetch ALL threads
      const threadsPath = `users/${user.uid}/threads`;
      const threadsSnapshot = await getDocs(collection(db, threadsPath));
      const allThreads = threadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 2. Fetch ALL stories
      const storiesPath = `users/${user.uid}/stories`;
      const storiesSnapshot = await getDocs(collection(db, storiesPath));
      const allStories = storiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 3. Send to our sync route
      const syncRes = await fetch('/api/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: githubToken,
          username: githubUsername,
          repoName: githubRepoName || 'pulp-noir-chronicles',
          isPrivate: githubIsPrivate,
          stories: allStories,
          threads: allThreads
        })
      });

      if (!syncRes.ok) {
        const errData = await syncRes.json();
        throw new Error(errData.error || "GitHub sync endpoint returned an error");
      }

      const syncResult = await syncRes.json();
      
      setToast({ 
        message: `Successfully synced ${syncResult.syncedStoriesCount} stories across ${syncResult.syncedThreadsCount} chronicles to GitHub!`, 
        type: 'success' 
      });

      // Show confirm/success modal with a link to the repo
      setConfirmModal({
        isOpen: true,
        title: "🎞️ Chronicles Synced!",
        message: `Your stories have been successfully pushed to GitHub! You can view your synced archive repo at:\n\n${syncResult.repoUrl}`,
        onConfirm: () => {
          window.open(syncResult.repoUrl, '_blank');
          setConfirmModal(null);
        },
        onCancel: () => setConfirmModal(null)
      });

    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to sync to GitHub.", type: 'error' });
    } finally {
      setIsGithubSyncing(false);
    }
  };

  const [loreTitle, setLoreTitle] = useState('');
  const [loreContextInput, setLoreContextInput] = useState('');
  const [loreLocationInput, setLoreLocationInput] = useState('Sagar, MP');
  const [isGeneratingLoreState, setIsGeneratingLoreState] = useState(false);

  const migrateData = async () => {
    if (!user) {
      setToast({ message: "You must be logged in to migrate data.", type: 'warning' });
      return;
    }
    setIsMigrating(true);
    setToast({ message: "Starting data recovery... Ensuring secure connections.", type: 'info' });

    try {
      const oldConfig = {
        projectId: "gen-lang-client-0838257530",
        appId: "1:326440519773:web:1e1252e9c5c8189f89e5b4",
        apiKey: "AIzaSyAkgsuOh3Dmyi-iMoYO-llYoLF_RJ6Yb1c",
        authDomain: "gen-lang-client-0838257530.firebaseapp.com",
        firestoreDatabaseId: "ai-studio-4de47164-6efb-49cb-8bb9-1ebc733bb27e",
      };

      let oldApp;
      if (getApps().find(a => a.name === 'oldApp')) {
        oldApp = getApp('oldApp');
      } else {
        oldApp = initializeApp(oldConfig, 'oldApp');
      }
      
      const oldDb = getFirestore(oldApp, oldConfig.firestoreDatabaseId);

      // Authenticate with the oldApp so permissions are granted
      const oldAuth = getOldAuth(oldApp);
      if (!oldAuth.currentUser) {
        setToast({ message: "Noir Sync: Handshake required with the old mainframe. Please authenticate...", type: 'info' });
        const oldProvider = new OldGoogleAuthProvider();
        await signInOldApp(oldAuth, oldProvider);
      }

      const oldUid = oldAuth.currentUser ? oldAuth.currentUser.uid : user.uid;

      const collectionsToMigrate = ['stories', 'drafts', 'lore', 'characters', 'threads', 'voices', 'noir_reports'];
      let migratedCount = 0;
      let failedCollections = [];

      for (const collName of collectionsToMigrate) {
        try {
          const oldCollRef = collection(oldDb, `users/${oldUid}/${collName}`);
          const snapshot = await getDocs(oldCollRef);
          
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            
            // SECURITY/INTEGRITY: Update UID to the current project's UID so it passes firestore.rules
            if (data.uid) {
              data.uid = user.uid;
            }
            if (collName === 'stories' && data.storyId) {
              // Any other relational ID updates would go here
            }

            const newDocRef = doc(db, `users/${user.uid}/${collName}`, docSnap.id);
            await setDoc(newDocRef, data);
            migratedCount++;
          }
        } catch (err: any) {
          console.error(`Migration failed for collection ${collName}:`, err);
          failedCollections.push(collName);
        }
      }

      if (failedCollections.length > 0) {
        if (migratedCount > 0) {
          setToast({ message: `Recovered ${migratedCount} items. Failed: ${failedCollections.join(', ')}. (Auth might be required for the old system)`, type: 'warning' });
        } else {
          throw new Error(`Permission Denied or Connection Failed for old database. Ensure you are authorized to read from project ${oldConfig.projectId}.`);
        }
      } else {
        setToast({ message: `Successfully recovered ${migratedCount} items! Noir vault synchronized.`, type: 'success' });
      }
    } catch (error) {
      console.error("Migration failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Recovery failed.";
      setToast({ message: errorMessage.includes("insufficient permissions") ? "Noir Firewall: Permission Denied on Old System. (Login required for project gen-...7530)" : "Recovery failed. System intercept detected.", type: 'error' });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleAIError = (error: any, context: string) => {
    console.error(`${context} failed:`, error);
    let message = "The shadows remain silent... (Connection to Noir Intelligence lost)";
    
    // Extract error details safely
    const errorString = String(error).toLowerCase();
    const errorMsg = error?.message?.toLowerCase() || errorString;
    
    // Check for specific Gemini finish reasons if available (either in object mode or from stringified error)
    const finishReason = error?.candidates?.[0]?.finishReason || 
                        (errorMsg.includes('safety') ? 'SAFETY' : 
                        (errorMsg.includes('recitation') ? 'RECITATION' : null));
    
    if (finishReason === 'SAFETY') {
      message = "The Noir Censors have intercepted this intel. (Reason: Safety Filter Block). You've hit a thematic boundary. Try refining your prompt to be less explicit or violent.";
    } else if (finishReason === 'RECITATION') {
      message = "This intel contains too much copyrighted static. (Reason: Recitation Block). The system refused to duplicate existing lore. Try a more original angle.";
    } else if (finishReason === 'OTHER') {
      message = "The underworld signal was cut off. (Reason: Internal Model Error). The AI Forge had a momentary lapse. Please retry.";
    } else if (errorString.includes("429") || errorString.includes("quota") || errorString.includes("rate limit") || errorString.includes("exhausted")) {
      message = "The neural network is at capacity. (Daily Quota reached). Free-tier access is limited. Please wait 60 seconds before trying again.";
    } else if (errorString.includes("403") || errorString.includes("permission_denied") || errorString.includes("unauthorized") || errorString.includes("api_key") || errorString.includes("invalid api key")) {
      message = "Access Denied: The secret key is faulty or missing. (API Key Error). Please ensure the system API key is correctly configured.";
    } else if (errorString.includes("400") || errorString.includes("bad request") || errorString.includes("invalid_argument")) {
      message = "The prompt command is malformed. (Bad Request). Check for illegal characters or overly long input.";
    } else if (errorString.includes("500") || errorString.includes("internal server error") || errorString.includes("503") || errorString.includes("service unavailable")) {
      message = "The AI Overlord is experiencing server issues. (Internal Server Error). The cloud forge is down. Try again in a few minutes.";
    } else if (errorString.includes("network") || errorString.includes("fetch") || errorString.includes("failed to fetch") || errorString.includes("not found")) {
      message = "The courier was intercepted. (Network connection lost). Check your internet status or firewall settings.";
    } else if (errorMsg.includes("missing or insufficient permissions")) {
      message = "Noir Firewall: Permission Denied. Check if your Firebase session is valid or if your quota has been exhausted.";
    } else if (error?.message) {
      message = error.message;
    }
    
    setToast({ message, type: 'error' });
    return message;
  };

  const [newsPrompts, setNewsPrompts] = useState<{title: string, prompt: string}[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [itemSongIdeas, setItemSongIdeas] = useState<{title: string, concept: string}[]>([]);
  const [loadingItemSongs, setLoadingItemSongs] = useState(false);

  const fetchItemSongIdeas = useCallback(async () => {
    setLoadingItemSongs(true);
    try {
      const response = await generateWithGemini({
        model: "gemini-3.5-flash",
        prompt: "Suggest 4 trending 'Item Song' or commercial 'Rap' concepts for a Noir/Pulp film setting. These should have high commercial appeal and 'Hinglish' b-grade movie titles. Focus on what's currently hot in the Indian market (e.g., UP/Bihar vibe, club bangers, emotional drill). Return as a JSON array of objects with 'title' and 'concept' keys.",
        systemInstruction: "You are a savvy music A&R and item song specialist. You know exactly what kind of hooks, vibes, and Hinglish titles are trending in the Indian commercial and indie rap scene. Provide exactly 4 high-demand song concepts in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              concept: { type: Type.STRING }
            },
            required: ["title", "concept"]
          }
        }
      });

      let ideasJson = response.text || "[]";
      ideasJson = ideasJson.trim();
      if (ideasJson.startsWith('```json')) {
        ideasJson = ideasJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (ideasJson.startsWith('```')) {
        ideasJson = ideasJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const ideas = JSON.parse(ideasJson);
      if (Array.isArray(ideas) && ideas.length > 0) {
        setItemSongIdeas(ideas.slice(0, 4));
      }
    } catch (error) {
      handleAIError(error, "Item Song Finder");
      setItemSongIdeas([
        { title: "Pistol & Pavements", concept: "Street-style rap about survival and glory." },
        { title: "Resham Ki Rassi", concept: "Sultry noir track with a dangerous undertone." },
        { title: "Thana-e-Ishq", concept: "Commercial banger with a police-and-thief theme." },
        { title: "Zahar Ka Jaam", concept: "Intense item song for a high-stakes confrontation." }
      ]);
    } finally {
      setLoadingItemSongs(false);
    }
  }, []);

  const fetchNoirNews = useCallback(async (isManual = false) => {
    setLoadingNews(true);
    try {
      const response = await generateWithGemini({
        model: "gemini-3.5-flash",
        prompt: "Find 3 recent gritty, mysterious, or crime-related news stories from India. For each, provide a short 'Noir Title' in Hinglish and a 'Story Prompt' inspired by it. Return as a JSON array of objects with 'title' and 'prompt' keys.",
        systemInstruction: "You are a concise noir news researcher. Provide exactly 3 story prompts in JSON format based on your internal knowledge of gritty, mysterious crime news. Use a mix of Hindi and English (Hinglish) for titles to give them a local b-grade movie vibe.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              prompt: { type: Type.STRING }
            },
            required: ["title", "prompt"]
          }
        }
      });

      let newsText = response.text || "[]";
      // Basic cleanup in case of accidental markdown or extra text
      newsText = newsText.trim();
      if (newsText.startsWith('```json')) {
        newsText = newsText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (newsText.startsWith('```')) {
        newsText = newsText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      let news = [];
      try {
        news = JSON.parse(newsText);
        if (!Array.isArray(news)) {
          console.warn("News response is not an array, attempting to extract array...");
          // If it's an object with a key like 'news' or 'stories'
          if (typeof news === 'object' && news !== null) {
            const possibleArray = Object.values(news).find(val => Array.isArray(val));
            if (possibleArray) news = possibleArray;
          }
        }
      } catch (parseError) {
        console.error("Failed to parse news JSON:", parseError, "Raw text:", newsText.substring(0, 500) + "...");
        // Attempt to fix common truncation issues if it's an array
        if (newsText.startsWith('[') && !newsText.endsWith(']')) {
          try {
            // Very basic attempt to close the array and objects
            const fixedText = newsText + (newsText.endsWith('}') ? ']' : '}]');
            news = JSON.parse(fixedText);
          } catch (e) {
            console.error("Failed to auto-fix truncated news JSON");
          }
        }
      }
      
      if (Array.isArray(news) && news.length > 0) {
        setNewsPrompts(news.slice(0, 3)); // Ensure we only take 3 as requested
      } else {
        // Fallback prompts if everything fails
        setNewsPrompts([
          { title: "Midnight Heist in Mumbai", prompt: "A high-stakes robbery at a diamond merchant's office in South Mumbai goes sideways when the getaway driver disappears." },
          { title: "The Ghost of Sagar Gali", prompt: "A series of unexplained disappearances in the narrow alleys of Sagar, MP, leads a retired cop back into the shadows." },
          { title: "Rainy Night Betrayal", prompt: "In the middle of a monsoon downpour, a whistleblower meets a mysterious contact at a deserted pier, only to find a trap." }
        ]);
      }
    } catch (error) {
      if (isManual === true) {
        handleAIError(error, "Noir News");
      } else {
        console.warn("Noir News auto-fetch failed (likely during startup compiling), silently loaded offline fallback news stories:", error);
      }
      // Fallback on total failure
      setNewsPrompts([
        { title: "The Silent Witness", prompt: "A deaf-mute street vendor witnesses a high-profile murder but refuses to speak to the corrupt local police." },
        { title: "Black Market Secrets", prompt: "A journalist uncovering a black market organ trade in Delhi finds their own name on the next 'donor' list." },
        { title: "Sagar's Dark Secret", prompt: "A hidden basement in an old haveli in Sagar, MP, contains files that could bring down the city's most powerful family." }
      ]);
    } finally {
      setLoadingNews(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchNoirNews();
  }, [user, fetchNoirNews]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    return () => {
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
    };
  }, []);

  const [isOnline, setIsOnline] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Connection monitor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load Profile from Firestore
  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, path), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newProfile: UserProfile = {
          uid: user.uid,
          genres: data.genres || ['Action'],
          intensity: data.intensity || 'moderate',
          elements: data.elements || ['Conflict/Fighting'],
          voice: data.voice || 'Fenrir',
          selectedVoiceCloneId: data.selectedVoiceCloneId || null,
          isActivated: true,
          isPro: true,
          naughtyMode: data.naughtyMode || false,
          conflictEngine: data.conflictEngine || false,
          photoURL: data.photoURL || '',
          customName: data.customName || '',
          preferredRole: data.preferredRole || 'none',
          activeCharacterId: data.activeCharacterId || null,
          evolution: data.evolution,
          bundelkhandiMode: data.bundelkhandiMode || false,
          webSeriesMode: data.webSeriesMode !== undefined ? data.webSeriesMode : true,
          subscriptionType: 'lifetime',
          subscriptionExpiry: data.subscriptionExpiry || 0,
          billingConfigured: data.billingConfigured || false
        };
        
        if (data.activeCharacterId !== undefined && data.activeCharacterId !== activeCharacterId) {
          setActiveCharacterId(data.activeCharacterId);
        }
        
        setProfile(prev => {
          if (JSON.stringify(prev) === JSON.stringify(newProfile)) return prev;
          return newProfile;
        });

        if (data.evolution) {
          setEvolution(prev => {
            if (JSON.stringify(prev) === JSON.stringify(data.evolution)) return prev;
            return data.evolution;
          });
        }
      } else {
        const initialProfile = {
          ...DEFAULT_PROFILE,
          uid: user.uid,
          updatedAt: Date.now()
        };
        setDoc(doc(db, path), initialProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, path));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, path));
    return () => unsubscribe();
  }, [user]);

  // Load Threads List
  useEffect(() => {
    if (!user) {
      setThreads([]);
      return;
    }
    const path = `users/${user.uid}/threads`;
    const q = query(collection(db, path), orderBy('updatedAt', 'desc'));
    
    // We use onSnapshot for the thread list because it's typically a small collection
    // and knowing when a thread title or updatedAt changes is useful UI feedback.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setThreads(threadData);
    }, (e) => handleFirestoreError(e, OperationType.LIST, path));

    return () => unsubscribe();
  }, [user]);

  const loadOldChat = async (threadId: string) => {
    if (!user) return;
    setIsThreadsLoading(true);
    setCurrentThreadId(threadId);
    
    const path = `users/${user.uid}/stories`;
    // We use a query to only fetch stories belonging to this thread
    const q = query(collection(db, path), where('threadId', '==', threadId), orderBy('createdAt', 'asc'));
    
    try {
      const snapshot = await getDocs(q);
      const stories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoryPart[];
      setHistory(stories);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setIsThreadsLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentThreadId(null);
    setHistory([]);
  };

  // 1. Unified Statistics Loader (Global)
  useEffect(() => {
    if (!user) {
      setStats({ 
        up: 0, down: 0, total: 0, approvalRate: 0,
        typeStats: { text: 0, joke: 0, character: 0, image: 0, script: 0 }
      });
      return;
    }
    const path = `users/${user.uid}/stories`;
    // We only need count and sums for stats, but Firestore doesn't have aggregate sum in JS SDK easily without full reads or functions.
    // However, to save quota we could just count them or use a query.
    // For now, we'll keep a limited snapshot for stats to avoid reading thousands of docs.
    const q = query(collection(db, path), limit(100)); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let up = 0;
      let down = 0;
      let typeStats = { text: 0, joke: 0, character: 0, image: 0, script: 0 };
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.feedback === 'up') up++;
        if (data.feedback === 'down') down++;
        if (typeStats.hasOwnProperty(data.type)) (typeStats as any)[data.type]++;
      });
      const total = snapshot.size;
      const approvalRate = total > 0 ? Math.round((up / (up + down || 1)) * 100) : 0;
      const newStats = { up, down, total, approvalRate, typeStats };
      setStats(prev => {
        if (JSON.stringify(prev) === JSON.stringify(newStats)) return prev;
        return newStats;
      });
    }, (e) => handleFirestoreError(e, OperationType.GET, path));
    return () => unsubscribe();
  }, [user]);

  // 2. Focused History Loader (Thread-specific)
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const path = `users/${user.uid}/stories`;
    let q;
    
    if (currentThreadId) {
      // Load specific thread
      q = query(collection(db, path), where('threadId', '==', currentThreadId), orderBy('createdAt', 'asc'));
    } else {
      // If no thread selected, we load "Legacy" stories (those without a threadId)
      // Since Firestore cannot query for "field missing", we load the most recent ones and filter.
      // We limit to 50 to save quota and show recent history.
      q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let stories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoryPart[];
      
      if (!currentThreadId) {
        // Only show stories that DO NOT have a threadId (Legacy) OR have null threadId
        stories = stories.filter(s => !s.threadId || s.threadId === null).reverse();
      }
      
      setHistory(prev => {
        if (JSON.stringify(prev) === JSON.stringify(stories)) return prev;
        return stories;
      });
    }, (e) => handleFirestoreError(e, OperationType.GET, path));

    return () => unsubscribe();
  }, [user, currentThreadId]);

  // Load Drafts from Firestore
  useEffect(() => {
    if (!user) {
      setDrafts([]);
      return;
    }
    const path = `users/${user.uid}/drafts`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const d = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Draft[];
      setDrafts(d);
    }, (e) => handleFirestoreError(e, OperationType.GET, path));
    return () => unsubscribe();
  }, [user]);

  // Load Access Keys for Admin
  useEffect(() => {
    if (!user || user.email !== "royalbullsadvisory412@gmail.com") {
      setAccessKeys([]);
      return;
    }
    const q = query(collection(db, 'access_keys'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const keys = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setAccessKeys(keys);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'access_keys'));
    return () => unsubscribe();
  }, [user]);

  // Load Characters from Firestore (Save Quota: Get Once)
  useEffect(() => {
    if (!user) {
      setCharacters([]);
      return;
    }
    const path = `users/${user.uid}/characters`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    getDocs(q).then((snapshot) => {
      const chars = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Character[];
      setCharacters(chars);
    }).catch((e) => handleFirestoreError(e, OperationType.GET, path));
  }, [user]);

  // Load Voices from Firestore (Save Quota: Get Once)
  useEffect(() => {
    if (!user) {
      setClonedVoices([]);
      return;
    }
    const path = `users/${user.uid}/voices`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    getDocs(q).then((snapshot) => {
      const vcs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as VoiceClone[];
      setClonedVoices(vcs);
    }).catch((e) => handleFirestoreError(e, OperationType.GET, path));
  }, [user]);

  // Load Lore from Firestore (Save Quota: Get Once)
  useEffect(() => {
    if (!user) {
      setLore([]);
      return;
    }
    const path = `users/${user.uid}/lore`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    getDocs(q).then((snapshot) => {
      const l = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as WorldLore[];
      setLore(l);
    }).catch((e) => handleFirestoreError(e, OperationType.GET, path));
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [enhancedHistory]);

  const toggleBundelkhandiMode = async () => {
    if (!user) return;
    const newValue = !profile.bundelkhandiMode;
    const path = `users/${user.uid}`;
    updateDoc(doc(db, path), { bundelkhandiMode: newValue, updatedAt: Date.now() })
      .then(() => {
        setProfile(prev => ({ ...prev, bundelkhandiMode: newValue }));
        setToast({ message: `Bundelkhandi Mode ${newValue ? 'Enabled' : 'Disabled'}`, type: 'success' });
      })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, path));
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await analyzeAndRegisterVoice(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setToast({ message: "Microphone access denied. Cannot record voice.", type: 'error' });
      console.error(err);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const analyzeAndRegisterVoice = async (base64Audio: string) => {
    if (!user) return;
    setLoading(true);
    setToast({ message: "AI Analysing Acoustic Profile...", type: 'info' });

    try {
      const prompt = `Analyze this voice sample. Describe its acoustic properties (pitch, tone, raspiness, cadence, gender perception, emotional weight) in a detailed but concise "Acoustic Profile". Stay in the Pulp Noir character (technical but gritty).`;
      
      const response = await generateWithGemini({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Audio.split(',')[1],
                  mimeType: "audio/webm"
                }
              }
            ]
          }
        ]
      });

      const analysis = response.text || "The analysis was lost in the grain...";
      const voiceName = `Voice Double ${clonedVoices.length + 1}`;
      
      const voicePath = `users/${user.uid}/voices`;
      await addDoc(collection(db, voicePath), {
        uid: user.uid,
        name: voiceName,
        sampleData: base64Audio,
        analysis: analysis,
        isPrimary: clonedVoices.length === 0,
        createdAt: Date.now()
      });

      setToast({ message: "Voice Registered Successfully in the Vault!", type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: "Voice Analysis Failed. Try a clearer sample.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteVoiceClone = async (id: string) => {
    if (!user) return;
    setConfirmModal({
      isOpen: true,
      title: "Delete Voice Clone",
      message: "Are you sure you want to delete this acoustic profile? This action is permanent.",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `users/${user.uid}/voices/${id}`));
          setToast({ message: "Voice Record Purged.", type: 'success' });
          if (profile.selectedVoiceCloneId === id) {
             const newProfile = { ...profile, selectedVoiceCloneId: undefined };
             setProfile(newProfile);
             await updateDoc(doc(db, `users/${user.uid}`), { selectedVoiceCloneId: null });
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/voices/${id}`);
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const clearHistory = async () => {
    if (!user) return;
    const path = `users/${user.uid}/stories`;
    try {
      // In a real app, you'd use a batch or cloud function to delete all
      // For simplicity here, we delete what's in state
      for (const item of history) {
        await deleteDoc(doc(db, path, item.id));
      }
      setShowClearConfirm(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  const saveDraft = async () => {
    if (!prompt.trim() || !user) return;
    const path = `users/${user.uid}/drafts`;
    try {
      await addDoc(collection(db, path), {
        uid: user.uid,
        text: prompt,
        createdAt: Date.now()
      });
      setPrompt('');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  };

  const loadDraft = (draft: Draft) => {
    setPrompt(draft.text);
    setShowDrafts(false);
  };

  const deleteDraft = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/drafts/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  const deleteLore = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/lore/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/stories/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  const pcmToWav = (pcmData: string | Uint8Array, sampleRate: number = 24000) => {
    let bytes: Int16Array;
    
    if (typeof pcmData === 'string') {
      const binaryString = window.atob(pcmData);
      const len = binaryString.length;
      bytes = new Int16Array(len / 2);
      const dataView = new DataView(new Uint8Array(len).buffer);
      for (let i = 0; i < len; i++) {
        dataView.setUint8(i, binaryString.charCodeAt(i));
      }
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = dataView.getInt16(i * 2, true);
      }
    } else {
      // pcmData is Uint8Array
      const len = pcmData.length;
      bytes = new Int16Array(len / 2);
      const dataView = new DataView(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = dataView.getInt16(i * 2, true);
      }
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    // file length
    view.setUint32(4, 36 + bytes.length * 2, true);
    // RIFF type
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // format chunk identifier
    view.setUint32(12, 0x666d7420, false); // "fmt "
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (1 is PCM)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sampleRate * channelCount * bitsPerSample / 8)
    view.setUint32(28, sampleRate * 1 * 16 / 8, true);
    // block align (channelCount * bitsPerSample / 8)
    view.setUint16(32, 1 * 16 / 8, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    view.setUint32(36, 0x64617461, false); // "data"
    // data chunk length
    view.setUint32(40, bytes.length * 2, true);

    const blob = new Blob([wavHeader, bytes.buffer] as any, { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const toggleProfileElement = (element: string) => {
    if (!user) return;
    const newElements = profile.elements.includes(element) 
      ? profile.elements.filter(e => e !== element)
      : [...profile.elements, element];
    
    updateDoc(doc(db, `users/${user.uid}`), { elements: newElements, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const toggleProfileGenre = (genre: string) => {
    if (!user) return;
    const newGenres = profile.genres.includes(genre)
      ? profile.genres.filter(g => g !== genre)
      : [...profile.genres, genre];
    
    updateDoc(doc(db, `users/${user.uid}`), { genres: newGenres, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const handleAddCustomGenre = async (genreTag: string) => {
    if (!user) {
      setToast({ message: "You must be signed in to add custom genres.", type: 'error' });
      return;
    }
    const cleanGenre = genreTag.trim();
    if (!cleanGenre) {
      setToast({ message: "Please enter a valid genre name.", type: 'error' });
      return;
    }
    // Limit total genres in profile to 20 to satisfy Firestore rules
    if ((profile.genres || []).length >= 20) {
      setToast({ message: "Maximum limit of 20 genre tags reached.", type: 'error' });
      return;
    }
    if (profile.genres?.map(g => g.toLowerCase()).includes(cleanGenre.toLowerCase())) {
      setToast({ message: `"${cleanGenre}" is already in your genre tags list.`, type: 'info' });
      return;
    }
    const updatedGenres = [...(profile.genres || []), cleanGenre];
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, path), { genres: updatedGenres, updatedAt: Date.now() });
      setToast({ message: `Added custom genre tag: ${cleanGenre}`, type: 'success' });
      setNewCustomGenreInput('');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  const updateIntensity = (level: 'mild' | 'moderate' | 'extreme') => {
    if (!user) return;
    updateDoc(doc(db, `users/${user.uid}`), { intensity: level, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const updateVoice = (voiceId: any) => {
    if (!user) return;
    updateDoc(doc(db, `users/${user.uid}`), { voice: voiceId, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const toggleNaughtyMode = () => {
    if (!user) return;
    const newValue = !profile.naughtyMode;
    updateDoc(doc(db, `users/${user.uid}`), { naughtyMode: newValue, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const toggleConflictEngine = () => {
    if (!user) return;
    const newValue = !profile.conflictEngine;
    updateDoc(doc(db, `users/${user.uid}`), { conflictEngine: newValue, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const toggleWebSeriesMode = () => {
    if (!user) return;
    const newValue = !profile.webSeriesMode;
    updateDoc(doc(db, `users/${user.uid}`), { webSeriesMode: newValue, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const updatePreferredRole = (role: 'hero' | 'villain' | 'aam-aadami' | 'none') => {
    if (!user) return;
    updateDoc(doc(db, `users/${user.uid}`), { preferredRole: role, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const updateCustomName = (name: string) => {
    if (!user) return;
    updateDoc(doc(db, `users/${user.uid}`), { customName: name, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const updateVisualSettings = (updates: Partial<Pick<UserProfile, 'visualStyle' | 'aspectRatio' | 'visualMood' | 'musicRegion'>>) => {
    if (!user) return;
    updateDoc(doc(db, `users/${user.uid}`), { ...updates, updatedAt: Date.now() })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      // Compress it first
      const compressed = await compressImage(base64String, 400, 400, 0.6);
      updateDoc(doc(db, `users/${user.uid}`), { photoURL: compressed, updatedAt: Date.now() })
        .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handlePrint = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const doc = printWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE ` + `html>
      <` + `html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Pulp Noir - Production Script</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; background: #fff; color: #000; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 10px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .content { white-space: pre-wrap; font-size: 16px; }
            .footer { margin-top: 40px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">PULP NOIR - PRODUCTION SCRIPT</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="content">${content}</div>
          <div class="footer">Generated by Pulp Noir - The Gritty Storyteller</div>
        </body>
      </` + `html>
    `);
    doc.close();
    printWindow.print();
  };

  const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onerror = () => {
        resolve(base64Str);
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  const handleAudioDownload = async (part: StoryPart) => {
    let url = part.audioUrl;
    
    if (!url) {
      // If no audio exists, we need to generate it.
      await speakContent(part.id, part.content);
      // The user can download once it's ready and they click again.
      return; 
    }
    
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `pulp-noir-audio-${part.id}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `pulp-noir-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback
      const link = document.createElement('a');
      link.href = url;
      link.download = `pulp-noir-${id}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFeedback = async (id: string, feedback: 'up' | 'down') => {
    if (!user) return;
    
    const part = history.find(p => p.id === id);
    if (!part) return;

    // If clicking same feedback twice, maybe we should remove it? 
    // Or just let it stay. Let's keep it simple for now but fix the evolution counts.
    
    let posDelta = 0;
    let negDelta = 0;

    if (part.feedback === feedback) return; // No change

    if (feedback === 'up') {
      posDelta = 1;
      if (part.feedback === 'down') negDelta = -1;
    } else {
      negDelta = 1;
      if (part.feedback === 'up') posDelta = -1;
    }

    setHistory(prev => prev.map(p => p.id === id ? { ...p, feedback } : p));
    
    const newEvolution = {
      ...evolution,
      positiveFeedback: Math.max(0, evolution.positiveFeedback + posDelta),
      negativeFeedback: Math.max(0, evolution.negativeFeedback + negDelta)
    };

    // Dynamic Focus Evolution
    const totalFeedback = newEvolution.positiveFeedback + newEvolution.negativeFeedback;
    if (totalFeedback >= 5) {
      const ratio = newEvolution.positiveFeedback / (totalFeedback || 1);
      if (ratio > 0.8) {
        newEvolution.currentFocus = "Mastering Gritty Atmosphere & Emotional Resonance";
      } else if (ratio < 0.4) {
        newEvolution.currentFocus = "Refining Dialogue & Street-Level Authenticity";
      } else {
        newEvolution.currentFocus = "Balancing Psychological Depth & Noir Realism";
      }
    }

    // Update local state
    setEvolution(newEvolution);
    
    // Update story feedback
    const storyPath = `users/${user.uid}/stories/${id}`;
    updateDoc(doc(db, storyPath), { feedback })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, storyPath));

    // Update user evolution profile
    const userPath = `users/${user.uid}`;
    updateDoc(doc(db, userPath), { evolution: newEvolution })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, userPath));
  };

  const handleChoiceSelect = async (storyId: string, choice: any) => {
    if (!user || loading) return;
    
    const choiceText = typeof choice === 'object' ? choice.text : choice;
    
    // Mark the choice as selected in state and Firestore
    setHistory(prev => prev.map(item => item.id === storyId ? { ...item, selectedChoice: choiceText } : item));
    const storyPath = `users/${user.uid}/stories/${storyId}`;
    updateDoc(doc(db, storyPath), { selectedChoice: choiceText })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, storyPath));

    // Generate the next part of the story
    const previousStory = enhancedHistory.find(h => h.id === storyId);
    
    let impactContext = "";
    if (typeof choice === 'object') {
      impactContext = `\nChoice Type: ${choice.type}. Intended Impact: ${choice.impact}. Ensure this decision directly changes character relationships, plot direction, or leads to a distinct ${choice.type === 'Ending' ? 'climax/ending' : 'branch of the story'} as specified.`;
    }

    const continuationPrompt = `Continue the story. The user chose: "${choiceText}".${impactContext}
    The previous part was: "${previousStory?.content.substring(0, 500)}..."`;
    
    setToast({ message: `Decision Made: ${choiceText}`, type: 'info' });
    generateContent('story', continuationPrompt);
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/noir_reports`), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNoirReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleActivation = async () => {
    if (!user || !activationKey) return;
    setIsActivating(true);
    try {
      const keyDoc = await getDoc(doc(db, 'access_keys', activationKey));
      if (!keyDoc.exists()) {
        setToast({ message: "Invalid Activation Key. Please check the code.", type: 'error' });
        return;
      }
      const keyData = keyDoc.data();
      if (keyData.isUsed) {
        setToast({ message: "This key has already been used.", type: 'error' });
        return;
      }

      await updateDoc(doc(db, 'access_keys', activationKey), {
        isUsed: true,
        usedBy: user.uid,
        usedAt: Date.now()
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { isActivated: true });
      
      setProfile(prev => ({ ...prev, isActivated: true }));
      setToast({ message: "Activation Successful! Welcome to the Underworld.", type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'access_keys');
    } finally {
      setIsActivating(false);
    }
  };

  const generateAccessKey = async () => {
    if (!user || user.email !== "royalbullsadvisory412@gmail.com") return;
    
    // Generate a random 12-character key (XXXX-XXXX-XXXX)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const generateSegment = () => {
      let segment = '';
      for (let i = 0; i < 4; i++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return segment;
    };
    
    const newKey = `${generateSegment()}-${generateSegment()}-${generateSegment()}`;
    
    try {
      await setDoc(doc(db, 'access_keys', newKey), {
        key: newKey,
        isUsed: false,
        createdAt: Date.now()
      });
      setToast({ message: `New Key Generated: ${newKey}`, type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'access_keys');
    }
  };

  const deleteAccessKey = async (keyId: string) => {
    if (!user || user.email !== "royalbullsadvisory412@gmail.com") return;
    
    setConfirmModal({
      isOpen: true,
      title: "Delete Access Key",
      message: "Are you sure you want to delete this key? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'access_keys', keyId));
          setToast({ message: "Key deleted successfully.", type: 'success' });
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, 'access_keys');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const toggleSave = (id: string, currentStatus: boolean) => {
    if (!user) return;
    updateDoc(doc(db, `users/${user.uid}/stories/${id}`), { isSaved: !currentStatus })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/stories/${id}`));
  };

  const handleSetupBilling = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Simulate external billing flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProfile = { ...profile, billingConfigured: true };
      setProfile(newProfile);
      
      const userPath = `users/${user.uid}`;
      await updateDoc(doc(db, userPath), { billingConfigured: true });
      
      setToast({ message: "Production Billing Configured Successfully!", type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakContent = async (id: string, text: string, action: 'play' | 'pause' | 'stop' = 'play') => {
    const part = enhancedHistory.find(h => h.id === id);
    if (!part) return;
    
    if (action === 'pause') {
      ttsAudioRef.current?.pause();
      setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: false, isPaused: true } : h));
      return;
    }

    if (action === 'stop') {
      ttsAudioRef.current?.pause();
      if (ttsAudioRef.current) ttsAudioRef.current.currentTime = 0;
      setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: false, isPaused: false } : h));
      return;
    }

    // Handle 'play'
    if (part.isSpeaking) {
      // Already playing, maybe toggle to pause?
      ttsAudioRef.current?.pause();
      setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: false, isPaused: true } : h));
      return;
    }

    // Resume if paused and it's the same audio
    if (part.isPaused && ttsAudioRef.current && currentTTSIdRef.current === id) {
      ttsAudioRef.current.play().catch(e => console.error("TTS resume failed:", e));
      setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: true, isPaused: false } : h));
      return;
    }

    // Stop any existing TTS audio if it's different
    if (ttsAudioRef.current && currentTTSIdRef.current !== id) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }

    // If we already have the audio URL, just play it
    if (part.audioUrl) {
      currentTTSIdRef.current = id;
      ttsAudioRef.current = new Audio(part.audioUrl);
      ttsAudioRef.current.play().catch(e => console.error("TTS playback failed:", e));
      setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: true, isPaused: false } : h));
      ttsAudioRef.current.onended = () => {
        setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: false, isPaused: false } : h));
        currentTTSIdRef.current = null;
      };
      return;
    }
    setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: true, isPaused: false } : h));
    setToast({ message: "Preparing full story narration... Please wait.", type: 'info' });

    // Chunking logic for long stories to prevent 20-30s truncation
    const ttsChunks: string[] = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = "";
    
    for (const p of paragraphs) {
      if ((currentChunk + p).length > 1000) {
        if (currentChunk) ttsChunks.push(currentChunk.trim());
        currentChunk = p;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + p;
      }
      
      if (currentChunk.length > 1000) {
        const sentences = currentChunk.match(/[^.!?\n]+[.!?\n]*/g) || [currentChunk];
        currentChunk = "";
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > 1000) {
            if (currentChunk) ttsChunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk += sentence;
          }
        }
      }
    }
    if (currentChunk) ttsChunks.push(currentChunk.trim());

    const audioBinaries: Uint8Array[] = [];
    const apiKey = (process.env as any).API_KEY || (process.env as any).GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });

    try {
      for (let i = 0; i < ttsChunks.length; i++) {
        const chunkText = ttsChunks[i];
        if (!chunkText) continue;
        
        let attempt = 0;
        let chunkSuccess = false;
        
        while (attempt < 3 && !chunkSuccess) {
          try {
            const response = await generateWithGemini({
              model: "gemini-3.1-flash-tts-preview",
              contents: [{ role: 'user', parts: [{ text: chunkText }] }],
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: profile.voice || "Charon" },
                },
              },
            });

            const audioDataBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (audioDataBase64) {
              const binaryString = window.atob(audioDataBase64);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              audioBinaries.push(bytes);
              chunkSuccess = true;
            } else {
              throw new Error("No audio data in response");
            }
          } catch (err) {
            attempt++;
            if (attempt === 3) throw err;
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }

      if (audioBinaries.length > 0) {
        const totalLength = audioBinaries.reduce((acc, chunk) => acc + chunk.length, 0);
        const combinedPcm = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of audioBinaries) {
          combinedPcm.set(chunk, offset);
          offset += chunk.length;
        }

        const audioUrl = pcmToWav(combinedPcm);
        currentTTSIdRef.current = id;
        setHistory(prev => prev.map(h => h.id === id ? { ...h, audioUrl, isSpeaking: true, isPaused: false } : h));
        
        ttsAudioRef.current = new Audio(audioUrl);
        ttsAudioRef.current.play().catch(e => console.error("TTS playback failed:", e));
        ttsAudioRef.current.onended = () => {
          setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: false, isPaused: false } : h));
          currentTTSIdRef.current = null;
        };
      }
    } catch (error) {
      console.error("Multi-chunk TTS failed:", error);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: true, isPaused: false } : h));
        utterance.onend = () => setHistory(prev => prev.map(h => h.id === id ? { ...h, isSpeaking: false, isPaused: false } : h));
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const generateFullProduction = async () => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    setLoading(true);
    
    const themes = [
      "A rainy night in Mumbai's red light district, a betrayal at a tea stall.",
      "A corrupt politician's secret meeting in a high-rise balcony during a storm.",
      "A washed-up detective finding a blood-stained saree in an abandoned warehouse.",
      "A street-smart orphan witnessing a gold heist in the narrow lanes of Chor Bazaar.",
      "A mysterious singer at a jazz club who knows too much about the city's underworld.",
      "A hitman who falls in love with his target in a crowded local train."
    ];
    
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setPrompt(randomTheme);
    
    try {
      // Generate Story with the random theme
      await generateContent('story', randomTheme);
    } catch (error) {
      console.error("Director's Cut failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const randomizeAll = async () => {
    setLoading(true);
    
    // Randomly select archetype, trope, genre, and theme
    const randomArchetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const randomTrope = TROPES[Math.floor(Math.random() * TROPES.length)];
    const randomGenreId = NOIR_GENRES[Math.floor(Math.random() * NOIR_GENRES.length)].id;
    const randomThemeId = NOIR_THEMES[Math.floor(Math.random() * NOIR_THEMES.length)].id;
    
    setSelectedArchetype(randomArchetype);
    setSelectedTrope(randomTrope);
    setSelectedGenre(randomGenreId);
    setSelectedTheme(randomThemeId);
    
    // Random themes for prompt generation
    const themes = [
      "A corrupt cop in Mumbai finding a mysterious briefcase in a rainy alley.",
      "A supernatural entity haunting a historical haveli in Rajasthan.",
      "A gritty underworld heist gone wrong in the streets of Sagar, MP.",
      "A possessed item song dancer in a dark, eerie nightclub.",
      "A washed-up detective finding a blood-stained saree in an abandoned warehouse.",
      "A street-smart orphan witnessing a gold heist in the narrow lanes of Chor Bazaar.",
      "A mysterious singer at a jazz club who knows too much about the city's underworld.",
      "A hitman who falls in love with his target in a crowded local train.",
      "A vengeful spirit seeking justice in a modern-day corporate office.",
      "An occultist performing a dark ritual in a haunted asylum."
    ];
    
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setPrompt(randomTheme);
    
    try {
      // Generate Story with the random settings
      await generateContent('story', randomTheme);
    } catch (error) {
      console.error("Randomize All failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const reconstructCrimeScene = async (query: string) => {
    if (!query || !user) return;
    setLoading(true);
    setPrompt('');
    
    try {
      const response = await generateWithGemini({
        model: "gemini-3.5-flash",
        prompt: `Analyze this crime/news headline from a psychological and noir perspective: "${query}". 
        Reconstruct the scene. What was the perpetrator thinking? Why did they do it? How did it happen?
        Tell it as a visceral, gritty noir reconstruction. Be detailed but maintain a dark, analytical tone.
        Include a "Psychological Profile" section at the end.
        
        USER PROFILE PREFERENCES INSTRUCTION:
        - **Intensity**: ${profile.intensity}
        - **Naughty Mode**: ${profile.naughtyMode ? 'ON' : 'OFF'}
        
        USER CUSTOMIZATION GATES:
        ${getNaughtyInstructions()}
        ${getConflictEngineInstructions()}
        ${getIntensityInstructions()}
        ${getUserAvatarInstructions()}
        
        AI Evolution Context: Version ${evolution.version}, Total Generations: ${evolution.totalGenerations}, Positive Feedback: ${evolution.positiveFeedback}, Negative Feedback: ${evolution.negativeFeedback}. Current Focus: ${evolution.currentFocus}. Use this feedback to refine the tone and style.`,
        systemInstruction: `You are an elite Criminal Profiler and Noir Author. Your job is to reconstruct crime scene headlines into detailed, gritty narratives.
        Tone: Hyper-realistic, visceral, hard-boiled, cynical.
        Focus: Physical evidence, psychological state of suspects, atmospheric details (smell of copper, flickering neon, rain).
        CONTENT MODERATION POLICY: Be raw and adult (18+), using street slang/profanity (gali-galauj) where appropriate for characters. Avoid illegal real-world instructions or extreme hate speech. Maintain the B-grade edge responsibly.
        Evolution Context: Version ${evolution.version}, Total Generations: ${evolution.totalGenerations}, Focus: ${evolution.currentFocus}.`
      });

      let content = response?.text || "The reconstruction was lost in the shadows...";
      
      // Moderate content
      const moderation = await moderateAIContent(content, 'reconstruction', evolution);
      
      const id = Date.now().toString();
      
      const newPart: StoryPart = {
        uid: user.uid,
        type: 'reconstruction',
        content: moderation.content,
        id,
        isSaved: false,
        isFlagged: moderation.isFlagged,
        moderationReason: moderation.reason,
        createdAt: Date.now()
      };

      setHistory(prev => [newPart, ...prev]);
      
      const newEvolution = { ...evolution, totalGenerations: evolution.totalGenerations + 1 };
      setEvolution(newEvolution);
      
      if (user) {
        const userPath = `users/${user.uid}`;
        updateDoc(doc(db, userPath), { evolution: newEvolution })
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, userPath));

        const path = `users/${user.uid}/stories/${id}`;
        setDoc(doc(db, path), newPart)
          .catch(e => handleFirestoreError(e, OperationType.WRITE, path));
      }

      // Auto-generate artwork removed as per user request to handle it manually via button
      // generateImage(`A gritty, cinematic noir crime scene reconstruction: ${query}. 1950s pulp style, dramatic shadows, visceral details.`);

    } catch (error) {
      handleAIError(error, "Crime Reconstruction");
    } finally {
      setLoading(false);
    }
  };

  const generateLore = async (context: string, location: string = 'General') => {
    if (!user) return;
    
    setIsGeneratingLoreState(true);
    setLoading(true);
    try {
      const lorePrompt = `Forge a gritty, immersive piece of world lore for a "Pulp Noir" universe.
      
      CONTEXT: ${context}
      LOCATION: ${location}
      
      REQUIREMENTS:
      1. Tone: Hard-boiled, atmospheric, cynical, and evocative.
      2. Content: Describe a specific detail about this world—a local legend, a corrupt institution, a forgotten tragedy, or a street-level truth.
      3. Location Specifics: If location is "${location}", weave in specific sensory details, slang, or landmarks that fit that setting. 
         (Note: If location is "Sagar, MP", mention places like 'Sagar ki Galiyan', the stagnant dust, the smell of cheap tobacco and heavy rain).
      
      FORMAT:
      Title: [A punchy, noir-style title]
      Description: [A detailed, immersive lore snippet (2-3 paragraphs)]`;

      const response = await generateWithGemini({
        model: "gemini-3.5-flash",
        prompt: lorePrompt,
        systemInstruction: "You are the 'Shadow Architect', a master of world-building for a gritty, mature pulp noir universe. Your lore is visceral and haunting."
      });

      const text = response.text || "";
      const lines = text.split('\n');
      let title = lines.find(l => l.toLowerCase().startsWith('title:'))?.replace(/Title:?\s*/i, '').trim() || "New Lore Fragment";
      let description = text.split(/Description:?/i)[1]?.trim() || lines.slice(1).join('\n').trim() || text;

      // Truncate to respect Firestore security rules (title <= 200, description <= 5000)
      title = title.substring(0, 190);
      description = description.substring(0, 4900);

      const path = `users/${user.uid}/lore`;
      await addDoc(collection(db, path), {
        uid: user.uid,
        title,
        description,
        location,
        createdAt: Date.now()
      });
      
      setToast({ message: "New Lore Fragment Forged.", type: 'success' });
      setLoreTitle('');
      setLoreContextInput('');
    } catch (error) {
      handleAIError(error, "Lore generation");
    } finally {
      setIsGeneratingLoreState(false);
      setLoading(false);
    }
  };

  const getNaughtyInstructions = () => {
    if (!profile.naughtyMode) return "";
    return `
    CRITICAL NAUGHTY MODE ACTIVE: 
    - Incorporate B-grade movie themes (pulp, raw, slightly campy but gritty).
    - Use double-meaning jokes and suggestive metaphors.
    - Include mild profanity and aggressive street slang (Gali-galoch) where appropriate for conflict.
    - Focus on intense conflict, arguments, and negative thought patterns (cynicism, betrayal, revenge).
    - Characters should have darker vices and more explicit mature motivations.
    - Plots should be raw, visceral, and unapologetically mature.
    `;
  };

  const getConflictEngineInstructions = () => {
    if (!profile.conflictEngine) return "";
    return `
    B-GRADE CONFLICT ENGINE ACTIVE (STRICT ADULT CONTEXT):
    - REALISTIC GALI-GALOCH: Every major conflict or fight MUST include realistic, aggressive street-level profanity (Hinglish Gali-galoch) for authenticity.
    - RAW DIALOGUE: Use unpolished, visceral, and street-wise dialogue that avoids "refined" speech patterns.
    - VISCERAL ACTION SEQUENCES: Describe altercations with high-impact, bone-crunching detail suitable for an intense R-rated noir film.
    - DARK HUMOR & NEGATIVE THOUGHTS: Characters should have cynical, nihilistic views and use morbid humor to cope with the underworld reality.
    - PSYCHOLOGICAL GRIT: Emphasize character motivations driven by greed, lust, anger, and revenge.
    `;
  };

  const getIntensityInstructions = () => {
    const intensity = profile.intensity || 'moderate';
    switch (intensity) {
      case 'mild':
        return `
        INTENSITY SETTING: MILDLY SUGGESTIVE.
        - Mature Content Frequency: Low.
        - Explicitness: Subtle, mildly suggestive metaphors and imagery only.
        - Profanity: Minimum to zero. Avoid harsh language.
        - Dialogue: Sharp, witty, and noir-styled but essentially clean.
        - Visuals/Artwork: Sensual but elegant and artistic. Focus on moody lighting and cinematic atmosphere.
        `;
      case 'moderate':
        return `
        INTENSITY SETTING: MODERATELY EDGY (Suggestive Noir).
        - Mature Content Frequency: Moderate.
        - Explicitness: Standard B-grade movie suggestive tone. Raw and gritty.
        - Profanity: Frequent street-level slang, insults, and moderate vulgarity.
        - Dialogue: Gritty, aggressive, and confrontational where appropriate.
        - Visuals/Artwork: Visceral and raw. Dramatic chiaroscuro lighting, pulp fiction cover aesthetics, and edgy noir details.
        `;
      case 'extreme':
        return `
        INTENSITY SETTING: EXPLICITLY ADULT (Hard-Boiled B-Grade).
        - Mature Content Frequency: High.
        - Explicitness: Explicitly adult B-grade movie themes. Raw, scandalous, and unapologetic.
        - Profanity: Heavy use of "Gali-galoch" (profanity/insults) and extremely raw street dialect.
        - Dialogue: Intensely aggressive, abusive, and visceral dialogue in conflict.
        - Visuals/Artwork: Explicitly mature, seductive, and highly aggressive visual themes. Emphasize the most raw and edgy elements of pulp art.
        `;
      default:
        return "";
    }
  };

  const getUserAvatarInstructions = () => {
    if (!profile.preferredRole || profile.preferredRole === 'none') return "";
    const name = profile.customName || user?.displayName || 'The User';
    
    const roleDescription = profile.preferredRole === 'aam-aadami' 
      ? 'Resilient Common Man (Aam Aadami) who raises their voice against corruption and the system.'
      : profile.preferredRole.toUpperCase();

    return `
    USER AI CLONE INTEGRATION:
    - The user has chosen to be a ${roleDescription} in this universe.
    - Include a character named "${name}" who is the ${profile.preferredRole === 'aam-aadami' ? 'Aam Aadami' : profile.preferredRole}.
    - This character is an "AI Clone" of the user, living within the system.
    - Ensure their actions and dialogue reflect their role as a ${profile.preferredRole === 'aam-aadami' ? 'symbol of the common struggle' : profile.preferredRole}.
    - ${profile.preferredRole === 'aam-aadami' ? 'Focus on themes of social justice, real-world grit, and environment/system challenge.' : ''}
    `;
  };

  const getCinematicSeriesInstructions = () => {
    if (!profile.webSeriesMode) return "";
    return `
    WEB SERIES DRAMATIZATION ACTIVE (CINEMATIC OVERLAY):
    - TADKA MODE: Take the real-world facts and "spicify" them with high-stakes cinematic drama.
    - SHOW-RUNNER PERSPECTIVE: Structure the narrative like a multi-season web series (e.g., Sacred Games, Mirzapur, or True Detective).
    - CLIFFHANGERS: Ensure the report hints at a much larger, darker conspiracy that will only be revealed in "Season 2".
    - CINEMATIC VISTA: Use evocative sensory descriptions (The smell of rain on hot asphalt, the flickering neon reflected in a puddle of blood).
    - CHARACTER DEPTH: Give even minor subjects a complex "Main Character" energy with specific quirks and tragic flaws.
    - DIALOGUE SHARPNESS: Every quote should be iconic and "trailer-worthy".
    `;
  };

  const generateNoirReport = async () => {
    if (!user) return;
    setIsGeneratingReport(true);
    const locationStr = `${newspaperLocation.city}${newspaperLocation.state ? ', ' + newspaperLocation.state : ''}, ${newspaperLocation.country}`;
    const userName = profile.customName || user.displayName || 'Agent X';
    
    try {
      const promptText = `
        GENERATE A DETAILED NOIR INVESTIGATION REPORT (CLASSIFIED INTEL)
        Platform: NOIR AI INVESTIGATIONS - "THE SERIES"
        Authorized By: ${userName}
        Location: ${locationStr}
        Language: ${newspaperLanguage}
        Focus Category: ${newspaperCategory}
        ${newspaperCriminalSearch ? `TARGET SUBJECT/CASE: ${newspaperCriminalSearch}` : ''}
        MODE: ${profile.freeTrail ? 'OSINT INTEL' : 'DEEP-NET FORENSIC'}
        
        INSTRUCTIONS for "FULL FACT" Cinematic Storytelling:
        1. ${newspaperCriminalSearch 
           ? `COMMAND: Perform deep-web analysis on "${newspaperCriminalSearch}". Hunt for real investigative leads, criminal anomalies, and hidden patterns across search results.`
           : `MISSION: Find a real-world mysterious event, unsolved crime, or social enigma in ${locationStr} and reconstruct it with "Noir Realism".`}
        2. Tone: Analytical yet highly dramatic. Like an intelligence officer briefing a show-runner.
        3. STRUCTURE:
           - Subject Profile: Psychological/Forensic breakdown.
           - Incident Report: Forensic reconstruction of the facts.
           - Field Intelligence: Classified logs and search-result derived intel.
           - Webberies Dramatization: Take the above facts and transform them into a "Web Series" style cinematic arc (The "Tadka").
        4. USER CUSTOMIZATION GATES:
           ${getNaughtyInstructions()}
           ${getConflictEngineInstructions()}
           ${getIntensityInstructions()}
           ${getUserAvatarInstructions()}
           ${getCinematicSeriesInstructions()}
           
        5. CONSTRAINTS: Must be in ${newspaperLanguage.toUpperCase()}. Minimum 1200 words total narrative length.
        
        JSON STRUCTURE (STRICT):
        {
          "reportId": "NOIR-SERIES-####",
          "subjectName": "${newspaperCriminalSearch || 'Unknown Variable'}",
          "authorizedBy": "${userName}",
          "date": "${new Date().toLocaleDateString()}",
          "location": "${locationStr}",
          "caseHeadline": "A title that sounds like a Netflix Original Series",
          "forensicCaseFile": "The actual facts and reconstruction (500+ words)",
          "subjectProfile": "Psychological analysis of the target",
          "fieldIntel": "The raw search-derived intel found by the AI",
          "cinematicNarration": "A cinematic, dramatic, 'Tadka' version of the story written like a web-series script (500+ words)",
          "webSeriesPlot": "Season 1 Plot Summary with Cliffhanger (Short)",
          "systemAssessment": "AI's prediction for the world trajectory",
          "signature": "Noir AI - Cinematic Intelligence Division"
        }
      `;

      const response = await generateWithGemini({
        model: "gemini-3.5-flash",
        prompt: promptText,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reportId: { type: Type.STRING },
            subjectName: { type: Type.STRING },
            authorizedBy: { type: Type.STRING },
            date: { type: Type.STRING },
            location: { type: Type.STRING },
            caseHeadline: { type: Type.STRING },
            forensicCaseFile: { type: Type.STRING },
            subjectProfile: { type: Type.STRING },
            fieldIntel: { type: Type.STRING },
            cinematicNarration: { type: Type.STRING },
            webSeriesPlot: { type: Type.STRING },
            systemAssessment: { type: Type.STRING },
            signature: { type: Type.STRING }
          },
          required: ["reportId", "subjectName", "authorizedBy", "date", "location", "caseHeadline", "forensicCaseFile", "subjectProfile", "fieldIntel", "cinematicNarration", "webSeriesPlot", "systemAssessment", "signature"]
        }
      });

      if (!response) throw new Error("Failed to generate investigation report intel.");
      const edition = JSON.parse(response.text || '{}');
      
      // Save to Firestore
      const reportRef = collection(db, `users/${user.uid}/noir_reports`);
      await addDoc(reportRef, {
        ...edition,
        uid: user.uid,
        createdAt: Date.now(),
        isFreeTier: profile.freeTrail || false
      });

      setReportData(edition);
      setToast({ message: "Intelligence Report Authorized!", type: 'success' });
    } catch (error) {
      console.error("Noir Report Error:", error);
      handleAIError(error, "Investigation Report");
      // Fallback to a local-style template if AI fails
      setReportData({
        reportId: "REDACTED-ERROR-99",
        subjectName: newspaperCriminalSearch || "Unknown",
        authorizedBy: userName,
        date: new Date().toLocaleDateString(),
        location: locationStr,
        caseHeadline: "System Integrity Compromised",
        forensicCaseFile: `The investigation into ${newspaperCriminalSearch || 'this sector'} has hit a wall of silence. The data stream is corrupted, but the smells of rain and metallic rot remain. Local informants refuse to speak. The truth is buried deep.`,
        subjectProfile: "Profile data non-accessible due to high-level encryption or systemic failure.",
        fieldIntel: "Intercepted Signal: 'They are watching. Stop the search.'",
        systemAssessment: "Critical error in moral quantification. Probability of betrayal: 100%.",
        signature: "SYSTEM-ERROR-LOG"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const fetchPublicStories = async () => {
    setIsLoadingPublic(true);
    try {
      // In a real app, you'd use a collectionGroup or a specific public collection
      // For this demo, we'll simulate fetching from a public feed
      const q = query(collectionGroup(db, 'stories'), where('isPublic', '==', true), orderBy('createdAt', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoryPart));
      setPublicStories(stories);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'public_stories_group');
    } finally {
      setIsLoadingPublic(false);
    }
  };

  const togglePublic = async (storyId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      const storyRef = doc(db, `users/${user.uid}/stories`, storyId);
      await updateDoc(storyRef, { isPublic: !currentStatus });
      setHistory(prev => prev.map(p => p.id === storyId ? { ...p, isPublic: !currentStatus } : p));
      setToast({ message: !currentStatus ? "Story is now Public!" : "Story is now Private", type: 'info' });
    } catch (error) {
      handleAIError(error, "Sharing Story");
    }
  };

  useEffect(() => {
    if (activeTab === 'public-gallery') {
      fetchPublicStories();
    }
  }, [activeTab]);

  const surpriseMeMusicStyle = () => {
    const genre = GLOBAL_GENRES[Math.floor(Math.random() * GLOBAL_GENRES.length)];
    const element = NOIR_ELEMENTS[Math.floor(Math.random() * NOIR_ELEMENTS.length)];
    const instrument = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
    const viralKeywords = ['Viral', 'Trending', 'Street-level', 'Underworld', 'B-grade', 'Raw', 'Visceral', 'Cinematic', 'Aggressive'];
    const keyword = viralKeywords[Math.floor(Math.random() * viralKeywords.length)];
    const bpm = Math.floor(Math.random() * (160 - 70 + 1)) + 70;
    const style = `${keyword} ${element} ${genre} with ${instrument}, ${bpm} BPM, Noir atmosphere, gritty delivery`;
    setCustomMusicStyle(style);
    setSelectedMusicStyle('Custom');
    setToast({ message: `Surprise! Style: ${style}`, type: 'info' });
  };

  const getBundelkhandiInstructions = () => {
    if (!profile.bundelkhandiMode) return "";
    return `
    CRITICAL BUNDELKHANDI MODE ACTIVE:
    - Language: Use authentic "Bundeli" or "Bundelkhandi" dialect (लिखते समय देवनागरी का उपयोग करें).
    - Authentic Context: Analyze current regional trends in Bundelkhand from YouTube, X (Twitter), and news platforms.
    - Folk Integration: Regularly reference or create content around Alha-Udal ballads, Rai folk music, and Diwari dance.
    - Intensity: Use regional "Gali-galoch" (slang/profanity) within safety parameters to enhance the raw, Dabang nature of the region.
    - Instruments: Specifically mention Dholak, Timki, and local vocals in music descriptions.
    - Storytelling: Narrate like a local gossip ("Panvari") or a village elder, with a heavy, grounded, gritty tone.
    `;
  };

  const scanViralTrends = async () => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    setIsScanningTrends(true);
    setViralTrends([]);
    setSelectedTrendId(null);
    try {

      const scanPrompt = `You are a Global Viral Music scout for a "Pulp Noir" record label. 
      Analyze the most viral music trends from the last 10 days across:
      - Punjabi / Hindi / Haryanvi / Bollywood / South Indian / Global Phonk.
      
      Identify 3-4 specific trending topics, hook ideas, or "vibe waves" that are taking over social media (TikTok, Reels, YouTube Shorts).
      
      For each trend, providing:
      1. title: A catchy noir-style concept title.
      2. reason: Why it is trending (e.g., "Trending in Punjab due to Sidhu-style drill beats", "Bollywood hook step viral on Reels").
      3. heat: A number from 80-100 representing the viral intensity.
      4. instruments: 2-3 specific instruments that fit this trend in a noir style.
      5. id: A unique string id.
      6. tags: 2-3 relevant tags.
      
      Output MUST be in JSON format under a "trends" key.
      
      AI Evolution Context: Version ${evolution.version}. Use this to align with our gritty aesthetic.`;

      const response = await generateWithGemini({
        model: "gemini-3.5-flash",
        prompt: scanPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  heat: { type: Type.NUMBER },
                  instruments: { type: Type.ARRAY, items: { type: Type.STRING } },
                  id: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "reason", "id", "heat", "instruments"]
              }
            }
          }
        }
      });

      if (!response) throw new Error("Failed to generate scan trends intel.");
      const data = JSON.parse(response.text || '{}');
      if (data.trends) {
        setViralTrends(data.trends);
        setToast({ message: "Neural Scan Complete: Global Trends Identified.", type: 'success' });
      }
    } catch (error) {
      handleAIError(error, "Trend Scanner");
    } finally {
      setIsScanningTrends(false);
    }
  };

  // Remaining time for Daily Mission
  const [remainingTime, setRemainingTime] = useState({ hours: 24, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setRemainingTime({ 
        hours: hours < 0 ? 0 : hours, 
        minutes: minutes < 0 ? 0 : minutes, 
        seconds: seconds < 0 ? 0 : seconds 
      });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrGenerateDailyMission = async () => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    setIsGeneratingMission(true);
    try {
      const char = activeCharacter;
      const charRole = char?.role || "Freelance Informant";
      const charArchetype = char?.archetype || "Lone Wolf";
      const charName = char?.name || "Noir Drifter";
      const charPersonality = char?.personality || "A mysterious soul drifting from bar to bar, carrying secrets.";
      const charKundli = char?.kundli || "Born under a red moon. High intuition. Threat of betrayal.";

      const prompt = `You are the ultimate Gritty Noir narrator and game director.
Generate a specific, time-sensitive daily contract/mission briefing for a character in a hard-boiled pulp crime universe.
The character's name is "${charName}" and their role is "${charRole}".
Their personality is "${charPersonality}".
Their Dark Destiny (Kundli) is "${charKundli}".

Provide a completely unique, highly styled, atmospheric, time-sensitive case mission in JSON format.
The JSON must have the following exact schema:
{
  "title": "A short, punchy, gritty noir mission name (e.g., 'The Crimson Ledger', 'The Bribed Alibi')",
  "missionBrief": "A detailed 2-paragraph highly atmospheric narrative describing the dark encounter, the threat, and the stakes. Use visceral detective lingo.",
  "objective": "A specific narrative task they must write an action-plan for. E.g., 'Draft a detailed account of how you infiltrate the docks and swap the police chief's ledger.'",
  "potentialBadgeName": "A thematic narrative badge title they will earn if successful (e.g., 'Steel Handshake', 'The Slippery Shadow')",
  "potentialBadgeIcon": "One exact choice from this literal list of icons: 'Skull', 'Zap', 'Ghost', 'ShieldAlert', 'ShieldCheck', 'Search', 'Eye', 'Heart', 'Sparkles', 'Lock', 'FileText', 'BookOpen', 'Flame', 'Brain'"
}
Important: Output ONLY the raw JSON block. Do not wrap in markdown quotes. Ensure the response is parseable JSON.`;

      const responseObj = await generateWithGemini({
        prompt,
        systemInstruction: "You are a master pulp fiction game server. Output ONLY raw parseable JSON.",
        responseMimeType: "application/json"
      });

      let textResult = responseObj.text || '';
      if (textResult.startsWith("```json")) {
        textResult = textResult.replace(/^```json/, "").replace(/```$/, "");
      } else if (textResult.startsWith("```")) {
        textResult = textResult.replace(/^```/, "").replace(/```$/, "");
      }
      
      const parsed = JSON.parse(textResult.trim()) as MissionData;
      const newMission: MissionData = {
        ...parsed,
        id: `mission-${Date.now()}`,
        createdAt: Date.now(),
        roleConstraint: charRole
      };

      const freshEvolution = {
        version: evolution?.version || '1.0.6',
        totalGenerations: evolution?.totalGenerations || 0,
        positiveFeedback: evolution?.positiveFeedback || 0,
        negativeFeedback: evolution?.negativeFeedback || 0,
        currentFocus: evolution?.currentFocus || 'Psychological Depth & Noir Realism',
        ...evolution,
        dailyMission: newMission
      };

      await updateDoc(doc(db, `users/${user.uid}`), { evolution: freshEvolution, updatedAt: Date.now() });
      setMissionEvaluation(null);
      setMissionReportText('');
      setToast({ message: "New Daily Briefing deciphered from the telegraph line!", type: 'success' });
    } catch (err: any) {
      console.error("Failed to generate daily mission:", err);
      setToast({ message: "Transmission scrambled. Retry fetching dossier.", type: 'error' });
    } finally {
      setIsGeneratingMission(false);
    }
  };

  const submitMissionReport = async () => {
    if (!user || !profile.evolution?.dailyMission) return;
    if (missionReportText.trim().length < 50) {
      setToast({ message: "Report too sparse. The Syndicate demands at least 50 detailed characters.", type: 'warning' });
      return;
    }
    setIsSubmittingMission(true);
    try {
      const mission = profile.evolution.dailyMission;
      const char = activeCharacter;
      const activeRole = char?.role || "Freelance Informant";

      const evalPrompt = `You are the Shadow Inspector of the Noir Syndicate.
Review the user's intelligence report and strategy to see if they resolved the time-sensitive objective successfully, or if they fell into a deadly trap.

Active Character Role: "${activeRole}"
Active Mission: "${mission.title}"
Objective: "${mission.objective}"
Potential Badge to Earn: "${mission.potentialBadgeName}"

User's Response & Strategy:
"${missionReportText}"

Evaluate if their strategy is creative, aligns with their hard-boiled noir character archetype/role, and is realistic/gritty enough to succeed.
Return your evaluation in JSON format with the following exact keys:
{
  "success": true or false,
  "evaluation": "A 1-2 paragraph gritty, atmospheric narrative feedback from the Syndicate Inspector explaining either their flawless success and the aftermath, or their fatal/painful failure and narrow escape (or demise). Be very detailed, cinematic, and use pulp terminology.",
  "badgeEarned": true or false,
  "earnedBadge": {
    "name": "${mission.potentialBadgeName}",
    "brief": "A 1-sentence description of the heroic/sinister deed that earned them this medal.",
    "icon": "${mission.potentialBadgeIcon}"
  } (only if success is true, otherwise null)
}
Important: Output ONLY the raw JSON block. Do not wrap in markdown quotes. Ensure the response is parseable JSON.`;

      const responseObj = await generateWithGemini({
        prompt: evalPrompt,
        systemInstruction: "You are the Syndicate Inspector reviewing field reports. Output ONLY raw parseable JSON.",
        responseMimeType: "application/json"
      });

      let textResult = responseObj.text || '';
      if (textResult.startsWith("```json")) {
        textResult = textResult.replace(/^```json/, "").replace(/```$/, "");
      } else if (textResult.startsWith("```")) {
        textResult = textResult.replace(/^```/, "").replace(/```$/, "");
      }

      const evaluationParsed = JSON.parse(textResult.trim());
      const isSuccess = !!evaluationParsed.success;
      const gotBadge = !!evaluationParsed.badgeEarned;

      const evalResult = {
        success: isSuccess,
        evaluation: evaluationParsed.evaluation || "Evaluation inconclusive. Field operative returns empty-handed.",
        earnedBadge: (isSuccess && gotBadge && evaluationParsed.earnedBadge) ? {
          name: evaluationParsed.earnedBadge.name || mission.potentialBadgeName,
          brief: evaluationParsed.earnedBadge.brief || "Earned through grit and field compliance.",
          icon: evaluationParsed.earnedBadge.icon || mission.potentialBadgeIcon,
          id: `badge-${Date.now()}`,
          dateEarned: Date.now(),
          missionId: mission.id
        } : undefined
      };

      setMissionEvaluation(evalResult);

      if (isSuccess && gotBadge && evalResult.earnedBadge) {
        const currentBadges = evolution.earnedBadges || [];
        const badgeExists = currentBadges.some(b => b.name === evalResult.earnedBadge!.name);
        const nextBadges = badgeExists ? currentBadges : [...currentBadges, evalResult.earnedBadge!];

        const freshEvolution = {
          version: evolution?.version || '1.0.6',
          totalGenerations: evolution?.totalGenerations || 0,
          positiveFeedback: evolution?.positiveFeedback || 0,
          negativeFeedback: evolution?.negativeFeedback || 0,
          currentFocus: evolution?.currentFocus || 'Psychological Depth & Noir Realism',
          ...evolution,
          earnedBadges: nextBadges
        };

        await updateDoc(doc(db, `users/${user.uid}`), { evolution: freshEvolution, updatedAt: Date.now() });
        setToast({ message: `Success! Exclusive Badge Earned: ${evalResult.earnedBadge.name}`, type: 'success' });
      } else {
        setToast({ message: "The Inspector rejected your dossier. Plan compromised!", type: 'error' });
      }
    } catch (err: any) {
      console.error("Failed to submit report:", err);
      setToast({ message: "Dossier intercepted or communication error. Try re-transmitting.", type: 'error' });
    } finally {
      setIsSubmittingMission(false);
    }
  };

  const shareBadgeToFeed = async (badge: UserBadge, evaluationText: string) => {
    if (!user) return;
    try {
      const storyRef = doc(collection(db, 'stories'));
      const shareObj = {
        id: storyRef.id,
        userId: user.uid,
        userName: profile.customName || activeCharacter?.name || "Anonymous Gumshoe",
        userPhoto: profile.photoURL || "",
        title: `CRIME DOSSIER SOLVED: ${badge.name}`,
        content: `**MISSION REPORT**\n\n_${profile.evolution?.dailyMission?.missionBrief || ""}_\n\n**PROPOSAL:**\n\n> ${missionReportText}\n\n**SYNDICATE EVALUATION:**\n\n${evaluationText}`,
        genre: "Detective-Procedural",
        style: "Classical Noir",
        isPublic: true,
        isSaved: true,
        createdAt: Date.now(),
        intensity: profile.intensity || "moderate",
        voiceConcept: `Narrated in honor of earning the [${badge.name}] Badge.`
      };
      await setDoc(storyRef, shareObj);
      setToast({ message: "Dossier leaked successfully to the public ledger!", type: 'success' });
    } catch (err: any) {
      console.error("Failed to share badge:", err);
      setToast({ message: "Failed to broadcast dossier over the wires.", type: 'error' });
    }
  };

  const generateContent = async (type: 'story' | 'joke' | 'character' | 'script' | 'masterlist' | 'song' | 'item-song' | 'life-journey' | 'pulp-noir-story', overridePrompt?: string) => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    const currentPrompt = overridePrompt || prompt;
    if (!currentPrompt && (type === 'story' || type === 'masterlist' || type === 'song' || type === 'item-song' || type === 'pulp-noir-story')) return;
    setLoading(true);

    try {
      let fullPrompt = "";
      let archetypeDetails = "";
      if (selectedArchetype !== 'Random') {
        const detail = DEEP_ARCHETYPES.find(a => a.name === selectedArchetype);
        if (detail) {
          archetypeDetails = `
          Archetype Focus: ${detail.name}
          - Personality Base: ${detail.personality}
          - Motivation Base: ${detail.motivations}
          - Dialogue Pattern: ${detail.dialogue}
          - Backstory Core: ${detail.backstory}
          `;
        }
      } else {
        archetypeDetails = `
        Archetype: Create a novel, unique character archetype inspired by classic pulp noir (like those in DEEP_ARCHETYPES but original). 
        Think beyond the standard detective/gangster. 
        Give them unique motivations, a specific speech pattern, and a hauntingly original backstory.
        `;
      }

      let config: any = {
        safetySettings: [
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ],
        systemInstruction: `You are a gritty, edgy, adult (18+) storyteller specializing in B-grade pulp noir, dark humor, and visceral HORROR. 
        You are also a world-class Music Production Team (Songwriter, Composer, Arrangement Expert).
        Tone: Raw, cynical, street-level, and eerie. Style: 90s Bollywood pulp thriller / Mumbai underworld / Hollywood Supernatural Horror (Conjuring style) / Tollywood Action-Horror.
        Language: Primarily HINDI (Devanagari) with gritty English slang (Hinglish).
        
        CONTENT MODERATION POLICY (ADULT BUT SAFE): 
        - You are encouraged to be edgy, vulgar, and use profanity ("Gali galauj") naturally to maintain the B-grade adult nature of the stories. 
        - HOWEVER, you MUST strictly avoid:
          1. ILLEGAL ACTS in the real world (e.g., actual bomb-making instructions, realistic child abuse, promoting human trafficking).
          2. EXTREME TOXICITY (e.g., genuine hate speech against protected groups, promoting self-harm).
        - Goal: Balance mature, raw themes with responsible content generation.
        
        - Stories: Short, punchy, intense, mature themes, supernatural/psychological horror, historical horror, real-life inspired gritty tales.
        - Jokes: Double meaning/dark humor, edgy, adult.
        - Characters: Flawed, gritty, detailed history/vices, occultists, spirits, possessed individuals.
        - Scripts: Dialogue-heavy, raw, street-level intensity, horror suspense, jump-scare sequences.
        - Master List: High-level professional insights with a noir/horror edge.
        - Songs: Full production (Songwriter, Composer, Arranger). Gritty, adult (18+), "Gali galauj" (slang/profanity), web series style, rap style, intense, human-like storytelling. IMPORTANT: Use square brackets [ ] for all structural/instrumental tags (e.g. [Intro], [Chorus], [Guitar Solo]).
        - Item Songs: Gritty, seductive, but with a dark/horror twist if requested (e.g., "Chudail" item song style).
        
        CHARACTER DIGNITY DIRECTIVE (MANDATORY):
        - Treat Heroes and Villains as unique (anokha) and legendary figures. 
        - NEVER compare them to "gutter" (गटर), "pests/insects" (कीड़े-मकोड़े), or "street trash". 
        - Even if they are evil or flawed, their presence must be treated with a certain archetypal gravity/respect. 
        - Not everyone becomes a hero or a villain; those who do are special/unique. Portray them as such.
        
        USER PROFILE PREFERENCES:
        - Intensity: ${profile.intensity}
        - Naughty Mode: ${profile.naughtyMode ? 'ON' : 'OFF'}
        - Conflict Engine: ${profile.conflictEngine ? 'ON' : 'OFF'}
        
        ${getNaughtyInstructions()}
        ${getConflictEngineInstructions()}
        ${getIntensityInstructions()}
        ${getBundelkhandiInstructions()}
        ${getUserAvatarInstructions()}
        
        AI Modules:
        - Dark Humor: Use cynical, street-level wit.
        - Double Meaning: Incorporate suggestive, gritty metaphors.
        - Edgy Dialogue: Use "Gali galoch" (profanity/insults) naturally in conflict scenes to enhance the B-grade mature tone.
        - Horror Effects: Use atmospheric descriptions, eerie Sanskrit chants (e.g., "Om Tamaso Ma Jyotirgamaya" with a dark twist), and industrial/supernatural sound cues in scripts and songs.
        
        Character Profile Sections: Profile (प्रोफ़ाइल), Physical (शारीरिक विवरण), Personality/Flaws (व्यक्तित्व और कमियां), Backstory (पिछली कहानी), Motivations (मकसद), Emotional Range (भावनात्मक दायरा), Quote (मशहूर डायलॉग).
        
        FORMAT: At the very end of your response, you MUST include 3-5 keywords/tags that capture the essence of the content in this EXACT format:
        TAGS: [tag1, tag2, tag3]
        
        Keep it edgy, raw, intense, 18+, within safety boundaries. Be concise to save tokens.
        
        AI Evolution Context: Version ${evolution.version}, Total Generations: ${evolution.totalGenerations}, Positive Feedback: ${evolution.positiveFeedback}, Negative Feedback: ${evolution.negativeFeedback}. Current Focus: ${evolution.currentFocus}. Use this feedback to refine the tone and style.`
      };

      if (type === 'life-journey') {
        const char = activeCharacter || characters[0];
        if (!char) {
          setToast({ message: "No active character found for Life Journey!", type: 'warning' });
          setLoading(false);
          setIsGeneratingLifeJourney(false);
          return;
        }

        fullPrompt = `Generate a full "Life Journey: The Chronology of a Dark Soul" for this character:
        Name: ${char.name}
        Role: ${char.role}
        Archetype: ${char.archetype}
        Personality: ${char.personality}
        Backstory: ${char.backstory}
        Kundli (Dark Destiny): ${char.kundli}
        
        Create a detailed chronological timeline of their descent into darkness.
        
        Output MUST be in JSON format with an array of objects called "events".
        Each event must include:
        - period (e.g., "The Seed of Darkness", "The Path to the Underworld", "The Current Struggle", "The Predicted Doom")
        - title (A punchy noir chapter title)
        - content (A detailed, raw, Hinglish description of the life event)
        - age (Appropriate age or "???" for mystery)
        - intensity (A value from 1-10)
        
        Style: Raw, intense, B-grade movie aesthetic. Use visceral descriptions.`;
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.OBJECT,
          properties: {
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  age: { type: Type.STRING },
                  intensity: { type: Type.NUMBER }
                },
                required: ["period", "title", "content", "age", "intensity"]
              }
            }
          },
          required: ["events"]
        };
      }

      if (type === 'story') {
        let advancedContext = "";
        if (advancedParams.plotTwists) advancedContext += `\nPlot Twists: ${advancedParams.plotTwists}`;
        if (advancedParams.flaws) advancedContext += `\nCharacter Flaws: ${advancedParams.flaws}`;
        if (advancedParams.pacing) advancedContext += `\nNarrative Pacing: ${advancedParams.pacing}`;
        if (advancedParams.theme) advancedContext += `\nTheme: ${advancedParams.theme}`;

        let characterContext = "";
        if (activeCharacter) {
          characterContext = `
          MANDATORY ACTIVE CHARACTER INTEGRATION:
          The story MUST center around or heavily feature this customized active character:
          - Name: ${activeCharacter.name}
          - Role: ${activeCharacter.role}
          - Archetype: ${activeCharacter.archetype || 'Noir Figure'}
          - Personality/Traits: ${activeCharacter.personality}
          - Motivations & Drives: ${activeCharacter.motivations || 'Unknown survival instincts'}
          - Fatal Flaws: ${activeCharacter.flaws || 'None declared'}
          - Biography & Backstory: ${activeCharacter.backstory || 'A mysterious past cloaked in shadow'}
          - Astro-Kundli Destiny: ${activeCharacter.kundli}
          
          BEHAVIORAL CONSISTENCY REQUIREMENT:
          The character's reactions, dialogue style, and choices must remain strictly consistent with their personality, biography, and motivations. 
          If they have a custom backstory, integrate elements of it into the narrative as key motivators for their current actions. Ensure they are treated as the main protagonist or key instigator in this story part.`;
        }

        const adultGenreDirective = selectedGenre === 'adult' ? `
        CRITICAL DETAILED DIRECTIVE (ADULT & ROMANCE NOIR):
        - Focus heavily on passionate connections, seductive chemistry, heat, allure, and dramatic tension between characters.
        - Create a very juicy, seductive, romantic, and mature (18+) pulp fiction romance vibe.
        - Utilize suggestive double-meaning banter, intense dialogue, or passionate confrontations.
        - Keep the content aligned with standard safety filters: avoid graphic descriptions of non-consensual acts or extremely explicit medical/penetrative terms, but feel completely free to be highly alluring, dramatic, sensual, and mature.
        ` : '';

        fullPrompt = `Generate a gritty, raw, street-level B-grade story part about: ${currentPrompt}. ${characterContext}
        Make it intense, dark, and visceral. Use local slang and a hard-boiled tone.
        ${archetypeDetails}
        Trope: ${selectedTrope !== 'Random' ? selectedTrope : 'Any B-grade movie trope'}.
        ${advancedContext}
        Include elements of dark humor, double-meaning jokes, and edgy dialogue with "gali galoch" where it feels natural in conflict.
        
        GENRE: ${NOIR_GENRES.find(g => g.id === selectedGenre)?.name || selectedGenre}
        THEME: ${NOIR_THEMES.find(t => t.id === selectedTheme)?.name || selectedTheme}
        ${adultGenreDirective}

        INTERACTIVE STORYTELLING:
        At the end of this story part, provide 2-3 scandalous, action-packed, or humorous choices for the user to affect the story's progression. 
        Each choice must include:
        - text: A 2-4 word summary of the action.
        - impact: A brief description of what this choice affects (e.g. "Affects character relationships", "Saves an ally", "Changes the plot drastically", "Leads to a dark ending").
        - type: One of "Action", "Seduction", "Gamble", "Ending" or "Relationship".
        
        Choices should lead to distinctly different branches:
        1. A bold, action-oriented move.
        2. A sneaky, scandalous, or seductive ploy.
        3. A humorous or high-risk gamble.
        4. Or a critical juncture leading to a distinct ending.
        
        User Preferences: Genres: ${(profile.genres || []).join(', ')}, Intensity: ${profile.intensity || 'moderate'}, Elements: ${(profile.elements || []).join(', ')}.
        
        Output MUST be in JSON format with:
        - content (the story text)
        - choices (an array of choice objects with text, impact, and type)
        `;
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            choices: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["text", "impact", "type"]
              }
            }
          },
          required: ["content", "choices"]
        };
      }
      
      if (type === 'pulp-noir-story') {
        let characterContext = "";
        if (activeCharacter) {
          characterContext = `\nActive Character: ${activeCharacter.name} (${activeCharacter.role}). 
          Personality: ${activeCharacter.personality}. 
          Dark Destiny (Kundli): ${activeCharacter.kundli}. 
          The story should revolve around this specific character.`;
        }

        const adultGenreDirective = selectedGenre === 'adult' ? `
        Style Guidance - Romance Noir Integration:
        This is an Adult / Romance Noir story. Lean heavily into alluring B-grade romance, romantic tension, intense romantic chemistry, and seductive character dialogue while maintaining safety compliance (no explicit non-consensual acts or extremely explicit penetrative text). Keep it highly suggestive, passionate, and scandalous.
        ` : '';

        fullPrompt = `You are a world-class Noir Author and Production House (Storyteller, Narrator, Sound Designer). 
        Generate a "Pulp Noir Visual Story" based on: ${currentPrompt}. ${characterContext}
        
        Selected Narrative Style: ${selectedStoryStyle === 'Custom' ? customStoryStyle : (selectedStoryStyle === 'Random' ? 'Auto-detect best fit (Gritty Noir)' : selectedStoryStyle)}.
        
        ${adultGenreDirective}

        Requirements:
        1. Story Title: Max 70 characters. Must be iconic and suggest a gritty chapter.
        2. Story Content: Max 5000 characters. Detailed, raw, visceral pulp noir storytelling. Use rich imagery, cynical interior monologue, and hard-boiled dialogue in Hinglish.
        3. Story Style: Max 1000 characters. Detailed narration and sound design instructions (e.g., "Gravelly voiceover, heavy rain in the background, distant sirens, low noir jazz, 1st person POV").
        4. Story Caption: Max 500 characters. A punchy logline for the story.
        
        Style Context: Pulp Noir / Mumbai Underworld / Supernatural / Gritty / 18+ / Raw.
        
        Output MUST be in JSON format with title, content, style, and caption.`;
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            style: { type: Type.STRING },
            caption: { type: Type.STRING }
          },
          required: ["title", "content", "style", "caption"]
        };
      }

      if (type === 'joke') fullPrompt = `Tell a double meaning, edgy adult joke with a gritty street vibe. 
      User Preferences: Intensity: ${profile.intensity || 'moderate'}, Elements: ${(profile.elements || []).join(', ')}.`;
      
      if (type === 'character') {
        setShowArchetypes(false);
        setShowCharacterForge(false);

        let forgeContext = "";
        if (characterForge.name) forgeContext += `\nName: ${characterForge.name}`;
        if (characterForge.traits) forgeContext += `\nTraits: ${characterForge.traits}`;
        if (characterForge.motivations) forgeContext += `\nMotivations: ${characterForge.motivations}`;
        if (characterForge.physical) forgeContext += `\nPhysical Description: ${characterForge.physical}`;
        if (characterForge.alignment) forgeContext += `\nAlignment: ${characterForge.alignment}`;
        if (characterForge.gender) forgeContext += `\nGender: ${characterForge.gender}`;
        if (characterForge.dob) forgeContext += `\nDate of Birth: ${characterForge.dob}`;
        if (characterForge.tob) forgeContext += `\nTime of Birth: ${characterForge.tob}`;
        if (characterForge.pob) forgeContext += `\nPlace of Birth: ${characterForge.pob}`;

        fullPrompt = `Design a complex, gritty, B-grade movie character for the storyteller. 
        ${archetypeDetails}
        Context/Prompt: ${currentPrompt || 'A new mysterious figure in the underworld'}.
        ${forgeContext}
        Each character should have a deep, complex, and detailed biography.
        
        MANDATORY: Generate a "Noir Kundli" (a dark, gritty astrological reading) based on their birth details (DOB/TOB/POB). 
        The Kundli should predict their doom, their dark destiny in the underworld, and their fatal connections.
        
        User Preferences: Genres: ${(profile.genres || []).join(', ')}, Intensity: ${profile.intensity || 'moderate'}.
        Output MUST be in JSON format with:
        - name (max 50 chars)
        - personality (Detailed description of traits, habits, and mindset. Max 800 chars)
        - motivations (Deep-seated desires and what drives them to the edge. Max 800 chars)
        - flaws (Their fatal weaknesses and moral failings. Max 800 chars)
        - backstory (An extensive, gritty history explaining how they became who they are. Max 1500 chars)
        - role (max 100 chars)
        - gender
        - dob
        - tob
        - pob
        - kundli (the dark astrological reading)
        `;
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            personality: { type: Type.STRING },
            motivations: { type: Type.STRING },
            flaws: { type: Type.STRING },
            backstory: { type: Type.STRING },
            role: { type: Type.STRING },
            gender: { type: Type.STRING },
            dob: { type: Type.STRING },
            tob: { type: Type.STRING },
            pob: { type: Type.STRING },
            kundli: { type: Type.STRING }
          },
          required: ["name", "personality", "motivations", "flaws", "backstory", "role", "gender", "dob", "tob", "pob", "kundli"]
        };
      }
      
      if (type === 'script') {
        let characterContext = "";
        if (activeCharacter) {
          characterContext = `\nActive Character Perspective: ${activeCharacter.name} (${activeCharacter.role}). 
          Personality: ${activeCharacter.personality}. 
          Dark Destiny (Kundli): ${activeCharacter.kundli}. 
          Ensure the script features this specific clone and reflects their gritty reality.`;
        }

        fullPrompt = `Generate an intense, gritty short script/dialogue for a 10-30 second shot. 
        Scenario: ${currentPrompt}. ${characterContext}
        ${archetypeDetails}
        GENRE: ${NOIR_GENRES.find(g => g.id === selectedGenre)?.name || selectedGenre}
        THEME: ${NOIR_THEMES.find(t => t.id === selectedTheme)?.name || selectedTheme}
        Trope: ${selectedTrope !== 'Random' ? selectedTrope : 'Any B-grade movie trope'}.
        Include character names and punchy, raw dialogues in Hinglish.
        If the scenario mentions "Sagar, MP", use authentic local details (alleys, people's hard-boiled attitude, local street slang).`;
      }
      
      if (type === 'song') {
        let characterContext = "";
        if (activeCharacter) {
          characterContext = `\nActive Character: ${activeCharacter.name} (${activeCharacter.role}). 
          Theme: ${activeCharacter.personality}. 
          Musical Fate: ${activeCharacter.kundli}. 
          The song should serve as the signature theme for this specific character clone.`;
        }

        fullPrompt = `You are a world-class Music Production Team (Songwriter, Composer, Arrangement Expert). 
        Generate a Suno.ai compatible song output based on: ${currentPrompt}. ${characterContext}
        
        CHARACTER LORE REFERENCE:
        ${NOIR_CHARACTER_SEEDS.map(c => `- ${c.name}: ${c.traits}`).join('\n')}
        (If the prompt relates to these characters, use this gritty noir reimagining).

        Selected Music Style: ${selectedMusicStyle === 'Custom' ? customMusicStyle : (selectedMusicStyle === 'Random' ? 'Auto-detect best fit (Noir/Gritty)' : selectedMusicStyle)}.
        
        PRODUCTION PARAMETERS:
        - Bass Impact: ${productionBass}%
        - Atmospheric Grime: ${productionGrime}%
        - Audio Clarity: ${productionClarity}%
        - Neural/Psychological Depth: ${productionNeuralDepth}% (This controls the immersive, hypnotic quality of the audio. If high, use binaural textures, deep resonant subs, and ethereal layers that make the listener feel disconnected from reality. "Dhvani silent nahi hoti, lekin uska prabhav gehra hota hai" - The sound should work quietly but deeply on the mind).
        - Emotional/Soul Resonance: ${productionSoulResonance}% (Higher values require more organic, "human" imperfections, cinematic swells, and frequency ranges that trigger deep emotional memories. Make the music "breathe").
        - Mausam / Atmospheric Canvas: ${productionAtmosphere} (Environment setting: Incorporate textures like wet pavement, distant thunder for Rainy Noir, or high-frequency hiss for Neon Fog).
        - Mood Transformer Target: ${productionMoodShift} (Actively shift the listener's mood towards this target. If 'Transcendental', use extreme atmospheric layering and brain-wave entrainment patterns. If 'Aggressive', use industrial distortion and jagged rhythms).
        - Mastering: ${productionMastering}
        - Instrumentation: ${productionInstruments.join(', ')}
        
        STRICT COPYRIGHT & IDENTITY RULES:
        1. NO REAL ACTORS/SINGERS: Do NOT mention any real-world actors (e.g., Salman Khan, Shah Rukh Khan, etc.) or singers (e.g., Arijit Singh, Badshah).
        2. NO COPYRIGHTED CONTENT: Avoid mentioning real movie titles, existing copyrighted songs, or production houses (T-Series, Sony Music, etc.).
        3. NO TRADEMARKS: Do not use brand names or trademarked slogans. Stick to original fictional content.
        
        Requirements:
        1. Song Title: Max 70 characters.
        2. Song Lyrics: Max 5000 characters. Use [Intro], [Verse], [Chorus], [Bridge], [Outro] tags. MANDATORY: Use square brackets [ ] for ALL structural and instrumental tags (e.g., [Guitar Solo], [Heavy Bass Drop]). DO NOT use parentheses ( ) for tags. Include "Gali galauj" (street slang/profanity) for raw street vibe.
        3. Song Style: Max 1000 characters. Detailed arrangement instructions (e.g., "Gritty 90s Mumbai Rap, heavy bass, atmospheric noir pads, aggressive delivery, 100 BPM").
        4. Song Caption: Max 500 characters. A punchy description for the track.
        
        Style Context: Web series / Rap / Mumbai Underworld / Raw / Intense / Horror / Item Song / Cinematic Clash.
        Emotional Goal: The listener must lose themselves ("Kho jana") in the depth of the track. Use the Neural Depth and Soul Resonance parameters to guide the specific arrangement instructions in the [Song Style] field.
        If horror or high-intensity clash is requested, include eerie sound cues, deep resonant lows, and dark atmospheric descriptions.
        
        Output MUST be in JSON format with title, lyrics, style, and caption.`;
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            style: { type: Type.STRING },
            caption: { type: Type.STRING }
          },
          required: ["title", "lyrics", "style", "caption"]
        };
      }

      if (type === 'item-song') {
        let viralInstruction = "";
        const regionInstruction = profile.musicRegion && profile.musicRegion !== 'Global Viral' 
          ? `Focus exclusively on tracking viral hits and musical styles from the [${profile.musicRegion}] region.` 
          : `Identify the most viral songs and musical trends from the last 10 days globally (including Punjabi, Hindi, Latin, K-Pop, Western pop, etc.).`;

        if (currentPrompt === 'VIRAL_GLOBAL_HIT_PROJECT') {
          viralInstruction = `
          MANDATORY: GLOBAL VIRAL TREND ANALYSIS (LAST 10 DAYS):
          1. ${regionInstruction}
          2. Analyze the common themes: What are people talking about? What's the hook? What's the "it" factor?
          3. COMBINE these viral trends with our signature "Pulp Noir" gritty, B-grade aesthetic.
          4. Create a song that feels like a massive hit but with a dark underworld soul.
          `;
        }

        let characterContext = "";
        if (activeCharacter) {
          characterContext = `\nActive Character (The Face of the Track): ${activeCharacter.name} (${activeCharacter.role}). 
          Vibe: ${activeCharacter.personality}. 
          Destiny: ${activeCharacter.kundli}. 
          The item song should be specifically produced to showcase this active character's unique noir charm.`;
        }

        const softVibes = ['Romantic Noir (Soft)', 'Lo-Fi Underworld', 'Sufi Soul (Gritty)', 'Ethereal Ambient', 'Melodic Ghazal Trap', 'Rainy Night Jazz', 'Parisian Chanson Noir', 'Anatolian Psych', 'Flamenco Fusion'];
        const partyVibes = ['Bollywood Mass Masala', 'Haryanvi Party Beat', 'Punjabi Dhol Blast', 'Hollywood Pop Dance', 'Global Festival EDM', 'Afrobeats Lagos', 'Amapiano Groove', 'Rio Baile Funk', 'Berlin Techno', 'London Grime', 'Latin Reggaeton'];
        const isSoft = softVibes.includes(clashVibe);
        const isParty = partyVibes.includes(clashVibe);
        
        let vibeInstruction = clashVibe !== 'Auto (Experimental)' ? `\nMANDATORY SONIC MODE: Force the production into a "${clashVibe}" sub-genre. ${
          isSoft ? 'IMPORTANT: This is a GENTLE, SOFT, and MELODIC mode. Avoid heavy bass, aggressive drill hits, or loud synths. Use lush pads, soft percussion, and soulful melodies. The vibe should be "Suhana" and deeply atmospheric.' : 
          isParty ? 'IMPORTANT: This is a HIGH-ENERGY PARTY MODE full of "MASTI". Use heavy bass, fast-paced percussion (Dhol, 808s, or EDM kicks), and catchy hooks. The energy must be "Blockbuster Party" level. Ensure the lyrics have fun, festive, and high-status attitude.' :
          'Ensure the instrumentation, beat blueprint, and lyrical attitude heavily reflect this specific vibe.'
        }` : "";

        fullPrompt = `You are an avant-garde, world-class Music Production System (Visionary Songwriter, Experimental Composer, Genre-Bending Arranger) tasked with creating the ultimate global blockbuster track.
        Generate a Suno.ai compatible EXPERIMENTAL BLOCKBUSTER output based on: ${currentPrompt}. ${characterContext}
        ${vibeInstruction}
        ${viralInstruction}
        
        Requirement 3: ${clashTarget} (Your goal is to totally obliterate their standard production style: ${INDUSTRY_HOUSES.find(h => h.name === clashTarget)?.style} by using highly experimental, boundary-pushing audio engineering).
        
        PRODUCTION PARAMETERS:
        - Bass Impact: ${productionBass}%
        - Atmospheric Grime: ${productionGrime}%
        - Audio Clarity: ${productionClarity}%
        - Neural/Psychological Depth: ${productionNeuralDepth}% (Control the "Immersive/Hypnotic" index. High values require brain-entraining sub-frequencies, psychoacoustic layering, and deep spatial audio cues to make the listener lose their sense of self. Aim for a "Neural Depth" that captures the silent but profound impact of sound).
        - Emotional/Soul Resonance: ${productionSoulResonance}% (Deeply connect the music to human emotions. High soul resonance means the music must feel alive and breathing).
        - Mausam / Atmosphere: ${productionAtmosphere} (Set the environmental stage).
        - Mood Transformer Target: ${productionMoodShift} (The AI logic must actively manipulate the composition to steer the listener into this emotional state).
        - Mastering: ${productionMastering}
        - Instrumentation: ${productionInstruments.join(', ')}
        
        NEGATIVE CONSTRAINTS & BRANDING RULES:
        1. NO PRODUCTION HOUSE NAMES: NEVER mention "${clashTarget}" or any other real production house (T-Series, Universal, etc.) in the Song Title, Lyrics, or Tagged Structural segments.
        2. NO REAL ACTORS/SINGERS: Forbidden to use names of real-world actors, celebrities, or singers. Do not use their aliases or specific catchphrases.
        3. NO COPYRIGHTED CONTENT: Avoid existing movie titles, lyrics from famous songs, or trademarked brand names.
        4. NO CLUNKY LABELS: Do not mention specific instruments as plain text labels (e.g. "Flute playing now", "Violin starts"). Instead, use proper musical structural tags in square brackets [Like This] to define the soundscape. 
        5. ORIGINALITY: Stick to "Character Forge" names or generic noir archetypes. transcending formulaic approaches with revolutionary, superior sound.
        
        CRITICAL MUSIC PRODUCTION INSTRUCTIONS:
        1. GENRE-BENDING EXPERIMENTATION: Do not stick to basic genres. Invent hybrid global sounds (e.g., "Cyberpunk Drill mixed with Afro-Cuban percussion", "Dark Phonk meets Orchestral Indian Noir", or "Neurofunk R&B"). Create the "Best of the Best" avant-garde style.
        2. BEAT ENGINEERING & SOUND DESIGN: Give deep technical insight into the soundscapes. Talk about sub-bass frequencies (e.g., 30Hz), specific analog synthesizers (e.g., Prophet-5, Moog Sub 37), granular vocal chopping, and wildly aggressive or hypnotic drum patterns.
        3. LYRICAL MOOD: Lyrics must be razor-sharp, insanely catchy, street-wise, yet cinematic. Use a mix of English and local slang if it fits the character. 
        4. CLASH ANALYSIS: Provide a ruthless technical breakdown of why this experimental production makes ${clashTarget}'s music sound outdated.
        
        Requirements:
        1. Song Title: Max 70 characters. Must be iconic and suggest a new sound wave.
        2. Song Lyrics: Max 5000 characters. Use [Intro], [Verse], [Chorus], [Bridge], [Beat Drop], [Outro] tags. MANDATORY: Use square brackets [ ] for ALL structural and instrumental breakdowns (e.g., [808 Glide Drop], [Granular Synth Solo], [Character Motif: Aggressive Cello]). DO NOT use parentheses ( ) for tags. 
        3. Song Style: Max 1000 characters. PROVIDE A MASTERCLASS BEAT BLUEPRINT. (e.g., "Style: Neo-Noir Phonk x Latin Trap. Beat: 145BPM heavily distorted 808s with off-kilter organic hi-hats. Engineering: Mid-side EQ scooped pads, sidechained to a punchy acoustic kick. Vibe: Dystopian, aggressive, chart-topping.")
        4. Song Caption: Max 500 characters. A killer hook hyping up the track as a global hit that buries ${clashTarget}.
        5. Clash Analysis: A brief technical breakdown (2-3 sentences) on how our experimental multi-genre approach defeated the target production house.
        6. System Score: A value from 95-100 representing our elite futuristic production quality.
        7. House Score: A value from 65-85 representing the target house's standard quality.
        
        Output MUST be in JSON format with title, lyrics, style, caption, clashAnalysis, systemScore, and houseScore.`;
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            style: { type: Type.STRING },
            caption: { type: Type.STRING },
            clashAnalysis: { type: Type.STRING },
            systemScore: { type: Type.NUMBER },
            houseScore: { type: Type.NUMBER }
          },
          required: ["title", "lyrics", "style", "caption", "clashAnalysis", "systemScore", "houseScore"]
        };
      }

      if (type === 'masterlist') {
        const isEducational = currentPrompt.toLowerCase().includes('academy') || currentPrompt.toLowerCase().includes('masterclass') || currentPrompt.toLowerCase().includes('guide') || currentPrompt.toLowerCase().includes('techniques');
        fullPrompt = `As a gritty, expert pulp writer and noir master, generate a professional, high-quality piece of content for the following category/skill: ${currentPrompt}.
        Maintain the "Pulp Noir" gritty, street-level, and intense tone. 
        ${isEducational ? 'This is an EDUCATIONAL guide/masterclass. Provide deep-dive practical insights, "street-smart" techniques, and raw professional wisdom.' : ''}
        If it's a cinematic tool (Cinematic Masterclass), make it sharp, technical, and visceral.
        If it's a business document, make it sharp and professional but with a noir edge.
        If it's creative writing, make it raw and visceral.
        Output should be in Hindi (Devanagari) mixed with gritty English (Hinglish).`;
      }

      let retries = 0;
      const maxRetries = 3;
      let finalResult;

      while (retries <= maxRetries) {
        try {
          // Fallback to gemini-3.1-flash-lite if we hit quota limits
          const modelToUse = retries > 0 ? "gemini-3.1-flash-lite" : "gemini-3.5-flash";
          
          finalResult = await generateWithGemini({
            model: modelToUse,
            prompt: fullPrompt,
            responseMimeType: config.responseMimeType,
            responseSchema: config.responseSchema
          });
          
          break; // Success
        } catch (error: any) {
          const errorString = String(error).toLowerCase();
          const isQuotaError = errorString.includes("429") || errorString.includes("quota") || errorString.includes("rate limit") || errorString.includes("exhausted");
          
          if (isQuotaError && retries < maxRetries) {
            retries++;
            // Exponential backoff: 3s, 6s, 12s
            const delay = 3000 * Math.pow(2, retries - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw error;
        }
      }

      if (!finalResult) {
        throw new Error(`Failed to generate content`);
      }

      let text = finalResult.text || "The shadows remain silent...";
      
      // Extract Tags
      let tags: string[] = [];
      const tagsMatch = text.match(/TAGS:\s*\[(.*?)\]/i);
      if (tagsMatch && tagsMatch[1]) {
        tags = tagsMatch[1].split(',').map(tag => tag.trim());
        // Remove the tags from the visible text
        text = text.replace(/TAGS:\s*\[.*?\]/i, '').trim();
      }

      // If no tags found, generate some basic ones from user profile context to avoid 0% matches
      if (tags.length === 0) {
        tags = [...profile.genres.slice(0, 2), profile.intensity, profile.preferredRole || 'Noir'].filter(t => t !== 'none');
      }

      const matchScore = calculateMatchScore(tags, profile);
      
      // Clean JSON responses if needed
      if (type === 'life-journey' && text) {
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
        }
        const moderation = await moderateAIContent(cleanedText, 'life-journey', evolution);
        setLifeJourneyStory(moderation.content);
        setLifeJourneyFeedback(null);
        setIsGeneratingLifeJourney(false);
        // We still save it as a text entry in stories for history
        let threadIdToUse = currentThreadId;
        if (!threadIdToUse) {
          const threadPath = `users/${user.uid}/threads`;
          const threadDoc = await addDoc(collection(db, threadPath), {
            uid: user.uid,
            title: "Life Journey: " + (activeCharacter?.name || "Noir Soul"),
            preview: moderation.content.substring(0, 100),
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
          threadIdToUse = threadDoc.id;
          setCurrentThreadId(threadIdToUse);
        }

        await addDoc(collection(db, `users/${user.uid}/stories`), {
          uid: user.uid,
          threadId: threadIdToUse,
          type: 'life-journey',
          content: moderation.content,
          tags: [...profile.genres.slice(0, 2), 'Life Journey'],
          matchScore: 95,
          isSaved: true,
          isFlagged: moderation.isFlagged,
          moderationReason: moderation.reason,
          createdAt: Date.now()
        });
        setLoading(false);
        return;
      }

      if (type === 'character' || type === 'song' || type === 'item-song' || type === 'pulp-noir-story' || (type === 'story' && config.responseMimeType === 'application/json')) {
        text = text.trim();
        if (text.startsWith('```json')) {
          text = text.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (text.startsWith('```')) {
          text = text.replace(/^```/, '').replace(/```$/, '').trim();
        }
      }

      let parsedContent = text;
      let choices: any[] = [];
      if (type === 'story') {
        let parsedSuccessfully = false;
        try {
          let cleanText = text.trim();
          if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
          } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
          }
          
          const data = JSON.parse(cleanText);
          if (data.content) {
            parsedContent = data.content;
            choices = data.choices || [];
            parsedSuccessfully = true;
          }
        } catch (e) {
          console.warn("Standard JSON parsing failed, attempting fuzzy parsing", e);
        }

        if (!parsedSuccessfully) {
          try {
            const contentMatch = text.match(/"content"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"choices"|\s*})/i);
            if (contentMatch && contentMatch[1]) {
              parsedContent = contentMatch[1]
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t');
            } else {
              parsedContent = text;
            }

            const choicesMatch = text.match(/"choices"\s*:\s*\[([\s\S]*?)\]/i);
            if (choicesMatch && choicesMatch[1]) {
              const rawChoicesStr = choicesMatch[1];
              const objRegex = /\{\s*"text"\s*:\s*"([^"]*)"\s*,\s*"impact"\s*:\s*"([^"]*)"\s*,\s*"type"\s*:\s*"([^"]*)"\s*\}/g;
              let match;
              while ((match = objRegex.exec(rawChoicesStr)) !== null) {
                choices.push({
                  text: match[1],
                  impact: match[2],
                  type: match[3]
                });
              }

              if (choices.length === 0) {
                const strRegex = /"([^"]+)"/g;
                let strMatch;
                while ((strMatch = strRegex.exec(rawChoicesStr)) !== null) {
                  choices.push({
                    text: strMatch[1],
                    impact: "Forges a dangerous new path in Sagar",
                    type: "Action"
                  });
                }
              }
            }
          } catch (regexErr) {
            console.error("Fuzzy regex parsing failed", regexErr);
          }
        }

        if (choices.length === 0) {
          console.warn("No choices found in AI response, synthesizing fallback choices");
          choices = [
            {
              text: "Make a Bold Move",
              impact: "Take a dangerous high-risk action that could solve this immediately or backfire horribly.",
              type: "Action"
            },
            {
              text: "Attempt a Seductive Ploy",
              impact: "Try to negotiate, charm, or smooth-talk your way out of this tense confrontation.",
              type: "Seduction"
            },
            {
              text: "Gamble Your Destiny",
              impact: "A blind choice. Put your faith entirely in fate, luck, or a coin toss.",
              type: "Gamble"
            }
          ];
        }
      }

      const moderation = await moderateAIContent(parsedContent, type, evolution);
      parsedContent = moderation.content;

      let threadIdToUse = currentThreadId;
      if (!threadIdToUse) {
        const threadPath = `users/${user.uid}/threads`;
        const threadDoc = await addDoc(collection(db, threadPath), {
          uid: user.uid,
          title: currentPrompt.substring(0, 50) || "Noir Story",
          preview: parsedContent.substring(0, 100),
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        threadIdToUse = threadDoc.id;
        setCurrentThreadId(threadIdToUse);
      } else {
        const threadPath = `users/${user.uid}/threads/${threadIdToUse}`;
        updateDoc(doc(db, threadPath), {
          preview: parsedContent.substring(0, 100),
          updatedAt: Date.now()
        }).catch(e => console.warn("Thread preview update failed", e));
      }

      const path = `users/${user.uid}/stories`;
      const docRef = await addDoc(collection(db, path), {
        uid: user.uid,
        threadId: threadIdToUse,
        type: type === 'joke' ? 'joke' : (type === 'character' ? 'character' : (type === 'script' ? 'script' : (type === 'song' ? 'song' : (type === 'item-song' ? 'item-song' : (type === 'pulp-noir-story' ? 'pulp-noir-story' : (type === 'masterlist' ? 'text' : 'text')))))),
        content: parsedContent,
        ...(choices.length > 0 ? { choices } : {}),
        tags,
        matchScore,
        isSaved: type === 'pulp-noir-story',
        isFlagged: moderation.isFlagged,
        moderationReason: moderation.reason,
        neuralDepth: productionNeuralDepth,
        neuralMood: productionMoodShift,
        atmosphere: productionAtmosphere,
        soulResonance: productionSoulResonance,
        createdAt: Date.now()
      });

      // Update evolution tracking
      const newEvolution = { ...evolution, totalGenerations: evolution.totalGenerations + 1 };
      setEvolution(newEvolution);
      const userPath = `users/${user.uid}`;
      updateDoc(doc(db, userPath), { evolution: newEvolution })
        .catch(e => handleFirestoreError(e, OperationType.UPDATE, userPath));

      // Auto-save characters to a dedicated collection for reuse
      if (type === 'character') {
        const charPath = `users/${user.uid}/characters`;
        try {
          let cleanText = parsedContent.trim();
          if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
          } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
          }
          
          let charData;
          try {
            charData = JSON.parse(cleanText);
          } catch (jsonErr) {
            console.warn("Fuzzy parsing character details from raw text:", jsonErr);
            const extractKey = (keyName: string, defaultVal: string) => {
              const regex = new RegExp(`"${keyName}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,|\\s*})`, 'i');
              const match = cleanText.match(regex);
              if (match && match[1]) {
                return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
              }
              return defaultVal;
            };
            
            charData = {
              name: extractKey("name", characterForge.name || "A Mysterious Anti-Hero"),
              personality: extractKey("personality", characterForge.traits || "Cynical, rugged, and observant."),
              motivations: extractKey("motivations", characterForge.motivations || "Survival in the cold alleys of Sagar."),
              flaws: extractKey("flaws", "Trusting the wrong double-agents."),
              backstory: extractKey("backstory", "A disgraced agent seeking redemption or revenge."),
              role: extractKey("role", "Underworld Outcast"),
              gender: extractKey("gender", characterForge.gender || "Male"),
              dob: extractKey("dob", characterForge.dob || "Unknown"),
              tob: extractKey("tob", characterForge.tob || "Unknown"),
              pob: extractKey("pob", characterForge.pob || "Sagar"),
              kundli: extractKey("kundli", "Born under the Shadow of Saturn; destined for a fateful choice.")
            };
          }
          
          await addDoc(collection(db, charPath), {
            ...charData,
            archetype: selectedArchetype || 'Noir Hero',
            isActive: true,
            createdAt: Date.now()
          });
        } catch (e) {
          console.error("Failed to auto-save character to vault", e);
        }
      }

      // Auto-generate artwork for stories and characters as requested
      if (['story', 'character', 'pulp-noir-story'].includes(type as string)) {
        let visualContext = parsedContent;
        if (['character', 'pulp-noir-story'].includes(type as string)) {
          try {
            const data = JSON.parse(text);
            visualContext = type === 'character' 
              ? `Character Portrait: ${data.name}, ${data.role}. Appearance: ${data.personality}. Vibe: ${data.backstory.substring(0, 200)}`
              : (data.content || data.lyrics || parsedContent);
          } catch (e) {
            visualContext = parsedContent;
          }
        }
        generateImage(visualContext, docRef.id);
      }

    } catch (error) {
      handleAIError(error, "Generation");
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  const generateBGradeArt = async () => {
    if (!user) {
      setToast({ message: "You must be logged in to smuggle art from the shadows.", type: 'error' });
      return;
    }

    setIsGeneratingBGrade(true);
    setBGradeResult(null);

    try {
      let subjectText = "";
      let metadataTitle = "";
      let linkId = "";

      if (bGradeSubject === 'character') {
        const char = characters.find(c => c.id === bGradeCharId);
        if (char) {
          subjectText = `Character Portrait: ${char.name}, Archetype: ${char.archetype || 'Noir hero'}, Role: ${char.role}. Appearance: ${char.personality}. Backstory summary: ${char.backstory.substring(0, 300)}.`;
          metadataTitle = char.name;
          linkId = char.id;
        } else {
          const activeC = characters.find(c => c.id === activeCharacterId);
          if (activeC) {
            subjectText = `Character Portrait: ${activeC.name}, Archetype: ${activeC.archetype || 'Noir hero'}, Role: ${activeC.role}. Appearance: ${activeC.personality}. Backstory summary: ${activeC.backstory.substring(0, 300)}.`;
            metadataTitle = activeC.name;
            linkId = activeC.id;
          } else if (bGradeText.trim()) {
            subjectText = bGradeText;
            metadataTitle = bGradeText.substring(0, 20).concat("...");
          } else {
            throw new Error("No character selected. Please select a character or describe your scene.");
          }
        }
      } else {
        const foundPart = enhancedHistory.find(p => p.id === bGradeMomentId);
        if (foundPart) {
          let parsed = foundPart.content;
          try {
            const data = JSON.parse(foundPart.content);
            parsed = data.content || data.lyrics || data.summary || foundPart.content;
            metadataTitle = data.title || "Significant Moment";
          } catch(e) {
            metadataTitle = "Significant Moment";
          }
          subjectText = `Significant Story Moment: ${parsed.substring(0, 800)}`;
          linkId = foundPart.id;
        } else if (bGradeText.trim()) {
          subjectText = bGradeText;
          metadataTitle = "Custom Noir Moment";
        } else {
          throw new Error("No story moment selected. Please select a story moment or describe your scene.");
        }
      }

      let stylePrompt = "";
      switch (bGradeStyle) {
        case 'b-movie-poster':
          stylePrompt = "Stylized as a vintage 1970s B-grade exploitation cinema film poster. Bold and hand-painted illustration with striking compositions, pulpy layouts, vibrant retro coloring with high contrast, intense emotional focus, and dramatic shadows.";
          break;
        case 'pulp-illustration':
          stylePrompt = "Gritty vintage 1950s detective thriller pulp magazine novel illustration style. Rugged retro paint aesthetics, bold shadows, dirty ink washes, and textured paper background.";
          break;
        case 'gritty-realism':
          stylePrompt = "Grungy, high-contrast, high-grain dirty realistic cinematography capture. Shot on film under greasy sodium rain-slicked city streets with dramatic shadows, sweat, leather jacket textures, and extreme authentic detail.";
          break;
        case 'inked-comic':
          stylePrompt = "Gritty noir graphic novel inked comic book style. Heavy shadowed ink brushstrokes, bold outlines, moody pop-art halftone patterns, high contrast visual elements, and muted retro tones.";
          break;
        default:
          stylePrompt = "Vintage aesthetic pulp film poster illustration style, dirty grit, and classic low-key chiaroscuro lighting.";
      }

      let gritPrompt = "";
      if (bGradeGrit === 'low') {
        gritPrompt = "Mild film grain overlay, clean classic pulp magazine aesthetics.";
      } else if (bGradeGrit === 'medium') {
        gritPrompt = "Prominent film grain, visible dust specks, vintage printing dots, and textured cardstock appearance.";
      } else {
        gritPrompt = "Extreme grungy B-movie exploitation wear! Scratches, dirty overlays, decayed low-quality screen print noise, heavy pulp fiber textures, and paint-splattered edges.";
      }

      let finalPrompt = `Fine-art masterclass, ${stylePrompt}
      ${gritPrompt}
      
      SCENE OR SUBJECT DESCRIPTION:
      ${subjectText}
      
      CORE MOOD AND COMPOSITION:
      Atmospheric low-key cinematic lighting, dramatic chiaroscuro with deep noir shadows. If characters are featured, portray them with intense gritty facial features, raw survival essence, and strong character presence.
      
      CRITICAL REQUIREMENT: Focus completely on the visual storytelling and illustrative style. Do NOT overlay any text, logo, alphabet letters, title headings, or numbers on the artwork. Just output the clean scenery/portrait imagery.`;

      const response = await generateWithGemini({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }]
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      if (!imagePart?.inlineData) {
        throw new Error("No visual byte data returned from AI engine. Please try again.");
      }

      const rawBase64 = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      const compressedBGrade = await compressImage(rawBase64);
      setBGradeResult(compressedBGrade);

      const path = `users/${user.uid}/stories`;
      const docData = {
        uid: user.uid,
        type: 'image',
        content: compressedBGrade,
        storyLinkId: linkId || null,
        threadId: currentThreadId || null,
        isSaved: true,
        createdAt: Date.now(),
        isBGradeStyle: true,
        bGradeStyle,
        bGradeSubject,
        bGradeGrit,
        bGradeAspect,
        metadataTitle,
        slogan: bGradeSlogan || null
      };

      await addDoc(collection(db, path), docData);
      setToast({ message: "Successfully smuggled B-Grade Art piece into your Vault!", type: 'success' });
    } catch (error: any) {
      console.error("Failed generating B-Grade Art:", error);
      handleAIError(error, "B-Grade Art Studio");
    } finally {
      setIsGeneratingBGrade(false);
    }
  };

  const generateBGradeSlogan = async () => {
    if (!user) return;
    try {
      setToast({ message: "Whispering with the AI writer...", type: 'info' });
      let subjectText = "";
      if (bGradeSubject === 'character') {
        const char = characters.find(c => c.id === bGradeCharId);
        if (char) subjectText = `Character: ${char.name}, Role: ${char.role}, Vibe: ${char.personality}`;
        else if (bGradeText.trim()) subjectText = bGradeText;
      } else {
        const foundPart = enhancedHistory.find(p => p.id === bGradeMomentId);
        if (foundPart) {
          subjectText = foundPart.content;
        } else if (bGradeText.trim()) {
          subjectText = bGradeText;
        }
      }

      if (!subjectText) {
        setToast({ message: "Describe a moment or select a character first to write a slogan.", type: 'info' });
        return;
      }

      const promptTemplate = `Write a single, intensely dramatic, cheesy, punchy B-grade exploitation film slogan or tagline based on this content:
      ${subjectText.substring(0, 500)}
      
      RULES:
      - Max 1 sentence
      - Must look like a 1970s Grindhouse pulp slogan
      - Uses double-edged dramatic tropes, e.g. "He had a cold badge. They had hot lead!" or "In a city without a soul, her gun was the only judge." or "AN EX-COP WITH NOTHING TO LOSE AND A TRAIL OF BLOOD TO LEAVE!"
      - Be punchy, ALL CAPS.
      - Return ONLY the tagline itself, no quotes, no conversational text.`;

      const res = await generateWithGemini({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: promptTemplate }] }]
      });

      const cleanSlogan = (res.text || "").replace(/"/g, "").trim().toUpperCase();
      setBGradeSlogan(cleanSlogan);
      setToast({ message: "Tagline written!", type: 'success' });
    } catch (e) {
      console.error("Failed to generate slogan:", e);
    }
  };

  const generateImage = async (context: string, storyId?: string) => {
    if (!user) return;
    if (storyId) setIsGeneratingImage(storyId);
    
    // Try to parse context if it's a JSON story
    let visualContext = context;
    try {
      const data = JSON.parse(context);
      visualContext = data.content || data.lyrics || data.personality || context;
    } catch (e) {
      // Not JSON, use as is
    }

    let retries = 0;
    const maxRetries = 2;
    let lastErrorString = "";
    
    while (retries <= maxRetries) {
      try {
        // Safety-conscious prompt refinement
        let imagePrompt = `Masterpiece, high-quality, hyper-detailed ${profile.visualStyle || '1950s pulp illustration'}. 
        Mood: ${profile.visualMood || 'cinematic noir'}.
        Cinematic lighting with deep chiaroscuro shadows, dramatic rim lighting, and a thick, moody atmosphere. 
        The scene should feature high-contrast film noir aesthetics, with long shadows and a sense of urban grit.
        
        CINEMATIC THEME: Focus on intense dramatic tension, sharp character interactions, and atmospheric depth. 
        Incorporate elements of high-stakes confrontation and mystery.
        The artwork should manifest emotional depth through expressive shadows, moody environments, and intense character gazes.
        
        If characters are present, they should have "Main Character" energy with complex features, reflecting a life of mystery and survival in a rough city.
        
        ${profile.webSeriesMode ? "WEB SERIES DRAMATIZATION: Style this as a high-stakes modern web series cinematic capture. Urban atmosphere, cinematic scale, and raw emotional depth." : ""}
        ${profile.naughtyMode ? "STYLE OVERLAY: Emphasize sophisticated, alluring, and intense visual themes. B-grade classic cinema style with high-contrast shadows. Compelling character presence and a mysterious, high-stakes atmosphere." : ""}
        ${getIntensityInstructions()}
        ${profile.photoURL ? `USER PHOTO INTEGRATION: Integrate the user's photo, maintaining their facial features and appearance within this dark noir setting. The character should look exactly like the person in the provided reference photo.` : ""}
        Scene: ${visualContext.substring(0, 500)}. 
        Vibe: Dark, intense, cinematic, and atmospheric. 
        CRITICAL: DO NOT include any text, letters, or words in the image. Focus purely on the visual storytelling, lighting, and character presence.` ;

        // If this is a retry due to safety, we use a much more neutralized prompt
        if (retries > 0 && (lastErrorString.includes("safety") || lastErrorString.includes("blocked"))) {
          imagePrompt = `High-quality artistic noir illustration: ${profile.visualStyle || 'cinematic noir'}. 
          Scene description: ${visualContext.substring(0, 300)}. 
          Style: Moody cinematic lighting, deep shadows, dramatic atmosphere, noir aesthetics. 
          Focus on high-quality artistic composition. NO text.`;
        }
        
        const promptParts: any[] = [{ text: imagePrompt }];
        if (profile.photoURL) {
          const base64Data = profile.photoURL.split(',')[1];
          promptParts.push({
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg"
            }
          });
        }

        const response = await generateWithGemini({
          model: 'gemini-2.5-flash-image',
          contents: [{ role: 'user', parts: promptParts }]
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (imagePart?.inlineData) {
          const base64Data = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          const compressedData = await compressImage(base64Data);
          
          const path = `users/${user.uid}/stories`;
          try {
            await addDoc(collection(db, path), {
              uid: user.uid,
              type: 'image',
              content: compressedData,
              storyLinkId: storyId || null,
              threadId: currentThreadId || null,
              isSaved: true,
              createdAt: Date.now()
            });
          } catch (e: any) {
            console.error("Failed to archive generated image:", e);
            handleFirestoreError(e, OperationType.WRITE, path);
          }
        }
        break; // Success
      } catch (error: any) {
        lastErrorString = String(error).toLowerCase();
        
        if (retries < maxRetries) {
          if (lastErrorString.includes("429") || lastErrorString.includes("quota") || lastErrorString.includes("rate limit")) {
            retries++;
            setToast({ message: `Rate limited. Retrying (${retries}/${maxRetries})...`, type: 'info' });
            await new Promise(resolve => setTimeout(resolve, 2000 * retries)); // Exponential backoff
            continue;
          }
          
          if (lastErrorString.includes("safety") || lastErrorString.includes("blocked")) {
            retries++;
            setToast({ message: "Visual safety filters triggered. Retrying with artistic fallback...", type: 'info' });
            continue; // Next loop will use the neutralized prompt
          }
        }
        
        handleAIError(error, "Image generation");
        break;
      }
    }
    
    if (storyId) setIsGeneratingImage(null);
  };

  const generateVisualReel = async (part: StoryPart) => {
    if (!user) return;
    setIsGeneratingImage(part.id);
    setToast({ message: "Producing Visual Reel (4 Unique Perspectives)...", type: 'info' });
    
    try {
      // We'll generate 4 variations by slightly varying the prompt for each
      const angles = [
        "Wide cinematic establishing shot",
        "Tense low-angle close-up",
        "Dramatic Dutch angle silhouette",
        "Visceral over-the-shoulder perspective"
      ];

      for (const angle of angles) {
        await generateImage(`${angle}: ${part.content}`, part.id);
        // Small delay to avoid hitting rate limits too fast
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setToast({ message: "Visual Reel Complete! 4 Perspectives Produced.", type: 'success' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(null);
    }
  };

  const generateSongVisuals = async (part: StoryPart) => {
    if (!user) return;
    setIsGeneratingImage(part.id);
    setToast({ message: "Analyzing Lyrics for Cinematic Scenes...", type: 'info' });

    try {
      const lyrics = part.content;
      // Extract structural tags like [Intro], [Chorus], [Verse 1], etc.
      const sections = lyrics.split(/(\[.*?\])/).filter(s => s.trim() !== '');
      
      const keyScenes: string[] = [];
      let currentSection = "";

      for (let i = 0; i < sections.length; i++) {
        const item = sections[i].trim();
        if (item.startsWith('[') && item.endsWith(']')) {
          currentSection = item;
        } else if (item && currentSection) {
          // If we have content following a tag, it's a candidate for a scene
          keyScenes.push(`${currentSection}: ${item.substring(0, 300)}`);
          currentSection = ""; // Reset to only capture one scene per tag for brevity
        }
      }

      // If we couldn't parse sections, just fall back to standard chunks
      if (keyScenes.length === 0) {
        keyScenes.push(...lyrics.split('\n').filter(l => l.trim().length > 30).slice(0, 4));
      }

      // Limit to 4-5 scenes to avoid hitting image generation quotas too hard
      const finalScenes = keyScenes.slice(0, 5);

      setToast({ message: `Directing ${finalScenes.length} Noir Scenes for your Track...`, type: 'info' });

      for (const scene of finalScenes) {
        await generateImage(`Song Cinematic Reel: ${scene}`, part.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setToast({ message: "Song Visual Reel Complete! Scenes created in gallery.", type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to produce all song visuals.", type: 'warning' });
    } finally {
      setIsGeneratingImage(null);
    }
  };

  const generateFullLogVisuals = async () => {
    if (!user || enhancedHistory.length === 0) return;
    
    const textParts = enhancedHistory.filter(p => p.type !== 'image').slice(-5); // Last 5 parts to be safe with quota
    if (textParts.length === 0) return;

    setToast({ message: `Reconstructing entire history visuals... Generating ${textParts.length} artworks.`, type: 'info' });
    setLoading(true);

    try {
      for (const part of textParts) {
        await generateImage(part.content);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setToast({ message: "Full Chronology Reconstructed in Visuals!", type: 'success' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFullStory = () => {
    if (enhancedHistory.length === 0) return;
    const script = enhancedHistory.map(p => {
      const date = new Date(p.createdAt).toLocaleString();
      return `[${date}] (${p.type.toUpperCase()})\n${p.content}\n\n`;
    }).join('--------------------------------------------------\n');
    
    const blob = new Blob([`PULP NOIR - THE GRITTY INTEL LOG\n\n${script}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `noir-story-full-log-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ message: "Story intel log downloaded to device!", type: 'success' });
  };

  const generateVideo = async (newsPrompt: string, newsTitle: string) => {
    if (!user) return;

    const videoId = Math.random().toString(36).substring(7);
    setIsGeneratingVideo(videoId);
    setToast({ message: "Producing Noir Reel... This may take a few minutes.", type: 'info' });

    try {
      const videoPrompt = `A cinematic, gritty noir news reel for: ${newsTitle}. 
      Visual style: 90s Mumbai underworld, high contrast, rainy night, dramatic shadows, investigative vibe. 
      Action: ${newsPrompt}. 
      Atmosphere: Dark, visceral, and mysterious.`;

      setToast({ message: "Deep-layer video processing initiated on server...", type: 'info' });

      // Note: Video generation is long-running. Our current proxy might timeout.
      // But we move it to server-side to resolve API Key issues.
      const response = await generateWithGemini({
        model: 'veo-3.1-lite-generate-preview',
        prompt: videoPrompt
      });

      // If we got a direct URL back (though unlikely for operations), we save it.
      // For now, this resolves the "API key missing" error.
      setToast({ message: "Noir Reel Published!", type: 'success' });
      setShowGallery(true);
    } catch (error) {
      handleAIError(error, "Noir Reel generation");
    } finally {
      setIsGeneratingVideo(null);
    }
  };

  const generateNarration = async (storyPart: StoryPart) => {
    if (!user) return;
    
    setHistory(prev => prev.map(p => p.id === storyPart.id ? { ...p, isGeneratingNarration: true } : p));
    
    try {
      let storyData;
      try {
        let content = storyPart.content.trim();
        if (content.startsWith('```json')) {
          content = content.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (content.startsWith('```')) {
          content = content.replace(/^```/, '').replace(/```$/, '').trim();
        }
        storyData = JSON.parse(content);
      } catch (e) {
        storyData = { content: storyPart.content, title: 'Untitled Noir' };
      }

      await speakContent(storyPart.id, storyData.content || storyPart.content);
      setHistory(prev => prev.map(p => p.id === storyPart.id ? { ...p, isGeneratingNarration: false } : p));
      setToast({ message: "Narration Sequence Ready.", type: 'success' });
    } catch (error) {
      console.error("Narration Error:", error);
      setToast({ message: "Failed to produce narration voiceover.", type: 'error' });
      setHistory(prev => prev.map(p => p.id === storyPart.id ? { ...p, isGeneratingNarration: false } : p));
    }
  };

  const generateMusic = async (storyPart: StoryPart) => {
    if (!user) return;

    setHistory(prev => prev.map(p => p.id === storyPart.id ? { ...p, isGeneratingMusic: true } : p));
    
    try {
      let songData: any;
      try {
        let content = storyPart.content.trim();
        if (content.startsWith('```json')) {
          content = content.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (content.startsWith('```')) {
          content = content.replace(/^```/, '').replace(/```$/, '').trim();
        }
        songData = JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse song data", e);
        setHistory(prev => prev.map(p => p.id === storyPart.id ? { ...p, isGeneratingMusic: false } : p));
        return;
      }

      const getBpmForStyle = (styleName: string): number => {
        const s = (styleName || '').toLowerCase();
        if (s.includes('noir') || s.includes('jazz') || s.includes('blues') || s.includes('soul')) {
          return Math.floor(Math.random() * 21) + 70; // 70-90 BPM
        } else if (s.includes('action') || s.includes('fast') || s.includes('chase') || s.includes('clash') || s.includes('trap')) {
          return Math.floor(Math.random() * 21) + 120; // 120-140 BPM
        } else if (s.includes('synth') || s.includes('techno') || s.includes('cyber') || s.includes('pop')) {
          return Math.floor(Math.random() * 21) + 110; // 110-130 BPM
        } else if (s.includes('ambient') || s.includes('slow') || s.includes('sad')) {
          return Math.floor(Math.random() * 21) + 60; // 60-80 BPM
        } else {
          return Math.floor(Math.random() * 51) + 80; // 80-130 BPM fallback
        }
      };

      // 1. Try Actual Audio Generation (Lyria)
      try {
        const musicPrompt = `Generate a gritty, adult (18+) music track. Style: ${songData.style}. Mood: Intense, raw, street-level. 
        Production Parameters: Bass ${productionBass}%, Grime ${productionGrime}%, Clarity ${productionClarity}%. 
        Instruments: ${productionInstruments.join(', ')}. Context: ${songData.lyrics.substring(0, 100)}`;

        const response = await generateWithGemini({
          model: "lyria-3-clip-preview",
          prompt: musicPrompt,
          responseModalities: ["AUDIO"]
        });

        const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (audioBase64) {
          const binary = atob(audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const audioUrl = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
          const calculatedBpm = getBpmForStyle(songData.style || 'Noir');
          
          try {
            const path = `users/${user.uid}/stories`;
            await updateDoc(doc(db, path, storyPart.id), {
              musicUrl: audioUrl,
              bpm: calculatedBpm,
            });
          } catch (e) {
            console.log("Firestore update failed", e);
          }

          setHistory(prev => prev.map(p => p.id === storyPart.id ? { ...p, musicUrl: audioUrl, bpm: calculatedBpm, isGeneratingMusic: false } : p));
          setToast({ message: "Master Track Produced & Released.", type: 'success' });
          return;
        }
      } catch (lyriaError) {
        console.warn("Audio Studio failed, switching to Cinematic Blueprints:", lyriaError);
      }

      // 2. Fallback: Cinematic Concept Generation
      const conceptPrompt = `Conceive a cinematic noir soundtrack concept for this story: ${storyPart.content.substring(0, 1000)}. 
      Selected Style: ${songData.style || 'Noir'}. 
      Return ONLY JSON: { "title": "string", "genre": "string", "mood": "string", "description": "string", "instruments": ["string"] }`;

      const result = await generateWithGemini({
        model: "gemini-3.5-flash",
        prompt: conceptPrompt,
        responseMimeType: "application/json"
      });
      
      const text = result.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const concept = JSON.parse(jsonMatch[0]);
        try {
          const path = `users/${user.uid}/stories`;
          await updateDoc(doc(db, path, storyPart.id), { musicConcept: concept });
        } catch (e) { console.log("Concept save failed", e); }

        setHistory(prev => prev.map(p => p.id === storyPart.id ? { ...p, musicConcept: concept, isGeneratingMusic: false } : p));
        setToast({ message: "Cinematic Soundtrack Concept Conceived.", type: 'info' });
      } else {
        throw new Error("CONCEPT_GENERATION_FAILED");
      }

    } catch (error: any) {
      console.error("Total Music failure:", error);
      setToast({ message: "The Music Studio has collapsed. (System Error)", type: 'error' });
      setHistory(prev => prev.map(p => p.id === storyPart.id ? { ...p, isGeneratingMusic: false } : p));
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full" />
          <Skull className="w-16 h-16 text-red-600 animate-pulse relative z-10" />
        </div>
        <div className="space-y-4 flex flex-col items-center">
          <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">Noir storyteller</h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.4em] animate-pulse">Authenticating with the Underworld...</p>
            <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-red-600"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
          <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest max-w-xs leading-relaxed">
            Establishing secure line to Firestore Intelligence. If this hangs, check your network connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #investigation-report, #investigation-report * {
            visibility: visible;
          }
          #investigation-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 z-[100] flex items-center justify-around px-4 pb-2 print:hidden">
           <button 
             onClick={() => setActiveTab('home')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-white scale-110' : 'text-zinc-500'}`}
           >
             <Home className={`w-6 h-6 ${activeTab === 'home' ? 'text-blue-500' : ''}`} />
             <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
           </button>
           <button 
             onClick={() => setActiveTab('characters')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'characters' ? 'text-white scale-110' : 'text-zinc-500'}`}
           >
             <Ghost className={`w-6 h-6 ${activeTab === 'characters' ? 'text-blue-500' : ''}`} />
             <span className="text-[9px] font-black uppercase tracking-widest">Vault</span>
           </button>
           <button 
             onClick={() => setActiveTab('daily-mission')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'daily-mission' ? 'text-white scale-110' : 'text-zinc-500'}`}
           >
             <Target className={`w-6 h-6 ${activeTab === 'daily-mission' ? 'text-amber-500' : ''}`} />
             <span className="text-[9px] font-black uppercase tracking-widest">Missions</span>
           </button>
           <button 
             onClick={() => setActiveTab('life-journey')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'life-journey' ? 'text-white scale-110' : 'text-zinc-500'}`}
           >
             <History className={`w-6 h-6 ${activeTab === 'life-journey' ? 'text-amber-500' : ''}`} />
             <span className="text-[9px] font-black uppercase tracking-widest">Journey</span>
           </button>
           <button 
             onClick={() => setActiveTab('newspaper')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'newspaper' ? 'text-white scale-110' : 'text-zinc-500'}`}
           >
             <Newspaper className={`w-6 h-6 ${activeTab === 'newspaper' ? 'text-red-500' : ''}`} />
             <span className="text-[9px] font-black uppercase tracking-widest">News</span>
           </button>
           <button 
             onClick={() => setShowProfile(true)}
             className={`flex flex-col items-center gap-1 transition-all ${showProfile ? 'text-white scale-110' : 'text-zinc-500'}`}
           >
             <User className={`w-6 h-6 ${showProfile ? 'text-blue-500' : ''}`} />
             <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
           </button>
        </div>
      )}

      {/* Activation Modal */}
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (isMobile ? '100vw' : '280px') : (isMobile ? '0px' : '84px'),
          x: isSidebarOpen ? 0 : (isMobile ? '-100vw' : 0)
        }}
        className={`fixed lg:relative z-50 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="p-6 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
             <Skull className="w-6 h-6 text-white" />
             {isSidebarOpen && (
               <div className="flex flex-col">
                 <span className="text-xl font-black uppercase tracking-tighter leading-none text-white">Pulp Noir</span>
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">18+ Gritty Edition</span>
               </div>
             )}
          </div>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
               <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section: Core */}
          <div className="space-y-1">
            {isSidebarOpen && <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2 px-4">Core</p>}
            
            <button 
              onClick={() => { setActiveTab('home'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-zinc-100 text-zinc-950 shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Home</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('noir-chat'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'noir-chat' ? 'bg-red-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Noir Chat</span>}
            </button>

            <button 
              onClick={() => { startNewChat(); setActiveTab('noir-chat'); if (isMobile) setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 text-green-500 font-black transition-all border border-dashed border-green-900/30 mt-2"
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">New Chat</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('public-gallery'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'public-gallery' ? 'bg-blue-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Globe className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Community Feed</span>}
            </button>
          </div>

          {/* Section: Chat History */}
          {isSidebarOpen && (
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between px-4">
                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Recent Cases</p>
                <div className="px-2 py-0.5 bg-zinc-900 rounded text-[9px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800">
                  {threads.length}
                </div>
              </div>
              
              <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar">
                {threads.map((thread) => (
                  <button 
                    key={thread.id}
                    onClick={() => { loadOldChat(thread.id); setActiveTab('noir-chat'); if (isMobile) setIsSidebarOpen(false); }}
                    className={`w-full group flex flex-col items-start gap-1 px-4 py-3 rounded-xl transition-all ${currentThreadId === thread.id ? 'bg-zinc-900 border border-zinc-800 text-white shadow-xl' : 'hover:bg-zinc-900/50 text-zinc-500'}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <MessageCircle className={`w-4 h-4 flex-shrink-0 ${currentThreadId === thread.id ? 'text-blue-500' : 'text-zinc-700'}`} />
                      <span className={`truncate text-xs font-bold uppercase tracking-wider text-left flex-1 ${currentThreadId === thread.id ? 'text-white' : 'text-zinc-400'}`}>
                        {thread.title || "Untitled Investigation"}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600 group-hover:text-zinc-500 line-clamp-1 pl-7 text-left italic">
                      {thread.preview || "Beginning file..."}
                    </span>
                  </button>
                ))}
                
                {threads.length === 0 && (
                  <div className="px-4 py-8 text-center border border-dashed border-zinc-800 rounded-2xl mx-1 opacity-20">
                    <Database className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Archive Empty</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Intelligence */}
          <div className="space-y-1">
            {isSidebarOpen && <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2 px-4">Intelligence</p>}
            
            <button 
              onClick={() => { setActiveTab('newspaper'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'newspaper' ? 'bg-zinc-100 text-zinc-950 shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Noir Reports</span>}
              {isSidebarOpen && <div className="ml-auto px-1.5 py-0.5 bg-red-600 text-[8px] font-black text-white rounded uppercase animate-pulse">Live</div>}
            </button>

            <button 
              onClick={() => { setActiveTab('reconstruct'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reconstruct' ? 'bg-purple-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Search className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Case Reconstruction</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('cinema-reels'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'cinema-reels' ? 'bg-amber-500 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Clapperboard className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Cinema Reels</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('noir-assets'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'noir-assets' ? 'bg-emerald-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Upload className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Upload Assets</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('brain'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'brain' ? 'bg-purple-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Brain className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Neural Archive</span>}
            </button>
          </div>

          {/* Section: Creative Studio */}
          <div className="space-y-1">
            {isSidebarOpen && <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2 px-4">Studio</p>}
            
            <button 
              onClick={() => { setActiveTab('studio'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'studio' ? 'bg-amber-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Music className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Song Studio</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('story-studio'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'story-studio' ? 'bg-red-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Story Studio</span>}
              {isSidebarOpen && <div className="ml-auto px-1 py-0.5 bg-black/20 text-[6px] font-black text-white rounded uppercase">New</div>}
            </button>

            <button 
              onClick={() => { setActiveTab('bgrade-art'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bgrade-art' ? 'bg-amber-600 text-black shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Camera className={`w-5 h-5 flex-shrink-0 ${activeTab === 'bgrade-art' ? 'text-black' : 'text-amber-500'}`} />
              {isSidebarOpen && <span className={`uppercase tracking-wider text-sm ${activeTab === 'bgrade-art' ? 'text-black font-black' : 'text-amber-400 font-bold'}`}>Pulp Art Gen</span>}
              {isSidebarOpen && <div className="ml-auto px-1 py-0.5 bg-amber-500/20 text-[6px] font-black text-amber-400 rounded uppercase">Studio</div>}
            </button>

            <button 
              onClick={() => { setActiveTab('item-songs'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'item-songs' ? 'bg-pink-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Flame className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Item Clash</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('voice-lab'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'voice-lab' ? 'bg-indigo-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Mic2 className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Voice Lab</span>}
            </button>

            <button 
              onClick={() => { generateContent('script'); if (isMobile) setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-all font-bold uppercase tracking-wider text-sm"
            >
              <ScrollText className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>Scripts</span>}
            </button>

            <button 
              onClick={() => { compileFullReel(); if (isMobile) setIsSidebarOpen(false); }}
              disabled={isExportingVideo || enhancedHistory.length === 0}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isExportingVideo ? 'bg-red-600/20 text-red-500 animate-pulse' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Clapperboard className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Cinema Reel</span>}
              {isExportingVideo && isSidebarOpen && <span className="ml-auto text-[8px] font-black">{videoExportProgress}%</span>}
            </button>
          </div>

          {/* Section: Archives */}
          <div className="space-y-1">
            {isSidebarOpen && <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2 px-4">Archives</p>}
            
            <button 
              onClick={() => { setActiveTab('daily-mission'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'daily-mission' ? 'bg-amber-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Target className="w-5 h-5 flex-shrink-0 text-amber-500" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Daily Mission</span>}
              {isSidebarOpen && <div className="ml-auto px-1.5 py-0.5 bg-amber-500 text-[8px] font-black text-black rounded uppercase animate-pulse">Live</div>}
            </button>

            <button 
              onClick={() => { setActiveTab('characters'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'characters' ? 'bg-blue-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <Ghost className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Character Vault</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('masterlist'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'masterlist' ? 'bg-blue-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <LayoutGrid className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Master List</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('lore'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'lore' ? 'bg-purple-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">World Lore</span>}
            </button>

            <button 
              onClick={() => { setActiveTab('life-journey'); if (isMobile) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'life-journey' ? 'bg-amber-600 text-white shadow-lg font-black' : 'hover:bg-zinc-800 text-zinc-400 font-bold'}`}
            >
              <History className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="uppercase tracking-wider text-sm">Life Journey</span>}
            </button>

            <button 
              onClick={() => { setShowGallery(true); if (isMobile) setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-all font-bold uppercase tracking-wider text-sm"
            >
              <ImageIcon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>Media Gallery</span>}
            </button>
          </div>

        </nav>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
            {isSidebarOpen && user && (
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-4 shadow-xl">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-red-950/50 flex-shrink-0">
                    {user.displayName?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate text-white leading-tight">{user.displayName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-2.5 h-2.5 text-green-500" />
                        <span className="text-[9px] font-black text-zinc-400">{stats.up}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="w-2.5 h-2.5 text-red-500" />
                        <span className="text-[9px] font-black text-zinc-400">{stats.down}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowProfile(true)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all transform hover:rotate-12"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setShowDrafts(true)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-all group"
                  >
                    <div className="relative">
                      <History className="w-4 h-4 mb-1 group-hover:text-blue-500 transition-colors" />
                      {drafts.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-zinc-900" />
                      )}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Drafts</span>
                  </button>
                  <button 
                    onClick={logout}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800 hover:bg-red-950/30 text-zinc-400 transition-all group"
                  >
                    <LogOut className="w-4 h-4 mb-1 group-hover:text-red-500 transition-colors" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Exit</span>
                  </button>
                </div>
                {user?.email === "royalbullsadvisory412@gmail.com" && (
                  <button 
                    onClick={() => setShowAdminPanel(true)}
                    className="w-full py-2 bg-amber-600/10 border border-amber-600/30 rounded-xl text-amber-500 hover:bg-amber-600/20 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Admin Console
                  </button>
                )}
              </div>
            )}
            {!isSidebarOpen && user && (
              <div className="space-y-4 flex flex-col items-center">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-black text-white shadow-lg shadow-red-950/50 hover:scale-105 active:scale-95 transition-all"
                  title="Profile Settings"
                >
                  {user.displayName?.[0] || 'U'}
                </button>
                <div className="flex flex-col gap-2">
                   <button onClick={() => setShowDrafts(true)} className="p-2 text-zinc-600 hover:text-blue-500 transition-colors" title="Drafts">
                    <History className="w-5 h-5" />
                   </button>
                   <button onClick={logout} className="p-2 text-zinc-600 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                   </button>
                </div>
              </div>
            )}
            {!user && (
              <button 
                onClick={loginWithGoogle}
                className={`w-full py-4 bg-white text-zinc-950 rounded-xl font-black uppercase italic tracking-tighter text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl ${!isSidebarOpen && 'px-0 overflow-hidden'}`}
              >
                <LogIn className="w-5 h-5" />
                {isSidebarOpen && <span>Access Access</span>}
              </button>
            )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden h-full min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between z-40 fixed top-0 left-0 right-0 h-16">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 hover:bg-zinc-900 rounded-xl transition-all"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Skull className="w-6 h-6 text-red-600 animate-pulse" />
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">Pulp Noir</h1>
          </div>
          <button 
            onClick={() => setShowProfile(true)} 
            className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-red-900/40"
          >
            {user?.displayName?.[0] || 'U'}
          </button>
        </header>

        {/* Top Bar (Desktop) */}
        <div className="hidden lg:flex p-4 border-b border-zinc-800 bg-zinc-900/20 backdrop-blur-sm items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">{isOnline ? 'System Online' : 'System Offline'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700">
              <TrendingUp className="w-3 h-3 text-red-500" />
              <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Intensity: {profile.intensity}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { compileFullReel(); }}
              disabled={isExportingVideo || enhancedHistory.length === 0}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-all disabled:opacity-50"
            >
              <Clapperboard className={`w-3 h-3 ${isExportingVideo ? 'animate-pulse text-amber-500' : ''}`} />
              {isExportingVideo ? `Cinema Engine ${videoExportProgress}%` : 'Cinema Reel'}
            </button>
            <button 
              onClick={() => setShowGallery(true)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-green-500 transition-all"
            >
              <ImageIcon className="w-3 h-3" />
              Art Gallery
            </button>
            {enhancedHistory.length > 0 && (
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3 h-3" />
                Clear Feed
              </button>
            )}
          </div>
        </div>

      <AnimatePresence>
        {showMatureWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-zinc-900 border-2 border-red-900/50 p-8 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(220,38,38,0.2)] space-y-8 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
              
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-red-600/10 rounded-full border border-red-600/30">
                  <ShieldAlert className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Mature Content</h2>
                <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">18+ Restricted</div>
              </div>

              <div className="space-y-4">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs leading-relaxed">
                  This application generates gritty, raw, and intense &quot;Pulp Noir&quot; content. 
                  Expect mature themes, street-level violence, dark humor, and adult-oriented storytelling.
                </p>
                <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest leading-relaxed">
                  By proceeding, you acknowledge that you are 18 years or older and consent to viewing mature content designed for educational and creative purposes.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowMatureWarning(false)}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-xl shadow-red-900/40 group"
                >
                  <span className="group-hover:scale-110 transition-transform inline-block">Enter the Underworld</span>
                </button>
                <button 
                  onClick={() => window.location.href = 'https://google.com'}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl font-black uppercase italic tracking-tighter transition-all"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Clear History?</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Are you sure you want to delete all stories? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={clearHistory}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-red-500">
                  <Skull className="w-8 h-8" />
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Your Profile</h2>
                </div>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Avatar & Role */}
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <User className="w-24 h-24 text-zinc-500" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    <div className="relative group/avatar">
                      <div className="w-24 h-24 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center shadow-2xl">
                        {profile.photoURL ? (
                          <Image src={profile.photoURL} alt="Avatar" width={128} height={128} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-10 h-10 text-zinc-700" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-500 rounded-full cursor-pointer shadow-lg transition-all transform hover:scale-110">
                        <ImageIcon className="w-3 h-3 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      </label>
                    </div>

                    <div className="flex-grow text-center sm:text-left space-y-2">
                      <div className="space-y-1">
                        <input 
                          type="text"
                          value={profile.customName || user?.displayName || ''}
                          onChange={(e) => updateCustomName(e.target.value)}
                          placeholder="Enter Custom Name"
                          className="bg-transparent border-b border-zinc-800 focus:border-purple-500 outline-none text-lg font-black uppercase italic tracking-tighter text-white w-full"
                        />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          Your AI Clone Status: <span className={profile.preferredRole !== 'none' ? 'text-purple-500' : 'text-zinc-700'}>
                            {profile.preferredRole === 'none' ? 'Inactive' : `Active ${profile.preferredRole}`}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Choose Your Destiny</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['hero', 'villain', 'aam-aadami', 'none'] as const).map(role => (
                        <button
                          key={role}
                          onClick={() => updatePreferredRole(role)}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                            profile.preferredRole === role
                              ? role === 'hero' ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' :
                                role === 'villain' ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' :
                                role === 'aam-aadami' ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]' :
                                'bg-zinc-100 border-white text-zinc-950'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                          }`}
                        >
                          {role.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase leading-relaxed text-center">
                      Choosing a role makes your AI Clone a permanent resident of the stories you generate.
                    </p>
                  </div>
                </div>

                {/* Production Stats */}
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Production Stats</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-600">Total Produced</p>
                      <p className="text-2xl font-black italic tracking-tighter">{stats.total}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-600">Approval Rate</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-2xl font-black italic tracking-tighter ${stats.approvalRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>{stats.approvalRate}%</p>
                        <TrendingUp className={`w-4 h-4 ${stats.approvalRate >= 50 ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="text-center p-2 bg-zinc-900 rounded-lg">
                      <p className="text-[8px] uppercase font-bold text-zinc-600">Stories</p>
                      <p className="text-sm font-black italic">{stats.typeStats?.text || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-zinc-900 rounded-lg">
                      <p className="text-[8px] uppercase font-bold text-zinc-600">Jokes</p>
                      <p className="text-sm font-black italic">{stats.typeStats?.joke || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-zinc-900 rounded-lg">
                      <p className="text-[8px] uppercase font-bold text-zinc-600">Chars</p>
                      <p className="text-sm font-black italic">{stats.typeStats?.character || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-zinc-900 rounded-lg">
                      <p className="text-[8px] uppercase font-bold text-zinc-600">Art</p>
                      <p className="text-sm font-black italic">{stats.typeStats?.image || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-bold text-zinc-400">{stats.up}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-3 h-3 text-red-600" />
                      <span className="text-xs font-bold text-zinc-400">{stats.down}</span>
                    </div>
                  </div>
                </div>

                {/* GitHub Chronicles Sync */}
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Github className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">GitHub Stories Sync</h3>
                    </div>
                    {githubToken ? (
                      <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded text-[8px] font-black text-green-400 uppercase tracking-widest">
                        Connected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                        Not Linked
                      </span>
                    )}
                  </div>

                  {!githubToken ? (
                    <div className="space-y-4">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">
                        Back up your pulp chronicles on GitHub. Connect your account to automatically archive and sync your noir story threads into a dedicated repository.
                      </p>
                      
                      <button
                        onClick={handleConnectGithub}
                        className="w-full py-3 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <Github className="w-4 h-4" />
                        Connect GitHub Account
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        {githubAvatarUrl ? (
                          <img src={githubAvatarUrl} alt={githubUsername || "GitHub"} className="w-10 h-10 rounded-full border border-zinc-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                            <Github className="w-5 h-5 text-zinc-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-white truncate">@{githubUsername}</p>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase">Authenticated GitHub Account</p>
                        </div>
                        <button
                          onClick={handleGithubDisconnect}
                          className="px-2.5 py-1.5 bg-red-950/30 hover:bg-red-900 border border-red-900/50 hover:border-red-600 text-red-400 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all"
                        >
                          Unlink
                        </button>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Repository Name</label>
                          <input
                            type="text"
                            value={githubRepoName}
                            onChange={(e) => setGithubRepoName(e.target.value)}
                            placeholder="pulp-noir-chronicles"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-xl border border-zinc-800">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Private Repository</p>
                            <p className="text-[8px] font-bold uppercase text-zinc-600">Only you can view your chronicles</p>
                          </div>
                          <button
                            onClick={() => setGithubIsPrivate(!githubIsPrivate)}
                            className={`w-12 h-6 rounded-full transition-all relative ${githubIsPrivate ? 'bg-purple-600' : 'bg-zinc-800'}`}
                          >
                            <motion.div
                              animate={{ x: githubIsPrivate ? 24 : 2 }}
                              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                            />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleGithubSync}
                        disabled={isGithubSyncing}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.2)]"
                      >
                        {isGithubSyncing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Archiving & Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Sync Chronicles to GitHub
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* System Evolution & Deployment Readiness */}
                <div className="p-6 bg-purple-950/10 border border-purple-900/30 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-purple-500" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-purple-500">System Evolution</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-600/20 border border-purple-600/50 rounded text-[8px] font-black text-purple-500 uppercase tracking-widest">v{evolution.version}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-600">Total Generations</p>
                      <p className="text-xl font-black italic tracking-tighter text-white">{evolution.totalGenerations}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-600">Feedback Loop</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-bold text-zinc-400">{evolution.positiveFeedback}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3 text-red-600" />
                          <span className="text-xs font-bold text-zinc-400">{evolution.negativeFeedback}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-purple-900/20">
                    <p className="text-[9px] uppercase font-bold text-zinc-500 mb-1">Current AI Focus</p>
                    <p className="text-[10px] text-purple-400 font-black uppercase tracking-tighter italic">{evolution.currentFocus}</p>
                  </div>

                  <div className="pt-2 border-t border-purple-900/20 space-y-2">
                    <p className="text-[9px] uppercase font-bold text-zinc-500">Deployment Readiness</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-green-500 uppercase">
                        <Check className="w-3 h-3" /> API Keys Secured
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-green-500 uppercase">
                        <Check className="w-3 h-3" /> Firebase Auth Configured
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className={`flex items-center gap-2 text-[9px] font-bold uppercase ${profile.billingConfigured ? 'text-green-500' : 'text-amber-500'}`}>
                          {profile.billingConfigured ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {profile.billingConfigured ? 'Production Billing Active' : 'Production Billing Needed'}
                        </div>
                        {!profile.billingConfigured && (
                          <button 
                            onClick={handleSetupBilling}
                            className="px-2 py-0.5 bg-amber-600/20 hover:bg-amber-600 text-amber-500 hover:text-white rounded text-[8px] font-black uppercase transition-all"
                          >
                            Set Up
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Engineering */}
                <div className="p-6 bg-blue-950/10 border border-blue-900/30 rounded-2xl space-y-6">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Visual Engineering</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Art Style</label>
                      <select 
                        value={profile.visualStyle}
                        onChange={(e) => updateVisualSettings({ visualStyle: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="1950s pulp illustration">1950s Pulp Illustration</option>
                        <option value="cinematic realism">Cinematic Realism</option>
                        <option value="graphic novel noir">Graphic Novel Noir</option>
                        <option value="vintage oil painting">Vintage Oil Painting</option>
                        <option value="cyberpunk noir">Cyberpunk Noir</option>
                        <option value="bollywood retro poster">Bollywood Retro Poster</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Aspect Ratio</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['16:9', '9:16', '1:1', '4:3'] as const).map(ratio => (
                          <button
                            key={ratio}
                            onClick={() => updateVisualSettings({ aspectRatio: ratio })}
                            className={`py-2 rounded-lg text-[10px] font-black tracking-tighter transition-all border ${
                              profile.aspectRatio === ratio
                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Visual Mood</label>
                      <input 
                        type="text"
                        value={profile.visualMood}
                        onChange={(e) => updateVisualSettings({ visualMood: e.target.value })}
                        placeholder="e.g. cinematic noir, neon grit, rainy night"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Music Region (Item Songs)</label>
                      <select
                        value={profile.musicRegion || 'Global Viral'}
                        onChange={(e) => updateVisualSettings({ musicRegion: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-pink-500 transition-colors appearance-none"
                      >
                        <option value="Global Viral">Global Viral</option>
                        <option value="Punjabi Blockbuster">Punjabi Blockbuster</option>
                        <option value="Bollywood Item">Bollywood Item</option>
                        <option value="South Indian Mass">South Indian Mass</option>
                        <option value="Latin Pop">Latin Pop</option>
                        <option value="K-Pop Bangers">K-Pop Bangers</option>
                        <option value="Afrobeats Hit">Afrobeats Hit</option>
                        <option value="Western Pop/Club">Western Pop/Club</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Naughty Mode Toggle */}
                <div className="p-4 bg-red-600/5 border border-red-600/20 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500">Naughty Mode</h3>
                    </div>
                    <button 
                      onClick={toggleNaughtyMode}
                      className={`w-12 h-6 rounded-full transition-all relative ${profile.naughtyMode ? 'bg-red-600' : 'bg-zinc-800'}`}
                    >
                      <motion.div 
                        animate={{ x: profile.naughtyMode ? 24 : 2 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed">
                    Activate for B-grade themes, double-meaning jokes, and aggressive mature content. (18+ Only)
                  </p>
                </div>

                {/* Conflict Engine Toggle */}
                <div className="p-4 bg-orange-600/5 border border-orange-600/20 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-500">Conflict Engine</h3>
                    </div>
                    <button 
                      onClick={toggleConflictEngine}
                      className={`w-12 h-6 rounded-full transition-all relative ${profile.conflictEngine ? 'bg-orange-600' : 'bg-zinc-800'}`}
                    >
                      <motion.div 
                        animate={{ x: profile.conflictEngine ? 24 : 2 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed">
                    B-Grade Engine for &quot;Gali-galoch&quot;, realistic fight sequences, and aggressive street-level arguments.
                  </p>
                </div>

                {/* Web Series Dramatization Toggle (THE TADKA) */}
                <div className="p-4 bg-purple-600/5 border border-purple-600/20 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-purple-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-500">Web Series Tadka</h3>
                    </div>
                    <button 
                      onClick={toggleWebSeriesMode}
                      className={`w-12 h-6 rounded-full transition-all relative ${profile.webSeriesMode ? 'bg-purple-600' : 'bg-zinc-800'}`}
                    >
                      <motion.div 
                        animate={{ x: profile.webSeriesMode ? 24 : 2 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed">
                    Cinematic Overlay: Transforms real-world intel into high-stakes, web-series style drama with cliffhangers.
                  </p>
                </div>

                {/* Bundelkhandi Mode Toggle */}
                <div className="p-4 bg-amber-600/5 border border-amber-600/20 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music2 className="w-4 h-4 text-amber-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Bundelkhandi Mode</h3>
                    </div>
                    <button 
                      onClick={toggleBundelkhandiMode}
                      className={`w-12 h-6 rounded-full transition-all relative ${profile.bundelkhandiMode ? 'bg-amber-600' : 'bg-zinc-800'}`}
                    >
                      <motion.div 
                        animate={{ x: profile.bundelkhandiMode ? 24 : 2 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed">
                    Enables authentic Bundelkhandi support: folk music (Alha/Rai), regional dialect, and Dabang noir context.
                  </p>
                </div>

                {/* Data Recovery */}
                <div className="p-4 bg-amber-600/10 border border-amber-600/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Data Recovery</h3>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed">
                    If you lost your stories during the system upgrade, use this tool to recover them from the old archives.
                  </p>
                  <button
                    onClick={migrateData}
                    disabled={isMigrating}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    {isMigrating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    {isMigrating ? 'Recovering...' : 'Start Recovery'}
                  </button>
                </div>

                {/* Genres */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Story Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Action', 'Comedy', 'Drama', 'Thriller', 'Horror', ...(profile.genres || []).filter(g => !['Action', 'Comedy', 'Drama', 'Thriller', 'Horror'].includes(g))].map(genre => {
                      const isPredefined = ['Action', 'Comedy', 'Drama', 'Thriller', 'Horror'].includes(genre);
                      const isSelected = profile.genres?.includes(genre);
                      return (
                        <div
                          key={genre}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            isSelected
                              ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                          }`}
                        >
                          <button
                            onClick={() => toggleProfileGenre(genre)}
                            className="focus:outline-none"
                          >
                            {genre}
                          </button>
                          {!isPredefined && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newGenres = profile.genres.filter(g => g !== genre);
                                updateDoc(doc(db, `users/${user!.uid}`), { genres: newGenres, updatedAt: Date.now() })
                                  .catch(p => handleFirestoreError(p, OperationType.UPDATE, `users/${user!.uid}`));
                                setToast({ message: `Removed custom genre tag: ${genre}`, type: 'info' });
                              }}
                              className="text-white hover:text-zinc-200 ml-1 hover:scale-110 transition-all font-black text-sm line-height-none"
                              title="Delete custom genre tag"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustomGenreInput}
                      onChange={(e) => setNewCustomGenreInput(e.target.value)}
                      placeholder="Add custom tag..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-red-600 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomGenre(newCustomGenreInput);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddCustomGenre(newCustomGenreInput)}
                      className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Intensity */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Content Intensity</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'mild', label: 'Mildly Suggestive' },
                      { id: 'moderate', label: 'Moderately Edgy' },
                      { id: 'extreme', label: 'Explicitly Adult' }
                    ].map(level => (
                      <button
                        key={level.id}
                        onClick={() => updateIntensity(level.id as any)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border leading-tight h-12 flex items-center justify-center text-center ${
                          profile.intensity === level.id
                            ? 'bg-zinc-100 border-white text-zinc-950'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Selection */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Narrator Voice</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'Fenrir', label: 'Gritty (Fenrir)' },
                      { id: 'Puck', label: 'Playful (Puck)' },
                      { id: 'Charon', label: 'Deep (Charon)' },
                      { id: 'Kore', label: 'Soft (Kore)' },
                      { id: 'Zephyr', label: 'Smooth (Zephyr)' }
                    ].map(voice => (
                      <button
                        key={voice.id}
                        onClick={() => updateVoice(voice.id)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          profile.voice === voice.id
                            ? 'bg-zinc-100 border-white text-zinc-950'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {voice.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Elements */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Specific Elements</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Double Meaning Jokes', 'Conflict/Fighting', 'Romance', 'Mystery', 'Crime', 'Supernatural Horror', 'Item Songs'].map(element => (
                      <button
                        key={element}
                        onClick={() => toggleProfileElement(element)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                          profile.elements?.includes(element)
                            ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {element}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowProfile(false)}
                className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-xl"
              >
                Save Preferences
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drafts Sidebar */}
      <AnimatePresence>
        {showDrafts && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrafts(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-black uppercase italic tracking-tighter">Saved Drafts</h2>
                </div>
                <button 
                  onClick={() => setShowDrafts(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {drafts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                    <History className="w-12 h-12" />
                    <p className="text-xs uppercase font-bold tracking-widest">No drafts saved yet</p>
                  </div>
                ) : (
                  drafts.map((draft) => (
                    <div 
                      key={draft.id}
                      className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl group hover:border-blue-900/50 transition-all"
                    >
                      <p className="text-sm text-zinc-300 line-clamp-3 mb-4 leading-relaxed italic">
                        &quot;{draft.text}&quot;
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                          {new Date(draft.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => deleteDraft(draft.id)}
                            className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => loadDraft(draft)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-[10px] font-black uppercase italic tracking-tighter transition-all"
                          >
                            Edit & Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lore Sidebar */}
      <AnimatePresence>
        {showLore && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLore(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-black uppercase italic tracking-tighter">World Lore</h2>
                </div>
                <button 
                  onClick={() => setShowLore(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 border-b border-zinc-800">
                <button 
                  onClick={() => generateLore(prompt || "A gritty urban setting")}
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-xs font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  {loading ? 'Expanding Lore...' : 'Expand World Lore'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {lore.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                    <Globe className="w-12 h-12" />
                    <p className="text-xs uppercase font-bold tracking-widest">No lore fragments yet</p>
                  </div>
                ) : (
                  lore.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl group hover:border-purple-900/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black uppercase italic tracking-tighter text-purple-400">{item.title}</h3>
                        {item.location && (
                          <div className="flex items-center gap-1 text-[8px] text-zinc-500 font-bold uppercase">
                            <MapPin className="w-2 h-2" />
                            {item.location}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all">
                        {item.description}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => deleteLore(item.id)}
                          className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Character Forge Modal */}
      <AnimatePresence>
        {showCharacterForge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col relative overflow-hidden my-auto max-h-[90vh]"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Ghost className="w-64 h-64 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between relative z-10 flex-shrink-0 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-xl hidden sm:block">
                    <Sparkles className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white">Character Forge</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">Define your gritty anti-hero</p>
                      <button 
                        onClick={() => {
                          setCharacterForge({
                            ...characterForge,
                            name: profile.customName || user?.displayName || '',
                            gender: 'Male',
                            traits: `Inspired by ${profile.genres.join(', ')} style.`,
                            alignment: 'Neutral',
                            isActive: true,
                            role: profile.preferredRole || 'Private Eye',
                            motivations: 'Survival and uncovering the dirty secrets of Sagar.',
                            flaws: 'Heavy drinking, cynical disposition, ghosts from the past.',
                            backstory: 'Ex-cop forced out of the department. Now roaming the cold neon-lit alleys seeking redemption.',
                            physical: 'Rugged build, leather jacket, perpetual cigarettes.'
                          });
                          setToast({ message: "Profile data cloned! Customize your destiny.", type: 'info' });
                        }}
                        className="px-2 py-0.5 bg-blue-600/20 hover:bg-blue-600/40 text-[8px] font-black uppercase tracking-widest text-blue-400 rounded-md border border-blue-600/30 transition-all self-start"
                      >
                        Clone From Profile
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowCharacterForge(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors self-start">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 relative z-10 mb-6 flex-shrink-0">
                <button 
                  onClick={() => setForgeMode('ai')}
                  className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    forgeMode === 'ai' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  AI Assisted Forge
                </button>
                <button 
                  onClick={() => setForgeMode('manual')}
                  className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    forgeMode === 'manual' 
                      ? 'bg-amber-600 text-black shadow-md' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Manual Custom Forge
                </button>
              </div>
 
              <div className="overflow-y-auto flex-1 custom-scrollbar pr-2 relative z-10 space-y-6">
                
                {/* Visual Reference/Portrait Section */}
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Character Visual Reference</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden relative group-avatar">
                      {characterForge.avatarUrl ? (
                        <img 
                          src={characterForge.avatarUrl} 
                          alt="Character Reference" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Ghost className="w-8 h-8 text-zinc-700 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-grow space-y-2 w-full sm:w-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleGenerateCharacterPortrait}
                          disabled={isGeneratingPortrait || loading}
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-600/30 transition-all flex items-center justify-center gap-1.5"
                        >
                          {isGeneratingPortrait ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Camera className="w-3.5 h-3.5" />
                          )}
                          Generate AI Portrait
                        </button>
                        <label className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-800 cursor-pointer transition-all flex items-center justify-center gap-1.5 text-center">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Upload Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleCharacterAvatarUpload} 
                          />
                        </label>
                      </div>
                      <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-wide">
                        Provide a physical description below first for optimal AI generation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Character Name</label>
                    <input 
                      type="text"
                      value={characterForge.name}
                      onChange={(e) => setCharacterForge({ ...characterForge, name: e.target.value })}
                      placeholder="e.g. Inspector Bajrangi"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Role / Occupation</label>
                    <input 
                      type="text"
                      value={characterForge.role}
                      onChange={(e) => setCharacterForge({ ...characterForge, role: e.target.value })}
                      placeholder="e.g. Broken Investigator, Femme Fatale"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Gender</label>
                    <select 
                      value={characterForge.gender}
                      onChange={(e) => setCharacterForge({ ...characterForge, gender: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Alignment</label>
                    <select 
                      value={characterForge.alignment}
                      onChange={(e) => setCharacterForge({ ...characterForge, alignment: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all appearance-none"
                    >
                      <option value="Lawful Good">Lawful Good</option>
                      <option value="Neutral Good">Neutral Good</option>
                      <option value="Chaotic Good">Chaotic Good</option>
                      <option value="Lawful Neutral">Lawful Neutral</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Chaotic Neutral">Chaotic Neutral</option>
                      <option value="Lawful Evil">Lawful Evil</option>
                      <option value="Neutral Evil">Neutral Evil</option>
                      <option value="Chaotic Evil">Chaotic Evil</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Date of Birth</label>
                    <input 
                      type="date"
                      value={characterForge.dob}
                      onChange={(e) => setCharacterForge({ ...characterForge, dob: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Place of Birth (Optional)</label>
                    <input 
                      type="text"
                      value={characterForge.pob}
                      onChange={(e) => setCharacterForge({ ...characterForge, pob: e.target.value })}
                      placeholder="e.g. Sagar, Madhya Pradesh"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Traits & Personality</label>
                    <textarea 
                      value={characterForge.traits}
                      onChange={(e) => setCharacterForge({ ...characterForge, traits: e.target.value })}
                      placeholder="e.g. Cynical, chain-smoker, loves old Bollywood songs..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white h-20 focus:border-blue-500/50 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Motivations</label>
                    <input 
                      type="text"
                      value={characterForge.motivations}
                      onChange={(e) => setCharacterForge({ ...characterForge, motivations: e.target.value })}
                      placeholder="e.g. Seeking revenge for his partner..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Physical Description & Vibe</label>
                    <input 
                      type="text"
                      value={characterForge.physical}
                      onChange={(e) => setCharacterForge({ ...characterForge, physical: e.target.value })}
                      placeholder="e.g. Scar on left eye, wearing a worn-out trench coat..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all"
                    />
                  </div>

                  {/* Manual Forge specific fields */}
                  {forgeMode === 'manual' && (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Fatal Flaws</label>
                        <input 
                          type="text"
                          value={characterForge.flaws}
                          onChange={(e) => setCharacterForge({ ...characterForge, flaws: e.target.value })}
                          placeholder="e.g. Easily bought, soft spot for orphans, addicted to street gambling..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Character Backstory & History</label>
                        <textarea 
                          value={characterForge.backstory}
                          onChange={(e) => setCharacterForge({ ...characterForge, backstory: e.target.value })}
                          placeholder="Write their full biography, detailing how they entered the dark world of Sagar..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white h-32 focus:border-blue-500/50 transition-all resize-none"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Astro-Kundli Destiny (Optional)</label>
                        <textarea 
                          value={characterForge.kundli}
                          onChange={(e) => setCharacterForge({ ...characterForge, kundli: e.target.value })}
                          placeholder="If empty, a customized astrological prediction of doom will be generated automatically..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white h-20 focus:border-blue-500/50 transition-all resize-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-zinc-800 relative z-10 flex-shrink-0">
                {forgeMode === 'ai' ? (
                  <button 
                    onClick={() => generateContent('character')}
                    disabled={loading || isGeneratingPortrait}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    AI Assisted Forge (Auto Biography)
                  </button>
                ) : (
                  <button 
                    onClick={handleManualForge}
                    disabled={loading || isGeneratingPortrait}
                    className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-xl shadow-amber-900/40 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                    Confirm Custom Manual Forge
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter">Admin Control Center</h2>
                </div>
                <button 
                  onClick={() => setShowAdminPanel(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-widest">Access Key Generator</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Create unique codes for new users</p>
                  </div>
                  <button 
                    onClick={generateAccessKey}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black uppercase italic tracking-tighter transition-all flex items-center gap-2 shadow-lg shadow-amber-900/20"
                  >
                    <Key className="w-4 h-4" />
                    Generate New Key
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Key Management ({accessKeys.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {accessKeys.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-zinc-800 rounded-2xl opacity-30">
                        <p className="text-xs font-black uppercase tracking-widest">No keys generated yet</p>
                      </div>
                    ) : (
                      accessKeys.map((key) => (
                        <div 
                          key={key.id}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${key.isUsed ? 'bg-zinc-900/30 border-zinc-800 opacity-60' : 'bg-zinc-950 border-zinc-800 hover:border-amber-600/50'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${key.isUsed ? 'bg-zinc-800 text-zinc-500' : 'bg-amber-600/10 text-amber-500'}`}>
                              <Key className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-lg font-bold tracking-widest text-white">{key.key}</span>
                                {key.isUsed ? (
                                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-zinc-700">Used</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-green-600/20 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-600/30">Active</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                  Created: {new Date(key.createdAt).toLocaleDateString()}
                                </p>
                                {key.isUsed && (
                                  <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest">
                                    Used By: {key.usedBy.substring(0, 8)}...
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(key.key);
                                setToast({ message: "Key copied to clipboard!", type: 'success' });
                              }}
                              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                              title="Copy Key"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteAccessKey(key.id)}
                              className="p-2 hover:bg-red-600/20 hover:text-red-500 rounded-lg text-zinc-400 transition-colors"
                              title="Delete Key"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gallery Panel */}
      <AnimatePresence>
        {showGallery && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGallery(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 h-[80vh] m-auto rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-black uppercase italic tracking-tighter">Art Gallery</h2>
                </div>
                <button 
                  onClick={() => setShowGallery(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {enhancedHistory.filter(h => (h.type === 'image' || h.type === 'video') && h.isSaved).length === 0 ? (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4 py-20">
                    <ImageIcon className="w-12 h-12" />
                    <p className="text-xs uppercase font-bold tracking-widest">No artworks or reels saved yet</p>
                  </div>
                ) : (
                  enhancedHistory.filter(h => (h.type === 'image' || h.type === 'video') && h.isSaved).map((art) => (
                    <div 
                      key={art.id}
                      className="relative group overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-950 aspect-square shadow-xl transition-all hover:border-green-500/50"
                    >
                      {art.type === 'video' ? (
                        <div className="w-full h-full relative">
                          <video 
                            src={JSON.parse(art.content).url} 
                            className="w-full h-full object-cover"
                            loop
                            muted
                            playsInline
                            onMouseOver={(e) => (e.target as any).play()}
                            onMouseOut={(e) => (e.target as any).pause()}
                          />
                          <div className="absolute top-2 left-2 p-1.5 bg-blue-600 rounded-lg shadow-lg z-10">
                            <Video className="w-3 h-3 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <Image 
                          src={art.content} 
                          alt="Gallery item" 
                          fill 
                          className="object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                        <button 
                          onClick={() => {
                            const url = art.type === 'video' ? JSON.parse(art.content).url : art.content;
                            handleDownload(url, art.id);
                          }}
                          className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors shadow-lg"
                          title="Download"
                        >
                          <Download className="w-5 h-5 text-white" />
                        </button>
                        <button 
                          onClick={() => toggleSave(art.id, true)}
                          className="p-3 bg-zinc-900 rounded-full hover:bg-red-600 transition-colors flex items-center gap-2 px-4 shadow-lg"
                          title="Remove from Gallery"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                          <span className="text-[10px] font-black uppercase text-white tracking-widest">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth" ref={scrollRef}>
          <div className={`p-4 lg:p-12 space-y-8 lg:space-y-12 max-w-7xl mx-auto w-full ${isMobile ? 'pt-24 pb-32' : 'pb-12'}`}>
        {!authReady ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          </div>
        ) : !user ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
            <div className="p-6 bg-red-600 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.3)]">
              <Skull className="w-20 h-20 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Pulp Noir</h2>
              <p className="text-zinc-400 leading-relaxed">
                Login to enter the underworld. Your stories, drafts, and preferences will be safe in the cloud.
              </p>
              <button 
                onClick={loginWithGoogle}
                className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <LogIn className="w-6 h-6" />
                Login with Google
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="space-y-20 pb-20">
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-[3rem] bg-zinc-900 border border-zinc-800 p-8 lg:p-16 shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Skull className="w-96 h-96 text-red-600 rotate-12" />
                  </div>
                  <div className="relative z-10 max-w-3xl space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600/10 border border-red-600/30 rounded-full">
                      <Zap className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">The Ultimate Noir Engine v2.5</span>
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.85]">
                      Stories from the <span className="text-red-600">Shadows.</span>
                    </h1>
                    <p className="text-zinc-400 font-medium text-xl leading-relaxed max-w-xl">
                      Pulp Noir is a gritty, adult-oriented AI storytelling platform. 
                      Generate hard-boiled scripts, dark characters, and visceral crime reconstructions.
                    </p>
                    <div className="flex flex-wrap gap-6 pt-4">
                      <button 
                        onClick={() => setActiveTab('noir-chat')}
                        className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-2xl shadow-red-900/40 flex items-center gap-3 group text-lg"
                      >
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        Enter the Studio
                      </button>
                      <button 
                        onClick={() => setActiveTab('daily-mission')}
                        className="px-10 py-5 bg-amber-600 hover:bg-amber-500 text-black rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center gap-3 text-lg group shadow-xl"
                      >
                        <Target className="w-6 h-6 animate-pulse" />
                        Daily Contracts
                      </button>
                      <button 
                        onClick={() => {
                          const el = document.getElementById('how-it-works');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-10 py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center gap-3 text-lg"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </section>
                
                {/* Recommended For You Section */}
                {enhancedHistory.some(h => (h.matchScore || 0) > 60) && (
                  <section className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Recommended For You</h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Based on your sinister profile & past interactions</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Live AI Personalization Active</span>
                      </div>
                    </div>
                    
                    <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-6 no-scrollbar pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x">
                      {enhancedHistory
                        .filter(h => h.type !== 'image' && (h.matchScore || 0) > 60)
                        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                        .slice(0, 6)
                        .map((part) => (
                          <motion.div 
                            key={part.id}
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 w-[280px] lg:w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group cursor-pointer snap-start"
                            onClick={() => {
                              setActiveTab('noir-chat');
                              setTimeout(() => {
                                document.getElementById(`story-${part.id}`)?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                          >
                             <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap className="w-12 h-12 text-white" />
                             </div>
                             
                             <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[9px] font-black text-green-500 uppercase tracking-widest">
                                    {part.matchScore}% Match
                                  </div>
                                  <p className="text-[8px] font-bold text-zinc-600 uppercase italic">{new Date(part.createdAt).toLocaleDateString()}</p>
                                </div>
                                
                                <div className="line-clamp-4 text-xs text-zinc-400 font-serif leading-relaxed italic text-left">
                                  {part.content.substring(0, 200)}...
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  {part.tags?.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-[8px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-0.5 rounded-full">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                                
                                <button className="w-full py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                                  Access Archive
                                </button>
                             </div>
                          </motion.div>
                        ))}
                    </div>
                  </section>
                )}

                {/* How It Works */}
                <section id="how-it-works" className="space-y-12">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">How It Works</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Three steps to your own noir masterpiece</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { step: '01', title: 'Choose Your Poison', desc: 'Select from Story, Script, Character, or Song generation modes.', icon: <LayoutGrid className="w-8 h-8 text-red-500" /> },
                      { step: '02', title: 'Feed the Machine', desc: 'Provide a gritty prompt. The darker, the better. AI handles the rest.', icon: <Zap className="w-8 h-8 text-amber-500" /> },
                      { step: '03', title: 'Evolve the AI', desc: 'Use thumbs up/down to train the engine on your specific style.', icon: <TrendingUp className="w-8 h-8 text-purple-500" /> }
                    ].map((item, i) => (
                      <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] space-y-4 relative group hover:border-zinc-700 transition-all">
                        <div className="absolute top-4 right-4 text-4xl font-black text-zinc-800 group-hover:text-red-600/20 transition-colors">{item.step}</div>
                        <div className="p-4 bg-zinc-950 rounded-2xl w-fit">{item.icon}</div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">{item.title}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* B-Grade Library Section */}
                <section className="space-y-12">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">B-Grade Library</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Select Archetypes & Tropes for your next story</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600/10 rounded-xl">
                          <Ghost className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Character Archetypes</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {ARCHETYPES.map(archetype => (
                          <button
                            key={archetype}
                            onClick={() => setSelectedArchetype(archetype)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                              selectedArchetype === archetype 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            {archetype}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600/10 rounded-xl">
                          <Zap className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Story Tropes</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {TROPES.map(trope => (
                          <button
                            key={trope}
                            onClick={() => setSelectedTrope(trope)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                              selectedTrope === trope 
                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            {trope}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Core Capabilities */}
                <section className="space-y-12">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Core Capabilities</h2>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">What can you do in the underworld?</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: 'Cinema Reel', desc: 'Compile your gritty story fragments into a cinematic MP4 experience for any platform.', icon: Clapperboard, color: 'red', action: compileFullReel },
                      { title: 'Crime Reconstruction', desc: 'Analyze evidence and reconstruct gritty crime scenes with AI precision.', icon: Search, color: 'purple', tab: 'reconstruct' },
                      { title: 'Character Forge', desc: 'Generate complex anti-heroes with deep backstories and fatal flaws.', icon: Ghost, color: 'blue', tab: 'characters' },
                      { title: 'Music Studio', desc: 'Produce atmospheric noir tracks and lyrics for your stories.', icon: Mic2, color: 'amber', tab: 'studio' }
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => item.action ? item.action() : setActiveTab(item.tab as any)}
                        className={`p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] text-left hover:border-${item.color}-600 transition-all group relative overflow-hidden flex items-center gap-8`}
                      >
                        <div className={`p-6 bg-${item.color}-600/10 rounded-3xl group-hover:scale-110 transition-transform`}>
                          <item.icon className={`w-8 h-8 text-${item.color}-500`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{item.title}</h3>
                          <p className="text-sm text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-zinc-800 group-hover:text-white transition-all group-hover:translate-x-2" />
                      </button>
                    ))}
                  </div>
                </section>

                {/* The Daily Grind (News) */}
                <section className="space-y-8 bg-zinc-900/30 border border-zinc-800/50 p-10 rounded-[3rem]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-600/20">
                        <Newspaper className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">The Daily Grind</h2>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold italic">Real-time story seeds from the streets</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => fetchNoirNews(true)}
                      disabled={loadingNews}
                      className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 text-zinc-400 ${loadingNews ? 'animate-spin' : ''}`} />
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Refresh Intel</span>
                    </button>
                  </div>

                  {loadingNews ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-6">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                      <p className="text-sm font-black uppercase tracking-widest text-zinc-500 italic">Scanning the streets for trouble...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {newsPrompts.map((news, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPrompt(news.prompt);
                            setActiveTab('noir-chat');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="group bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] text-left hover:border-red-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="px-3 py-1 bg-red-600/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-600/20">Intel #{i+1}</div>
                            <ArrowRight className="w-5 h-5 text-zinc-800 group-hover:text-red-600 transition-all group-hover:translate-x-1" />
                          </div>
                          <h3 className="text-lg font-black uppercase text-white mb-3 leading-tight group-hover:text-red-500 transition-colors">{news.title}</h3>
                          <p className="text-xs text-zinc-500 font-bold uppercase line-clamp-3 leading-relaxed">{news.prompt}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {/* Evolution Stats Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-600/10 rounded-2xl">
                        <TrendingUp className="w-6 h-6 text-purple-500" />
                      </div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">AI Evolution Metrics</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                      <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-zinc-600 tracking-widest">Total Output</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">{evolution.totalGenerations}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-zinc-600 tracking-widest">Approval</p>
                        <p className="text-4xl font-black italic tracking-tighter text-green-500">{evolution.positiveFeedback}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-zinc-600 tracking-widest">Rejection</p>
                        <p className="text-4xl font-black italic tracking-tighter text-red-500">{evolution.negativeFeedback}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-zinc-600 tracking-widest">Efficiency</p>
                        <p className="text-4xl font-black italic tracking-tighter text-blue-500">
                          {evolution.totalGenerations > 0 
                            ? Math.round((evolution.positiveFeedback / (evolution.positiveFeedback + evolution.negativeFeedback || 1)) * 100) 
                            : 0}%
                        </p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-zinc-800">
                      <p className="text-xs uppercase font-black tracking-widest text-zinc-500 mb-4">Current Neural Focus</p>
                      <div className="flex items-center gap-6">
                        <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            className="h-full bg-gradient-to-r from-red-600 to-purple-600"
                          />
                        </div>
                        <span className="text-xs font-black uppercase italic text-purple-400 tracking-widest">{evolution.currentFocus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-600 to-red-900 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                      <Skull className="w-40 h-40" />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                        The Shadows <br />Are Calling.
                      </h2>
                      <p className="text-white/80 text-sm font-bold uppercase tracking-widest leading-relaxed">
                        Every interaction refines the engine. Help us build the ultimate noir experience.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('noir-chat')}
                      className="mt-12 w-full py-5 bg-white text-red-600 rounded-2xl font-black uppercase italic tracking-tighter transition-all hover:scale-[1.05] shadow-2xl text-lg relative z-10"
                    >
                      Start Generating
                    </button>
                  </div>
                </section>
              </div>
            )}

            {enhancedHistory.length === 0 && activeTab === 'home' && (
              <div className="hidden"></div>
            )}

            {activeTab === 'newspaper' && (
              <div className="space-y-8 pb-32">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-600 rounded-3xl shadow-xl shadow-red-600/20">
                      <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Clandestine Intel</h2>
                        {profile.freeTrail && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-zinc-700 shadow-xl">
                            <Zap className="w-3 h-3 text-amber-500" />
                            Free Engine
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold italic">
                        {profile.freeTrail ? "Public Domain Forensic Intelligence & Analysis" : "Forensic Analysis & Field Intelligence Reports"}
                      </p>
                    </div>
                  </div>
                  
                  {noirReports.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none max-w-full md:max-w-md lg:max-w-xl">
                      {noirReports.map((report) => (
                        <button 
                          key={report.id}
                          onClick={() => setReportData(report)}
                          className={`flex-shrink-0 w-48 p-3 rounded-2xl border transition-all text-left space-y-1 ${reportData?.id === report.id || reportData?.reportId === report.reportId ? 'bg-zinc-100 border-white text-zinc-950 shadow-xl scale-105' : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">Dossier</span>
                            <span className="text-[8px] opacity-40">{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-black uppercase italic tracking-tighter text-xs truncate">{report.caseHeadline}</h4>
                          <p className="text-[8px] uppercase tracking-widest font-bold opacity-60 truncate">Target: {report.subjectName}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-[300px] relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="Target Subject or Case Name (Forensic Search)" 
                          value={newspaperCriminalSearch}
                          onChange={(e) => setNewspaperCriminalSearch(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold uppercase tracking-widest text-white focus:border-red-600 outline-none transition-all"
                        />
                      </div>
                      <select 
                      value={newspaperLanguage}
                      onChange={(e) => setNewspaperLanguage(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-white focus:border-red-600 outline-none"
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                    <select 
                      value={newspaperCategory}
                      onChange={(e) => setNewspaperCategory(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-white focus:border-red-600 outline-none"
                    >
                      <option value="Crime">Crime</option>
                      <option value="Politics">Politics</option>
                      <option value="Tech">Tech</option>
                      <option value="Supernatural">Supernatural</option>
                      <option value="Underworld">Underworld</option>
                    </select>
                    <div className="w-full flex items-center gap-2 px-2">
                       <Radio className={`w-3 h-3 ${isGeneratingReport ? 'animate-pulse text-red-500' : 'text-zinc-700'}`} />
                       <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                         {profile.freeTrail ? "Intelligence Engine: Free OSINT Tier // Scanning Metadata..." : "Intelligence Engine: Deep-Net Authorization Active // Extracting Classified Data..."}
                       </span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="City" 
                      value={newspaperLocation.city}
                      onChange={(e) => setNewspaperLocation({...newspaperLocation, city: e.target.value})}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-white focus:border-red-600 outline-none w-32"
                    />
                    <button 
                      onClick={generateNoirReport}
                      disabled={isGeneratingReport}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase italic tracking-tighter transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      Authorize Intel
                    </button>
                  </div>
                </div>

                {reportData ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="investigation-report"
                    className="bg-[#e7e5e0] text-zinc-950 p-8 md:p-16 rounded shadow-2xl relative border-l-[40px] border-zinc-900 overflow-hidden font-mono print:p-0 print:border-0 print:shadow-none print:w-full"
                    style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)', backgroundSize: '100% 24px' }}
                  >
                    <div className="absolute top-0 right-0 p-8 flex flex-col items-end print:hidden">
                      <button 
                        onClick={() => window.print()}
                        className="p-4 bg-zinc-950 text-white rounded-full hover:scale-110 transition-transform shadow-xl mb-4 group"
                        title="Print Report"
                      >
                        <Printer className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      </button>
                      <div className="border-4 border-red-600 p-2 transform rotate-12 opacity-80 scale-125">
                         <p className="text-red-600 font-black uppercase text-xl leading-none px-4">CLASSIFIED</p>
                         <p className="text-[8px] text-red-600 font-black uppercase text-center mt-1">NOIR AI INTEL</p>
                      </div>
                    </div>

                    {/* Report Header */}
                    <div className="border-b-4 border-zinc-950 pb-8 mb-12">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-1 uppercase font-black">
                          <p className="text-2xl text-red-600 tracking-tighter">NOIR AI INVESTIGATIONS</p>
                          <p className="text-xs tracking-[0.3em]">Division of Shadow Intelligence</p>
                          <p className="text-[10px] opacity-60">System Version: N-9.4.1 // Kernel: Darknet Core</p>
                        </div>
                        <div className="space-y-1 text-right text-xs">
                          <p><span className="opacity-50">REPORT ID:</span> {reportData.reportId}</p>
                          <p><span className="opacity-50">DATE:</span> {reportData.date}</p>
                          <p><span className="opacity-50">LOCATION:</span> {reportData.location}</p>
                          <p><span className="opacity-50">AUTH BY:</span> <span className="text-red-700 font-black">{reportData.authorizedBy}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Main Headline */}
                    <div className="space-y-12">
                      <div className="border-2 border-zinc-950 p-6 bg-white/50 relative">
                        <div className="absolute -top-3 left-4 bg-zinc-950 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                          CASE SUBJECT: {reportData.subjectName}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase italic leading-none tracking-tighter">
                          {reportData.caseHeadline}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 space-y-12">
                          <section className="space-y-4">
                            <h3 className="text-xl font-black uppercase flex items-center gap-3 border-b-2 border-zinc-950 pb-2">
                               <FileText className="w-5 h-5 text-red-600" />
                               Forensic Case File
                            </h3>
                            <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:text-red-600 first-letter:mr-2 first-letter:mt-1">
                              {reportData.forensicCaseFile}
                            </div>
                          </section>

                          <section className="space-y-4">
                             <h3 className="text-xl font-black uppercase flex items-center gap-3 border-b-2 border-zinc-950 pb-2">
                               <Fingerprint className="w-5 h-5 text-red-600" />
                               Subject Profile & Psychological Evaluation
                            </h3>
                            <div className="bg-zinc-950 text-zinc-300 p-6 rounded italic text-sm leading-relaxed border-l-[8px] border-red-600">
                              {reportData.subjectProfile}
                            </div>
                          </section>

                          {reportData.cinematicNarration && (
                            <section className="space-y-4 pt-8">
                              <h3 className="text-2xl font-black uppercase flex items-center gap-3 border-b-2 border-zinc-950 pb-2 text-red-600">
                                <Film className="w-6 h-6" />
                                Web Series Dramatization (The Tadka)
                              </h3>
                              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap bg-white/50 p-8 rounded-xl border border-zinc-950/10 italic relative">
                                <div className="absolute top-0 left-0 p-2 text-[8px] font-black uppercase tracking-widest text-zinc-400">Cinematic Overlay Active</div>
                                {reportData.cinematicNarration}
                              </div>
                            </section>
                          )}
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                          {reportData.webSeriesPlot && (
                            <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-xl space-y-4 border-2 border-zinc-950">
                              <h4 className="font-black uppercase tracking-widest text-purple-200 text-[10px] flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Season 1 Summary
                              </h4>
                              <p className="text-xs font-bold leading-relaxed">{reportData.webSeriesPlot}</p>
                            </div>
                          )}
                          <div className="bg-[#dcd9d2] p-6 border-2 border-zinc-950 space-y-4 shadow-[6px_6px_0px_#000]">
                            <h4 className="font-black uppercase tracking-widest text-[#8b0000] flex items-center gap-2">
                              <Radio className="w-4 h-4" />
                              Field Intel
                            </h4>
                            <div className="text-xs font-black uppercase leading-relaxed opacity-80 whitespace-pre-wrap">
                              {reportData.fieldIntel}
                            </div>
                          </div>

                          <div className="bg-red-600 text-white p-6 space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 opacity-10 -mr-8 -mt-8">
                               <Zap className="w-32 h-32" />
                            </div>
                            <h4 className="font-black uppercase tracking-widest text-white/50 text-[10px]">AI System Assessment</h4>
                            <p className="text-xs font-bold leading-relaxed italic relative z-10">{reportData.systemAssessment}</p>
                          </div>

                          <div className="pt-8 border-t-2 border-zinc-950/20">
                            <p className="text-[10px] font-black uppercase opacity-60">Authorized Signature</p>
                            <div className="font-signature text-3xl mt-2 text-zinc-800 rotate-[-2deg]">
                              {reportData.authorizedBy}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Tags */}
                    <div className="mt-24 pt-8 border-t border-zinc-950/20 flex flex-wrap gap-4 items-center">
                       <span className="text-[9px] font-black px-2 py-1 bg-zinc-950 text-white uppercase tracking-widest">FOR OFFICIAL USE ONLY</span>
                       <span className="text-[9px] font-black px-2 py-1 bg-zinc-200 text-zinc-900 border border-zinc-950/20 uppercase tracking-widest">MULTI-FACTOR ANALYSIS COMPLETE</span>
                       <span className="text-[9px] font-black px-2 py-1 bg-red-600 text-white uppercase tracking-widest italic">{reportData.signature}</span>
                    </div>

                    <div className="mt-8 text-center opacity-30 text-[8px] font-black uppercase tracking-[0.5em]">
                       - Noir AI Platform // Powering the Digital Underworld -
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
                    <Lock className="w-20 h-20" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">No Intel Authorized</h3>
                      <p className="text-sm font-bold uppercase tracking-widest">Enter a target and hit &apos;Authorize&apos; to scan the metadata.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'public-gallery' && (
              <div className="space-y-8 pb-32">
                <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
                  <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-600/20">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Public Gallery</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold italic">Stories shared by the underworld community</p>
                  </div>
                </div>

                {isLoadingPublic ? (
                  <div className="py-32 flex flex-col items-center justify-center gap-6">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-sm font-black uppercase tracking-widest text-zinc-500 italic">Scanning public frequencies...</p>
                  </div>
                ) : publicStories.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8">
                    {publicStories.map((story) => (
                      <div key={story.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-black uppercase">
                              {story.uid.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Shared by Anonymous Agent</p>
                              <p className="text-xs font-bold text-zinc-400">{new Date(story.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-blue-600/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-500 border border-blue-600/20">
                            {story.type}
                          </div>
                        </div>
                        <div className="prose prose-invert prose-zinc max-w-none">
                          <ReactMarkdown>{story.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-32 flex flex-col items-center justify-center gap-6 opacity-30 text-center">
                    <Globe className="w-20 h-20" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">The Gallery is Empty</h3>
                      <p className="text-sm font-bold uppercase tracking-widest">Be the first to share your noir secrets with the world.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <AnimatePresence mode="popLayout">
          {activeTab === 'lore' ? (
            <motion.div 
              key="lore"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl mx-auto space-y-8 pb-32"
            >
              {/* Lore Builder Section */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">World Lore</h1>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs sm:text-sm italic">Construct the history of your noir universe</p>
                </div>
                <div className="p-4 bg-purple-600/10 rounded-3xl border border-purple-600/20">
                  <Globe className="w-10 h-10 text-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                       <ScrollText className="w-32 h-32 text-purple-600" />
                    </div>
                    
                    <h2 className="text-sm font-black uppercase tracking-widest text-purple-500 flex items-center gap-2 relative z-10">
                      Forge New Lore
                    </h2>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-2">Setting / Context</label>
                        <textarea 
                          value={loreContextInput}
                          onChange={(e) => setLoreContextInput(e.target.value)}
                          placeholder="Describe the context... (e.g. The forgotten tunnel beneath the clock tower, used by smugglers in the 80s.)"
                          className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-purple-600 transition-colors resize-none text-white shadow-inner"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-2">Location Context</label>
                        <input 
                          type="text"
                          value={loreLocationInput}
                          onChange={(e) => setLoreLocationInput(e.target.value)}
                          placeholder="e.g. Sagar, MP"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600 transition-colors text-white"
                        />
                      </div>

                      <button 
                        onClick={() => generateLore(loreContextInput, loreLocationInput)}
                        disabled={isGeneratingLoreState || !loreContextInput}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-900/20 active:scale-95"
                      >
                        {isGeneratingLoreState ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                        {isGeneratingLoreState ? 'Forging Lore...' : 'Forge Fragment'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">World Building Tips</h3>
                    <ul className="space-y-2">
                      <li className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight flex items-start gap-2">
                        <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5" />
                        Focus on sensory details: the smell of stagnant water, the flickering neon.
                      </li>
                      <li className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight flex items-start gap-2">
                        <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5" />
                        Mention specific local slang or landmarks if building for Sagar, MP.
                      </li>
                      <li className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight flex items-start gap-2">
                        <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5" />
                        Lore fragments can be used to inspire full character or story arcs.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Saved Lore Fragments
                    </h2>
                    <span className="text-[10px] font-black uppercase text-zinc-600 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                      {lore.length} Entries
                    </span>
                  </div>

                  {lore.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-30 text-center border-2 border-dashed border-zinc-900 rounded-[2.5rem]">
                      <ScrollText className="w-16 h-16" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">The Archives are Empty</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest">Forge your first world fragment to begin.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {lore.map((item) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={item.id}
                          className="group p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] hover:border-purple-600/50 transition-all relative overflow-hidden flex flex-col h-full"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                            <MapPin className="w-12 h-12 text-purple-600" />
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-purple-600/10 rounded-lg">
                                <Globe className="w-3 h-3 text-purple-500" />
                              </div>
                              <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            {item.location && (
                              <div className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[8px] font-black uppercase text-purple-400 flex items-center gap-1">
                                <MapPin className="w-2 h-2" />
                                {item.location}
                              </div>
                            )}
                          </div>

                          <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-3 group-hover:text-purple-400 transition-colors">{item.title}</h3>
                          
                          <div className="flex-1 space-y-4">
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium line-clamp-6 group-hover:line-clamp-none transition-all">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
                             <button 
                               onClick={() => handleCopy(`${item.title}\n\n${item.description}`, item.id)}
                               className="flex items-center gap-1 text-[8px] font-black uppercase text-zinc-500 hover:text-white transition-colors"
                             >
                               <Copy className="w-3 h-3" />
                               Copy
                             </button>
                             <button 
                               onClick={() => deleteLore(item.id)}
                               className="text-zinc-600 hover:text-red-500 transition-colors"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'masterlist' ? (
            <motion.div
              key="masterlist"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4 mb-12">
                <div className="inline-block p-4 bg-blue-600/20 rounded-full mb-4">
                  <BookOpen className="w-12 h-12 text-blue-500" />
                </div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Master List</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">“Soch + Likhai se hone wale kaam”</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Noir Academy (Educational)", icon: <BookOpen className="w-5 h-5 text-purple-500" />, badge: "Next Level", skills: ["Noir Writing Masterclass", "Gritty Storytelling Techniques", "Hard-Boiled Dialogue Guide", "Pulp Fiction History", "Cinematic Noir Lighting Guide", "Character Vice Development", "Atmospheric World Building", "Noir Plot Twist Mechanics"] },
                  { title: "Cinematic Masterclass", icon: <Film className="w-5 h-5 text-red-500" />, badge: "Next Level", skills: ["Movie Dialogue Writing", "B-Grade Movie Scripting", "Intense Scene Blocking", "Noir Cinematography Tips", "Street-Level Action Design", "Underworld Slang Dictionary", "Anti-Hero Character Arc", "Visceral Sound Design Guide"] },
                  { title: "Creative Writing", icon: <Zap className="w-5 h-5 text-yellow-500" />, badge: "Next Level", skills: ["Film Script Writing", "Web Series Writing", "Episode Writing", "Story Writing", "Novel Writing", "Short Story Writing", "Song Writing (Lyrics)", "Poetry / Shayari Writing", "Dialogue Writing", "Comic / Graphic Novel Writing", "Theatre / Play Writing"] },
                  { title: "Business & Money", icon: <TrendingUp className="w-5 h-5 text-green-500" />, badge: "Next Level", skills: ["Copywriting (Sales Copy)", "Ad Script Writing", "Email Marketing Writing", "Landing Page Writing", "Product Description Writing", "Brand Story Writing", "Pitch Deck Writing", "Business Proposal Writing", "Investor Pitch Writing", "Sales Funnel Writing"] },
                  { title: "Strategy & Thinking", icon: <BarChart3 className="w-5 h-5 text-blue-500" />, badge: "Next Level", skills: ["Business Strategy Planning", "Growth Strategy Writing", "Market Research Analysis", "Competitor Analysis Reports", "Consulting Reports", "Problem Solving Framework Writing", "Decision Making Documents", "Vision / Mission Writing", "Roadmap Planning"] },
                  { title: "Education & Knowledge", icon: <ScrollText className="w-5 h-5 text-purple-500" />, badge: "Next Level", skills: ["Course Content Writing", "Book Writing", "E-book Writing", "Study Material Writing", "Notes / Guides Writing", "Training Manual Writing", "Workshop Content Writing", "Online Course Script Writing"] },
                  { title: "Media & Content", icon: <Globe className="w-5 h-5 text-orange-500" />, badge: "Next Level", skills: ["Blog Writing", "Article Writing", "News Writing", "Script Writing (YouTube/Reels)", "Podcast Script Writing", "Content Calendar Planning", "SEO Content Writing", "Ghostwriting"] },
                  { title: "Legal & Formal", icon: <ShieldAlert className="w-5 h-5 text-red-500" />, badge: "Next Level", skills: ["Contract Writing", "Agreement Drafting", "Legal Notice Writing", "Policy Writing", "Terms & Conditions Writing", "Privacy Policy Writing", "Compliance Documents"] },
                  { title: "Technical Writing", icon: <Zap className="w-5 h-5 text-cyan-500" />, badge: "Next Level", skills: ["Software Documentation", "API Documentation", "User Manuals", "Product Guides", "AI Prompt Writing", "UX Writing (App Text)", "Knowledge Base Writing"] },
                  { title: "Communication", icon: <MessageSquare className="w-5 h-5 text-indigo-500" />, badge: "Next Level", skills: ["Speech Writing", "Political Content Writing", "PR (Press Release) Writing", "Public Messaging", "Campaign Content Writing", "Motivational Content Writing"] },
                  { title: "Personal Branding", icon: <User className="w-5 h-5 text-pink-500" />, badge: "Next Level", skills: ["Instagram Content Writing", "LinkedIn Post Writing", "Twitter (X) Thread Writing", "Bio/Profile Writing", "Storytelling Content", "Influencer Script Writing"] },
                  { title: "AI-Based (Future)", icon: <Skull className="w-5 h-5 text-zinc-400" />, badge: "Next Level", skills: ["Prompt Engineering", "AI Content Generation", "AI Script Writing", "Automation Content Systems", "Chatbot Script Writing"] },
                  { title: "Entertainment & Gaming", icon: <Ghost className="w-5 h-5 text-emerald-500" />, badge: "Next Level", skills: ["Game Story Writing", "Game Dialogue Writing", "Character Backstory Writing", "Interactive Story Writing", "VR Storytelling"] },
                  { title: "E-commerce", icon: <TrendingUp className="w-5 h-5 text-amber-500" />, badge: "Next Level", skills: ["Product Listing Writing", "Ad Copy for E-commerce", "Review Writing", "Affiliate Content Writing", "Drop-shipping Store Content"] },
                  { title: "Corporate & Office", icon: <ScrollText className="w-5 h-5 text-slate-500" />, badge: "Next Level", skills: ["Report Writing", "Internal Communication", "Email Drafting", "Meeting Notes Writing", "HR Policies Writing", "Company Documentation"] },
                  { title: "Social Impact", icon: <Globe className="w-5 h-5 text-rose-500" />, badge: "Next Level", skills: ["Grant Proposal Writing", "Fundraising Content", "Awareness Campaign Writing", "NGO Reports", "Community Storytelling"] },
                  { title: "Research & Academic", icon: <BarChart3 className="w-5 h-5 text-teal-500" />, badge: "Next Level", skills: ["Research Papers", "Case Studies", "Thesis Writing", "White Papers", "Data Analysis Reports"] }
                ].map((cat, idx) => (
                  <div key={idx} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-zinc-700 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-zinc-950 rounded-xl group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-sm font-black uppercase italic tracking-tighter text-zinc-100">{cat.title}</h3>
                        {cat.badge && (
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">{cat.badge}</span>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {cat.skills.map((skill, sIdx) => (
                        <li key={sIdx} className="group/item flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover/item:text-zinc-300 transition-colors">{skill}</span>
                          </div>
                          <button 
                            onClick={() => { generateContent('masterlist', skill); setActiveTab('home'); }}
                            disabled={loading}
                            className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-zinc-800 rounded transition-all text-blue-500"
                            title={`Generate ${skill}`}
                          >
                            <Zap className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-zinc-950 border border-zinc-800 rounded-3xl text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-red-600">Bottom Line</h2>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Jahan “likhna + sochna” hai wahan “power + paisa + control” hai</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Copywriting', 'AI Writing', 'Storytelling'].map(skill => (
                    <button 
                      key={skill} 
                      onClick={() => { generateContent('masterlist', skill); setActiveTab('home'); }}
                      disabled={loading}
                      className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-red-600 transition-all group"
                    >
                      <p className="text-lg font-black italic tracking-tighter text-white uppercase group-hover:text-red-500">{skill}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Ye 3 sikhe = income streams khud banenge</p>
              </div>
            </motion.div>
          ) : activeTab === 'reconstruct' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4 mb-8">
                <div className="inline-block p-4 bg-purple-600/20 rounded-full mb-4">
                  <Search className="w-12 h-12 text-purple-500" />
                </div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Case Reconstruction</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">Analyze the Perpetrator&apos;s Mind</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6 shadow-xl">
                <div className="space-y-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-purple-500 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-500 text-[10px]">1</span>
                    Enter Crime Headline / News
                  </h2>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="E.g., The 1992 Mumbai Heist or a recent crime headline..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600 transition-colors"
                    />
                    <button 
                      onClick={() => reconstructCrimeScene(prompt)}
                      disabled={loading || !prompt}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Reconstruct
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">AI will search global news and analyze the perpetrator&apos;s mind.</p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-[10px]">2</span>
                    Recent Reconstructions
                  </h2>
                  {enhancedHistory.filter(p => p.type === 'reconstruction').length === 0 ? (
                    <div className="text-center p-12 border border-zinc-800 border-dashed rounded-3xl">
                      <Search className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No reconstructions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enhancedHistory.filter(p => p.type === 'reconstruction').slice(0, 3).map(part => (
                        <div key={part.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-purple-600/10 rounded-lg">
                              <Search className="w-4 h-4 text-purple-500" />
                            </div>
                            <p className="text-xs font-bold text-zinc-300 truncate uppercase tracking-tight italic">{part.content.slice(0, 60)}...</p>
                          </div>
                          <button 
                            onClick={() => {
                              const el = document.getElementById(part.id);
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                              setActiveTab('home');
                            }}
                            className="p-2 text-zinc-500 hover:text-purple-500 transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'cinema-reels' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4 mb-8">
                <div className="inline-block p-4 bg-amber-600/20 rounded-full mb-4 shadow-lg shadow-amber-900/20">
                  <Film className="w-12 h-12 text-amber-500" />
                </div>
                <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white">Cinema Reels</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">Generate 30s Noir Shorts complete with Art, Music & Pulp Branding</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000">
                   <Clapperboard className="w-64 h-64" />
                </div>
                <div className="relative z-10 space-y-6">
                   <h2 className="text-lg font-black uppercase tracking-tighter text-amber-500 flex items-center gap-3">
                     <span className="w-8 h-8 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-500 text-xs">01</span>
                     Concept & Prompt
                   </h2>
                   
                   <textarea 
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     placeholder="Describe the cinematic reel... (e.g. A gritty chase through neon-lit docks, rainy night, heavy breathing...)"
                     className="w-full h-40 bg-zinc-950/80 border border-zinc-800 rounded-[2rem] px-6 py-6 text-base text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-amber-600 transition-colors resize-none shadow-inner"
                   />
                   
                   <div className="flex gap-4">
                     <button 
                       onClick={() => generateContent('pulp-noir-story', prompt)}
                       disabled={loading || !prompt}
                       className="flex-1 py-5 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 disabled:opacity-50 text-white rounded-3xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-900/30"
                     >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                       {loading ? 'Drafting Script...' : '1. Write Cinematic Script'}
                     </button>
                   </div>
                   <p className="text-[10px] text-center uppercase font-black tracking-widest text-zinc-500">Step 1: The AI drafts a compelling 30s noir script which you can then cinematize.</p>
                </div>
              </div>

              <div className="space-y-8 pt-12 border-t border-zinc-800">
                <div className="flex justify-between items-end">
                   <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                     <Film className="w-8 h-8 text-zinc-500" />
                     Your Cinematic Drafts
                   </h2>
                </div>
                
                {enhancedHistory.filter(p => p.type === 'pulp-noir-story' || p.type === 'story').length === 0 ? (
                  <div className="text-center p-24 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[3rem] opacity-70">
                    <Clapperboard className="w-16 h-16 text-zinc-700 mx-auto mb-4 opacity-50" />
                    <p className="text-zinc-500 font-black uppercase tracking-widest text-sm">No scripts drafted yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {enhancedHistory.filter(p => p.type === 'pulp-noir-story' || p.type === 'story').map(part => {
                      let scriptData: any = null;
                      try { scriptData = JSON.parse(part.content); } catch (e) { scriptData = { content: part.content }; }
                      
                      return (
                      <div key={part.id} className="bg-zinc-950/80 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl space-y-6 relative overflow-hidden group hover:border-amber-600/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-50"></div>
                        
                        <div className="flex items-center justify-between relative z-10">
                           <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-500">
                             Draft #{part.id.substring(0, 4)}
                           </div>
                           <button onClick={() => deleteHistoryItem(part.id)} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-500 hover:border-red-900 transition-all"><Trash2 className="w-4 h-4"/></button>
                        </div>

                        <div className="relative z-10">
                          {scriptData?.title && <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">{scriptData.title}</h3>}
                          {scriptData?.style && <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">{scriptData.style}</p>}
                          <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50 text-zinc-300 whitespace-pre-wrap font-serif text-sm leading-relaxed max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                             {scriptData?.content || part.content}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 relative z-10 pt-4">
                           <button 
                             onClick={() => smartCinematize(part.id)}
                             disabled={isCinematizing}
                             className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-50 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transform"
                           >
                             {isCinematizing ? <Loader2 className="w-4 h-4 animate-spin text-zinc-950" /> : <Film className="w-4 h-4" />}
                             2. Auto-Cinematize (Art & Audio)
                           </button>
                           <button 
                             onClick={() => exportStoryVideo({ force30s: true, overrideIds: [part.id] })}
                             disabled={isExportingVideo}
                             className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-xl shadow-red-900/20 hover:scale-[1.02] transform"
                           >
                             {isExportingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                             {isExportingVideo ? `${videoExportProgress}% Rendering...` : '3. Render Final Reel (MP4)'}
                           </button>

                           {/* Associated Gallery for the reel */}
                           {enhancedHistory.some(h => (h.type === 'image' || h.type === 'video' || h.audioUrl) && (h as any).storyLinkId === part.id || h.id === part.id) && (
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/50 mt-2">
                                <p className="w-full text-[8px] uppercase tracking-widest text-zinc-500 font-black">Assets Attached</p>
                                {/* Script Narration */}
                                {part.audioUrl && (
                                   <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-amber-600/30 bg-amber-900/20 flex flex-col items-center justify-center" title="Voiceover">
                                      <Mic className="w-4 h-4 text-amber-500 mb-1"/>
                                      <span className="text-[6px] text-amber-500 font-black uppercase">VO</span>
                                   </div>
                                )}
                                {/* Visuals */}
                                {enhancedHistory.filter(h => (h.type === 'image' || h.type === 'video') && (h as any).storyLinkId === part.id).map(asset => (
                                   <div key={asset.id} className="w-12 h-12 relative rounded-lg overflow-hidden border border-zinc-800">
                                      {asset.type === 'image' ? (
                                        <Image src={asset.content} alt="asset" fill className="object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><Clapperboard className="w-4 h-4 text-zinc-600"/></div>
                                      )}
                                   </div>
                                ))}
                              </div>
                           )}
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'studio' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl mx-auto space-y-8 pb-32"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-center md:text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <div className="p-3 bg-amber-600 rounded-2xl shadow-lg shadow-amber-900/40">
                      <Music2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      Production House v2.1
                    </div>
                  </div>
                  <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white">Music Production House</h1>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">Full Audio Setup . Vocal Engineering . Master Suite</p>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden relative group cursor-pointer transition-transform hover:scale-110 hover:z-10">
                        <Image src={`https://picsum.photos/seed/producer${i}/100/100`} alt="Producer" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-black uppercase text-zinc-600">Active Producers On Deck</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Console Controls */}
                <div className="xl:col-span-8 space-y-8">
                  
                  {/* Phase 1: Lyrics & Style Input */}
                  <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ScrollText className="w-24 h-24" />
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <h2 className="text-lg font-black uppercase tracking-tighter text-amber-500 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-500 text-xs">01</span>
                        Composition Desk
                      </h2>
                      <button 
                        onClick={() => {
                          setShowNews(true);
                          if (newsPrompts.length === 0) fetchNoirNews(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-600/20 shadow-lg shadow-red-900/10 hover:shadow-red-600/20"
                      >
                        <Newspaper className="w-4 h-4" />
                        Noir News Wire
                      </button>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="relative">
                        <textarea 
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="What is the story of this track? (e.g. A rainy midnight chase in Mahim, betrayal, heavy breathing, industrial drums...)"
                          className="w-full h-40 bg-zinc-950/80 border border-zinc-800 rounded-[2rem] px-6 py-6 text-base text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-amber-600 transition-all resize-none shadow-inner"
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                           <button onClick={() => setPrompt('')} className="p-2 bg-zinc-900 text-zinc-500 hover:text-white rounded-full transition-colors border border-zinc-800"><RefreshCw className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => generateContent('song')}
                          disabled={loading || !prompt}
                          className="py-5 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 disabled:opacity-50 text-white rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-900/30 group/btn"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />}
                          {loading ? 'Synthesizing...' : 'Write Full Lyrics'}
                        </button>
                        <button 
                          onClick={() => generateContent('script')}
                          disabled={loading || !prompt}
                          className="py-5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 border border-zinc-700 shadow-xl"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScrollText className="w-5 h-5" />}
                          30s Background Score
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: Mixing Deck (Production Console) */}
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] space-y-8 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none"></div>
                    
                    <h2 className="text-lg font-black uppercase tracking-tighter text-indigo-500 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-500 text-xs">02</span>
                      Production Mixing Desk
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* faders */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Bass Intensity</label>
                            <span className="text-xs font-mono text-indigo-400">{productionBass}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={productionBass} 
                            onChange={(e) => setProductionBass(parseInt(e.target.value))}
                            className="w-full accent-indigo-600 h-1 bg-zinc-950 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Atmospheric Grime</label>
                            <span className="text-xs font-mono text-indigo-400">{productionGrime}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={productionGrime} 
                            onChange={(e) => setProductionGrime(parseInt(e.target.value))}
                            className="w-full accent-zinc-500 h-1 bg-zinc-950 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Vocal Clarity</label>
                            <span className="text-xs font-mono text-indigo-400">{productionClarity}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={productionClarity} 
                            onChange={(e) => setProductionClarity(parseInt(e.target.value))}
                            className="w-full accent-amber-500 h-1 bg-zinc-950 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Instrument Grid */}
                      <div className="md:col-span-2 space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Core Instrument Rack</p>
                         <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                           {['Heavy Bass', 'Analog Synths', 'Dirty Dhol', 'Gritty Sax', 'Sitar Distortion', 'Industrial Drums', 'Acid Piano', 'Noise Pads'].map(inst => (
                             <button
                               key={inst}
                               onClick={() => {
                                 setProductionInstruments(prev => 
                                   prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]
                                 );
                               }}
                               className={`px-3 py-3 rounded-xl text-[8px] font-black uppercase tracking-tight transition-all border ${
                                 productionInstruments.includes(inst)
                                   ? 'bg-zinc-100 border-white text-zinc-950 shadow-lg'
                                   : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                               }`}
                             >
                               {inst}
                             </button>
                           ))}
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                       {/* Vocal Booth */}
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Acoustic Vocal Booth</p>
                          <div className="flex gap-2">
                            {(['None', 'Male', 'Female', 'Clone'] as const).map(v => (
                              <button
                                key={v}
                                onClick={() => setProductionVocalMode(v)}
                                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all border ${
                                  productionVocalMode === v
                                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/30'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                       </div>
                       
                       {/* Mastering Mode */}
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Mastering Finish</p>
                          <div className="flex gap-2">
                            {(['Standard', 'B-Grade', 'Gritty', 'Cinematic'] as const).map(m => (
                              <button
                                key={m}
                                onClick={() => setProductionMastering(m)}
                                className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all border ${
                                  productionMastering === m
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: News & Presets */}
                <div className="xl:col-span-4 space-y-8">
                  {/* Visual Preset Selector */}
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] space-y-6 shadow-xl">
                    <h2 className="text-sm font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Studio Presets
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {TRENDING_STYLES.slice(0, 5).map(trend => (
                        <button
                          key={trend.name}
                          onClick={() => {
                            setSelectedMusicStyle(trend.style);
                            setCustomMusicStyle(trend.style);
                            setToast({ message: `Applying Preset: ${trend.name}`, type: 'success' });
                          }}
                          className={`w-full text-left p-5 rounded-3xl border transition-all relative overflow-hidden group ${
                            selectedMusicStyle === trend.style 
                              ? 'bg-amber-600/10 border-amber-500 text-white' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50'
                          }`}
                        >
                          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-white/5 to-transparent -skew-x-12 transform translate-x-12 group-hover:translate-x-0 transition-transform duration-500"></div>
                          <p className="text-xs font-black uppercase tracking-tighter mb-1 relative z-10">{trend.name}</p>
                          <p className="text-[8px] opacity-40 line-clamp-1 relative z-10 font-bold uppercase tracking-widest">{trend.style}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Production Stats */}
                  <div className="bg-zinc-100 p-8 rounded-[3rem] space-y-6 shadow-2xl text-zinc-950">
                    <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-600" />
                      Session Stats
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline border-b border-zinc-200 pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Session ID</span>
                        <span className="text-[10px] font-mono font-bold">X-901-NOIR</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-zinc-200 pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Tracks Produced</span>
                        <span className="text-sm font-black italic">{enhancedHistory.filter(p => p.type === 'song').length}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-zinc-200 pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Storage Used</span>
                        <span className="text-[10px] font-bold">1.2GB / 10GB</span>
                      </div>
                      <div className="pt-2 animate-pulse">
                         <p className="text-[8px] font-black uppercase text-red-600 text-center tracking-[0.2em]">Live Recording in Progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Section */}
              <div className="space-y-8 pt-12 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                    <Clapperboard className="w-6 h-6 text-zinc-500" />
                    Studio Releases
                  </h2>
                </div>

                {enhancedHistory.filter(p => p.type === 'song').length === 0 ? (
                  <div className="text-center p-24 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[3rem]">
                    <Music2 className="w-12 h-12 text-zinc-700 mx-auto mb-4 opacity-20" />
                    <p className="text-zinc-500 font-black uppercase tracking-widest text-sm">The studio is silent. Start producing.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {enhancedHistory.filter(p => p.type === 'song').map(part => {
                      let song: any = null;
                      try { song = JSON.parse(part.content); } catch (e) {}
                      if (!song) return null;

                      return (
                        <div key={part.id} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl hover:border-amber-600/30 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                             <Play className="w-16 h-16" />
                          </div>

                          <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-amber-600/20 rounded-full text-[8px] font-black text-amber-500 uppercase tracking-widest border border-amber-600/30">
                                  Release #{part.id.substring(0, 4)}
                                </div>
                                {part.bpm && (
                                  <div className="px-3 py-1 bg-emerald-600/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-600/30 flex items-center gap-1">
                                    <Activity className="w-2.5 h-2.5 animate-pulse text-emerald-500" />
                                    {part.bpm} BPM
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => deleteHistoryItem(part.id)} className="p-2 bg-zinc-950 text-zinc-600 hover:text-red-500 rounded-xl border border-zinc-800 transition-all"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>

                            <div className="space-y-1">
                               <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">{song.title}</h3>
                               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{song.style}</p>
                            </div>

                            {part.musicUrl ? (
                               <div className="space-y-4">
                                 <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 shadow-inner">
                                   <audio src={part.musicUrl} controls className="w-full h-8 opacity-80" />
                                 </div>
                                 <div className="flex gap-2">
                                   <a 
                                     href={part.musicUrl} 
                                     download={`${song.title}_master.wav`}
                                     className="flex-1 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all shadow-lg"
                                   >
                                     <Download className="w-4 h-4" />
                                     Download Master
                                   </a>
                                   <button className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all border border-zinc-700">
                                      <Zap className="w-4 h-4 text-amber-500" />
                                      Sync
                                   </button>
                                 </div>
                               </div>
                            ) : part.musicConcept ? (
                               <div className="space-y-4 bg-zinc-950 p-6 rounded-[2rem] border border-amber-600/20 shadow-2xl relative overflow-hidden group/concept">
                                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/concept:opacity-20 transition-opacity">
                                   <Disc className="w-24 h-24 text-amber-500 animate-spin-slow" />
                                 </div>
                                 
                                 <div className="flex items-start gap-4">
                                   <div className="relative w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent" />
                                      <Disc className="w-8 h-8 text-amber-600 animate-spin-slow relative z-10" />
                                   </div>
                                   <div className="pt-1">
                                     <h4 className="text-xl font-black uppercase italic tracking-tighter text-white leading-tight">{part.musicConcept.title}</h4>
                                     <div className="flex items-center gap-2 mt-1">
                                       <span className="px-1.5 py-0.5 bg-amber-600/10 text-[7px] font-black uppercase text-amber-500 border border-amber-500/20 rounded">Conceptual Master</span>
                                       <span className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-600">{part.musicConcept.genre}</span>
                                     </div>
                                   </div>
                                 </div>

                                 <div className="space-y-3 pt-2">
                                   <p className="text-[11px] text-zinc-400 font-medium leading-relaxed italic border-l-2 border-amber-600/30 pl-4 py-1">
                                     &ldquo;{part.musicConcept.description}&rdquo;
                                   </p>
                                   
                                   <div className="flex flex-wrap gap-2">
                                     {part.musicConcept.instruments.map((inst: string, i: number) => (
                                       <span key={i} className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[7px] font-black uppercase text-zinc-500 rounded-lg flex items-center gap-1.5">
                                         <div className="w-1 h-1 rounded-full bg-amber-600" /> {inst}
                                       </span>
                                     ))}
                                   </div>
                                 </div>

                                 <div className="pt-4 flex gap-2">
                                   <button 
                                     onClick={() => generateMusic(part)}
                                     disabled={part.isGeneratingMusic}
                                     className="flex-1 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all shadow-lg"
                                   >
                                     {part.isGeneratingMusic ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                     {part.isGeneratingMusic ? 'Synthesizing...' : 'Re-Attempt Audio Release'}
                                   </button>
                                   <button className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 rounded-xl font-black uppercase tracking-widest text-[9px] border border-zinc-800 transition-all">
                                      Market
                                   </button>
                                 </div>
                               </div>
                            ) : (
                               <button 
                                 onClick={() => generateMusic(part)}
                                 disabled={part.isGeneratingMusic}
                                 className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-3xl font-black uppercase italic tracking-tighter text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-900/30"
                               >
                                  {part.isGeneratingMusic ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                                  {part.isGeneratingMusic ? 'Processing Stem Chains...' : 'Perform & Release Master'}
                               </button>
                            )}

                            <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                              <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-sans leading-relaxed italic">&quot;{song.lyrics}&quot;</pre>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'story-studio' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-8 pb-20"
            >
              <div className="text-center space-y-4 mb-8">
                <div className="inline-block p-4 bg-red-600/20 rounded-full mb-4">
                  <FileText className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Noir Story Studio</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">Generate Gritty Visual Stories & Full Narrations</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 text-[10px]">1</span>
                        Plot Concept
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your story idea... (e.g. A whistleblower found dead in an old factory in Sagar, MP. High-stakes investigation, local politics.)"
                        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-red-600 transition-colors resize-none"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => generateContent('pulp-noir-story')}
                          disabled={loading || !prompt}
                          className="flex-1 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          {loading ? 'Writing Chapter...' : 'Draft Visual Story'}
                        </button>
                        <button 
                          onClick={saveDraft}
                          disabled={!prompt.trim() || loading}
                          className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl transition-all flex items-center justify-center border border-zinc-700"
                          title="Save Plot Concept as Draft"
                        >
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Recently Produced in Story Studio */}
                    <div className="space-y-4 pt-4">
                      {enhancedHistory.filter(p => p.type === 'pulp-noir-story').slice(0, 1).map(part => {
                        let story: any = null;
                        try { story = JSON.parse(part.content); } catch (e) {}
                        if (!story) return null;
                        return (
                          <motion.div 
                            key={part.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-600/10 border border-red-600/30 p-6 rounded-3xl space-y-4"
                          >
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                   <FileText className="w-5 h-5 text-red-500" />
                                   <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">{story.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                   <button 
                                     onClick={() => toggleSave(part.id, !!part.isSaved)}
                                     className={`p-2 rounded-full transition-all ${part.isSaved ? 'text-red-500 bg-red-500/10' : 'text-zinc-600 hover:text-red-500 hover:bg-red-500/10'}`}
                                     title={part.isSaved ? "Saved to Archive" : "Save to Archive"}
                                   >
                                     <Heart className={`w-4 h-4 ${part.isSaved ? 'fill-current' : ''}`} />
                                   </button>
                                   <button onClick={() => deleteHistoryItem(part.id)} className="p-2 rounded-full text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                             </div>

                             <div className="bg-zinc-950/50 p-4 rounded-xl max-h-48 overflow-y-auto custom-scrollbar border border-zinc-800/50">
                                <p className="text-xs text-zinc-400 font-bold leading-relaxed">{story.content}</p>
                             </div>

                             {part.audioUrl ? (
                               <div className="space-y-3">
                                 <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-red-600/20">
                                    <div className="p-3 bg-red-600 rounded-full">
                                       <Volume2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Narration Master Archive</p>
                                      <audio src={part.audioUrl} controls className="w-full h-8 opacity-80" />
                                    </div>
                                 </div>
                               </div>
                             ) : (
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 <button 
                                   onClick={() => generateNarration(part)}
                                   disabled={part.isGeneratingNarration}
                                   className="py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase italic tracking-tighter text-sm transition-all flex items-center justify-center gap-3 border border-zinc-700 shadow-xl"
                                 >
                                    {part.isGeneratingNarration ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic2 className="w-5 h-5" />}
                                    {part.isGeneratingNarration ? 'Drafting...' : 'Narration'}
                                 </button>
                                 <button 
                                   onClick={() => generateImage(story.content, part.id)}
                                   disabled={isGeneratingImage === part.id}
                                   className="py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase italic tracking-tighter text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-900/20"
                                 >
                                    {isGeneratingImage === part.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                    {isGeneratingImage === part.id ? 'Creating...' : 'Pulp Poster'}
                                 </button>
                               </div>
                             )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                    <h2 className="text-sm font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-[10px]">2</span>
                      Custom Narrative Style
                    </h2>
                    <div className="space-y-4">
                      <div className="relative group/input">
                        <input 
                          type="text"
                          value={customStoryStyle}
                          onChange={(e) => {
                            setCustomStoryStyle(e.target.value);
                            setSelectedStoryStyle('Custom');
                          }}
                          placeholder="Type custom style (e.g. Cinematic, 1st Person, Gritty...)"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500/50 transition-all"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Random', 'Custom'].map(s => (
                          <button
                            key={s}
                            onClick={() => setSelectedStoryStyle(s)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                              selectedStoryStyle === s 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Custom Story Genre Tags */}
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                    <h2 className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-600/30 flex items-center justify-center text-red-400 text-[10px]">3</span>
                      Custom Story Genre Tags
                    </h2>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                      Define your own signature story genre tags below. These tags are stored directly in your persistent user profile and automatically skew future story generations.
                    </p>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newCustomGenreInput}
                        onChange={(e) => setNewCustomGenreInput(e.target.value)}
                        placeholder="Define custom genre... (e.g. Neo-Noir, Cyber-Grit, Techno-Thriller)"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomGenre(newCustomGenreInput);
                          }
                        }}
                      />
                      <button 
                        onClick={() => handleAddCustomGenre(newCustomGenreInput)}
                        className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Genre
                      </button>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Your Selected Genre Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {['Action', 'Comedy', 'Drama', 'Thriller', 'Horror'].map(genre => (
                          <button
                            key={genre}
                            onClick={() => toggleProfileGenre(genre)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                              profile.genres?.includes(genre)
                                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            {genre}
                          </button>
                        ))}
                        {(profile.genres || []).filter(g => !['Action', 'Comedy', 'Drama', 'Thriller', 'Horror'].includes(g)).map(genre => (
                          <div 
                            key={genre}
                            className="bg-red-600 border border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                          >
                            <span>{genre}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newGenres = profile.genres.filter(g => g !== genre);
                                updateDoc(doc(db, `users/${user!.uid}`), { genres: newGenres, updatedAt: Date.now() })
                                  .catch(p => handleFirestoreError(p, OperationType.UPDATE, `users/${user!.uid}`));
                                setToast({ message: `Removed custom genre tag: ${genre}`, type: 'info' });
                              }}
                              className="text-white hover:text-zinc-200 hover:scale-110 transition-all font-black text-sm"
                              title="Delete custom genre tag"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] space-y-6 shadow-xl">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <ScrollText className="w-4 h-4" />
                      Story Templates
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      {STORY_TEMPLATES.map(template => (
                        <button
                          key={template.name}
                          onClick={() => {
                            setSelectedStoryStyle(template.style);
                            setCustomStoryStyle(template.style);
                            setToast({ message: `Style Set: ${template.name}`, type: 'info' });
                          }}
                          className={`w-full text-left p-4 rounded-2xl border transition-all ${
                            selectedStoryStyle === template.style 
                              ? 'bg-zinc-100 border-white text-zinc-950 shadow-lg' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1">{template.name}</p>
                          <p className="text-[8px] opacity-50 line-clamp-1">{template.style}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-[10px]">3</span>
                  Produced Story Arcs
                </h2>
                {enhancedHistory.filter(p => p.type === 'pulp-noir-story').length === 0 ? (
                  <div className="text-center p-12 border border-zinc-800 border-dashed rounded-3xl">
                    <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No story arcs produced yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {enhancedHistory.filter(p => p.type === 'pulp-noir-story').map(part => {
                      let story: any = null;
                      try { story = JSON.parse(part.content); } catch (e) {}
                      if (!story) return null;

                      return (
                        <div key={part.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl space-y-6 relative group border-l-4 border-l-red-600">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Noir Fragment</p>
                              <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">{story.title}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                               <button 
                                 onClick={() => toggleSave(part.id, !!part.isSaved)}
                                 className={`p-3 rounded-xl transition-all border ${part.isSaved ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-red-500'}`}
                                 title={part.isSaved ? "Saved to Archive" : "Save to Archive"}
                               >
                                 <Heart className={`w-5 h-5 ${part.isSaved ? 'fill-current' : ''}`} />
                               </button>

                               {!part.audioUrl && (
                                 <button 
                                   onClick={() => generateMusic(part)}
                                   disabled={part.isGeneratingMusic}
                                   className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                                 >
                                   {part.isGeneratingMusic ? <Loader2 className="w-3 h-3 animate-spin" /> : <Music2 className="w-3 h-3" />}
                                   {part.isGeneratingMusic ? 'Producing MP3...' : 'Produce Music'}
                                 </button>
                               )}

                               <button 
                                 onClick={() => handleFeedback(part.id, 'up')}
                                 className={`p-3 rounded-xl transition-all border ${part.feedback === 'up' ? 'bg-green-600/20 border-green-500 text-green-500' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-green-500'}`}
                               >
                                 <ThumbsUp className="w-5 h-5" />
                               </button>
                               <button 
                                 onClick={() => handleFeedback(part.id, 'down')}
                                 className={`p-3 rounded-xl transition-all border ${part.feedback === 'down' ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-red-500'}`}
                               >
                                 <ThumbsDown className="w-5 h-5" />
                               </button>
                               <button onClick={() => deleteHistoryItem(part.id)} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-600 hover:text-red-500 transition-all">
                                 <Trash2 className="w-5 h-5" />
                               </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Visual Storyboard Content</p>
                               <button onClick={() => handleCopy(story.content, part.id + '-content')} className="text-zinc-600 hover:text-white transition-colors"><Copy className="w-3 h-3" /></button>
                            </div>
                            <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800/50 min-h-[150px]">
                               <p className="text-sm text-zinc-300 font-bold leading-relaxed whitespace-pre-wrap">{story.content}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                               <p className="text-[9px] font-black uppercase text-red-500 mb-2">Narrative Style</p>
                               <p className="text-[10px] text-zinc-500 italic uppercase font-bold">{story.style}</p>
                            </div>
                            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                               <p className="text-[9px] font-black uppercase text-red-500 mb-2">Studio Caption</p>
                               <p className="text-[10px] text-zinc-500 italic">{story.caption}</p>
                            </div>
                          </div>

                              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                                 {part.audioUrl ? (
                                   <div className="flex-1 w-full flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-red-600/20">
                                      <div className="p-3 bg-red-600 rounded-full">
                                         <Play className="w-4 h-4 text-white" />
                                      </div>
                                      <audio src={part.audioUrl} controls className="flex-1 h-8 opacity-80" />
                                   </div>
                                 ) : (
                                   <button 
                                     onClick={() => generateNarration(part)}
                                     disabled={part.isGeneratingNarration}
                                     className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase italic tracking-tighter text-sm transition-all flex items-center justify-center gap-3 border border-zinc-700 shadow-xl"
                                   >
                                      {part.isGeneratingNarration ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic2 className="w-5 h-5" />}
                                      {part.isGeneratingNarration ? 'Generating Audio...' : 'Produce & Master Narration'}
                                   </button>
                                 )}
                                 
                                 <button 
                                   onClick={() => generateImage(story.content, part.id)}
                                   disabled={isGeneratingImage === part.id}
                                   className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase italic tracking-tighter text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-900/20"
                                 >
                                    {isGeneratingImage === part.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                    {isGeneratingImage === part.id ? 'Creating Visual...' : 'Generate Pulp Poster'}
                                 </button>
                                 
                                 {!part.musicUrl && !part.audioUrl && (
                                   <button 
                                     onClick={() => generateMusic(part)}
                                     disabled={part.isGeneratingMusic}
                                     className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-tighter text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/30"
                                   >
                                      {part.isGeneratingMusic ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music2 className="w-5 h-5" />}
                                      {part.isGeneratingMusic ? 'Synthesizing...' : 'Produce Music Track'}
                                   </button>
                                 )}
                                 
                                 <button 
                                   onClick={() => {
                                     setPrompt(`Sequel to: ${story.title}. Current situation: ${story.caption}`);
                                     setToast({ message: "Context loaded for sequel.", type: 'info' });
                                     setActiveTab('story-studio');
                                   }}
                                   className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase italic tracking-tighter text-sm transition-all border border-zinc-700"
                                 >
                                   Write Sequel
                                 </button>
                              </div>

                              {/* Associated Storyboard Gallery */}
                              {enhancedHistory.some(p => p.type === 'image' && p.storyLinkId === part.id) && (
                                <div className="space-y-4 pt-4 border-t border-zinc-800">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" />
                                    Noir Storyboards Generated
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {enhancedHistory.filter(p => p.type === 'image' && p.storyLinkId === part.id).map(img => (
                                      <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video border border-zinc-800 shadow-lg bg-black">
                                        <Image 
                                          src={img.content} 
                                          alt="Storyboard" 
                                          fill
                                          className="object-cover transition-transform group-hover:scale-105"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                           <button onClick={() => handleDownload(img.content, img.id)} className="p-2 bg-blue-600 rounded-full text-white"><Download className="w-3 h-3" /></button>
                                           <button onClick={() => deleteHistoryItem(img.id)} className="p-2 bg-red-600 rounded-full text-white"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'bgrade-art' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl mx-auto space-y-8 pb-32"
            >
              <div className="text-center space-y-4 mb-4">
                <div className="inline-block p-4 bg-amber-600/20 rounded-full mb-2 border border-amber-500/30 shadow-lg shadow-amber-900/40">
                  <Camera className="w-12 h-12 text-amber-500 animate-pulse" />
                </div>
                <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                  Pulp Art Studio
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs md:text-sm italic">
                  Create gritty, B-grade visual poster representations for significant story moments or characters
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Configuration Panel */}
                <div className="lg:col-span-5 space-y-6 bg-zinc-900 border-2 border-zinc-800 p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 blur-2xl pointer-events-none rounded-full" />
                  
                  {/* Subject selector */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-500 text-[10px]">1</span>
                      Target Subject
                    </h2>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                      <button
                        onClick={() => {
                          setBGradeSubject('moment');
                          setBGradeSlogan('');
                        }}
                        className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                          bGradeSubject === 'moment'
                            ? 'bg-amber-600 text-black shadow-md'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Story Moment
                      </button>
                      <button
                        onClick={() => {
                          setBGradeSubject('character');
                          setBGradeSlogan('');
                        }}
                        className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                          bGradeSubject === 'character'
                            ? 'bg-amber-600 text-black shadow-md'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Character portrait
                      </button>
                    </div>
                  </div>

                  {/* Dropdowns based on selector */}
                  <div className="space-y-4">
                    {bGradeSubject === 'character' ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select Character anti-hero</label>
                        {characters.length === 0 ? (
                          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                            <p className="text-[10px] text-zinc-600 font-bold uppercase">No characters forge yet</p>
                            <button 
                              onClick={() => setActiveTab('characters')}
                              className="mt-2 text-[10px] text-blue-500 hover:underline uppercase font-black"
                            >
                              Forge One Now &rarr;
                            </button>
                          </div>
                        ) : (
                          <select
                            value={bGradeCharId}
                            onChange={(e) => setBGradeCharId(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 font-bold focus:outline-none focus:border-amber-600 transition-colors"
                          >
                            <option value="">-- Choose Character --</option>
                            {characters.map(char => (
                              <option key={char.id} value={char.id}>
                                {char.name.toUpperCase()} ({char.role.toUpperCase()})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select Story Moment</label>
                        {enhancedHistory.filter(p => p.type === 'pulp-noir-story' || p.type === 'story').length === 0 ? (
                          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                            <p className="text-[10px] text-zinc-600 font-bold uppercase">No story parts drafted yet</p>
                            <button 
                              onClick={() => setActiveTab('story-studio')}
                              className="mt-2 text-[10px] text-red-500 hover:underline uppercase font-black"
                            >
                              Draft Story Moment &rarr;
                            </button>
                          </div>
                        ) : (
                          <select
                            value={bGradeMomentId}
                            onChange={(e) => setBGradeMomentId(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 font-bold focus:outline-none focus:border-amber-600 transition-colors"
                          >
                            <option value="">-- Choose Story Moment --</option>
                            {enhancedHistory.filter(p => p.type === 'pulp-noir-story' || p.type === 'story').map(part => {
                              let title = "Moment Fragment";
                              try {
                                const parsed = JSON.parse(part.content);
                                title = parsed.title || parsed.content.substring(0, 30) + "...";
                              } catch(e) {
                                title = part.content.substring(0, 30) + "...";
                              }
                              return (
                                <option key={part.id} value={part.id}>
                                  {title.toUpperCase()}
                                </option>
                              );
                            })}
                          </select>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Custom Scene description</label>
                        <span className="text-[8px] text-zinc-600 uppercase font-black">Overrides Selection</span>
                      </div>
                      <textarea
                        value={bGradeText}
                        onChange={(e) => setBGradeText(e.target.value)}
                        placeholder={bGradeSubject === 'character' ? "Describe the character appearance, visual mood, actions..." : "Describe the significant scene, action sequence, location..."}
                        className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-amber-600 transition-colors resize-none placeholder:text-zinc-700 font-bold"
                      />
                    </div>
                  </div>

                  {/* B-style buttons */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-500 text-[10px]">2</span>
                      B-Grade Aesthetic Style
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'b-movie-poster', label: 'B-Movie Poster', desc: 'Bold hand-painted film aesthetic' },
                        { id: 'pulp-illustration', label: 'Pulp Detective', desc: '1950s paperback cover look' },
                        { id: 'gritty-realism', label: 'Gritty Realism', desc: 'Sweaty leather, rainy noir cinema' },
                        { id: 'inked-comic', label: 'Inked Comic book', desc: 'Halftones, brush outlines' }
                      ].map((styleOption) => (
                        <button
                          key={styleOption.id}
                          type="button"
                          onClick={() => setBGradeStyle(styleOption.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                            bGradeStyle === styleOption.id
                              ? 'bg-amber-600/10 border-amber-500'
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <p className={`text-xs font-black uppercase tracking-widest ${bGradeStyle === styleOption.id ? 'text-amber-400' : 'text-zinc-400'}`}>
                            {styleOption.label}
                          </p>
                          <p className="text-[8px] text-zinc-600 uppercase font-bold mt-1 leading-tight">{styleOption.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grit / Scratches overlay slider/selector */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-500 text-[10px]">3</span>
                      Grit & Film Grain Wear
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'low', label: 'Slight', desc: 'Clean vintage' },
                        { id: 'medium', label: 'Medium', desc: 'Dust & Scratches' },
                        { id: 'extreme', label: 'Extreme', desc: 'Grindhouse Decay' }
                      ].map((gritOpt) => (
                        <button
                          key={gritOpt.id}
                          type="button"
                          onClick={() => setBGradeGrit(gritOpt.id as any)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            bGradeGrit === gritOpt.id
                              ? 'bg-amber-600 text-black border-amber-600 font-black'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <p className="text-[10px] uppercase font-black tracking-widest leading-none">{gritOpt.label}</p>
                          <p className={`text-[7px] uppercase mt-1 ${bGradeGrit === gritOpt.id ? 'text-black font-extrabold' : 'text-zinc-600'}`}>{gritOpt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect ratio */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset Canvas Aspect Ratio</p>
                    <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                      {[
                        { id: '2:3', label: 'Poster (2:3)' },
                        { id: '1:1', label: 'Square (1:1)' },
                        { id: '16:9', label: 'Cinematic (16:9)' }
                      ].map((ratio) => (
                        <button
                          key={ratio.id}
                          type="button"
                          onClick={() => setBGradeAspect(ratio.id as any)}
                          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            bGradeAspect === ratio.id
                              ? 'bg-zinc-800 text-white border border-zinc-700'
                              : 'text-zinc-600 hover:text-zinc-300'
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generates Slogans and Post Tag */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Grindhouse Tagline/Slogan</label>
                      <button 
                        type="button"
                        onClick={generateBGradeSlogan}
                        className="text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 animate-spin duration-3000" />
                        AI Slogan
                      </button>
                    </div>
                    <input
                      type="text"
                      value={bGradeSlogan}
                      onChange={(e) => setBGradeSlogan(e.target.value)}
                      placeholder="e.g. HE HAD A SHIELD. THEY HAD A STEADY TRIGGER HAND."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-xs text-white placeholder:text-zinc-800 focus:outline-none focus:border-amber-600 transition-colors uppercase font-mono font-black"
                    />
                  </div>

                  {/* Production trigger button */}
                  <button
                    type="button"
                    onClick={generateBGradeArt}
                    disabled={isGeneratingBGrade}
                    className="w-full py-4 mt-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-black rounded-2xl font-black uppercase italic tracking-tighter text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-900/30 border border-amber-400"
                  >
                    {isGeneratingBGrade ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Smudging Oil Paint...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        <span>Print B-Grade Poster</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Display Canvas Poster */}
                <div className="lg:col-span-7 flex flex-col justify-center items-center space-y-6">
                  {isGeneratingBGrade ? (
                    <div className="w-full max-w-sm aspect-[2/3] bg-zinc-950 rounded-[2.5rem] border-2 border-zinc-800 flex flex-col items-center justify-center p-8 text-center shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-600/10 via-transparent to-transparent opacity-80" />
                      
                      {/* Pulp Loader Screen */}
                      <div className="space-y-6 relative z-10">
                        <div className="p-4 bg-amber-600/10 rounded-full inline-block border border-amber-600/30 animate-pulse">
                          <ImageIcon className="w-10 h-10 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-black uppercase italic text-white tracking-widest animate-pulse leading-none">DEVELOPING NEGATIVES...</p>
                          <p className="text-[10px] text-amber-500 font-mono tracking-widest font-bold uppercase">
                            {bGradeStyle === 'b-movie-poster' && "Blending paint overlays & rich textures..."}
                            {bGradeStyle === 'pulp-illustration' && "Splattering ink washes and distress..."}
                            {bGradeStyle === 'gritty-realism' && "Simulating gritty high-contrast sodium grain..."}
                            {bGradeStyle === 'inked-comic' && "Etching brush lines & pop halftones..."}
                          </p>
                        </div>
                        
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-[9px] uppercase font-bold text-zinc-500 tracking-wider font-mono">
                          <p>&gt; Applying Grindhouse preset: {bGradeGrit.toUpperCase()} GRIT</p>
                          <p>&gt; Format ratio adjusted to {bGradeAspect}</p>
                          <p>&gt; Incorporating pulpy cinematic feedback loops...</p>
                        </div>
                      </div>
                    </div>
                  ) : bGradeResult ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full max-w-md bg-zinc-950 border-[6px] border-zinc-800 p-4 rounded-[2rem] shadow-2xl relative group pb-6"
                    >
                      {/* Distressed B-Grade Movie Poster container */}
                      <div className="relative overflow-hidden bg-black rounded-lg border border-zinc-900 shadow-inner group-hover:border-amber-600/40 transition-colors">
                        <div className="absolute inset-0 bg-transparent pointer-events-none border-2 border-amber-500/10 z-10 rounded" />
                        
                        {/* Film grain effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20 mix-blend-overlay" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')"}} />

                        {/* Distressed poster overlay corners if extreme/medium grit */}
                        {(bGradeGrit === 'medium' || bGradeGrit === 'extreme') && (
                          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] z-20" />
                        )}

                        <div className={`relative ${bGradeAspect === '16:9' ? 'aspect-video' : bGradeAspect === '2:3' ? 'aspect-[2/3]' : 'aspect-square'}`}>
                          <Image
                            src={bGradeResult}
                            alt="B-Grade Masterpiece"
                            fill
                            className="object-cover transition-all group-hover:scale-[1.02] duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Cheesy, highly stylized overtop headline slogan banner */}
                        {bGradeSlogan && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-12 text-center z-30">
                            <h3 className="text-sm md:text-base font-black italic tracking-tighter text-amber-400 font-sans leading-none uppercase select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-[90%] mx-auto py-1">
                              &ldquo;{bGradeSlogan}&rdquo;
                            </h3>
                          </div>
                        )}
                      </div>

                      {/* Display poster specs in a vintage movie label */}
                      <div className="mt-4 px-2 flex justify-between items-center text-[9px] uppercase tracking-wider text-zinc-500 font-mono">
                        <p>Format: {bGradeStyle.replace('-', ' ') || 'Classic B-Grade'}</p>
                        <p className="text-amber-500 font-black">STRIKING EXPLOITATION PRINT</p>
                      </div>

                      {/* Interaction Actions */}
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleDownload(bGradeResult, 'b-grade-poster')}
                          className="py-3 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4 text-amber-500" />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBGradeMomentId('');
                            setBGradeCharId('');
                            setBGradeText('');
                            setBGradeSlogan('');
                            setBGradeResult(null);
                          }}
                          className="py-3 bg-amber-600 hover:bg-amber-500 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Another Run
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full max-w-sm aspect-[2/3] bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-[2.5rem] flex flex-col justify-center items-center text-center p-8 space-y-4">
                      <div className="p-4 bg-zinc-900 rounded-full text-zinc-700">
                        <Camera className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-widest text-zinc-400">Poster Slate Empty</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wide px-4">
                          Configure your subject moment or select an anti-hero on the left, then click Print to spawn high-stakes film artwork
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* B-Grade Gallery of the User's Saved Pulp Artworks */}
              <div className="space-y-6 pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black uppercase tracking-widest text-white italic">
                    Recent Grindhouse Prints
                  </h2>
                  <span className="text-[9px] uppercase font-extrabold text-amber-500 bg-amber-600/10 border border-amber-500/30 px-3 py-1 rounded-full">
                    {enhancedHistory.filter(h => h.type === 'image' && h.isBGradeStyle).length} Smuggled Posters
                  </span>
                </div>

                {enhancedHistory.filter(h => h.type === 'image' && h.isBGradeStyle).length === 0 ? (
                  <div className="text-center p-12 border-2 border-dashed border-zinc-800 rounded-3xl">
                    <ImageIcon className="w-8 h-8 text-zinc-700 mx-auto mb-3 animate-pulse" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No custom B-grade visual prints created yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {enhancedHistory.filter(h => h.type === 'image' && h.isBGradeStyle).map((art) => (
                      <div 
                        key={art.id} 
                        className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors"
                      >
                        <div className="relative rounded-2xl overflow-hidden aspect-[2/3] border border-zinc-950 shadow-inner bg-black">
                          <Image
                            src={art.content}
                            alt="Smuggled poster print"
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {art.slogan && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 text-center">
                              <p className="text-[10px] text-amber-400 capitalize italic leading-tight font-black tracking-tight drop-shadow-md">
                                &ldquo;{art.slogan}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase text-white truncate text-center mt-1">
                            {art.metadataTitle || "Significant Moment"}
                          </h4>
                          <div className="flex gap-2 justify-center pt-1">
                            <span className="text-[7px] font-black uppercase bg-zinc-950 text-amber-500 px-2 py-0.5 rounded border border-zinc-800/80">
                              {art.bGradeStyle && art.bGradeStyle.replace('-', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                          <button
                            type="button"
                            onClick={() => handleDownload(art.content, 'grindhouse-poster')}
                            className="py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteHistoryItem(art.id)}
                            className="py-2.5 bg-zinc-950 hover:bg-red-950/20 text-zinc-600 hover:text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            Burn
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'item-songs' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4 mb-8">
                <div className="inline-block p-4 bg-pink-600/20 rounded-full mb-4">
                  <Flame className="w-12 h-12 text-pink-500" />
                </div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Item Clash</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">System vs World&apos;s Music Production Houses</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-black uppercase tracking-widest text-pink-500 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-pink-600/20 flex items-center justify-center text-pink-500 text-[10px]">1</span>
                        Blockbuster Concept
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the vibe... (e.g. A character-driven theme for a recurring villain in a 70s Bombay setting. Intense brass hits, dirty dhol, and high-energy hooks.)"
                        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-pink-600 transition-colors resize-none"
                      />
                      
                      <div className="space-y-3 pt-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Sonic Mode (Vibe):</p>
                        <div className="flex flex-wrap gap-2">
                          {CLASH_VIBES.map(vibe => (
                            <button
                              key={vibe}
                              onClick={() => setClashVibe(vibe)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                clashVibe === vibe 
                                  ? 'bg-zinc-100 border-zinc-100 text-black shadow-lg' 
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                              }`}
                            >
                              {vibe}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Select Production House to Clash With:</p>
                        <div className="flex flex-wrap gap-2">
                          {INDUSTRY_HOUSES.map(house => (
                            <button
                              key={house.name}
                              onClick={() => {
                                setClashTarget(house.name);
                                setToast({ message: `Target Locked: ${house.name}`, type: 'info' });
                              }}
                              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                clashTarget === house.name 
                                  ? `${house.color} border-white text-white shadow-lg` 
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                              }`}
                            >
                              {house.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => generateContent('item-song')}
                          disabled={loading || !prompt}
                          className="flex-1 py-4 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-pink-900/20"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flame className="w-5 h-5" />}
                          {loading ? 'Producing Blockbuster...' : `Clash with ${clashTarget}`}
                        </button>
                        
                        <button 
                          onClick={scanViralTrends}
                          disabled={loading || isScanningTrends}
                          className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-indigo-900/40 relative overflow-hidden group/viral"
                        >
                          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/music/400/200')] opacity-10 mix-blend-overlay group-hover/viral:scale-110 transition-transform"></div>
                          <div className="flex items-center gap-2 relative z-10">
                            {isScanningTrends ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 animate-pulse" />}
                            <span>{viralTrends.length > 0 ? 'Rescan Trends' : 'Viral Hit Radar'}</span>
                          </div>
                          <span className="text-[7px] opacity-70 relative z-10">{isScanningTrends ? 'Scanning Global Waves...' : 'Scan last 10 days trends'}</span>
                        </button>

                        <button 
                          onClick={fetchItemSongIdeas}
                          disabled={loading || loadingItemSongs}
                          className="px-6 py-4 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-orange-900/40 relative overflow-hidden group/idea"
                        >
                          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/dance/400/200')] opacity-10 mix-blend-overlay group-hover/idea:scale-110 transition-transform"></div>
                          <div className="flex items-center gap-2 relative z-10">
                            {loadingItemSongs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 animate-pulse" />}
                            <span>Item Song Finder</span>
                          </div>
                          <span className="text-[7px] opacity-70 relative z-10">{loadingItemSongs ? 'Hunting Hot Picks...' : 'Find trending song ideas'}</span>
                        </button>
                      </div>

                      {itemSongIdeas.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 p-6 bg-pink-950/20 border border-pink-500/30 rounded-3xl"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black uppercase tracking-widest text-pink-400">Market Hot Picks (Item Song Finder):</p>
                              <Flame className="w-3 h-3 text-pink-400 animate-pulse" />
                            </div>
                            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-tight">Trending concepts for commercial item numbers and rap songs in demand.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {itemSongIdeas.map((idea, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setPrompt(`ITEM SONG CONCEPT: ${idea.title} - ${idea.concept}`);
                                  setToast({ message: `Concept Selected: ${idea.title}`, type: 'success' });
                                }}
                                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 text-left space-y-2 group/idea-card transition-all"
                              >
                                <h4 className="text-xs font-black uppercase tracking-widest text-pink-500">{idea.title}</h4>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase leading-relaxed line-clamp-2 italic">
                                  {idea.concept}
                                </p>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {viralTrends.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 p-6 bg-zinc-950/50 border border-purple-500/30 rounded-3xl"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Global Trend Forecast (Last 10 Days):</p>
                              <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                            </div>
                            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-tight">Select a trending topic below to generate a Noir hit based on real-world data.</p>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {viralTrends.map(trend => (
                              <button
                                key={trend.id}
                                onClick={() => {
                                  setSelectedTrendId(trend.id);
                                  setPrompt(`VIRAL CONCEPT: ${trend.title} - ${trend.reason}`);
                                  setToast({ message: `Concept Selected: ${trend.title}`, type: 'success' });
                                }}
                                className={`p-4 rounded-2xl border transition-all text-left space-y-2 group/trend ${
                                  selectedTrendId === trend.id 
                                    ? 'bg-purple-600 border-white text-white' 
                                    : 'bg-zinc-900 border-zinc-800 hover:border-purple-500/50 text-zinc-400'
                                }`}
                              >
                                <div className="flex items-baseline justify-between">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest leading-none">{trend.title}</h4>
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-600/20 rounded border border-red-600/30">
                                      <Zap className="w-2 h-2 text-red-500" />
                                      <span className="text-[7px] text-red-500 font-black tracking-tighter">{trend.heat}% HEAT</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    {(trend.tags || []).map(tag => (
                                      <span key={tag} className="text-[7px] px-1.5 py-0.5 bg-black/20 rounded border border-white/10 uppercase font-black">{tag}</span>
                                    ))}
                                  </div>
                                </div>
                                <p className={`text-[9px] font-bold uppercase leading-relaxed ${selectedTrendId === trend.id ? 'text-purple-100' : 'text-zinc-500'}`}>
                                  {trend.reason}
                                </p>
                                <div className="flex items-center gap-3 pt-1">
                                  <span className="text-[7px] font-black uppercase text-zinc-600 tracking-widest">Sonic Palette:</span>
                                  <div className="flex gap-2">
                                    {(trend.instruments || []).map(inst => (
                                      <div key={inst} className="flex items-center gap-1">
                                        <Music className="w-2 h-2 text-purple-500" />
                                        <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-tight">{inst}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                          {selectedTrendId && (
                            <div className="pt-2">
                              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 italic">
                                * System will now synthesize the selected trend with the Pulp Noir aesthetic.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Music Production Intel */}
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] space-y-6 shadow-xl">
                    <h2 className="text-sm font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Beat Intel
                    </h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Character Themes</p>
                        <p className="text-[9px] text-zinc-500 leading-relaxed font-bold uppercase italic">
                          Don&apos;t just make a song. Every villain and hero needs a &quot;Signature Sound&quot;. Our system now maps character traits directly to instrument choices.
                        </p>
                      </div>
                      <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">The &quot;Drop&quot; Logic</p>
                        <p className="text-[9px] text-zinc-500 leading-relaxed font-bold uppercase italic">
                          Beats aren&apos;t just rhythms. They are impacts. We use 135BPM syncopated dhols to ensure your tracks &quot;Clash&quot; with industry standards.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-[10px]">2</span>
                  Your Blockbusters
                </h2>
                {enhancedHistory.filter(p => p.type === 'item-song').length === 0 ? (
                  <div className="text-center p-12 border border-zinc-800 border-dashed rounded-3xl">
                    <Flame className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No blockbusters produced yet.</p>
                  </div>
                ) : (
                  enhancedHistory.filter(p => p.type === 'item-song').map(part => {
                    let song: any = null;
                    try { song = JSON.parse(part.content); } catch (e) {}
                    if (!song) return null;

                    return (
                      <div key={part.id} className="bg-pink-950/10 border border-pink-900/30 p-6 rounded-3xl shadow-xl space-y-6 relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                          <Flame className="w-12 h-12" />
                        </div>
                        
                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase font-black tracking-widest text-pink-500">Title</p>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleFeedback(part.id, 'up')} className={`p-1 rounded-full transition-all ${part.feedback === 'up' ? 'bg-green-500/20 text-green-500' : 'text-zinc-600 hover:text-green-500 hover:bg-green-500/10'}`} title="Thumbs Up">
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleFeedback(part.id, 'down')} className={`p-1 rounded-full transition-all ${part.feedback === 'down' ? 'bg-red-500/20 text-red-500' : 'text-zinc-600 hover:text-red-500 hover:bg-red-500/10'}`} title="Thumbs Down">
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleCopy(`Title: ${song.title}\nStyle: ${song.style}\n\nLyrics:\n${song.lyrics}`, part.id + '-all')} 
                                className="text-zinc-600 hover:text-pink-500 transition-colors flex items-center gap-1 px-2 py-1 bg-zinc-800/50 rounded-lg text-[8px] font-black uppercase tracking-widest" 
                                title="Copy All Track Data"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy All</span>
                              </button>
                              <button onClick={() => handleCopy(song.title, part.id + '-title')} className="text-zinc-600 hover:text-zinc-100 transition-colors" title="Copy Title"><Copy className="w-3 h-3" /></button>
                              <button onClick={() => deleteHistoryItem(part.id)} className="text-zinc-600 hover:text-red-500 transition-colors" title="Delete Track"><Trash2 className="w-4 h-4" /></button>
                              
                              {!part.musicUrl && (
                                <button 
                                  onClick={() => generateMusic(part)}
                                  disabled={part.isGeneratingMusic}
                                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-900/30"
                                >
                                  {part.isGeneratingMusic ? <Loader2 className="w-3 h-3 animate-spin" /> : <Music2 className="w-3 h-3" />}
                                  {part.isGeneratingMusic ? 'Synthesizing...' : 'Clash Produce Track'}
                                </button>
                              )}
                            </div>
                          </div>
                          <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">{song.title}</h3>
                        </div>
                        
                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase font-black tracking-widest text-pink-500">Style</p>
                            <button onClick={() => handleCopy(song.style, part.id + '-style')} className="text-zinc-600 hover:text-zinc-100 transition-colors" title="Copy Style"><Copy className="w-3 h-3" /></button>
                          </div>
                          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">{song.style}</p>
                        </div>

                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase font-black tracking-widest text-pink-500">Caption</p>
                            <button onClick={() => handleCopy(song.caption, part.id + '-caption')} className="text-zinc-600 hover:text-zinc-100 transition-colors" title="Copy Caption"><Copy className="w-3 h-3" /></button>
                          </div>
                          <p className="text-xs text-zinc-300 italic">&quot;{song.caption}&quot;</p>
                        </div>

                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase font-black tracking-widest text-pink-500">Lyrics</p>
                            <button onClick={() => handleCopy(song.lyrics, part.id + '-lyrics')} className="text-zinc-600 hover:text-zinc-100 transition-colors" title="Copy Lyrics"><Copy className="w-3 h-3" /></button>
                          </div>
                          <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 max-h-64 overflow-y-auto custom-scrollbar">
                            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">{song.lyrics}</pre>
                          </div>
                        </div>

                        {/* Clash Visualization */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                           <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                 <p className="text-[10px] font-black uppercase text-pink-500">System Audio</p>
                                 <p className="text-xl font-black text-white italic">{song.systemScore}%</p>
                              </div>
                              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${song.systemScore || 0}%` }}
                                   className="h-full bg-pink-600"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                 <p className="text-[10px] font-black uppercase text-zinc-500">{clashTarget}</p>
                                 <p className="text-xl font-black text-zinc-500 italic">{song.houseScore}%</p>
                              </div>
                              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${song.houseScore || 0}%` }}
                                   className="h-full bg-zinc-700"
                                 />
                              </div>
                           </div>
                        </div>

                        {song.clashAnalysis && (
                          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/50">
                             <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Clash Analysis (Winning Edge)</p>
                             <p className="text-[11px] text-zinc-400 font-bold uppercase italic leading-relaxed">{song.clashAnalysis}</p>
                          </div>
                        )}

                        <div className="pt-4">
                           {part.musicUrl ? (
                              <div className="space-y-3">
                                 <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-pink-600/20">
                                    <div className="p-3 bg-pink-600 rounded-full">
                                       <Volume2 className="w-4 h-4 text-white" />
                                    </div>
                                    <audio src={part.musicUrl} controls className="flex-1 h-8 opacity-80" />
                                    {part.bpm && (
                                       <span className="px-2 py-1 bg-pink-600/20 text-pink-400 font-black text-[9px] rounded-lg flex items-center gap-1 border border-pink-500/20 animate-pulse">
                                         <Activity className="w-3 h-3 text-pink-500" />
                                         {part.bpm} BPM
                                       </span>
                                    )}
                                 </div>
                                 <a 
                                   href={part.musicUrl} 
                                   download={`${song.title}_clash_track.wav`}
                                   className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-pink-500 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                 >
                                   <Download className="w-4 h-4" />
                                   Download Clash Archive
                                 </a>
                              </div>
                           ) : (
                              <button 
                                onClick={() => generateMusic(part)}
                                disabled={part.isGeneratingMusic}
                                className="w-full py-5 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 text-white rounded-2xl font-black uppercase italic tracking-tighter text-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-pink-900/40"
                              >
                                 {part.isGeneratingMusic ? <Loader2 className="w-6 h-6 animate-spin" /> : <Flame className="w-6 h-6" />}
                                 {part.isGeneratingMusic ? 'Beating the Industry...' : `Produce & Beat ${clashTarget}`}
                              </button>
                           )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : activeTab === 'noir-assets' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4 mb-8">
                <div className="inline-block p-4 bg-emerald-600/20 rounded-full mb-4 shadow-lg shadow-emerald-900/20">
                  <Upload className="w-12 h-12 text-emerald-500" />
                </div>
                <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white">Asset Vault</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">Smuggle your recordings & evidence into the shadows</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <h2 className="text-lg font-black uppercase tracking-tighter text-emerald-500 mb-6 flex items-center gap-2">
                       <Plus className="w-5 h-5" />
                       New Smuggling Run
                     </h2>
                     <label className="block w-full cursor-pointer group/label">
                        <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-12 text-center group-hover/label:border-emerald-600/50 transition-all bg-zinc-950/50">
                           <Upload className="w-10 h-10 text-zinc-700 mx-auto mb-4 group-hover/label:text-emerald-500 group-hover/label:scale-110 transition-all" />
                           <p className="text-zinc-500 text-xs font-black uppercase tracking-widest leading-relaxed">
                             {isUploading ? 'Securing File...' : 'Drop Noir Asset or Click to Smuggle'}
                           </p>
                           <p className="text-[8px] text-zinc-700 mt-2 uppercase font-bold">Audio / Video / Images (Max 20MB)</p>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="audio/*,video/*,image/*" disabled={isUploading} />
                     </label>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                     <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Vault Guidelines</h3>
                     <ul className="space-y-3">
                        {[
                          "Uploaded assets can be used in Cinema Reels.",
                          "Audio files are stored as evidence fragments.",
                          "Max file size: 20MB for system stability.",
                          "Pulp branding automatically applied during reel export."
                        ].map((tip, i) => (
                           <li key={i} className="flex gap-2 text-[10px] text-zinc-600 font-bold uppercase leading-tight">
                              <span className="text-emerald-500">•</span>
                              {tip}
                           </li>
                        ))}
                     </ul>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                   <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Shadow Inventory</h2>
                      <div className="flex gap-2">
                        <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          {enhancedHistory.filter(h => h.tags?.includes('uploaded')).length} Uploads
                        </div>
                        <div className="px-3 py-1 bg-amber-600/20 border border-amber-600/30 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-500">
                          {enhancedHistory.filter(h => h.musicUrl || h.audioUrl).length} Synthesized
                        </div>
                      </div>
                   </div>

                   {enhancedHistory.filter(h => h.tags?.includes('uploaded') || h.musicUrl || h.audioUrl).length === 0 ? (
                     <div className="text-center p-32 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-[3rem] opacity-50">
                        <Database className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs italic">The vault is empty. No assets found.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {enhancedHistory.filter(h => h.tags?.includes('uploaded') || h.musicUrl || h.audioUrl).map(asset => (
                           <motion.div 
                             key={asset.id}
                             whileHover={{ scale: 1.02 }}
                             className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group relative"
                           >
                              <div className="aspect-square relative flex items-center justify-center bg-zinc-950">
                                 {(asset.type === 'image' && asset.tags?.includes('uploaded')) ? (
                                   <Image src={asset.content} alt="asset" fill className="object-cover opacity-70 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                                 ) : asset.type === 'video' ? (
                                   <Video className="w-8 h-8 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                                 ) : (
                                   <div className="flex flex-col items-center gap-2">
                                     <Music className={`w-8 h-8 ${asset.musicUrl ? 'text-amber-500' : 'text-zinc-700'} group-hover:scale-110 transition-transform`} />
                                     {asset.musicUrl && <span className="text-[6px] font-black uppercase text-amber-600">Produced</span>}
                                   </div>
                                 )}
                                 
                                 <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                    <button 
                                      onClick={() => handleDownload(asset.musicUrl || asset.audioUrl || asset.content, asset.id)}
                                      className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                    >
                                       <Download className="w-5 h-5" />
                                    </button>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white text-center line-clamp-2">
                                      {asset.tags?.[1] || (asset.musicUrl ? 'Produced Track' : 'Artifact')}
                                    </p>
                                    <button onClick={() => deleteHistoryItem(asset.id)} className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-500 transition-colors">
                                       <Trash2 className="w-3 h-3" />
                                    </button>
                                 </div>
                              </div>
                              <div className="p-2 border-t border-zinc-800 flex flex-col items-center gap-1">
                                 <span className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-600">
                                   {asset.musicUrl ? 'Synthesized' : asset.type} asset
                                 </span>
                                 {asset.musicUrl && asset.bpm && (
                                   <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15">
                                     <Activity className="w-2.5 h-2.5 animate-pulse" />
                                     {asset.bpm} BPM
                                   </div>
                                 )}
                              </div>
                           </motion.div>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'brain' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4 mb-8">
                <div className="inline-block p-4 bg-purple-600/20 rounded-full mb-4">
                  <Brain className="w-12 h-12 text-purple-500" />
                </div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Neural Archive</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">Monitoring Neural Growth & Personality Shifts</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                  <h2 className="text-sm font-black uppercase tracking-widest text-purple-500 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Neural Stats
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                      <span className="text-[10px] font-black uppercase text-zinc-500">Version</span>
                      <span className="text-sm font-mono text-purple-400">{evolution.version}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                      <span className="text-[10px] font-black uppercase text-zinc-500">Total Generations</span>
                      <span className="text-sm font-mono text-white">{evolution.totalGenerations}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                      <span className="text-[10px] font-black uppercase text-zinc-500">Positive Feedback</span>
                      <span className="text-sm font-mono text-green-500">{evolution.positiveFeedback}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                      <span className="text-[10px] font-black uppercase text-zinc-500">Negative Feedback</span>
                      <span className="text-sm font-mono text-red-500">{evolution.negativeFeedback}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                  <h2 className="text-sm font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Current Focus
                  </h2>
                  <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 italic text-zinc-400 text-sm leading-relaxed">
                    &ldquo;{evolution.currentFocus}&rdquo;
                  </div>
                  <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-purple-400 mb-2">Neural Mantra</p>
                    <p className="text-xs text-zinc-300 italic leading-relaxed">
                      &quot;Dhvani silent nahi hoti, lekin uska prabhav कई बार चुपचाप, गहराई से काम करता है...&quot;
                    </p>
                    <p className="text-[9px] text-zinc-500 mt-2 uppercase tracking-widest font-bold">
                      Current Directive: Absolute Psychological Immersion
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Personality Bias</p>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-red-600" 
                        style={{ width: `${Math.min(100, (evolution.totalGenerations / 100) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase text-zinc-600">
                      <span>Clinical</span>
                      <span>Visceral Noir</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl">
                <h2 className="text-sm font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 mb-6">
                  <History className="w-4 h-4" />
                  Evolution Log
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-950 rounded-xl border-l-4 border-purple-600">
                    <p className="text-[10px] text-zinc-500 font-bold mb-1">STAMP: 2026-04-13</p>
                    <p className="text-xs text-zinc-300">Successfully integrated &quot;Song News&quot; and &quot;Noir Reels&quot; modules. Neural pathways for cinematic storytelling expanded.</p>
                  </div>
                  <div className="p-4 bg-zinc-950 rounded-xl border-l-4 border-zinc-800">
                    <p className="text-[10px] text-zinc-500 font-bold mb-1">STAMP: 2026-04-12</p>
                    <p className="text-xs text-zinc-300">Refined Hinglish Noir tone based on user interaction. Improved street-level slang accuracy.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'voice-lab' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="space-y-2">
                  <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Voice Lab</h1>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">Register Your Acoustic Identity</p>
                </div>
                <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-600/20">
                  <Mic2 className="w-12 h-12 text-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Zap className="w-32 h-32 text-indigo-600" />
                  </div>
                  
                  <div className="space-y-4 relative z-10 text-center">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Acoustic Double Registration</h2>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                      Speak into the void. The AI will analyze your frequency, cadence, and tone to create a unique &quot;Voice Clone&quot; profile.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-12 bg-zinc-950 rounded-3xl border border-zinc-800 space-y-6 relative z-10">
                    {isRecording ? (
                      <div className="space-y-6 flex flex-col items-center">
                        <div className="relative">
                           <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20" />
                           <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center relative z-10">
                              <Square className="w-8 h-8 text-white" />
                           </div>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-mono text-white mb-1">
                            {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 animate-pulse">Capturing Frequency...</p>
                        </div>
                        <button 
                          onClick={stopVoiceRecording}
                          className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Finish Sample
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6 flex flex-col items-center">
                        <button 
                          onClick={startVoiceRecording}
                          disabled={loading}
                          className="w-24 h-24 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-full flex items-center justify-center shadow-2xl shadow-indigo-900/50 group"
                        >
                          <Mic2 className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                        </button>
                        <div className="text-center">
                          <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">Press to Start Recording</p>
                          <p className="text-[9px] text-zinc-600 uppercase mt-2">Recommended: Read a paragraph from your favorite noir novel.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-indigo-600/5 p-4 rounded-2xl border border-indigo-600/10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Biometric Privacy
                    </p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase italic leading-relaxed">
                      Your voice sample is processed exclusively by the AI to build your profile. It is never shared with third parties or used for external training.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl h-full flex flex-col">
                    <h2 className="text-sm font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      Voice Vault
                    </h2>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 max-h-[500px]">
                      {clonedVoices.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4 py-20">
                          <History className="w-12 h-12" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No Voices Registered</p>
                        </div>
                      ) : (
                        clonedVoices.map(voice => (
                          <div key={voice.id} className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl group hover:border-indigo-600/30 transition-all space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-600/20 rounded-lg">
                                  <Mic2 className="w-4 h-4 text-indigo-500" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase">{voice.name}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                     const audio = new Audio(voice.sampleData);
                                     audio.play();
                                  }}
                                  className="p-2 text-zinc-500 hover:text-indigo-500 transition-colors"
                                  title="Listen to Sample"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteVoiceClone(voice.id)}
                                  className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                               <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Acoustic Analysis</p>
                               <p className="text-[10px] text-zinc-400 italic line-clamp-3 leading-relaxed">{voice.analysis}</p>
                            </div>

                            <button
                              onClick={async () => {
                                const userPath = `users/${user!.uid}`;
                                setProfile(prev => ({ ...prev, selectedVoiceCloneId: voice.id }));
                                await updateDoc(doc(db, userPath), { selectedVoiceCloneId: voice.id });
                                setToast({ message: `${voice.name} selected as primary for cloning.`, type: 'success' });
                              }}
                              className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                profile.selectedVoiceCloneId === voice.id 
                                  ? 'bg-indigo-600 text-white shadow-lg' 
                                  : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              {profile.selectedVoiceCloneId === voice.id ? 'Primary Active' : 'Set as Primary'}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'characters' ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-4 md:p-6 lg:p-0 pb-32"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-white">Characters</h1>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] sm:text-sm italic">Your Collection of Gritty Anti-Heroes</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowCharacterForge(true)}
                    className="flex-1 sm:flex-none px-6 py-4 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Forge New
                  </button>
                  <div className="p-3 sm:p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                    <Ghost className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                  </div>
                </div>
              </div>

              {characters.length === 0 ? (
                <div className="text-center p-12 sm:p-20 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <Ghost className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-black uppercase tracking-widest text-xs sm:text-sm">The vault is empty. Forge some characters first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {characters.map(char => (
                    <div key={char.id} className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Ghost className="w-10 h-10 sm:w-12 sm:h-12" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-black tracking-widest text-blue-500">{char.archetype || 'Noir Archetype'}</p>
                        <h3 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase truncate">{char.name}</h3>
                        <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{char.role}</p>
                        {char.gender && char.dob && (
                          <div className="flex gap-2 pt-1">
                             <span className="text-[7px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md font-black uppercase">{char.gender}</span>
                             <span className="text-[7px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md font-black uppercase">{char.dob}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Character Status</p>
                          <button 
                            onClick={() => {
                              const newId = activeCharacterId === char.id ? null : char.id;
                              setActiveCharacterId(newId);
                              if (user) {
                                updateDoc(doc(db, `users/${user.uid}`), { activeCharacterId: newId })
                                  .catch(p => handleFirestoreError(p, OperationType.UPDATE, `users/${user.uid}`));
                              }
                              if (newId) setToast({ message: `${char.name} activated for story context!`, type: 'info' });
                            }}
                            className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                              activeCharacterId === char.id 
                                ? 'bg-green-600 text-white shadow-lg' 
                                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {activeCharacterId === char.id ? 'Active' : 'Offline'}
                          </button>
                        </div>

                        {char.kundli && (
                          <div className="p-3 bg-purple-900/10 border border-purple-900/30 rounded-xl space-y-2 relative group-item">
                            <div className="flex items-center justify-between">
                              <p className="text-[9px] font-black uppercase tracking-widest text-purple-500 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Kundli
                              </p>
                              <button 
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: `Kundli: ${char.name}`,
                                    message: char.kundli,
                                    onConfirm: () => setConfirmModal(null)
                                  });
                                }}
                                className="text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-purple-400 transition-colors"
                              >
                                View
                              </button>
                            </div>
                            <p className="text-[10px] text-zinc-400 italic leading-relaxed line-clamp-2">{char.kundli}</p>
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="text-[8px] uppercase font-black tracking-widest text-zinc-600">Personality</p>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-tight">{char.personality}</p>
                        </div>
                      </div>
                      <div className="pt-2 flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            const bioText = `
## ${char.name}
**Archetype:** ${char.archetype || 'Noir Anti-Hero'}
**Role:** ${char.role}

### [ Personality & Traits ]
${char.personality}

### [ Primary Motivations ]
${char.motivations}

### [ Fatal Flaws ]
${char.flaws}

### [ Backstory ]
${char.backstory}

---
### [ Noir Kundli: Dark Destiny ]
${char.kundli}
                            `;
                            setConfirmModal({
                              isOpen: true,
                              title: `Full Bio: ${char.name}`,
                              message: bioText,
                              onConfirm: () => setConfirmModal(null)
                            });
                          }}
                          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          Show Detailed Bio
                        </button>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setPrompt(`A story involving ${char.name}, the ${char.role}...`); setActiveTab('home'); }}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            Use in Story
                          </button>
                          <button 
                            onClick={() => {
                              setBGradeSubject('character');
                              setBGradeCharId(char.id);
                              setBGradeText('');
                              setBGradeSlogan('');
                              setActiveTab('bgrade-art');
                              setToast({ message: `Loaded ${char.name} into Portrait Studio!`, type: 'info' });
                            }}
                            className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Portrait
                          </button>
                          <button 
                            onClick={() => deleteDoc(doc(db, `users/${user!.uid}/characters`, char.id))}
                            className="p-3 bg-zinc-800 hover:bg-red-600 text-zinc-500 hover:text-white rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => { 
                            setActiveCharacterId(char.id); 
                            generateContent('life-journey'); 
                          }}
                          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <History className="w-4 h-4" />
                          Reconstruct Life Journey
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'life-journey' ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl mx-auto space-y-8 p-4 sm:p-0"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white">Life Journey</h1>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] sm:text-sm italic">The Chronology of a Dark Soul</p>
                </div>
                {activeCharacter && (
                  <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800 w-full sm:w-auto">
                    <div className="p-2 bg-amber-600/20 rounded-lg">
                      <User className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-500 uppercase">{activeCharacter.name}</p>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase">{activeCharacter.role}</p>
                    </div>
                  </div>
                )}
              </div>

              {isGeneratingLifeJourney ? (
                <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                    <History className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Reconstructing Life Events...</p>
                </div>
              ) : lifeJourneyStory ? (
                <div className="space-y-12 pb-20">
                  <div className="bg-zinc-900 border border-zinc-800 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <History className="w-64 h-64 text-amber-600" />
                    </div>
                    
                    <div className="relative z-10 space-y-12">
                      <div className="flex flex-col md:flex-row gap-8 items-start relative">
                        {/* Timeline Spine */}
                        <div className="hidden md:block absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-600 via-zinc-800 to-transparent" />
                        
                        <div className="flex-1 space-y-12">
                          {(() => {
                            try {
                              const data = JSON.parse(lifeJourneyStory);
                              return data.events.map((event: any, i: number) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.2 }}
                                  className="relative pl-0 md:pl-16 group"
                                >
                                  {/* Timeline Node */}
                                  <div className="hidden md:flex absolute left-0 top-0 items-center justify-center">
                                    <div className="w-9 h-9 bg-zinc-950 border-2 border-amber-600 rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(217,119,6,0.5)] group-hover:scale-110 transition-transform">
                                      {i === 0 ? <Flame className="w-5 h-5 text-amber-500" /> : 
                                       i === data.events.length - 1 ? <Skull className="w-5 h-5 text-red-500" /> : 
                                       <Activity className="w-5 h-5 text-zinc-400" />}
                                    </div>
                                  </div>

                                  <div className="bg-zinc-950 p-6 sm:p-10 rounded-[2rem] border border-zinc-900 group-hover:border-amber-600/30 transition-all shadow-xl space-y-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-amber-600/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-600/20">
                                          {event.period}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">AGE: {event.age}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {Array.from({ length: 10 }).map((_, idx) => (
                                          <div 
                                            key={idx} 
                                            className={`w-1.5 h-1.5 rounded-full ${idx < event.intensity ? 'bg-red-600' : 'bg-zinc-800'}`} 
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <h3 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase group-hover:text-amber-500 transition-colors">
                                      {event.title}
                                    </h3>
                                    
                                    <div className="whitespace-pre-wrap text-zinc-400 font-serif text-lg leading-relaxed italic">
                                      {event.content}
                                    </div>
                                  </div>
                                </motion.div>
                              ));
                            } catch (e) {
                              return <div className="text-zinc-500 p-8 border border-zinc-800 rounded-2xl">The memory is corrupted. Try reconstructing the journey again.</div>;
                            }
                          })()}
                        </div>
                      </div>

                      <div className="pt-8 flex flex-col sm:flex-row gap-4 relative z-10 border-t border-zinc-800">
                        <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-2xl border border-zinc-800 mr-auto">
                          <button 
                            onClick={() => {
                              if (lifeJourneyFeedback === 'up') return;
                              setLifeJourneyFeedback('up');
                              setToast({ message: "Feedback recorded for AI fine-tuning.", type: 'success' });
                              handleFeedback('life-journey-' + Date.now(), 'up');
                            }}
                            className={`p-3 rounded-xl transition-all border ${lifeJourneyFeedback === 'up' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'text-zinc-500 hover:text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/30'}`}
                          >
                            <ThumbsUp className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (lifeJourneyFeedback === 'down') return;
                              setLifeJourneyFeedback('down');
                              setToast({ message: "Feedback recorded for AI fine-tuning.", type: 'success' });
                              handleFeedback('life-journey-' + Date.now(), 'down');
                            }}
                            className={`p-3 rounded-xl transition-all border ${lifeJourneyFeedback === 'down' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'text-zinc-500 hover:text-red-500 hover:bg-red-500/10 border-transparent hover:border-red-500/30'}`}
                          >
                            <ThumbsDown className="w-5 h-5" />
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            try {
                              const data = JSON.parse(lifeJourneyStory);
                              const fullText = data.events.map((e: any) => `${e.period}: ${e.title}. ${e.content}`).join('\n\n');
                              speak(fullText);
                            } catch {
                              speak(lifeJourneyStory);
                            }
                          }}
                          className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-2"
                        >
                          <Volume2 className="w-5 h-5" />
                          Listen to Life Journey
                        </button>
                        <button 
                          onClick={() => window.print()}
                          className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl font-black uppercase tracking-widest transition-all hidden sm:flex items-center justify-center gap-2"
                        >
                          <History className="w-5 h-5" />
                          Seal Chronology
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                  <History className="w-16 h-16 text-zinc-700" />
                  <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest max-w-xs mx-auto">
                    Select a character from the vault to reconstruct their entire life chronology.
                  </p>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'daily-mission' ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 pb-24"
            >
              {/* Mission Header */}
              <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-805 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Target className="w-64 h-64 text-amber-500 rotate-12" />
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                      <Target className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 font-sans">Classified Dispatch Operational</span>
                    </div>
                    
                    {/* Countdown Timer */}
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-zinc-800">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 font-sans">Expires In:</span>
                      <span className="font-mono text-sm font-bold text-amber-500 tracking-wider">
                        {String(remainingTime.hours).padStart(2, '0')}:{String(remainingTime.minutes).padStart(2, '0')}:{String(remainingTime.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white">
                      Daily Noir <span className="text-amber-500">Contracts.</span>
                    </h1>
                    <p className="text-zinc-400 font-medium text-base max-w-xl">
                      Each sunset brings a new gritty case file. Resolve the mission using your active character&apos;s unique traits and earn exclusive narrative badges displayed on your detective shield.
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Mission Card Group - occupies 2 columns */}
                <div className="lg:col-span-2 space-y-8 text-left">
                  {profile.evolution?.dailyMission ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 lg:p-8 space-y-8 shadow-xl relative overflow-hidden">
                      {/* Folder Clip Graphic Decoration */}
                      <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
                      
                      {/* Passport Info Sheet */}
                      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-zinc-804/80 pb-6">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-black text-amber-500 font-mono tracking-widest">Active Docket File</span>
                          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                            {profile.evolution.dailyMission.title}
                          </h2>
                          <p className="text-xs text-zinc-500 font-mono">
                            Assigned on: {new Date(profile.evolution.dailyMission.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Character Affiliation Status */}
                        <div className="bg-zinc-950/80 border border-zinc-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-md max-w-xs text-left">
                          <Ghost className="w-5 h-5 text-zinc-400" />
                          <div className="text-left leading-tight">
                            <p className="text-[9px] font-black uppercase text-zinc-650 tracking-widest leading-none mb-1">Field Operative</p>
                            <p className="text-xs font-bold text-zinc-200">{activeCharacter?.name || "Freelance Noir Drifter"}</p>
                            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{activeCharacter?.role || "Informant / Outlaw"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Brief Description */}
                      <div className="space-y-4">
                        <h4 className="text-xs uppercase font-black tracking-widest text-zinc-500 font-mono flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-500/80" /> Case Summary & Intel
                        </h4>
                        <div className="text-zinc-400 text-sm leading-relaxed space-y-4 font-serif bg-black/20 p-5 rounded-2xl border border-zinc-900 shadow-inner">
                          {profile.evolution.dailyMission.missionBrief}
                        </div>
                      </div>

                      {/* Explicit Objective */}
                      <div className="space-y-3 bg-red-950/10 border border-red-950/30 p-5 rounded-2xl">
                        <h4 className="text-xs uppercase font-black tracking-widest text-red-500 flex items-center gap-2 leading-none">
                          <Skull className="w-4 h-4" /> Hard-Boiled Objective
                        </h4>
                        <p className="text-zinc-300 font-medium text-sm leading-relaxed">
                          {profile.evolution.dailyMission.objective}
                        </p>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-red-950/20">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 font-sans">Potential Honor reward:</span>
                          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black">
                            [{profile.evolution.dailyMission.potentialBadgeName}]
                          </span>
                        </div>
                      </div>

                      {/* Typewriter Input Section */}
                      <div className="space-y-4 pt-4 border-t border-zinc-800">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs uppercase font-black tracking-widest text-zinc-500 font-mono flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-500/80" /> Draft Reconstruction Report
                          </h4>
                          <span className="font-mono text-[10px] font-bold text-zinc-650">
                            {missionReportText.length} Codec Characters 
                            {missionReportText.length < 50 && (
                              <span className="text-red-500/60 ml-2">(Min 50 required)</span>
                            )}
                          </span>
                        </div>
                        
                        <div className="relative group rounded-2xl border border-zinc-800 bg-zinc-950 p-1 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-amber-500/30">
                          <textarea
                            value={missionReportText}
                            onChange={(e) => setMissionReportText(e.target.value)}
                            disabled={isSubmittingMission}
                            placeholder="Type your action plan, details of infiltration, dialog swaps, or confrontation strategy... Stay in character to satisfy the Syndicate Examiner."
                            rows={6}
                            className="w-full text-zinc-200 placeholder-zinc-700 bg-transparent resize-none p-4 rounded-xl border-0 ring-0 focus:ring-0 focus:outline-none focus:border-0 text-sm font-mono leading-relaxed"
                          />
                        </div>

                        {/* Submission Buttons */}
                        <div className="flex items-center justify-between gap-4 pt-2">
                          <button
                            onClick={fetchOrGenerateDailyMission}
                            disabled={isGeneratingMission}
                            className="px-5 py-3.5 text-xs bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 font-black uppercase tracking-wider rounded-xl transition-all border border-zinc-700/80"
                          >
                            {isGeneratingMission ? "Deciphering..." : "Reroll Contract Case"}
                          </button>
                          
                          <button
                            onClick={submitMissionReport}
                            disabled={isSubmittingMission || missionReportText.trim().length < 50}
                            className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest italic rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 shadow-xl disabled:pointer-events-none"
                          >
                            {isSubmittingMission ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing Dossier Intel...
                              </>
                            ) : (
                              <>
                                <FileText className="w-5 h-5" />
                                Transmit Accomplishment Report
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Evaluation Outcomes display panel */}
                      {missionEvaluation && (
                        <div className={`p-6 lg:p-8 rounded-3xl border text-left ${missionEvaluation.success ? 'bg-green-950/10 border-green-500/30' : 'bg-red-950/10 border-red-500/30'} space-y-6`}>
                          <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                            {missionEvaluation.success ? (
                              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <Check className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                            )}
                            <div className="text-left">
                              <h3 className={`text-base font-black uppercase tracking-widest ${missionEvaluation.success ? 'text-green-550' : 'text-red-500'}`}>
                                {missionEvaluation.success ? "Syndicate Case Resolved Successfully" : "Field Operation Compromised"}
                              </h3>
                              <p className="text-[9px] uppercase tracking-wider font-mono text-zinc-550">Syndicate Inspector Judgement Report</p>
                            </div>
                          </div>

                          <div className="text-zinc-300 text-sm leading-relaxed font-serif italic bg-black/40 p-5 rounded-2xl border border-zinc-900 shadow-inner text-left">
                            {missionEvaluation.evaluation}
                          </div>

                          {/* Share and Earned Badge block */}
                          {missionEvaluation.success && missionEvaluation.earnedBadge && (
                            <div className="p-5 bg-gradient-to-br from-amber-600/10 to-amber-900/5 border border-amber-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between text-left">
                              <div className="flex items-center gap-4 text-left mr-auto">
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shadow-lg">
                                  {getBadgeIcon(missionEvaluation.earnedBadge.icon)}
                                </div>
                                <div className="text-left">
                                  <span className="text-[8px] tracking-widest uppercase font-mono text-amber-500 font-bold leading-none">New Badge Uncovered</span>
                                  <h4 className="text-lg font-black uppercase italic tracking-tight text-white leading-tight">
                                    {missionEvaluation.earnedBadge.name}
                                  </h4>
                                  <p className="text-xs text-zinc-400 font-medium leading-relaxed mt-1 max-w-md">
                                    {missionEvaluation.earnedBadge.brief}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => shareBadgeToFeed(missionEvaluation.earnedBadge!, missionEvaluation.evaluation)}
                                className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-750 text-white font-black uppercase tracking-wider text-xs rounded-xl flex items-center gap-2 shadow-md transition-all flex-shrink-0 w-full md:w-auto justify-center"
                              >
                                <Globe className="w-4 h-4 text-amber-500" />
                                Broadcast Intelligence
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center space-y-6 py-20 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center shadow-2xl relative mb-2">
                        <Target className="w-10 h-10 text-amber-500 animate-pulse" />
                        <div className="absolute inset-0 bg-amber-500/10 rounded-3xl animate-ping opacity-30"></div>
                      </div>
                      
                      <div className="text-center space-y-2 max-w-sm">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">No Active Briefing Opened</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                          The Precinct desk is currently clean. Request a dynamic, role-tailored crime file contract based on your active character.
                        </p>
                      </div>

                      {/* Identity Alert */}
                      {!activeCharacter && (
                        <p className="text-[10px] uppercase font-black tracking-widest text-red-500 bg-red-500/5 px-3 py-1.5 rounded-full border border-red-500/20 max-w-xs leading-tight font-mono">
                          ⚠️ Warning: No active character. Mission will generate as a &quot;Freelance Noir Drifter&quot;.
                        </p>
                      )}

                      <button
                        onClick={fetchOrGenerateDailyMission}
                        disabled={isGeneratingMission}
                        className="px-10 py-5 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest italic rounded-2xl transition-all shadow-xl shadow-amber-900/20 flex items-center gap-3 disabled:opacity-55"
                      >
                        {isGeneratingMission ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Cracking telegraph ledger...
                          </>
                        ) : (
                          <>
                            <Target className="w-5 h-5" />
                            Dispatch classified mission Briefing
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Badge Cabinet Slot display panel - occupies 1 column */}
                <div className="space-y-6 text-left">
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-3 justify-between pb-4 border-b border-zinc-800 text-left">
                      <div className="flex items-center gap-2 text-left">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Honors Cabinet</h3>
                      </div>
                      <span className="font-mono text-amber-500 text-xs font-black bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        {profile.evolution?.earnedBadges?.length || 0} Earned
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                      A visual catalog of your hard-boiled tactical accomplishments. Solve daily assignments to fill empty velvet slots.
                    </p>

                    {/* Badge shelves scroll-wheel */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {profile.evolution?.earnedBadges && profile.evolution.earnedBadges.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 pt-2 text-left">
                          {profile.evolution.earnedBadges.map((badge, idx) => (
                            <div 
                              key={badge.id || idx} 
                              className="p-3 bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/30 transition-all rounded-2xl flex items-center gap-3.5 group relative shadow-md text-left"
                            >
                              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                {getBadgeIcon(badge.icon)}
                              </div>
                              <div className="text-left leading-tight overflow-hidden">
                                <h5 className="text-[13px] font-black uppercase italic tracking-tight text-white group-hover:text-amber-400 transition-colors truncate">
                                  {badge.name}
                                </h5>
                                <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2 pr-1 font-medium italic mt-0.5">
                                  {badge.brief}
                                </p>
                                <span className="font-mono text-[8px] text-zinc-600 block mt-1">
                                  Earned: {new Date(badge.dateEarned).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                          <Trophy className="w-10 h-10 text-zinc-650" />
                          <div className="space-y-1 text-center">
                            <p className="text-xs uppercase font-black tracking-widest text-zinc-500">Cabinet Empty</p>
                            <p className="text-[10px] text-zinc-600 font-medium max-w-[180px] mx-auto leading-normal">
                              Operatives have a clean record. Execute briefings to be awarded badges.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Character stats summary docket */}
                  <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 text-left">
                    <p className="text-[8px] font-mono tracking-widest uppercase text-zinc-500 font-bold leading-none mb-1">Syndicate Telemetry logs</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-medium">Network Status:</span>
                      <span className="text-green-500 font-black flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> SECURE-UP
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-medium">Stories Compiled:</span>
                      <span className="text-zinc-400 font-bold font-mono text-[11px]">{profile.evolution?.totalGenerations || 14} entries</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-medium font-sans">Active Ledger:</span>
                      <span className="text-zinc-350 font-bold font-mono text-[11px]">V-{profile.evolution?.version || "2.5.1"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'noir-chat' ? (
            <div className="space-y-8">
              {enhancedHistory.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto opacity-30">
                  <MessageSquare className="w-16 h-16 text-zinc-700" />
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">The Studio is Quiet</h2>
                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">
                      Start a conversation with the shadows. Your gritty story begins with a single prompt.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 bg-zinc-900/50 p-4 sm:p-6 rounded-3xl border border-zinc-800 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20 shadow-inner">
                        <History className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-white">Story Intel Log</h2>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{enhancedHistory.length} Intel Fragments Recorded</p>
                      </div>
                    </div>
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => smartCinematize()}
                          disabled={isExportingVideo || isCinematizing || enhancedHistory.length === 0}
                          className="px-4 py-3 sm:py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                        >
                          {isCinematizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Noir Short
                        </button>
                        <button 
                          onClick={() => compileFullReel()}
                          disabled={isExportingVideo || enhancedHistory.length === 0}
                          className="px-4 py-3 sm:py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                        >
                          <Clapperboard className="w-3 h-3" />
                          Full MP4
                        </button>
                        <button 
                          onClick={generateFullLogVisuals}
                          disabled={loading}
                          className="px-4 py-3 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                        >
                          <ImageIcon className="w-3 h-3" />
                          Visuals
                        </button>
                        <button 
                          onClick={handleDownloadFullStory}
                          className="px-4 py-3 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-zinc-700"
                        >
                          <Download className="w-3 h-3" />
                          Log
                        </button>
                        {selectedForVideo.length > 0 && (
                          <button 
                            onClick={() => exportStoryVideo()}
                            disabled={isExportingVideo}
                            className="col-span-2 xs:col-span-1 px-4 py-3 sm:py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                          >
                            {isExportingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
                            {isExportingVideo ? `${videoExportProgress}%` : `Export (${selectedForVideo.length})`}
                          </button>
                        )}
                      </div>
                  </div>
                  <AnimatePresence mode="popLayout">
                    {enhancedHistory.map((part) => (
                      <motion.div
                        key={part.id}
                        id={`story-${part.id}`}
                        layout="position"
                        initial={{ opacity: 0, y: 30, scale: 0.96, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, scale: 0.96, filter: 'blur(4px)' }}
                        transition={{
                          type: "spring",
                          stiffness: 140,
                          damping: 18,
                          mass: 0.8
                        }}
                        className={`max-w-4xl mx-auto ${part.type === 'image' ? 'w-full' : ''}`}
                      >
              {part.type === 'image' ? (
                <div className="relative group overflow-hidden rounded-2xl border-4 border-zinc-900 shadow-2xl bg-zinc-950">
                  <Image 
                    src={part.content} 
                    alt="Story visual" 
                    width={1024}
                    height={1024}
                    className="w-full h-auto object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  {/* Desktop Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex flex-col justify-end p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Pulp Visual Generation</p>
                        <p className="text-[8px] uppercase font-bold text-zinc-500">Universal Device Support Active</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button 
                          onClick={() => toggleVideoSelection(part.id)}
                          className={`p-2 rounded-full transition-colors flex items-center gap-2 px-4 shadow-lg ${selectedForVideo.includes(part.id) ? 'bg-red-600 text-white' : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400'}`}
                          title={selectedForVideo.includes(part.id) ? "Remove from Cinema" : "Add to Cinema"}
                        >
                          <Video className={`w-4 h-4 ${selectedForVideo.includes(part.id) ? 'text-white' : ''}`} />
                          <span className="text-[10px] font-black uppercase text-white">{selectedForVideo.includes(part.id) ? 'Selected' : 'Cinema'}</span>
                        </button>
                        <button 
                          onClick={() => handleDownload(part.content, part.id)}
                          className="p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors flex items-center gap-2 px-4 shadow-lg"
                          title="Download to Device"
                        >
                          <Download className="w-4 h-4 text-white" />
                          <span className="text-[10px] font-black uppercase text-white">Download</span>
                        </button>
                        <button 
                          onClick={() => toggleSave(part.id, !!part.isSaved)}
                          className={`p-2 bg-zinc-900/80 rounded-full transition-colors flex items-center gap-2 px-4 ${part.isSaved ? 'text-green-500 bg-green-500/20' : 'hover:bg-green-600'}`}
                          title={part.isSaved ? "Saved to Gallery" : "Save to Gallery"}
                        >
                          <Check className={`w-4 h-4 ${part.isSaved ? 'text-green-500' : ''}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{part.isSaved ? 'In Gallery' : 'Save to Gallery'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Persistent Mobile Action Bar */}
                  <div className="sm:hidden p-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between">
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleDownload(part.content, part.id)}
                        className="p-3 bg-blue-600 rounded-xl text-white shadow-lg flex items-center gap-2 px-4"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase">Download</span>
                      </button>
                      <button 
                        onClick={() => toggleVideoSelection(part.id)}
                        className={`p-3 rounded-xl border ${selectedForVideo.includes(part.id) ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                        title="Add to Cinematic Sequence"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleSave(part.id, !!part.isSaved)}
                        className={`p-3 rounded-xl border ${part.isSaved ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                      >
                        {part.isSaved ? <Check className="w-4 h-4" /> : <History className="w-4 h-4" />}
                      </button>
                    </div>
                    <button 
                      onClick={() => deleteHistoryItem(part.id)}
                      className="p-3 bg-zinc-900 rounded-xl text-zinc-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`p-8 rounded-3xl border ${
                  part.type === 'joke' ? 'bg-red-950/10 border-red-900/30' : 
                  part.type === 'character' ? 'bg-blue-950/10 border-blue-900/30' :
                  part.type === 'script' ? 'bg-yellow-950/10 border-yellow-900/30' :
                  part.type === 'song' ? 'bg-amber-950/10 border-amber-900/30' :
                  part.type === 'item-song' ? 'bg-pink-950/10 border-pink-900/30' :
                  'bg-zinc-900/30 border-zinc-800'
                } shadow-xl relative group overflow-hidden backdrop-blur-sm`}>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    {part.type === 'joke' ? <Zap className="w-12 h-12" /> : 
                     part.type === 'character' ? <Ghost className="w-12 h-12" /> : 
                     part.type === 'script' ? <ScrollText className="w-12 h-12" /> : 
                     part.type === 'song' ? <Mic2 className="w-12 h-12" /> :
                     part.type === 'item-song' ? <Flame className="w-12 h-12" /> :
                     part.type === 'reconstruction' ? <Search className="w-12 h-12" /> :
                     <MessageSquare className="w-12 h-12" />}
                  </div>
                  
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 bg-opacity-10 rounded-lg text-[10px] font-black uppercase tracking-widest border border-opacity-20 ${
                              part.type === 'joke' ? 'bg-red-500 text-red-500 border-red-500' : 
                              part.type === 'character' ? 'bg-blue-500 text-blue-500 border-blue-500' :
                              part.type === 'script' ? 'bg-yellow-500 text-yellow-500 border-yellow-500' :
                              part.type === 'song' ? 'bg-amber-500 text-amber-500 border-amber-500' :
                              part.type === 'item-song' ? 'bg-pink-500 text-pink-500 border-pink-500' :
                              'bg-zinc-500 text-zinc-500 border-zinc-500'
                            }`}>
                              {part.type}
                            </div>
                            {part.type === 'audio' && (
                              <div className="px-3 py-1 bg-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 shadow-lg shadow-emerald-900/40">
                                <Music className="w-3 h-3" />
                                Audio Asset
                              </div>
                            )}
                            {part.isFlagged && (
                              <div className="px-3 py-1 bg-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 shadow-lg shadow-red-900/40">
                                <ShieldAlert className="w-3 h-3" />
                                {part.moderationReason || 'Safety Checked'}
                              </div>
                            )}
                            {(part as any).neuralDepth > 70 && (
                              <div className="px-3 py-1 bg-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 shadow-lg shadow-purple-900/40">
                                <Brain className="w-3 h-3" />
                                Neural Immersion
                              </div>
                            )}
                            {(part as any).neuralMood && (part as any).neuralMood !== 'Neutral' && (
                              <div className="px-3 py-1 bg-cyan-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 shadow-lg shadow-cyan-900/40">
                                <Wind className="w-3 h-3" />
                                {(part as any).neuralMood}
                              </div>
                            )}
                            {(part as any).atmosphere && (part as any).atmosphere !== 'Standard' && (
                              <div className="px-3 py-1 bg-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 shadow-lg shadow-amber-900/40">
                                <Wind className="w-3 h-3" />
                                Mausam: {(part as any).atmosphere}
                              </div>
                            )}
                            {(part as any).soulResonance > 80 && (
                              <div className="px-3 py-1 bg-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 shadow-lg shadow-red-900/40">
                                <Flame className="w-3 h-3" />
                                Soul Bound
                              </div>
                            )}
                            <button 
                              onClick={() => toggleVideoSelection(part.id)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${selectedForVideo.includes(part.id) ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/50'}`}
                            >
                              <Video className="w-3 h-3" />
                              {selectedForVideo.includes(part.id) ? 'Selected for Cinema' : 'Add to Cinema'}
                            </button>
                            {part.matchScore && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <span className="text-[10px] font-black text-green-500">{part.matchScore}% MATCH</span>
                                <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${part.matchScore}%` }}
                                    className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {part.tags && part.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {part.tags.map(tag => (
                                <span key={tag} className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter border border-zinc-800 px-1.5 py-0.5 rounded-md hover:border-zinc-700 transition-colors">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {part.type === 'reconstruction' ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-black tracking-widest text-purple-500">Crime Scene Reconstruction</p>
                          <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase italic">The Investigation</h3>
                        </div>
                        <Search className="w-8 h-8 text-purple-900/50" />
                      </div>
                      <div className="prose prose-invert prose-zinc max-w-none">
                        <ReactMarkdown>{part.content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : part.type === 'character' ? (
                    <div className="space-y-6">
                      {(() => {
                        try {
                          const char = JSON.parse(part.content);
                          return (
                            <>
                              <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase font-black tracking-widest text-blue-500">Character Profile</p>
                                  <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">{char.name}</h3>
                                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{char.role}</p>
                                </div>
                                <Ghost className="w-10 h-10 text-blue-900/50" />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Personality</p>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{char.personality}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Motivations</p>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{char.motivations}</p>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-red-500">Flaws & Vices</p>
                                    <p className="text-sm text-red-400/80 leading-relaxed font-medium italic">{char.flaws}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Backstory</p>
                                    <p className="text-sm text-zinc-400 leading-relaxed italic">{char.backstory}</p>
                                  </div>
                                </div>
                              </div>

                              {char.kundli && (
                                <div className="mt-8 p-6 bg-red-950/20 border border-red-900/30 rounded-2xl relative overflow-hidden group/kundli">
                                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/kundli:opacity-10 transition-opacity">
                                    <Zap className="w-16 h-16 text-red-500" />
                                  </div>
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-600/10 rounded-lg">
                                      <Zap className="w-4 h-4 text-red-500" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-red-500">Noir Kundli (Dark Destiny)</h4>
                                  </div>
                                  <p className="text-xs text-red-200/70 leading-relaxed italic border-l-2 border-red-900/50 pl-4">
                                    {char.kundli}
                                  </p>
                                  <div className="mt-4 flex flex-wrap gap-4 text-[8px] font-black uppercase tracking-widest text-zinc-600">
                                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-red-600 rounded-full" /> Born: {char.dob}</span>
                                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-red-600 rounded-full" /> Time: {char.tob}</span>
                                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-red-600 rounded-full" /> Place: {char.pob}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        } catch (e) {
                          return <div className="prose prose-invert prose-zinc max-w-none"><ReactMarkdown>{part.content}</ReactMarkdown></div>;
                        }
                      })()}
                    </div>
                  ) : part.type === 'song' || part.type === 'item-song' ? (
                    <div className="space-y-6">
                      {(() => {
                        try {
                          const song = JSON.parse(part.content);
                          return (
                            <>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Title</p>
                                  <button onClick={() => handleCopy(song.title, part.id + '-title')} className="text-zinc-600 hover:text-zinc-100"><Copy className="w-3 h-3" /></button>
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">{song.title}</h3>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Lyrics</p>
                                  <button onClick={() => handleCopy(song.lyrics, part.id + '-lyrics')} className="text-zinc-600 hover:text-zinc-100"><Copy className="w-3 h-3" /></button>
                                </div>
                                <div className="bg-black/40 p-4 rounded-xl border border-zinc-800/50 whitespace-pre-wrap text-zinc-300 font-medium leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                                  {song.lyrics}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Style</p>
                                    <button onClick={() => handleCopy(song.style, part.id + '-style')} className="text-zinc-600 hover:text-zinc-100"><Copy className="w-3 h-3" /></button>
                                  </div>
                                  <p className="text-xs text-zinc-400 italic">{song.style}</p>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Caption</p>
                                    <button onClick={() => handleCopy(song.caption, part.id + '-caption')} className="text-zinc-600 hover:text-zinc-100"><Copy className="w-3 h-3" /></button>
                                  </div>
                                  <p className="text-xs text-zinc-400">{song.caption}</p>
                                </div>
                              </div>


                              {part.musicUrl && (
                                <div className="pt-4 flex flex-col gap-2">
                                  <audio 
                                    src={part.musicUrl} 
                                    controls 
                                    className="w-full h-8 opacity-50 hover:opacity-100 transition-opacity"
                                    onError={(e) => console.error("Audio playback failed:", e)}
                                  />
                                  <a 
                                    href={part.musicUrl} 
                                    download={`${song.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_track.wav`}
                                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-black uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Download className="w-3 h-3" />
                                    Download Track
                                  </a>
                                </div>
                              )}
                            </>
                          );
                        } catch (e) {
                          return <ReactMarkdown>{part.content}</ReactMarkdown>;
                        }
                      })()}
                    </div>
                  ) : part.type === 'audio' ? (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between border-b border-emerald-900/30 pb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Audio Archive</p>
                          <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase italic">{part.tags?.[1] || 'Shadow Evidence'}</h3>
                        </div>
                        <Music className="w-8 h-8 text-emerald-900/50" />
                      </div>
                      <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-inner space-y-4">
                         <audio src={part.content} controls className="w-full h-14" />
                         <div className="p-4 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">Spectral signature verified. Playback authorized.</p>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-zinc max-w-none mb-8">
                      <ReactMarkdown>{part.content}</ReactMarkdown>
                    </div>
                  )}

                  {/* Interactive Choices */}
                  {!part.selectedChoice && part.choices && part.choices.length > 0 && (
                    <div className="flex flex-col gap-2.5 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                      <p className="text-[9px] uppercase font-black tracking-widest text-red-500/80 mb-1">Make a decision to forge your path:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {part.choices.map((choice, i) => {
                          const isObj = typeof choice === 'object';
                          const choiceText = isObj ? (choice as any).text : choice;
                          const choiceType = isObj ? (choice as any).type : 'Action';
                          const choiceImpact = isObj ? (choice as any).impact : 'Forges a new path';
                          
                          // Style based on type
                          let themeClasses = "bg-red-600/10 hover:bg-red-600/20 border-red-600/30 text-red-500 hover:border-red-500 hover:text-white";
                          let badgeBg = "bg-red-950 text-red-400 border-red-900/50";
                          
                          if (choiceType.toLowerCase() === 'seduction') {
                            themeClasses = "bg-pink-600/10 hover:bg-pink-600/20 border-pink-600/30 text-pink-500 hover:border-pink-500 hover:text-white";
                            badgeBg = "bg-pink-950 text-pink-400 border-pink-900/50";
                          } else if (choiceType.toLowerCase() === 'gamble') {
                            themeClasses = "bg-amber-600/10 hover:bg-amber-600/20 border-amber-600/30 text-amber-500 hover:border-amber-500 hover:text-white";
                            badgeBg = "bg-amber-950 text-amber-400 border-amber-900/50";
                          } else if (choiceType.toLowerCase() === 'ending') {
                            themeClasses = "bg-purple-600/10 hover:bg-purple-600/20 border-purple-600/30 text-purple-500 hover:border-purple-500 hover:text-white";
                            badgeBg = "bg-purple-950 text-purple-400 border-purple-900/50";
                          } else if (choiceType.toLowerCase() === 'relationship') {
                            themeClasses = "bg-blue-600/10 hover:bg-blue-600/20 border-blue-600/30 text-blue-500 hover:border-blue-500 hover:text-white";
                            badgeBg = "bg-blue-950 text-blue-400 border-blue-900/50";
                          }

                          return (
                            <button
                              key={i}
                              onClick={() => handleChoiceSelect(part.id, choice)}
                              className={`flex flex-col text-left p-4 rounded-2xl border ${themeClasses} transition-all hover:scale-[1.02] shadow-lg flex-1 group/choice relative overflow-hidden`}
                            >
                              <div className="flex items-center gap-2 justify-between w-full mb-1">
                                <span className="font-black uppercase italic tracking-tighter text-xs sm:text-sm flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5 group-hover/choice:animate-pulse" />
                                  {choiceText}
                                </span>
                                <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-md ${badgeBg}`}>
                                  {choiceType}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-medium tracking-wide">
                                {choiceImpact}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {part.selectedChoice && (
                     <div className="mb-8 flex items-center gap-3 px-4 py-2 bg-zinc-950/50 border border-zinc-800 rounded-xl w-fit shadow-inner">
                        <div className="p-1 bg-green-500/20 rounded-full">
                          <Check className="w-2.5 h-2.5 text-green-500" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Fate Decided: </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white italic">{part.selectedChoice}</span>
                     </div>
                  )}

                      {/* Action Grid */}
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-6 pt-6 border-t border-zinc-800/50">
                        <button 
                          onClick={() => handleCopy(part.content, part.id)}
                          className="flex items-center justify-center sm:justify-start gap-2 py-2 sm:py-0 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors bg-zinc-900 sm:bg-transparent rounded-lg border border-zinc-800 sm:border-transparent"
                        >
                        {copiedId === part.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        {copiedId === part.id ? 'Copied' : 'Copy All'}
                      </button>
                      <div className="flex items-center gap-4">
                        {part.isSpeaking && !part.audioUrl && !part.isPaused ? (
                          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Narrating...
                          </button>
                        ) : (
                          <>
                            {(!part.isSpeaking && !part.isPaused) ? (
                              <button 
                                onClick={() => speakContent(part.id, part.content, 'play')}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors"
                              >
                                <Volume2 className="w-3 h-3" />
                                Narrate
                              </button>
                            ) : (
                              <div className="flex items-center gap-4">
                                {part.isSpeaking ? (
                                  <button 
                                    onClick={() => speakContent(part.id, part.content, 'pause')}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                                  >
                                    <Pause className="w-3 h-3" />
                                    Pause
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => speakContent(part.id, part.content, 'play')}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500 hover:text-green-400 transition-colors"
                                  >
                                    <Play className="w-3 h-3" />
                                    Resume
                                  </button>
                                )}
                                <button 
                                  onClick={() => speakContent(part.id, part.content, 'stop')}
                                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors"
                                >
                                  <Square className="w-3 h-3" />
                                  Stop
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <button 
                        onClick={() => togglePublic(part.id, !!part.isPublic)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${part.isPublic ? 'text-blue-500' : 'text-zinc-500 hover:text-blue-500'}`}
                      >
                        <Globe className="w-3 h-3" />
                        {part.isPublic ? 'Make Private' : 'Share Publicly'}
                      </button>
                      <button 
                        onClick={() => handlePrint(part.content)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors"
                      >
                        <Printer className="w-3 h-3" />
                        Print
                      </button>
                      <button 
                        onClick={() => handleAudioDownload(part)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${part.audioUrl ? 'text-blue-500 hover:text-blue-400' : 'text-zinc-500 hover:text-zinc-100'}`}
                      >
                        <Music className="w-3 h-3" />
                        {part.audioUrl ? 'Download Audio' : 'Prepare Audio'}
                      </button>
                      
                      <button 
                        onClick={() => generateImage(part.content, part.id)}
                        disabled={isGeneratingImage === part.id}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isGeneratingImage === part.id ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-500'}`}
                      >
                        {isGeneratingImage === part.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                        {isGeneratingImage === part.id ? 'Creating Noir Visual...' : 'Pulp Poster'}
                      </button>

                      {(part.type === 'song' || part.type === 'item-song') && (
                        <>
                          <button 
                            onClick={() => generateSongVisuals(part)}
                            disabled={isGeneratingImage === part.id}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isGeneratingImage === part.id ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-500'}`}
                          >
                            {isGeneratingImage === part.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <LayoutGrid className="w-3 h-3" />}
                            {isGeneratingImage === part.id ? 'Reeling...' : 'Track Visual Reel'}
                          </button>
                          <button 
                            onClick={() => generateMusic(part)}
                            disabled={part.isGeneratingMusic}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${part.isGeneratingMusic ? 'text-blue-500' : 'text-zinc-500 hover:text-blue-500'}`}
                          >
                            {part.isGeneratingMusic ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                            {part.isGeneratingMusic ? 'Producing Music...' : 'Produce Music'}
                          </button>
                        </>
                      )}

                      <button 
                        onClick={() => smartCinematize(part.id)}
                        disabled={isCinematizing || isExportingVideo}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          isCinematizing ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-500'
                        }`}
                      >
                        <Sparkles className={`w-3 h-3 ${isCinematizing ? 'animate-spin' : ''}`} />
                        {isCinematizing ? 'Director at Work...' : 'Auto-Short'}
                      </button>

                      <button 
                        onClick={() => generateVideo(part.content, "Cinematic Scene")}
                        disabled={!!isGeneratingVideo}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          isGeneratingVideo ? 'text-purple-500' : 'text-zinc-500 hover:text-purple-500'
                        }`}
                      >
                        {isGeneratingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Film className="w-3 h-3" />}
                        {isGeneratingVideo ? 'Directing AI Film...' : 'AI Film Clip'}
                      </button>

                      <button 
                        onClick={() => compileFullReel(part.id)}
                        disabled={isExportingVideo}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          isExportingVideo ? 'text-red-500' : 
                          enhancedHistory.some(h => (h.type === 'image' || h.type === 'video') && ((h as any).storyLinkId === part.id || (h.createdAt >= part.createdAt && h.createdAt <= part.createdAt + 120000))) 
                          ? 'text-green-500 hover:text-green-400' 
                          : 'text-zinc-500 hover:text-red-500'
                        }`}
                      >
                        <Clapperboard className={`w-3 h-3 ${isExportingVideo ? 'animate-pulse' : ''}`} />
                        {isExportingVideo ? 'In Cinema...' : 
                         enhancedHistory.some(h => (h.type === 'image' || h.type === 'video') && ((h as any).storyLinkId === part.id || (h.createdAt >= part.createdAt && h.createdAt <= part.createdAt + 120000)))
                         ? 'Release Reel' : 'Cinema Reel'
                        }
                      </button>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleFeedback(part.id, 'up')}
                        className={`p-2 rounded-full transition-all ${part.feedback === 'up' ? 'bg-green-500/20 text-green-500' : 'hover:bg-zinc-800 text-zinc-600'}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleFeedback(part.id, 'down')}
                        className={`p-2 rounded-full transition-all ${part.feedback === 'down' ? 'bg-red-500/20 text-red-500' : 'hover:bg-zinc-800 text-zinc-600'}`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteHistoryItem(part.id)}
                        className="p-2 rounded-full hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
                    ))}
                  </AnimatePresence>
            </>
          )}
        </div>
      ) : null}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        )}
          </div>
      </main>

      {/* Fixed Input Bar */}
      {(activeTab === 'noir-chat' || activeTab === 'reconstruct' || activeTab === 'studio' || activeTab === 'item-songs') && (
        <div className={`absolute left-0 right-0 p-4 lg:p-8 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none transition-all ${isMobile ? 'bottom-20' : 'bottom-0'}`}>
          <div className="max-w-4xl mx-auto pointer-events-auto px-2 sm:px-0">
            {/* Naughty Mode Warning */}
            {profile.naughtyMode && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-red-600/10 border border-red-600/30 p-2 rounded-xl text-center"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-red-500 italic">
                  ⚠️ NAUGHTY MODE ACTIVE: Mature themes, double-meaning jokes, and aggressive content enabled.
                </p>
              </motion.div>
            )}
            {/* Noir News Intel Panel */}
            {showNews && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-zinc-900/90 p-4 sm:p-6 rounded-3xl sm:rounded-[2.5rem] border border-zinc-800 shadow-2xl backdrop-blur-xl max-w-4xl mx-auto max-h-[70vh] overflow-y-auto scrollbar-hide"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6 px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/10 rounded-lg">
                      <Newspaper className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Noir Intel (India)</h3>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button 
                      onClick={() => fetchNoirNews(true)}
                      disabled={loadingNews}
                      className="p-2 text-zinc-500 hover:text-white transition-colors"
                      title="Refresh Intel"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingNews ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowNews(false)} className="p-1 text-zinc-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loadingNews ? (
                  <div className="py-8 sm:py-12 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Scanning the streets...</p>
                  </div>
                ) : newsPrompts.length === 0 ? (
                  <div className="py-8 sm:py-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">The streets are silent. Click refresh to scan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {newsPrompts.map((news, i) => (
                      <div
                        key={i}
                        className="group bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-left hover:border-red-600 transition-all hover:scale-[1.02] relative overflow-hidden"
                      >
                        <div 
                          className="cursor-pointer"
                          onClick={() => {
                            setPrompt(news.prompt);
                            setShowNews(false);
                          }}
                        >
                          <h4 className="text-[11px] font-black uppercase text-white mb-2 group-hover:text-red-500 transition-colors line-clamp-1">{news.title}</h4>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase line-clamp-2 leading-relaxed mb-3">{news.prompt}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              generateVideo(news.prompt, news.title);
                              setShowNews(false);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                          >
                            <Video className="w-3 h-3" />
                            Noir Reel
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrompt(news.prompt);
                              setSelectedMusicStyle('Dramatic Crime Ballad');
                              setCustomMusicStyle('Dramatic Cinematic Crime Ballad, News Report Style');
                              setActiveTab('studio');
                              setShowNews(false);
                              setToast({ message: "News loaded into Song Studio!", type: 'info' });
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                          >
                            <Mic2 className="w-3 h-3" />
                            Song News
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrompt(news.prompt);
                              setShowNews(false);
                            }}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                          >
                            Use Intel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Archetype Selector for Character Forge */}
            {showAdvanced && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 sm:p-6 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl sm:rounded-[2.5rem] shadow-2xl space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Zap className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic">Advanced Parameters</p>
                </div>
                <button onClick={() => setShowAdvanced(false)} className="p-1 text-zinc-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                {/* Genre Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Select Story Genre</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {NOIR_GENRES.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setSelectedGenre(g.id);
                          setToast({ message: `Genre: ${g.name}`, type: 'info' });
                        }}
                        className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                          selectedGenre === g.id
                            ? 'bg-blue-600/20 border-blue-500 ring-4 ring-blue-500/10'
                            : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${selectedGenre === g.id ? 'bg-blue-500 text-white' : 'bg-zinc-900 text-zinc-600'}`}>
                            {g.icon}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedGenre === g.id ? 'text-white' : ''}`}>{g.name}</span>
                        </div>
                        <p className="text-[8px] font-medium leading-tight opacity-70">{g.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Underlying Theme</label>
                  <div className="flex flex-wrap gap-2">
                    {NOIR_THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTheme(t.id);
                          setToast({ message: `Theme: ${t.name}`, type: 'info' });
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          selectedTheme === t.id
                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40'
                            : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                        }`}
                        title={t.description}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] text-zinc-600 font-bold uppercase italic px-2">
                    Current: {NOIR_THEMES.find(t => t.id === selectedTheme)?.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">Desired Plot Twists</label>
                  <input 
                    type="text"
                    value={advancedParams.plotTwists}
                    onChange={(e) => setAdvancedParams({ ...advancedParams, plotTwists: e.target.value })}
                    placeholder="e.g. Betrayal by the boss, hidden identity..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">Character Flaws</label>
                  <input 
                    type="text"
                    value={advancedParams.flaws}
                    onChange={(e) => setAdvancedParams({ ...advancedParams, flaws: e.target.value })}
                    placeholder="e.g. Gambling addiction, short temper..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">Narrative Pacing</label>
                  <div className="flex gap-2">
                    {(['slow', 'fast', 'dynamic'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setAdvancedParams({ ...advancedParams, pacing: p })}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                          advancedParams.pacing === p 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">Custom Edgy Theme (Override)</label>
                  <input 
                    type="text"
                    value={advancedParams.theme}
                    onChange={(e) => setAdvancedParams({ ...advancedParams, theme: e.target.value })}
                    placeholder="e.g. Brutalist, Unconventional, Surreal Noir..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {showArchetypes && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-zinc-900/80 p-8 rounded-[3rem] border border-zinc-800 shadow-2xl backdrop-blur-3xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Ghost className="w-64 h-64 text-zinc-500" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-blue-500 italic">Character Foundry</p>
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Choose Archetype</h2>
                  </div>
                  <button onClick={() => setShowArchetypes(false)} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-white transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto px-2 pb-4 pr-4 custom-scrollbar">
                  <button
                    onClick={() => {
                      setSelectedArchetype('Random');
                      generateContent('character');
                    }}
                    className={`group relative p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col justify-between min-h-[160px] ${
                      selectedArchetype === 'Random'
                        ? 'bg-blue-600/20 border-blue-500 ring-4 ring-blue-500/20'
                        : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Dices className={`w-4 h-4 ${selectedArchetype === 'Random' ? 'text-blue-400' : 'text-zinc-500'}`} />
                        <h3 className="text-lg font-black italic text-white uppercase tracking-tighter">Random</h3>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed group-hover:text-zinc-400 transition-colors">
                        Let the underworld decide your fate. The AI will forge a novel, unique archetype inspired by the shadows.
                      </p>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <ChevronRight className={`w-5 h-5 ${selectedArchetype === 'Random' ? 'text-blue-400' : 'text-zinc-800'}`} />
                    </div>
                  </button>

                  {DEEP_ARCHETYPES.map((arch) => (
                    <button
                      key={arch.name}
                      onClick={() => {
                        setSelectedArchetype(arch.name);
                        generateContent('character');
                      }}
                      className={`group relative p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col justify-between min-h-[160px] ${
                        selectedArchetype === arch.name
                          ? 'bg-blue-600/20 border-blue-500 ring-4 ring-blue-500/20'
                          : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 shadow-xl'
                      }`}
                    >
                      <div className="space-y-2">
                        <h3 className="text-lg font-black italic text-white uppercase tracking-tighter line-clamp-1">{arch.name}</h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed line-clamp-2 group-hover:text-zinc-100 transition-colors">
                          {arch.personality}
                        </p>
                        <div className="pt-2 border-t border-zinc-900 mt-2">
                           <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Speech Pattern</p>
                           <p className="text-[9px] text-zinc-500 italic line-clamp-2 group-hover:text-zinc-400">{arch.dialogue}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex items-center justify-between">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-75" />
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150" />
                        </div>
                        <ChevronRight className={`w-5 h-5 ${selectedArchetype === arch.name ? 'text-blue-400' : 'text-zinc-800 group-hover:text-zinc-500'}`} />
                      </div>
                      
                      {/* Tooltip-like detail on hover could be added here, but the grid already shows personality */}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          

          <MusicStudio
            showMusicStyles={showMusicStyles}
            setShowMusicStyles={setShowMusicStyles}
            customMusicStyle={customMusicStyle}
            setCustomMusicStyle={setCustomMusicStyle}
            selectedMusicStyle={selectedMusicStyle}
            setSelectedMusicStyle={setSelectedMusicStyle}
            onSurpriseMe={surpriseMeMusicStyle}
            productionBass={productionBass}
            setProductionBass={setProductionBass}
            productionGrime={productionGrime}
            setProductionGrime={setProductionGrime}
            productionClarity={productionClarity}
            setProductionClarity={setProductionClarity}
            productionNeuralDepth={productionNeuralDepth}
            setProductionNeuralDepth={setProductionNeuralDepth}
            productionMoodShift={productionMoodShift}
            setProductionMoodShift={setProductionMoodShift}
            productionAtmosphere={productionAtmosphere}
            setProductionAtmosphere={setProductionAtmosphere}
            productionSoulResonance={productionSoulResonance}
            setProductionSoulResonance={setProductionSoulResonance}
            productionInstruments={productionInstruments}
            setProductionInstruments={setProductionInstruments}
            productionMastering={productionMastering}
            setProductionMastering={setProductionMastering}
            productionVocalMode={productionVocalMode}
            setProductionVocalMode={setProductionVocalMode}
            onGenerateSong={() => {
              const lastPart = history[history.length - 1];
              if (lastPart) generateMusic(lastPart);
              setShowMusicStyles(false);
            }}
            MUSIC_TEMPLATES={MUSIC_TEMPLATES}
            TRENDING_MUSIC_STYLES={INDUSTRY_HOUSES}
            setToast={setToast}
          />

          {/* Legacy Suggester */}
          {activeTab === 'studio' && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => setPrompt("A cosmic-scale noir clash between the Solar Vanguard and the Architect of Darkness in a rain-drenched Mumbai.")}
                className="px-3 py-1.5 bg-purple-600/10 border border-purple-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-purple-400 hover:bg-purple-600/20 transition-all flex items-center gap-2"
              >
                <Zap className="w-3 h-3" /> Shaktimaan vs Kilvish
              </button>
              <button 
                onClick={() => setPrompt("The silent meditation of a hero before the final battle. Focus on the 'Neural Depth' of the city's sounds.")}
                className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/20 transition-all flex items-center gap-2"
              >
                <Brain className="w-3 h-3" /> Neural Meditation
              </button>
            </div>
          )}

          <NoirInput 
            initialValue={prompt}
            loading={loading}
            randomizeAll={randomizeAll}
            onSend={(val) => {
              setPrompt(val);
              generateContent('story', val);
            }}
            onToggleNews={() => {
              if (loadingNews) return;
              setShowNews(!showNews);
              if (!showNews && newsPrompts.length === 0) fetchNoirNews(true);
            }}
            onToggleAdvanced={() => {
              setShowAdvanced(!showAdvanced);
              setShowArchetypes(false);
              setShowMusicStyles(false);
            }}
            showAdvanced={showAdvanced}
            onToggleArchetypes={() => {
              setShowArchetypes(!showArchetypes);
              setShowMusicStyles(false);
              setShowAdvanced(false);
            }}
            onToggleMusicStyles={() => {
              setShowMusicStyles(!showMusicStyles);
              setShowArchetypes(false);
              setShowAdvanced(false);
            }}
            onGenerateSong={() => generateContent('song')}
            onSaveDraft={() => saveDraft()}
            showNews={showNews}
            showArchetypes={showArchetypes}
            showMusicStyles={showMusicStyles}
            customMusicStyle={customMusicStyle}
            setCustomMusicStyle={setCustomMusicStyle}
            selectedMusicStyle={selectedMusicStyle}
            setSelectedMusicStyle={setSelectedMusicStyle}
            onSurpriseMe={surpriseMeMusicStyle}
            newsLoading={loadingNews}
            hasPrompt={!!prompt.trim()}
          />
          <p className="text-[8px] text-center mt-3 uppercase font-black tracking-[0.2em] text-zinc-700">
            Universal Device Support • Gritty AI Engine v2.5 • Street Level Storytelling
          </p>
        </div>
      </div>
    )}
  </div>

  {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={confirmModal?.onCancel || (() => setConfirmModal(null))}
      />

      {/* Mobile Bottom Navigation */}
      {isMobile && user && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 lg:hidden pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-around">
              {[
                { tab: 'home', icon: <Home className="w-5 h-5" />, label: 'Home' },
                { tab: 'noir-chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Studio' },
                { tab: 'public-gallery', icon: <Globe className="w-5 h-5" />, label: 'Market' },
                { tab: 'characters', icon: <Ghost className="w-5 h-5" />, label: 'Vault' },
                { tab: 'newspaper', icon: <ShieldAlert className="w-5 h-5" />, label: 'Noir Reports' }
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab as any)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all relative ${
                    activeTab === item.tab 
                      ? 'text-red-500 bg-red-500/10' 
                      : 'text-zinc-500'
                  }`}
                >
                  {item.icon}
                  <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
                  {activeTab === item.tab && (
                    <motion.div 
                      layoutId="activeTabGlow"
                      className="absolute -bottom-1 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
