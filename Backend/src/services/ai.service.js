console.log("AI SERVICE FILE LOADED")
const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")  

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `
Generate a COMPLETE interview preparation report in STRICT JSON format.

IMPORTANT RULES:
- Return ONLY valid JSON
- Do not add markdown
- Do not add explanation
- Do not leave arrays empty
- Generate minimum:
  - 5 technical questions
  - 3 behavioral questions
  - 3 skill gaps
  - 5 preparation plan days

JSON FORMAT:

{
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behavioralQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGaps": [
    {
      "skill": "",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": ["", ""]
    }
  ],
  "title": ""
}

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`

    const response = await ai.models.generateContent({
         model: "gemini-3.5-flash-lite",
        contents: prompt
    })

    console.log(response.text)

    return JSON.parse(response.text)

}

// async function generatePdfFromHtml(htmlContent) {

//     const browser = await puppeteer.launch({
//         args: chromium.args,
//         defaultViewport: chromium.defaultViewport,
//         executablePath: await chromium.executablePath(),
//         headless: true,
//     });

//     const page = await browser.newPage();

//     await page.setContent(htmlContent, {
//         waitUntil: "networkidle0"
//     });

//     const pdfBuffer = await page.pdf({
//         format: "A4",
//         margin: {
//             top: "20mm",
//             bottom: "20mm",
//             left: "15mm",
//             right: "15mm"
//         }
//     });

//     await browser.close();

//     return pdfBuffer;
// }
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // const pdfBuffer = await page.pdf({
    //   format: "A4",
    //   printBackground: true,
    //   margin: {
    //     top: "20mm",
    //     bottom: "20mm",
    //     left: "15mm",
    //     right: "15mm",
    //   },
      // });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: "12mm",
          bottom: "12mm",
          left: "12mm",
          right: "12mm",
        },
      });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                        Layout and pagination requirements:
- Create a compact, professional, ATS-friendly resume.
- Minimize unnecessary blank spaces between sections.
- Use consistent font sizes, margins, line heights, and spacing.
- Avoid large top or bottom gaps on each page.
- Keep section headings together with their content.
- Avoid splitting a project description or bullet point across pages.
- Use page breaks only when necessary.
- Prefer a clean one-page resume when content fits; otherwise use two pages.
- Never remove relevant information just to fit everything on one page.
- Do not add empty sections or excessive vertical spacing.
- Include only factual information supported by the supplied candidate details.
The generated HTML must include a complete CSS style block inside the HTML head.

Use the following CSS for compact and consistent resume spacing:

@page {
    size: A4;
    margin: 12mm;
}

body {
    margin: 0;
    font-size: 10pt;
    line-height: 1.3;
}

h1, h2, h3 {
    margin-top: 8px;
    margin-bottom: 4px;
}

section {
    margin-bottom: 8px;
}

.project, .education-item, li {
    break-inside: avoid;
}

h2, h3 {
    break-after: avoid;
}

Ensure the CSS is actually included in the returned HTML document. Avoid excessive blank space and keep headings with their associated content.

                    `;

    const response = await ai.models.generateContent({
       model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = {generateInterviewReport, generateResumePdf}