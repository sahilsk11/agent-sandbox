export interface LeetCodeProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  testCases: Array<{
    input: string;
    expected: string;
  }>;
  starterCode: string;
}

export interface SystemDesignChallenge {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  components: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  rubric: Array<{
    category: string;
    items: string[];
  }>;
}

export interface RefactoringExercise {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  originalCode: string;
  refactoredCode: string;
  hints: string[];
  principles: string[];
}

export interface BehavioralQuestion {
  id: string;
  question: string;
  category: string;
  starPrompt: string;
  rubric: Array<{
    level: string;
    description: string;
    score: number;
  }>;
}

export const leetCodeProblems: LeetCodeProblem[] = [
  {
    id: 'lc-001',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    testCases: [
      { input: '[2,7,11,15], 9', expected: '[0,1]' },
      { input: '[3,2,4], 6', expected: '[1,2]' },
      { input: '[3,3], 6', expected: '[0,1]' }
    ],
    starterCode: `function twoSum(nums: number[], target: number): number[] {
  // Your code here

}`
  },
  {
    id: 'lc-002',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    testCases: [
      { input: '"()"', expected: 'true' },
      { input: '"()[]{}"', expected: 'true' },
      { input: '"(]"', expected: 'false' }
    ],
    starterCode: `function isValid(s: string): boolean {
  // Your code here

}`
  },
  {
    id: 'lc-003',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.',
    examples: [
      {
        input: 'list1 = [1,2,4], list2 = [1,3,4]',
        output: '[1,1,2,3,4,4]'
      },
      {
        input: 'list1 = [], list2 = []',
        output: '[]'
      }
    ],
    constraints: [
      'The number of nodes in both lists is in the range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.'
    ],
    testCases: [
      { input: '[1,2,4], [1,3,4]', expected: '[1,1,2,3,4,4]' },
      { input: '[], []', expected: '[]' }
    ],
    starterCode: `function mergeTwoLists(list1: number[] | null, list2: number[] | null): number[] | null {
  // Your code here

}`
  }
];

export const systemDesignChallenges: SystemDesignChallenge[] = [
  {
    id: 'sd-001',
    title: 'Design a URL Shortener',
    description: 'Design a service that takes long URLs and Shortens them to short URLs (like bit.ly). Users should be able to input a long URL and get a shorter unique URL.',
    requirements: [
      'Handle millions of URLs',
      'Track click analytics',
      'High availability',
      'Handle concurrent requests'
    ],
    components: [
      { id: 'db', name: 'Database', icon: 'database' },
      { id: 'cache', name: 'Cache', icon: 'zap' },
      { id: 'cdn', name: 'CDN', icon: 'cloud' },
      { id: 'lb', name: 'Load Balancer', icon: 'server' },
      { id: 'queue', name: 'Message Queue', icon: 'message-circle' }
    ],
    rubric: [
      {
        category: 'Architecture',
        items: [
          'Client-server architecture clearly defined',
          'API endpoints specified',
          'Data flow described'
        ]
      },
      {
        category: 'Scalability',
        items: [
          'Horizontal scaling approach',
          'Database sharding strategy',
          'Caching layer included'
        ]
      },
      {
        category: 'Reliability',
        items: [
          'Failure handling strategies',
          'Redundancy measures',
          'Consistency guarantees'
        ]
      }
    ]
  },
  {
    id: 'sd-002',
    title: 'Design a News Feed',
    description: 'Design a social media news feed system that shows relevant content to users based on their connections and interests.',
    requirements: [
      'Handle millions of users',
      'Real-time updates',
      'Personalization algorithm',
      'Infinite scroll pagination'
    ],
    components: [
      { id: 'db', name: 'Database', icon: 'database' },
      { id: 'cache', name: 'Cache', icon: 'zap' },
      { id: 'cdn', name: 'CDN', icon: 'cloud' },
      { id: 'algo', name: 'Recommendation Engine', icon: 'brain' },
      { id: 'queue', name: 'Message Queue', icon: 'message-circle' }
    ],
    rubric: [
      {
        category: 'Architecture',
        items: [
          'Feed generation approach',
          'Pull vs push model',
          'API design'
        ]
      },
      {
        category: 'Scalability',
        items: [
          'Fan-out strategy',
          'Load balancing',
          'Storage optimization'
        ]
      }
    ]
  }
];

