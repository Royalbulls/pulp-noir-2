export async function generateWithGemini(params: {
  prompt?: string;
  contents?: any[];
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  model?: string;
  responseModalities?: string[];
  speechConfig?: any;
}) {
  // Read systemLanguage from localStorage (client-side only)
  let systemLanguage = "Hinglish";
  if (typeof window !== "undefined") {
    systemLanguage = window.localStorage.getItem("systemLanguage") || "Hinglish";
  }

  let languageInstruction = "";
  if (systemLanguage === "Hindi") {
    languageInstruction = "\n\nCRITICAL LANGUAGE DIRECTIVE: You MUST write all user-facing narrative, titles, descriptions, dialogues, and song lyrics strictly in the Hindi language using the Devanagari script (हिंदी भाषा और देवनागरी लिपि का उपयोग करें).";
    if (params.responseMimeType === "application/json") {
      languageInstruction += " For JSON output: keep all JSON keys exactly as specified in the schema, but translate all string values (narrative text, lyrics, dialogues, titles, descriptions) into Hindi. Do not change the JSON structure.";
    } else {
      languageInstruction += " Avoid using English words or Latin characters unless they are standard proper nouns.";
    }
  } else if (systemLanguage === "Hinglish") {
    languageInstruction = "\n\nCRITICAL LANGUAGE DIRECTIVE: You MUST write all user-facing narrative, titles, descriptions, dialogues, and song lyrics strictly in Hinglish (a cinematic, dramatic Bollywood-style mix of Hindi and English written in the English/Latin alphabet, e.g., 'Arey yaar, maine tujhe kitni baar bola hai ki is dhandhe se door raho, par tum sunte hi nahi!').";
    if (params.responseMimeType === "application/json") {
      languageInstruction += " For JSON output: keep all JSON keys exactly as specified in the schema, but write all string values (narrative text, lyrics, dialogues, titles, descriptions) in Hinglish. Do not change the JSON structure.";
    } else {
      languageInstruction += " Make the dialogue and text punchy, using strong Hindi/Urdu words mixed with English phrases, written using Latin script.";
    }
  } else {
    languageInstruction = "\n\nCRITICAL LANGUAGE DIRECTIVE: You MUST write all user-facing narrative, titles, descriptions, dialogues, and song lyrics strictly in English. Maintain a gritty, hard-boiled, atmospheric retro pulp noir style.";
  }

  // Inject language instruction into the params
  const updatedParams = { ...params };
  if (updatedParams.systemInstruction) {
    updatedParams.systemInstruction += languageInstruction;
  } else if (updatedParams.prompt) {
    updatedParams.prompt += languageInstruction;
  } else {
    updatedParams.systemInstruction = "You are a retro pulp noir narrative storyteller." + languageInstruction;
  }

  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedParams),
  });

  if (!response.ok) {
    let errorMessage = `Server error: ${response.status} ${response.statusText}`;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const text = await response.text();
        // If it's a Next.js error or HTML page, try to extract a clean message or snippet
        if (text.includes("<title>")) {
          const match = text.match(/<title>([^<]+)<\/title>/i);
          if (match && match[1]) {
            errorMessage = `Server Error: ${match[1].trim()}`;
          } else {
            errorMessage = `Server Error (500): The server returned an error page.`;
          }
        } else {
          errorMessage = text.substring(0, 150).trim() || errorMessage;
        }
      }
    } catch (e) {
      errorMessage = `Server error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  let data;
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (text.includes("<!doctype html>") || text.includes("<html")) {
        throw new Error("The server returned an HTML page instead of JSON content. This usually indicates a 404 or backend setup issue.");
      }
      throw new Error(`Expected JSON response, but received: ${text.substring(0, 100)}`);
    }
  } catch (e: any) {
    throw new Error(e.message || "Failed to parse API response as JSON");
  }

  return { 
    text: data.text,
    response: {
      text: () => data.text
    },
    // Adding candidates for multimodal access
    candidates: data.candidates
  };
}
