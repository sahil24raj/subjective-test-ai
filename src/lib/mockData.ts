export interface Subject {
  id: string;
  name: string;
  code: string;
  progress: number;
  avgScore: number;
  weakTopics: string[];
  strongTopics: string[];
  revisionStatus: 'Not Started' | 'In Progress' | 'Completed';
  topics: string[];
}

export interface Question {
  id: string;
  text: string;
  marks: number;
  type: 'very-short' | 'short' | 'long' | 'very-long';
  expectedKeywords: string[];
  expectedAnswer: string;
  topperAnswer: string;
}

export interface Test {
  id: string;
  subjectId: string;
  title: string;
  mode: 'Unit Test' | 'Mid Semester' | 'End Semester' | 'Viva Practice';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: number;
  questions: Question[];
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: string;
  streak: number;
  testsCompleted: number;
  isCurrentUser?: boolean;
}

// 1. Supported Subjects
export const SUBJECTS: Subject[] = [
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    code: 'CS-401',
    progress: 75,
    avgScore: 82,
    weakTopics: ['Heuristic Search Algorithms', 'First-Order Logic'],
    strongTopics: ['Adversarial Search', 'Neural Network Basics', 'Expert Systems'],
    revisionStatus: 'In Progress',
    topics: ['Informed Search', 'Uninformed Search', 'Knowledge Representation', 'Reasoning Under Uncertainty', 'Introduction to NLP']
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    code: 'CS-402',
    progress: 60,
    avgScore: 78,
    weakTopics: ['Backpropagation derivation', 'Support Vector Machine Kernels'],
    strongTopics: ['Linear Regression', 'Decision Trees', 'K-Means Clustering'],
    revisionStatus: 'In Progress',
    topics: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Model Evaluation & Selection', 'Deep Learning Basics']
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    code: 'CS-201',
    progress: 90,
    avgScore: 88,
    weakTopics: ['Red-Black Trees', 'Dynamic Programming Optimization'],
    strongTopics: ['Graph Traversals (BFS/DFS)', 'Sorting & Searching', 'Linked Lists', 'Binary Trees'],
    revisionStatus: 'Completed',
    topics: ['Complexity Analysis', 'Linear Data Structures', 'Trees & Graphs', 'Greedy Algorithms', 'Dynamic Programming']
  },
  {
    id: 'os',
    name: 'Operating Systems',
    code: 'CS-301',
    progress: 82,
    avgScore: 85,
    weakTopics: ['Page Replacement Algorithms', 'Deadlock Detection Proofs'],
    strongTopics: ['CPU Scheduling Algorithms', 'Process Synchronization', 'Virtual Memory Concepts'],
    revisionStatus: 'Completed',
    topics: ['Process Management', 'Memory Management', 'Storage Management', 'Deadlocks & Concurrency', 'File Systems']
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    code: 'CS-302',
    progress: 70,
    avgScore: 80,
    weakTopics: ['Query Optimization', 'Multi-valued Dependencies (4NF)'],
    strongTopics: ['SQL Queries', 'Entity-Relationship Models', 'Normalization (1NF-3NF/BCNF)', 'Indexing'],
    revisionStatus: 'In Progress',
    topics: ['ER Diagram', 'Relational Model & Normalization', 'SQL/PL-SQL', 'Transactions & Concurrency', 'NoSQL Intro']
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    code: 'CS-303',
    progress: 55,
    avgScore: 74,
    weakTopics: ['Subnet Sub-masking Calculations', 'BGP Routing Protocols'],
    strongTopics: ['OSI Model Layers', 'TCP vs UDP Protocols', 'Flow Control Algorithms'],
    revisionStatus: 'Not Started',
    topics: ['Physical & Data Link Layers', 'Network Layer & Routing', 'Transport Layer (TCP/UDP)', 'Application Layer Protocols', 'Network Security']
  },
  {
    id: 'oop',
    name: 'Object Oriented Programming',
    code: 'CS-202',
    progress: 88,
    avgScore: 87,
    weakTopics: ['Multiple Inheritance (Diamond Problem)', 'Virtual Destructors'],
    strongTopics: ['Encapsulation', 'Polymorphism', 'Constructors/Destructors', 'Templates & Exception Handling'],
    revisionStatus: 'Completed',
    topics: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'File Handling & Streams', 'Design Patterns']
  },
  {
    id: 'maths',
    name: 'Discrete Mathematics',
    code: 'MA-201',
    progress: 45,
    avgScore: 71,
    weakTopics: ['Generating Functions', 'Recurrence Relations'],
    strongTopics: ['Set Theory', 'Propositional Logic', 'Graph Theory Basics'],
    revisionStatus: 'Not Started',
    topics: ['Mathematical Logic', 'Set Theory & Relations', 'Combinatorics', 'Graph Theory & Trees', 'Algebraic Structures']
  }
];