export const refactoringExercises: RefactoringExercise[] = [
  {
    id: 'ref-001',
    title: 'Nested Callbacks to Async/Await',
    difficulty: 'Medium',
    description: 'Refactor the callback hell code below to use modern async/await syntax. Maintain the same functionality.',
    originalCode: `function fetchUserData(userId, callback) {
  getUser(userId, function(err, user) {
    if (err) {
      callback(err);
      return;
    }
    getUserPosts(user.id, function(err, posts) {
      if (err) {
        callback(err);
        return;
      }
      getUserComments(posts[0].id, function(err, comments) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, { user, posts, comments });
      });
    });
  });
}`,
    refactoredCode: `async function fetchUserData(userId) {
  const user = await getUser(userId);
  const posts = await getUserPosts(user.id);
  const comments = await getUserComments(posts[0].id);
  return { user, posts, comments };
}`,
    hints: [
      'Convert callback-based functions to return Promises',
      'Use try/catch for error handling',
      'Remove callback parameter from function signature'
    ],
    principles: ['Async/Await', 'Error Handling', 'Clean Code']
  },
  {
    id: 'ref-002',
    title: 'Extract Magic Numbers',
    difficulty: 'Easy',
    description: 'Replace magic numbers with descriptive constants to improve code readability.',
    originalCode: `function calculateShipping(order) {
  if (order.total > 100) {
    return 0;
  } else if (order.total > 50) {
    return 5;
  } else {
    return 10;
  }
}

function applyDiscount(item) {
  return item.price * 0.9;
}`,
    refactoredCode: `const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING_COST = 10;
const DISCOUNT_RATE = 0.9;

function calculateShipping(order) {
  if (order.total > FREE_SHIPPING_THRESHOLD) {
    return 0;
  } else if (order.total > 50) {
    return 5;
  } else {
    return STANDARD_SHIPPING_COST;
  }
}

function applyDiscount(item) {
  return item.price * DISCOUNT_RATE;
}`,
    hints: [
      'Create constants at the top of the file',
      'Use UPPER_SNAKE_CASE for constant names',
      'Group related constants'
    ],
    principles: ['Magic Numbers', 'Constants', 'Readability']
  },
  {
    id: 'ref-003',
    title: 'Apply DRY Principle',
    difficulty: 'Medium',
    description: 'Consolidate duplicate code patterns into reusable functions or classes.',
    originalCode: `class UserService {
  createUser(data) {
    if (!data.email) {
      return { error: 'Email required' };
    }
    if (!data.name) {
      return { error: 'Name required' };
    }
    // create user...
  }

  updateUser(id, data) {
    if (!data.email) {
      return { error: 'Email required' };
    }
    if (!data.name) {
      return { error: 'Name required' };
    }
    // update user...
  }
}`,
    refactoredCode: `function validateUserData(data) {
  if (!data.email) {
    return { error: 'Email required' };
  }
  if (!data.name) {
    return { error: 'Name required' };
  }
  return null;
}

class UserService {
  createUser(data) {
    const validation = validateUserData(data);
    if (validation) return validation;
    // create user...
  }

  updateUser(id, data) {
    const validation = validateUserData(data);
    if (validation) return validation;
    // update user...
  }
}`,
    hints: [
      'Extract validation to separate function',
      'Return early on validation errors',
      'Reuse validation logic'
    ],
    principles: ['DRY', 'Code Reuse', 'Single Responsibility']
  }
];

export const behavioralQuestions: BehavioralQuestion[] = [
  {
    id: 'bq-001',
    question: 'Tell me about a time you had a conflict with a teammate. How did you handle it?',
    category: 'Conflict Resolution',
    starPrompt: 'Describe the situation, your task, the actions you took, and the result.',
    rubric: [
      { level: 'Excellent', description: 'Showed empathy, actively listened, found common ground, positive outcome', score: 100 },
      { level: 'Good', description: 'Addressed conflict professionally, reached resolution', score: 80 },
      { level: 'Average', description: 'Handled conflict but outcome could be better', score: 60 },
      { level: 'Poor', description: 'Avoided conflict or behaved unprofessionally', score: 40 }
    ]
  },
  {
    id: 'bq-002',
    question: 'Describe a time when you had to learn something quickly under pressure.',
    category: 'Learning Agility',
    starPrompt: 'Use the STAR method: Situation, Task, Action, Result.',
    rubric: [
      { level: 'Excellent', description: 'Demonstrated rapid learning, applied knowledge effectively, delivered results', score: 100 },
      { level: 'Good', description: 'Learned quickly and completed the task', score: 80 },
      { level: 'Average', description: 'Learned but took longer than ideal', score: 60 },
      { level: 'Poor', description: 'Struggled to learn or didn\'t complete the task', score: 40 }
    ]
  },
  {
    id: 'bq-003',
    question: 'Tell me about a project you\'re most proud of. What challenges did you face?',
    category: 'Achievements',
    starPrompt: 'Describe the project scope, your role, obstacles overcome, and impact.',
    rubric: [
      { level: 'Excellent', description: 'Complex project, significant impact, clear achievements', score: 100 },
      { level: 'Good', description: 'Solid project with clear results', score: 80 },
      { level: 'Average', description: 'Project completed but impact unclear', score: 60 },
      { level: 'Poor', description: 'Simple project or no clear outcomes', score: 40 }
    ]
  },
  {
    id: 'bq-004',
    question: 'How do you handle receiving critical feedback on your work?',
    category: 'Feedback Handling',
    starPrompt: 'Give specific examples of how you\'ve responded to criticism constructively.',
    rubric: [
      { level: 'Excellent', description: 'Embraced feedback, made positive changes, showed growth mindset', score: 100 },
      { level: 'Good', description: 'Accepted feedback professionally and improved', score: 80 },
      { level: 'Average', description: 'Took feedback but struggled with implementation', score: 60 },
      { level: 'Poor', description: 'Defensive or dismissive of feedback', score: 40 }
    ]
  },
  {
    id: 'bq-005',
    question: 'Describe a time you had to make a difficult decision with incomplete information.',
    category: 'Decision Making',
    starPrompt: 'Explain your decision-making process and how you mitigated risks.',
    rubric: [
      { level: 'Excellent', description: 'Gathered available info, made calculated decision, had contingency plan', score: 100 },
      { level: 'Good', description: 'Made reasonable decision with available info', score: 80 },
      { level: 'Average', description: 'Decision was made but may not have been optimal', score: 60 },
      { level: 'Poor', description: 'Avoided decision or made poor choice', score: 40 }
    ]
  }
];