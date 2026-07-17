import { Question, QUESTIONS_DB } from './mockData';

// Structure of evaluation result for a single question
export interface QuestionEvaluation {
  questionId: string;
  score: number;
  maxScore: number;
  expectedAnswer: string;
  topperAnswer: string;
  missingPoints: string[];
  feedback: string;
}

// Global interface for AI helper
export const AIHelper = {
  // 1. Generate subjective questions
  generateQuestions: async (
    subjectId: string,
    topic: string,
    count: number | 'random',
    type: 'very-short' | 'short' | 'long' | 'very-long' | 'mixed',
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed',
    examMode: string,
    syllabusFileName?: string,
    collegeName?: string,
    course?: string,
    subject?: string
  ): Promise<Question[]> => {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `
          You are a professional university professor setting a question paper.
          Create an exam test paper.
          ${collegeName ? `College/University: ${collegeName}` : ''}
          ${course ? `Course/Degree: ${course}` : ''}
          ${subject ? `Subject: ${subject}` : ''}
          Topic: ${topic || subjectId}
          Question Count: ${count === 'random' ? 'A random number of questions between 3 and 7' : count}
          Question Type: ${type} (very-short is 2 marks, short is 5 marks, long is 10 marks, very-long is 20 marks, mixed is a combination of these)
          Difficulty: ${difficulty}
          Exam Mode Context: ${examMode}
          ${syllabusFileName ? `Based on the uploaded syllabus file: ${syllabusFileName}` : ''}

          Return a JSON object containing a "questions" key with an array of questions matching this schema:
          {
            "questions": [{
              "id": "q_" + unique index,
              "text": "The subjective question text",
              "marks": 2, 5, 10 or 20 depending on the type,
              "type": "very-short" | "short" | "long" | "very-long",
              "expectedKeywords": ["keyword1", "keyword2", "keyword3"],
              "expectedAnswer": "A comprehensive guideline answer containing the keywords that an examiner expects",
              "topperAnswer": "A high-scoring, perfectly structured academic answer that would fetch full marks"
            }]
          }
        `;

        const response = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              response_format: { type: 'json_object' }
            })
          }
        );

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Groq API returned an error');
        }

        const textResponse = data.choices?.[0]?.message?.content;
        if (textResponse) {
          const parsed = JSON.parse(textResponse);
          if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
          if (Array.isArray(parsed)) return parsed;
        }
        throw new Error('Groq API did not return a valid list of questions');
      } catch (error) {
        console.error('Failed to generate using Groq API, falling back to simulator', error);
      }
    }

    // FALLBACK SIMULATOR (No API Key or error occurred)
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI delay
    
    // Resolve random question count
    const actualCount = count === 'random' ? Math.floor(Math.random() * 5) + 3 : count;

    // Pick questions from mock database based on subject if known, else generate dynamically
    let selected: Question[] = [];
    const cleanTopic = (topic || subject || '').trim();
    const cleanTopicLower = cleanTopic.toLowerCase();

    if (cleanTopicLower.includes('operating system') || cleanTopicLower.includes('deadlock') || cleanTopicLower.includes('thrashing') || cleanTopicLower === 'os') {
      selected = [...QUESTIONS_DB['os']];
    } else if (cleanTopicLower.includes('algorithm') || cleanTopicLower.includes('bfs') || cleanTopicLower.includes('dfs') || cleanTopicLower === 'dsa') {
      selected = [...QUESTIONS_DB['dsa']];
    } else if (cleanTopicLower.includes('artificial') || cleanTopicLower.includes('intelligence') || cleanTopicLower.includes('turing') || cleanTopicLower === 'ai') {
      selected = [...QUESTIONS_DB['ai']];
    }

    if (selected.length === 0) {
      // DYNAMIC SIMULATOR GENERATION for custom topics!
      const words = cleanTopic.split(' ').filter(w => w.length > 2);
      const primaryWord = words[0] || 'concept';
      const secondaryWord = words[1] || 'framework';
      
      for (let i = 0; i < actualCount; i++) {
        let qType: 'very-short' | 'short' | 'long' | 'very-long' = 'short';
        
        if (type === 'mixed') {
          const typeChoices: ('very-short' | 'short' | 'long' | 'very-long')[] = ['very-short', 'short', 'long', 'very-long'];
          qType = typeChoices[i % typeChoices.length];
        } else {
          qType = type;
        }

        let qMarks = 5;
        if (qType === 'very-short') qMarks = 2;
        else if (qType === 'short') qMarks = 5;
        else if (qType === 'long') qMarks = 10;
        else if (qType === 'very-long') qMarks = 20;

        let text = '';
        const expectedKeywords: string[] = [primaryWord.toLowerCase(), 'optimization', 'process', 'efficiency'];
        if (secondaryWord) expectedKeywords.push(secondaryWord.toLowerCase());

        if (qType === 'very-short') {
          text = `Define the core definition of ${cleanTopic}. What is its primary objective?`;
          expectedKeywords.push('definition', 'objective');
        } else if (qType === 'short') {
          text = `Explain the architectural design and working mechanism of ${cleanTopic}. Provide a brief example.`;
          expectedKeywords.push('working', 'implementation', 'example');
        } else if (qType === 'long') {
          text = `Detailed analysis of ${cleanTopic}: Discuss the underlying principles, key challenges, and optimization strategies to achieve maximum efficiency.`;
          expectedKeywords.push('principles', 'analysis', 'challenges', 'strategies');
        } else {
          text = `Exhaustive analysis and mathematical/logical formulations of ${cleanTopic}: Discuss the architectural framework, trade-offs, security implications, and design patterns, providing a complete end-to-end case study.`;
          expectedKeywords.push('architectural framework', 'trade-offs', 'security', 'patterns', 'case study');
        }

        selected.push({
          id: `q_dynamic_${i}_${Date.now()}`,
          text,
          marks: qMarks,
          type: qType,
          expectedKeywords,
          expectedAnswer: `The expected answer for ${cleanTopic} requires a clear explanation of its core properties. One must cover how it initializes, the algorithmic complexity associated with it, and its main role in the architecture. For instance, in real-world scenarios, it acts as a primary controller to resolve conflicts and manage system resources efficiently.`,
          topperAnswer: `${cleanTopic} represents a fundamental paradigm in modern computing. \n\n1. **Theoretical Foundation**: It addresses resource allocation or processing pathways through a structured approach, ensuring that operations avoid bottlenecks and run within optimal space/time constraints.\n2. **Implementation Protocols**: System designers implement it using specialized algorithms that monitor state changes and dynamically adjust parameters.\n3. **Optimizations**: To achieve topper-grade efficiency, one must integrate caching mechanisms, prevent redundant calculations, and utilize formal design patterns.\n\nFor example, in high-throughput enterprise databases or networking stacks, this approach reduces processing overhead by up to 40%.`
        });
      }
    }

    // Map them or slice them based on requested count
    let resultQuestions = [...selected];
    
    // If we need more than available, duplicate with new ids
    while (resultQuestions.length < actualCount) {
      resultQuestions = [...resultQuestions, ...selected.map((q, idx) => ({
        ...q,
        id: `${q.id}_dup_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        text: q.text.replace('?', ` (Part ${Math.floor(resultQuestions.length / selected.length) + 1})?`)
      }))];
    }
    
    // Slice and adjust marks
    return resultQuestions.slice(0, actualCount).map((q, i) => {
      let qType = q.type;
      let qMarks = q.marks;
      
      if (type !== 'mixed') {
        qType = type;
      } else {
        const typeChoices: ('very-short' | 'short' | 'long' | 'very-long')[] = ['very-short', 'short', 'long', 'very-long'];
        qType = typeChoices[i % typeChoices.length];
      }

      if (qType === 'very-short') qMarks = 2;
      else if (qType === 'short') qMarks = 5;
      else if (qType === 'long') qMarks = 10;
      else if (qType === 'very-long') qMarks = 20;
      
      return {
        ...q,
        type: qType,
        marks: qMarks
      };
    });
  },

  // 2. Evaluate subjective answers
  evaluateAnswers: async (
    questions: Question[],
    answers: Record<string, string>
  ): Promise<QuestionEvaluation[]> => {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const submissionPayload = questions.map(q => ({
          questionId: q.id,
          questionText: q.text,
          maxMarks: q.marks,
          expectedKeywords: q.expectedKeywords,
          expectedAnswer: q.expectedAnswer,
          topperAnswer: q.topperAnswer,
          studentAnswer: answers[q.id] || ''
        }));

        const prompt = `
          You are an AI Examiner. Evaluate the student answers for the following exam questions.
          Here is the list of questions and the student's submitted answers:
          ${JSON.stringify(submissionPayload, null, 2)}

          Evaluation criteria: Concept Accuracy, Keywords presence, Explanation Quality, Structure, Examples, and Completeness.
          For very-short (2 marks), grade out of 2.
          For short (5 marks), grade out of 5.
          For long (10 marks), grade out of 10.

          Return a JSON object containing an "evaluations" key with an array of evaluations matching this schema:
          {
            "evaluations": [{
              "questionId": "string matching the question's id",
              "score": number (marks awarded),
              "maxScore": number (max marks),
              "expectedAnswer": "the expected answer from the database",
              "topperAnswer": "the topper answer from the database",
              "missingPoints": ["missing concept/keyword 1", "missing concept/keyword 2"],
              "feedback": "constructive feedback and suggestions for improvement"
            }]
          }
        `;

        const response = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              response_format: { type: 'json_object' }
            })
          }
        );

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Groq API returned an error');
        }

        const textResponse = data.choices?.[0]?.message?.content;
        if (textResponse) {
          const parsed = JSON.parse(textResponse);
          if (parsed && Array.isArray(parsed.evaluations)) return parsed.evaluations;
          if (Array.isArray(parsed)) return parsed;
        }
        throw new Error('Groq API did not return a valid list of evaluations');
      } catch (error) {
        console.error('Failed to evaluate using Groq API, falling back to simulator', error);
      }
    }

    // FALLBACK SIMULATOR EVALUATION (No API key / Offline mode)
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate grading delay

    return questions.map(q => {
      const studentAnswer = answers[q.id] || '';
      const cleanAnswer = studentAnswer.toLowerCase().trim();
      
      // Heuristic score calculation
      let score = 0;
      const missingPoints: string[] = [];
      
      if (cleanAnswer.length === 0) {
        score = 0;
        missingPoints.push('Question was left unanswered.');
      } else {
        // Keyword checking
        const matchedKeywords = q.expectedKeywords.filter(k => 
          cleanAnswer.includes(k.toLowerCase())
        );
        
        const keywordRatio = matchedKeywords.length / q.expectedKeywords.length;
        
        // Length check
        let lengthScore = 0.2;
        if (q.type === 'very-short' && cleanAnswer.split(' ').length >= 15) lengthScore = 0.4;
        if (q.type === 'short' && cleanAnswer.split(' ').length >= 50) lengthScore = 0.4;
        if (q.type === 'long' && cleanAnswer.split(' ').length >= 120) lengthScore = 0.4;
        
        // Structure check (presence of paragraphs or bullet points)
        const hasStructure = cleanAnswer.includes('\n') || cleanAnswer.includes('- ') || cleanAnswer.includes('1. ');
        const structureScore = hasStructure ? 0.2 : 0.0;
        
        // Calculate raw percentage
        // Keywords are 40%, details/length are 40%, structure is 20%
        const finalPercentage = (keywordRatio * 0.4) + lengthScore + structureScore;
        
        // Calculate marks
        score = Math.round(finalPercentage * q.marks * 10) / 10;
        
        // Round to nearest half mark
        score = Math.ceil(score * 2) / 2;
        
        // Caps
        if (score > q.marks) score = q.marks;
        
        // Find missing keywords
        q.expectedKeywords.forEach(k => {
          if (!cleanAnswer.includes(k.toLowerCase())) {
            missingPoints.push(`Missed core concept/keyword: "${k}"`);
          }
        });

        if (cleanAnswer.split(' ').length < (q.type === 'long' ? 100 : q.type === 'short' ? 40 : 10)) {
          missingPoints.push('Explanation needs more depth. Expand the answers with definitions.');
        }
        if (!hasStructure && q.type !== 'very-short') {
          missingPoints.push('Structure needs improvement. Use paragraphs or bullet points to present key ideas.');
        }
      }
      
      let feedback = '';
      if (score === q.marks) {
        feedback = 'Exceptional answer! Fully accurate, well-structured, and includes all necessary technical keywords.';
      } else if (score >= q.marks * 0.8) {
        feedback = 'Great response. You demonstrated a solid grasp of the concept. Incorporate minor missing keywords for full marks.';
      } else if (score >= q.marks * 0.5) {
        feedback = 'Satisfactory. You have the basic idea, but you need to elaborate on the definitions and use formal technical vocabulary.';
      } else {
        feedback = 'Weak attempt. You need to read up on this concept. Focus on definition structures and learn the expected keywords.';
      }

      return {
        questionId: q.id,
        score,
        maxScore: q.marks,
        expectedAnswer: q.expectedAnswer,
        topperAnswer: q.topperAnswer,
        missingPoints: missingPoints.slice(0, 3), // Max 3 suggestions
        feedback
      };
    });
  }
};