// 2. Pre-built Subjective Questions Database (for offline generator / demo)
export const QUESTIONS_DB: Record<string, Question[]> = {
  ai: [
    {
      id: 'ai_1',
      text: 'Explain the difference between Informed (Heuristic) Search and Uninformed Search algorithms with examples.',
      marks: 5,
      type: 'short',
      expectedKeywords: ['heuristic', 'informed', 'pathfinding', 'A*', 'BFS', 'uninformed', 'blind search', 'nodes', 'domain knowledge'],
      expectedAnswer: 'Uninformed Search (or blind search) has no information about the distance from the current state to the goal state. It operates purely based on node generation order. Examples: Breadth-First Search (BFS), Depth-First Search (DFS). Informed Search uses domain-specific knowledge (heuristics) to estimate how close a state is to the goal. Examples: A* Search, Greedy Best-First Search. Heuristics significantly reduce the search space and compute path planning more efficiently.',
      topperAnswer: 'Informed vs Uninformed search is characterized by the presence of a heuristic function h(n). Uninformed Search: Explores the state-space blindly in a systematic manner. It is complete but often suffers from exponential time complexity (O(b^d)). E.g., BFS (optimal for unit path costs) and DFS (memory efficient). Informed Search: Incorporates a heuristic evaluation function h(n), representing estimated cost from node n to the goal. A* search uses f(n) = g(n) + h(n), where g(n) is the path cost from start to n, and h(n) is admissible (never overestimates) and consistent. This guarantees finding the optimal path while exploring significantly fewer nodes than uninformed counterparts.'
    },
    {
      id: 'ai_2',
      text: 'Define Turing Test in Artificial Intelligence. What are its limitations?',
      marks: 2,
      type: 'very-short',
      expectedKeywords: ['Alan Turing', 'imitation game', 'intelligence', 'human-like', 'behavioral equivalence', 'Chinese Room'],
      expectedAnswer: 'Proposed by Alan Turing in 1950, the Turing Test evaluates a machine\'s ability to exhibit intelligent, human-like behavior. A human evaluator judges natural language conversations between a human and a machine. If the evaluator cannot reliably tell the machine from the human, the machine passes. Limitations include: it measures imitation, not actual consciousness or reasoning; it is subjective; and it can be tricked by conversational deflection.',
      topperAnswer: 'The Turing Test (originally the "Imitation Game") is a test of a machine\'s ability to exhibit behavior indistinguishable from that of a human. If a human interrogator cannot identify which conversational participant is the machine after 5 minutes of text-based dialogue, the machine passes. Key limitations: 1. Focuses on simulation, not genuine cognition (John Searle\'s Chinese Room argument). 2. Anthropocentric bias—excludes super-intelligent systems that do not think like humans. 3. Susceptible to conversational trickery rather than task-oriented intelligence.'
    },
    {
      id: 'ai_3',
      text: 'Detailed explanation of Alpha-Beta Pruning. How does it improve the Minimax search algorithm? Illustrate with pruning conditions.',
      marks: 10,
      type: 'long',
      expectedKeywords: ['Alpha-Beta Pruning', 'Minimax', 'game tree', 'adversarial search', 'alpha', 'beta', 'cut-off', 'time complexity', 'best-first order'],
      expectedAnswer: 'Alpha-Beta pruning is an optimization technique for the minimax algorithm to decrease the number of nodes evaluated in its search tree. It maintains two values: Alpha (the maximum score the maximizing player is assured of) and Beta (the minimum score the minimizing player is assured of). If at any point Alpha >= Beta, the opponent would never allow this path, so we can prune (stop searching) the remaining branches of this node. In the best-case (perfect move ordering), the search complexity reduces from O(b^d) to O(b^(d/2)), allowing the AI to search twice as deep in the same timeframe.',
      topperAnswer: 'Alpha-Beta Pruning is an adversarial search algorithm optimization that discards branches in a game tree that cannot influence the final Minimax decision. Minimax evaluates all O(b^d) states. Alpha-Beta maintains: 1. α (Alpha): The best (highest) value found so far along the path for MAX. 2. β (Beta): The best (lowest) value found so far along the path for MIN. Pruning rule: For any node, if α >= β, search is aborted for that branch. Formally, if a Min node has a child with value v <= α, MAX will never select this Min node, creating an Alpha Cut-off. If a Max node has a child with value v >= β, MIN will never select this Max node, creating a Beta Cut-off. Under optimal move ordering (best moves searched first), the branching factor is effectively reduced to √b, allowing the algorithm to search to depth 2d instead of d, effectively doubling search efficiency.'
    }
  ],
  os: [
    {
      id: 'os_1',
      text: 'What is a Deadlock? List the four necessary conditions for a deadlock to occur in an operating system.',
      marks: 5,
      type: 'short',
      expectedKeywords: ['deadlock', 'mutual exclusion', 'hold and wait', 'no preemption', 'circular wait', 'resources', 'processes'],
      expectedAnswer: 'A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process in the set. The four necessary Coffman conditions are: 1. Mutual Exclusion (at least one resource must be held in non-sharable mode), 2. Hold and Wait (processes holding resources can request new ones), 3. No Preemption (resources cannot be forcibly taken from processes), 4. Circular Wait (a closed loop of processes exists where each waits for a resource held by the next). All four must hold simultaneously for a deadlock to occur.',
      topperAnswer: 'A deadlock occurs in multi-programmed systems when two or more processes are permanently blocked, unable to proceed because each holds a resource the other needs. The four necessary and sufficient conditions (Coffman Conditions) are: 1. Mutual Exclusion: At least one resource must be held in a non-shareable mode (only one process can use it at a time). 2. Hold and Wait: A process must hold at least one resource and be waiting to acquire additional resources that are currently being held by other processes. 3. No Preemption: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it, after that process has finished its task. 4. Circular Wait: A closed chain of processes must exist, P0, P1, ..., Pn, such that P0 is waiting for a resource held by P1, P1 is waiting for P2, and Pn is waiting for P0. To prevent deadlocks, operating systems must design protocols that ensure at least one of these conditions is violated.'
    },
    {
      id: 'os_2',
      text: 'What is Thrashing in virtual memory?',
      marks: 2,
      type: 'very-short',
      expectedKeywords: ['thrashing', 'page fault', 'paging', 'CPU utilization', 'degree of multiprogramming'],
      expectedAnswer: 'Thrashing is a state in which a computer\'s virtual memory system is spending more time swapping pages in and out of disk storage (paging) than executing actual process instructions. It happens when active processes do not have enough page frames assigned, leading to a high frequency of page faults and extremely low CPU utilization.',
      topperAnswer: 'Thrashing occurs when the system spends more time servicing page faults (swapping pages between main memory and secondary disk storage) than executing active processes. If the sum of the working sets of all active processes exceeds the available physical memory, the system experiences continuous page faults. As processes queue up for the paging device, CPU utilization drops dramatically, prompting the OS scheduler to mistakenly increase the degree of multiprogramming, which exacerbates the page-fault rate and halts useful computational progress.'
    }
  ],
  dsa: [
    {
      id: 'dsa_1',
      text: 'Compare Breadth-First Search (BFS) and Depth-First Search (DFS) in graphs in terms of time complexity, space complexity, and data structures used.',
      marks: 5,
      type: 'short',
      expectedKeywords: ['BFS', 'DFS', 'Queue', 'Stack', 'O(V+E)', 'FIFO', 'LIFO', 'recursion', 'shortest path'],
      expectedAnswer: 'BFS uses a FIFO Queue data structure to traverse a graph level-by-level, making it ideal for finding the shortest path in unweighted graphs. DFS uses a LIFO Stack (or recursion) to traverse as deep as possible before backtracking. Both have a time complexity of O(V + E) where V is vertices and E is edges. Space complexity for BFS is O(V) in the worst case (storing a level), while DFS space complexity is O(H) where H is the maximum depth of the search tree.',
      topperAnswer: 'BFS and DFS are fundamental graph traversal algorithms: 1. Data Structures: BFS uses a First-In-First-Out (FIFO) Queue for tracking frontier nodes, while DFS uses a Last-In-First-Out (LIFO) Stack (implicitly via call stack recursion or explicitly). 2. Complexities: Time Complexity for both is O(V + E) where V is vertices and E is edges, as every node and edge is visited. Space Complexity for BFS is O(V) due to the maximum width of the graph stored in the queue. DFS has a space complexity of O(d) where d is the maximum depth of the graph, representing the stack frame depth. 3. Applications: BFS is optimal for finding shortest paths in unweighted graphs (least number of edges) and level-order traversals. DFS is preferred for cycle detection, topological sorting, finding strongly connected components, and solving maze-like pathfinding problems.'
    }
  ]
};

