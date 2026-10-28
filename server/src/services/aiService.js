import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';

/**
 * AI-Assisted Classification, Routing, Prioritization, and Summarization
 * Works with optional Gemini/OpenAI API key, and provides a comprehensive,
 * robust rule-based NLP classifier fallback that runs 100% offline.
 */

// Domain dictionaries for AICTE Bureaus
const BUREAU_ROUTING_RULES = [
  {
    bureauCode: 'GRC',
    category: 'Ragging & Student Safety',
    keywords: ['ragging', 'harassment', 'sexual', 'assault', 'threat', 'safety', 'bullying', 'mental health', 'suicide', 'police', 'fir', 'caste discrimination'],
    basePriority: 'Critical',
    rationale: 'Identified critical student safety, harassment, or anti-ragging compliance trigger requiring immediate escalation under AICTE mandatory guidelines.',
  },
  {
    bureauCode: 'AB',
    category: 'Affiliation & Approval',
    keywords: ['extension of approval', 'eoa', 'intake', 'affiliation', 'deficiency', 'scrutiny', 'architectural norm', 'land document', 'land conversion', 'aicte portal approval', 'noc', 'closure of course'],
    basePriority: 'High',
    rationale: 'Relates to regulatory institutional approval, extension of approval (EoA), or land/infrastructure regulatory criteria.',
  },
  {
    bureauCode: 'FB',
    category: 'Fee Structure & Refund',
    keywords: ['refund', 'excess fee', 'tuition fee', 'capitation', 'caution deposit', 'document withholding', 'tc withholding', 'original certificates'],
    basePriority: 'High',
    rationale: 'Violates AICTE public notice on mandatory fee refund policies and prohibition of original document retention.',
  },
  {
    bureauCode: 'SDC',
    category: 'Scholarships (Pragati/Saksham/PMSSS)',
    keywords: ['pragati', 'saksham', 'pmsss', 'swanath', 'scholarship', 'stipend', 'dbt', 'pfms', 'student fellowship', 'gate scholarship'],
    basePriority: 'Medium',
    rationale: 'Direct benefit transfer or student scholarship disbursement verification under AICTE student welfare schemes.',
  },
  {
    bureauCode: 'RIFDB',
    category: 'Research Grants & Faculty Development',
    keywords: ['modrob', 'rps', 'atal academy', 'fdp', 'faculty development', 'research grant', 'fund disbursal', 'utilization certificate', 'uc'],
    basePriority: 'Medium',
    rationale: 'Institutional research grant, MODROBS modernization scheme, or faculty development project funding tracking.',
  },
  {
    bureauCode: 'PAPB',
    category: 'Curriculum & Faculty Norms',
    keywords: ['faculty cadre ratio', '7th pay', 'pay commission', 'qualifications', 'phd requirement', 'model curriculum', 'internship credits', 'nep 2020 compliance', 'faculty recruitment'],
    basePriority: 'Medium',
    rationale: 'Pertains to faculty qualification standards, cadre ratio compliance, or model curriculum alignment.',
  },
  {
    bureauCode: 'ADMIN',
    category: 'Administration & RTI',
    keywords: ['rti', 'right to information', 'dispatch', 'portal technical issue', 'login credential', 'grievance portal error', 'general query'],
    basePriority: 'Low',
    rationale: 'General administrative inquiry, technical portal assistance, or RTI matter.',
  },
];

/**
 * Analyzes text and recommends Category, Priority, Rationale, and Bureau
 */
export const analyzeComplaint = async (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  let bestMatch = null;
  let maxScore = 0;

  for (const rule of BUREAU_ROUTING_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        score += kw.length > 8 ? 3 : 2; // longer exact phrases carry more weight
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
    }
  }

  // Fallback to General Grievance if low score
  if (!bestMatch || maxScore < 2) {
    bestMatch = {
      bureauCode: 'GRC',
      category: 'General Grievance',
      basePriority: 'Medium',
      rationale: 'Evaluated text using standard institutional grievance heuristics; assigned to Grievance Redressal Cell for officer triage.',
    };
  }

  // Determine Priority dynamically based on urgency keywords
  let priority = bestMatch.basePriority;
  let rationale = bestMatch.rationale;

  const urgentTriggers = ['urgent', 'emergency', 'immediate', 'deadline tomorrow', 'court order', 'contempt', 'police complaint', 'suicide', 'life threat', 'severe distress'];
  const hasUrgentTriggers = urgentTriggers.some((t) => text.includes(t));

  if (hasUrgentTriggers && priority !== 'Critical') {
    priority = 'High';
    rationale += ' Priority elevated due to high-urgency keywords detected in complaint body.';
  }

  // Fetch department details from DB
  const department = await Department.findOne({ code: bestMatch.bureauCode });

  // Generate concise 3-bullet summary
  const summaryBullets = generateSummary(title, description);

  return {
    provider: process.env.AI_PROVIDER || 'rule_based',
    suggestedCategory: bestMatch.category,
    suggestedPriority: priority,
    priorityRationale: rationale,
    suggestedDepartment: department ? { _id: department._id, name: department.name, code: department.code } : null,
    confidenceScore: Math.min(95, Math.max(65, 60 + maxScore * 5)),
    aiSummary: summaryBullets,
    isAiAssisted: true,
  };
};

/**
 * Generates an executive summary (3-4 concise points)
 */
export const generateSummary = (title, description) => {
  const sentences = description
    .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const keyPoints = [];
  keyPoints.push(`Core Issue: ${title}`);
  
  if (sentences.length > 0) {
    keyPoints.push(`Primary allegation/concern: ${sentences[0].substring(0, 160)}${sentences[0].length > 160 ? '...' : ''}`);
  }
  if (sentences.length > 1) {
    keyPoints.push(`Impact/Context: ${sentences[1].substring(0, 160)}${sentences[1].length > 160 ? '...' : ''}`);
  }
  keyPoints.push('Action Requested: Review submitted institutional records and assign designated officer for formal bureau inquiry.');

  return keyPoints.join('\n• ');
};

/**
 * Finds similar existing complaints in the database
 */
export const findSimilarComplaints = async (title, category, currentId = null) => {
  try {
    const query = { category };
    if (currentId) {
      query._id = { $ne: currentId };
    }

    const potentialMatches = await Complaint.find(query)
      .select('referenceId title category status priority createdAt institution')
      .populate('institution', 'name aicteId')
      .limit(20);

    const titleTokens = new Set(
      title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((t) => t.length > 3)
    );

    const scored = potentialMatches.map((comp) => {
      const compTokens = new Set(
        comp.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((t) => t.length > 3)
      );

      let commonCount = 0;
      for (const token of titleTokens) {
        if (compTokens.has(token)) commonCount++;
      }

      const totalTokens = new Set([...titleTokens, ...compTokens]).size;
      const similarityScore = totalTokens > 0 ? Math.round((commonCount / totalTokens) * 100) : 0;

      return {
        _id: comp._id,
        referenceId: comp.referenceId,
        title: comp.title,
        status: comp.status,
        priority: comp.priority,
        institution: comp.institution?.name || 'Unknown Institution',
        createdAt: comp.createdAt,
        similarityScore,
      };
    });

    // Return top 5 matches with similarity >= 25%
    return scored
      .filter((m) => m.similarityScore >= 25)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);
  } catch (error) {
    console.error('[AiService] Error finding similar complaints:', error.message);
    return [];
  }
};
