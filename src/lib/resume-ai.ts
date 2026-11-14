import {
  ResumeInputPayload,
  GeneratedResume,
  GeneratedResumeSchema,
} from "@/types/resume";

const DEFAULT_GEMINI_MODEL = "gemini-4-hydrogen";

/**
 * Constructs a strict, anti-hallucination ATS prompt for Google Gemini 4 Hydrogen.
 */
function buildGeminiPrompt(input: ResumeInputPayload): string {
  const isStudentOrFresher =
    input.career.careerLevel === "student" ||
    input.career.careerLevel === "fresher" ||
    input.career.careerLevel === "intern" ||
    input.experience.length === 0;

  return `You are an elite, executive-level ATS Resume Engineering AI for the studio IMDAD.BUILDS.
Your mission is to transform the provided user information into a world-class, ATS-compliant, high-impact resume.

CRITICAL ANTI-HALLUCINATION RULES (VIOLATION IS STRICTLY PROHIBITED):
1. FACTUAL ACCURACY IS ABSOLUTE. NEVER invent or hallucinate companies, job titles, start/end dates, universities, degrees, GPAs, certifications, projects, languages, or awards.
2. METRICS & NUMBERS: NEVER invent metrics, dollar amounts, revenue numbers, or percentages. ONLY use metrics if explicitly mentioned in user notes.
3. STUDENTS & FRESHERS: If the candidate is a student or fresher with no work experience, the "experience" array MUST be empty. DO NOT fabricate corporate internships or jobs. Emphasize their projects, technical skills, and academic coursework instead.
4. MISSING DETAILS: If an optional section has no data, return an empty array or omit. Never fill with placeholder text like "Lorem ipsum" or fictional companies.

ATS PARSING & COPYWRITING DIRECTIVES:
1. ACTION VERBS: Start every single bullet point with a powerful past-tense action verb (e.g., Engineered, Architected, Designed, Formulated, Streamlined, Spearheaded, Accelerated, Implemented, Deployed, Automated). For current jobs, present-tense verbs are acceptable.
2. CONCISENESS & IMPACT: Transform weak statements ("worked on frontend") into high-impact ATS bullets ("Engineered modular React component architecture improving frontend render speeds and UI responsiveness").
3. JOB DESCRIPTION OPTIMIZATION:
${
  input.career.targetJobDescription && input.career.targetJobDescription.trim().length > 10
    ? `Target Job Description Provided by User:
"""
${input.career.targetJobDescription.slice(0, 3000)}
"""
Align phrasing and natural keyword density to this job description without fabricating false experience.`
    : "No job description provided. Optimize for standard modern industry ATS keywords matching the target title."
}
4. FORMAT: Return ONLY valid JSON adhering strictly to the requested schema. No markdown backticks, no markdown fence, no preamble.

CANDIDATE INPUT DATA:
Personal Info:
- Full Name: ${input.personal.fullName}
- Email: ${input.personal.email}
- Phone: ${input.personal.phone}
- City & State: ${input.personal.cityState}
- LinkedIn: ${input.personal.linkedinUrl || "N/A"}
- Portfolio / Website: ${input.personal.portfolioUrl || "N/A"}

Career Goals:
- Target Job Title: ${input.career.targetJobTitle}
- Career Level: ${input.career.careerLevel}
- Target Industry: ${input.career.targetIndustry || "General Technology & Products"}
- User-provided summary thoughts: ${input.career.professionalSummary || "None"}

Education:
${JSON.stringify(input.education, null, 2)}

Work Experience (${isStudentOrFresher ? "Empty or Minimal - Emphasize Projects" : "Professional History"}):
${JSON.stringify(input.experience, null, 2)}

Skills & Accomplishments:
${JSON.stringify(input.skillsAndMore, null, 2)}

Preferences:
- Target Template: ${input.preferences.templateId}
- Page Target: ${input.preferences.pageLength}
- Language: ${input.preferences.language}

REQUIRED JSON STRUCTURE:
{
  "header": {
    "fullName": string,
    "targetTitle": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string (optional),
    "portfolio": string (optional)
  },
  "professionalSummary": string (2-4 sentences, ATS-optimized punchy narrative),
  "skills": {
    "technical": string[],
    "tools": string[],
    "soft": string[]
  },
  "experience": [
    {
      "id": string,
      "company": string,
      "jobTitle": string,
      "employmentType": string,
      "dateRange": string,
      "bulletPoints": string[] (3-5 high-impact bullets per role)
    }
  ],
  "education": [
    {
      "id": string,
      "institution": string,
      "degree": string,
      "fieldOfStudy": string,
      "dateRange": string,
      "grade": string (optional),
      "highlights": string[] (optional coursework/achievements)
    }
  ],
  "projects": [
    {
      "id": string,
      "title": string,
      "role": string (optional),
      "technologies": string[],
      "bulletPoints": string[] (2-3 bullets explaining architecture and purpose),
      "link": string (optional)
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string,
      "year": string (optional)
    }
  ],
  "languages": string[],
  "awards": string[],
  "metadata": {
    "generatedAt": ISO string,
    "model": "gemini-4-hydrogen",
    "templateId": "${input.preferences.templateId}",
    "pageTarget": "${input.preferences.pageLength}",
    "keywordMatchCount": number
  }
}`;
}

