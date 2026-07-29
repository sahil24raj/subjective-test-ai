// BACKUP / SAVED CODE: Syllabus Scanner Feature (Saved on request, to be restored later if needed)
// --------------------------------------------------------------------------------------------------

/*
1. In `src/lib/ai.ts`:

export interface ScannedSyllabus {
  collegeName?: string;
  course?: string;
  subject?: string;
  topics?: { name: string; importance: number }[];
}

function smartSimulatedScan(filename: string): ScannedSyllabus {
  const cleanName = filename.toLowerCase();
  
  if (cleanName.includes('os') || cleanName.includes('operating')) {
    return {
      collegeName: 'University of Technology',
      course: 'B.Tech CSE',
      subject: 'Operating Systems',
      topics: [
        { name: 'Process Synchronization & Semaphores', importance: 9 },
        { name: 'Deadlock Detection and Prevention', importance: 8 },
        { name: 'CPU Scheduling Algorithms (FCFS, SJF, RR)', importance: 8 },
        { name: 'Virtual Memory & Page Replacement', importance: 7 },
        { name: 'File Systems & Storage Structure', importance: 6 }
      ]
    };
  }
  
  return {
    collegeName: 'Autonomous Institute of Technology',
    course: 'Bachelor of Computer Applications',
    subject: 'Computer Networks & Systems',
    topics: [
      { name: 'TCP/IP Model & OSI Layers', importance: 9 },
      { name: 'IP Addressing & Subnetting', importance: 9 },
      { name: 'Routing Protocols (RIP, OSPF, BGP)', importance: 8 },
      { name: 'Network Security & Firewalls', importance: 7 },
      { name: 'Application Layer Protocols (HTTP, DNS)', importance: 6 }
    ]
  };
}

// Inside AIHelper object:
  // 1. Scan Syllabus File (PDF or Image)
  scanSyllabus: async (file: File): Promise<ScannedSyllabus> => {
    try {
      const isImage = file.type.startsWith('image/');
      const base64Data = await fileToBase64(file);

      const prompt = `You are a professional university syllabus scanner. Analyze the provided syllabus file and extract structural information.
Return ONLY a valid JSON object matching this structure:
{
  "collegeName": "Extracted college/university name or estimated",
  "course": "Extracted course/degree name (e.g. B.Tech Computer Science)",
  "subject": "Extracted main subject name",
  "topics": [
    { "name": "Chapter or core topic name", "importance": 8 }
  ]
}
Analyze the document carefully. Extract up to 6 major topics/chapters and rate their importance for exams from 1 to 10.`;

      let parts: any[] = [];
      if (isImage) {
        parts = [
          { inlineData: { data: base64Data.split(',')[1], mimeType: file.type } },
          { text: prompt }
        ];
      } else {
        parts = [
          { inlineData: { data: base64Data.split(',')[1], mimeType: 'application/pdf' } },
          { text: prompt }
        ];
      }

      const responseText = await callGeminiWithFallback(parts, { jsonOutput: true });
      const parsed = JSON.parse(responseText);
      return parsed;
    } catch (error) {
      console.error('Failed to perform AI syllabus scan, using simulated fallback:', error);
      return smartSimulatedScan(file.name);
    }
  },

2. In `src/app/generator/page.tsx`:

- Tab option and UI for 'scan'
- Upload input section with `id="syllabus-file"`
- `handleFileScan` function
- `scannedTopics` selection grid
*/