// 3. Badges Collection
export const BADGES: Badge[] = [
  {
    id: 'first_test',
    name: 'First Mission',
    description: 'Generated and completed your first AI subject test.',
    icon: 'Shield',
    color: '#00f0ff' // Cyber blue
  },
  {
    id: 'streak_7',
    name: 'Week on Fire',
    description: 'Maintained a daily study streak for 7 consecutive days.',
    icon: 'Flame',
    color: '#ff0055' // Cyber pink
  },
  {
    id: 'score_90',
    name: 'Topper Protocols',
    description: 'Scored 90% or higher in any End Semester Mock test.',
    icon: 'Award',
    color: '#00ff66' // Cyber green
  },
  {
    id: 'subject_master',
    name: 'Core Processor',
    description: 'Completed revision and scored over 80% across 3 different subjects.',
    icon: 'Cpu',
    color: '#bd00ff' // Cyber purple
  },
  {
    id: 'exam_champion',
    name: 'Semester Slayer',
    description: 'Earned a total of 1,000 XP in preparation modules.',
    icon: 'Zap',
    color: '#00ffd5' // Cyber teal
  }
];

// 4. Leaderboard Data
export const MOCK_LEADERBOARDS: Record<'college' | 'department' | 'friend', LeaderboardEntry[]> = {
  college: [
    { rank: 1, name: 'Siddharth R. (You)', avatar: 'cyber_avatar_1', xp: 780, level: 'AI Apprentice', streak: 5, testsCompleted: 8, isCurrentUser: true },
    { rank: 2, name: 'Aarav Mehta', avatar: 'cyber_avatar_2', xp: 750, level: 'AI Apprentice', streak: 12, testsCompleted: 7 },
    { rank: 3, name: 'Neha Sharma', avatar: 'cyber_avatar_3', xp: 620, level: 'Knowledge Explorer', streak: 4, testsCompleted: 5 },
    { rank: 4, name: 'Vikram Aditya', avatar: 'cyber_avatar_4', xp: 590, level: 'Knowledge Explorer', streak: 8, testsCompleted: 6 },
    { rank: 5, name: 'Priya Iyer', avatar: 'cyber_avatar_5', xp: 510, level: 'Knowledge Explorer', streak: 0, testsCompleted: 4 },
    { rank: 6, name: 'Kabir Kapoor', avatar: 'cyber_avatar_6', xp: 480, level: 'Beginner Scholar', streak: 3, testsCompleted: 3 }
  ],
  department: [
    { rank: 1, name: 'Aarav Mehta', avatar: 'cyber_avatar_2', xp: 750, level: 'AI Apprentice', streak: 12, testsCompleted: 7 },
    { rank: 2, name: 'Siddharth R. (You)', avatar: 'cyber_avatar_1', xp: 780, level: 'AI Apprentice', streak: 5, testsCompleted: 8, isCurrentUser: true },
    { rank: 3, name: 'Neha Sharma', avatar: 'cyber_avatar_3', xp: 620, level: 'Knowledge Explorer', streak: 4, testsCompleted: 5 },
    { rank: 4, name: 'Priya Iyer', avatar: 'cyber_avatar_5', xp: 510, level: 'Knowledge Explorer', streak: 0, testsCompleted: 4 }
  ],
  friend: [
    { rank: 1, name: 'Siddharth R. (You)', avatar: 'cyber_avatar_1', xp: 780, level: 'AI Apprentice', streak: 5, testsCompleted: 8, isCurrentUser: true },
    { rank: 2, name: 'Neha Sharma', avatar: 'cyber_avatar_3', xp: 620, level: 'Knowledge Explorer', streak: 4, testsCompleted: 5 },
    { rank: 3, name: 'Rahul Sen', avatar: 'cyber_avatar_7', xp: 350, level: 'Beginner Scholar', streak: 2, testsCompleted: 2 }
  ]
};

// 5. XP and Levels calculation helpers
export const LEVEL_TIERS = [
  { name: 'Beginner Scholar', minXp: 0, maxXp: 199 },
  { name: 'Knowledge Explorer', minXp: 200, maxXp: 499 },
  { name: 'AI Apprentice', minXp: 500, maxXp: 999 },
  { name: 'Semester Warrior', minXp: 1000, maxXp: 1999 },
  { name: 'Elite Achiever', minXp: 2000, maxXp: 3999 },
  { name: 'Topper Legend', minXp: 4000, maxXp: 999999 }
];

export function getLevelFromXp(xp: number): { name: string; minXp: number; maxXp: number; progressPercent: number } {
  const tier = LEVEL_TIERS.find(t => xp >= t.minXp && xp <= t.maxXp) || LEVEL_TIERS[0];
  const range = tier.maxXp - tier.minXp;
  const currentLevelProgress = xp - tier.minXp;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / (range || 1)) * 100));
  
  return {
    name: tier.name,
    minXp: tier.minXp,
    maxXp: tier.maxXp,
    progressPercent
  };
}
