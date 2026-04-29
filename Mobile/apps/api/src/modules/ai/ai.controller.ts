import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';

export const aiRouter = Router();

aiRouter.post('/ai/analyze', async (req, res) => {
  const body = z.object({
    query: z.string().min(2),
    userId: z.string().min(1),
    language: z.enum(['en', 'hi']).default('en'),
  }).parse(req.body);

  const q = body.query.toLowerCase();
  const isSalary = q.includes('salary') || q.includes('employment') || q.includes('job') || q.includes('naukri') || q.includes('vetan') || q.includes('wages');
  const isDivorce = q.includes('divorce') || q.includes('maintenance') || q.includes('matrimonial') || q.includes('talaq') || q.includes('talaaq') || q.includes('shaadi');
  const isProperty = q.includes('property') || q.includes('rent') || q.includes('tenant') || q.includes('ghar') || q.includes('zameen');
  const isCriminal = q.includes('fir') || q.includes('bail') || q.includes('police') || q.includes('criminal') || q.includes('complaint') || q.includes('dhokha');
  const isLoan = q.includes('loan') || q.includes('emi') || q.includes('gaadi loan') || q.includes('car loan') || q.includes('bank');

  const caseTypes = isSalary
    ? ['Employment', 'Labour Dispute']
    : isDivorce
      ? ['Matrimonial', 'Family Law']
      : isLoan
        ? ['Banking', 'Loan Recovery / EMI Dispute']
      : isProperty
        ? ['Property', 'Civil Dispute']
        : isCriminal
          ? ['Criminal', 'Police Procedure']
          : ['General Civil', 'Legal Consultation'];

  const legalSections = isSalary
    ? ['Payment of Wages Act, 1936', 'Industrial Disputes Act, 1947']
    : isDivorce
      ? ['Section 125 CrPC', 'Hindu Marriage Act, 1955']
      : isLoan
        ? ['RBI Fair Practices Code', 'SARFAESI Act (where applicable)', 'Consumer Protection Act, 2019']
      : isProperty
        ? ['Transfer of Property Act, 1882', 'Specific Relief Act, 1963']
        : isCriminal
          ? ['CrPC', 'Bharatiya Nyaya Sanhita (BNS)']
          : ['Civil Procedure Code'];

  const solutionSteps = isSalary
    ? [
        'Collect salary slips, joining letter, attendance proof, and bank statements.',
        'Send a written demand notice to employer (email + physical copy).',
        'If unresolved, file complaint with Labour Commissioner in your district.',
        'Escalate to labour court/authority with all documents and timeline.',
      ]
    : isDivorce
      ? [
          'Gather marriage documents, ID proofs, and current address details.',
          'Decide legal path: mutual consent divorce or contested divorce.',
          'Prepare details on maintenance, child custody, and residence needs.',
          'File petition through family court with lawyer support.',
        ]
      : isLoan
        ? [
            'Collect loan agreement, sanction letter, EMI receipts, and bank communication.',
            'Check charges, penalties, and notices for RBI guideline violations.',
            'Send written dispute/representation to lender nodal officer.',
            'If unresolved, file complaint via RBI Ombudsman / consumer forum.',
          ]
        : isProperty
          ? [
              'Collect title deed, registry papers, tax receipts, and possession proof.',
              'Prepare chronology of dispute and parties involved.',
              'Send legal notice to opposite party before civil filing.',
              'File injunction / declaration / possession case as advised.',
            ]
          : isCriminal
            ? [
                'Write clear incident timeline with date/time/place and parties.',
                'Preserve chats, calls, screenshots, bills, and witness details.',
                'File complaint/FIR at police station or online portal.',
                'Track FIR status and seek bail/protection through lawyer if required.',
              ]
            : [
                'Write your issue clearly with timeline and supporting evidence.',
                'Identify all parties and required documents.',
                'Send legal notice where applicable.',
                'Proceed with case filing in the correct forum.',
              ];

  const relatedSearches = isSalary
    ? ['wrongful termination compensation', 'unpaid wages legal notice', 'labour court filing process']
    : isDivorce
      ? ['interim maintenance process', 'mutual consent divorce', 'child custody rights india']
      : isLoan
        ? ['loan emi harassment complaint', 'rbi ombudsman process', 'vehicle repossession legal rights']
      : isProperty
        ? ['property title verification', 'tenant eviction legal process', 'injunction in property dispute']
        : isCriminal
          ? ['how to file FIR online', 'anticipatory bail process', 'criminal complaint documentation']
          : ['legal notice format', 'civil suit filing process', 'document checklist for case'];

  const response = {
    featuredAnswer: `Based on your query, the likely legal direction is ${caseTypes[0]}. You can proceed with a structured legal action plan below and consult the recommended lawyers.`,
    caseTypes,
    explanation: 'This analysis is generated from your query to help you identify case category, practical steps, legal provisions, and the right lawyer match.',
    solutionSteps,
    legalSections,
    recommendedLawyers: [
      { id: 'LAW-001', name: 'Adv. Anjali Kapoor', specialization: 'Property Law', rating: 4.9, city: 'Bengaluru' },
      { id: 'LAW-002', name: 'Adv. Rahul Mehta', specialization: 'Criminal Law', rating: 4.8, city: 'New Delhi' },
      { id: 'LAW-003', name: 'Adv. Priya Sharma', specialization: 'Family Law', rating: 4.7, city: 'Mumbai' },
    ],
    relatedSearches,
  };

  res.json(response);
});

aiRouter.post('/ai/query', requireAuth, async (req: AuthRequest, res) => {
  const body = z.object({ query: z.string().min(5) }).parse(req.body);
  const userId = req.user!.id;
  const dayKey = new Date().toISOString().slice(0, 10);

  const credits = await prisma.credit.upsert({
    where: { userId },
    create: { userId, dailyFreeLimit: 15, remainingToday: 15, purchasedCredits: 0, dayKey },
    update: {},
  });

  if (credits.dayKey !== dayKey) {
    await prisma.credit.update({
      where: { userId },
      data: { dayKey, remainingToday: credits.dailyFreeLimit },
    });
  }

  const current = await prisma.credit.findUnique({ where: { userId } });
  if (!current) throw new Error('Credits unavailable');

  if (current.remainingToday <= 0 && current.purchasedCredits <= 0) {
    res.status(402).json({ message: 'Credits exhausted' });
    return;
  }

  await prisma.credit.update({
    where: { userId },
    data:
      current.remainingToday > 0
        ? { remainingToday: { decrement: 1 } }
        : { purchasedCredits: { decrement: 1 } },
  });

  const mapping = body.query.toLowerCase().includes('salary')
    ? { caseType: 'Employment', laws: ['Payment of Wages Act, 1936', 'Industrial Disputes Act, 1947'] }
    : body.query.toLowerCase().includes('divorce')
      ? { caseType: 'Matrimonial', laws: ['Section 125 CrPC', 'Hindu Marriage Act'] }
      : { caseType: 'General Civil', laws: ['Civil Procedure Code'] };

  await prisma.transaction.create({
    data: {
      userId,
      type: 'DEBIT',
      amount: new Prisma.Decimal(1),
      source: 'NYAYA_CREDITS',
      status: 'SUCCESS',
      metadata: { query: body.query },
    },
  });

  res.json({
    caseType: mapping.caseType,
    explanation: 'Based on your query, this is the likely legal category and immediate guidance path.',
    steps: ['Collect supporting evidence', 'Generate notice draft', 'Consult matched lawyer'],
    laws: mapping.laws,
    suggestedLawyerTier: ['budget', 'mid', 'premium'],
  });
});