/**
 * Generates an ATS resume via Google's Gemini 4 Hydrogen model with schema validation.
 */
export async function generateResumeWithGemini4Hydrogen(
  input: ResumeInputPayload,
  configuredModel: string = DEFAULT_GEMINI_MODEL
): Promise<{ success: true; data: GeneratedResume } | { success: false; error: string; code: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return {
      success: false,
      code: "MISSING_API_KEY",
      error:
        "Google Gemini API key is not configured on the server. Please set GEMINI_API_KEY in server environment variables.",
    };
  }

  const prompt = buildGeminiPrompt(input);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${configuredModel}:generateContent?key=${apiKey}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45-second timeout for complex generation

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: "You are the IMDAD.BUILDS ATS Resume Engine. Output ONLY valid JSON adhering strictly to the user's schema. Do NOT enclose in markdown triple-backticks.",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2, // Low temperature for high factual adherence and consistency
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError: Record<string, any> = {};
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = { raw: errorText };
      }

      const status = response.status;
      if (status === 429) {
        return {
          success: false,
          code: "RATE_LIMITED",
          error: "AI generation rate limit reached. Please wait a moment and try again.",
        };
      }

      if (status === 404) {
        return {
          success: false,
          code: "MODEL_NOT_FOUND",
          error: `AI Model '${configuredModel}' is currently unavailable on your Gemini API tier. Please check API settings.`,
        };
      }

      return {
        success: false,
        code: `GEMINI_HTTP_${status}`,
        error: parsedError?.error?.message || `Gemini API returned status ${status}.`,
      };
    }

    const result = await response.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return {
        success: false,
        code: "EMPTY_AI_RESPONSE",
        error: "AI returned an empty response. Please retry.",
      };
    }

    // Clean any accidental markdown fence if present
    const cleanedJson = rawText.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(cleanedJson);
    } catch (parseErr) {
      return {
        success: false,
        code: "MALFORMED_JSON",
        error: "AI returned invalid JSON syntax. Please retry generation.",
      };
    }

    // Validate strictly against GeneratedResumeSchema (Zod)
    const validationResult = GeneratedResumeSchema.safeParse(parsedPayload);
    if (!validationResult.success) {
      const issueSummary = validationResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .slice(0, 3)
        .join("; ");

      return {
        success: false,
        code: "SCHEMA_VALIDATION_FAILED",
        error: `Generated resume output did not match expected structure (${issueSummary}). Retrying is recommended.`,
      };
    }

    return {
      success: true,
      data: validationResult.data,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        success: false,
        code: "TIMEOUT",
        error: "AI resume generation timed out after 45 seconds. Please try again.",
      };
    }

    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      error: `Network connection to Gemini API failed: ${message}`,
    };
  }
}

/**
 * Regenerate a specific section (e.g. summary, bullet points for one experience, etc.)
 */
export async function regenerateSectionWithGemini(
  sectionType: "summary" | "experience_bullets" | "project_bullets",
  context: {
    targetTitle: string;
    targetJobDescription?: string;
    existingContent: string;
    userNotes?: string;
  },
  configuredModel: string = DEFAULT_GEMINI_MODEL
): Promise<{ success: true; result: string | string[] } | { success: false; error: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Google Gemini API key is missing on the server.",
    };
  }

  const prompt = `You are the IMDAD.BUILDS ATS Resume Section Optimizer.
Rewrite and optimize the following ${sectionType} for target role: "${context.targetTitle}".
${context.targetJobDescription ? `Target Job Description: """${context.targetJobDescription}"""` : ""}
${context.userNotes ? `User Guidance/Notes: """${context.userNotes}"""` : ""}
Existing Draft:
"""
${context.existingContent}
"""

CRITICAL: Do NOT invent false companies, tools, dates, or numerical metrics. Use strong action verbs.
${
  sectionType === "summary"
    ? `Return a JSON object: { "summary": "2-3 sentence impactful summary" }`
    : `Return a JSON object: { "bulletPoints": ["Bullet 1 with action verb", "Bullet 2 with action verb", "Bullet 3 with action verb"] }`
}`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${configuredModel}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.25 },
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Gemini API returned error ${response.status}` };
    }

    const json = await response.json();
    const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(raw);

    if (sectionType === "summary" && parsed.summary) {
      return { success: true, result: parsed.summary };
    }
    if (parsed.bulletPoints && Array.isArray(parsed.bulletPoints)) {
      return { success: true, result: parsed.bulletPoints };
    }

    return { success: false, error: "Unexpected output structure from AI optimizer." };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
