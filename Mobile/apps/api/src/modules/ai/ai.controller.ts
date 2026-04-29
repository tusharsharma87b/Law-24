import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';

export const aiRouter = Router();

aiRouter.post('/ai/search', async (req, res) => {
  const body = z.object({ query: z.string().min(2) }).parse(req.body);
  const q = body.query.toLowerCase();

  const isSalary = q.includes('salary') || q.includes('wage') || q.includes('employment');
  const isDivorce = q.includes('divorce') || q.includes('marriage') || q.includes('maintenance');
  const isPolice = q.includes('police') || q.includes('fir') || q.includes('criminal');

  if (isSalary) {
    res.json({
      summary: 'Legal summary based on query',
      explanation: 'Detailed explanation for labour law remedies including wage recovery options.',
      sections: ['Payment of Wages Act, 1936', 'Industrial Disputes Act, 1947'],
      suggestedCases: ['Labour wage recovery dispute'],
      lawyers: [
        { name: 'Adv. Vikram Nair', rating: 4.6, city: 'Bangalore', specialization: 'Employment Law' },
      ],
    });
    return;
  }

  if (isDivorce) {
    res.json({
      summary: 'Legal summary based on query',
      explanation: 'Detailed explanation for family law process, maintenance, and petition pathways.',
      sections: ['Hindu Marriage Act, 1955', 'Section 125 CrPC'],
      suggestedCases: ['Mutual consent divorce', 'Maintenance petition'],
      lawyers: [
        { name: 'Adv. Priya Sharma', rating: 4.7, city: 'Mumbai', specialization: 'Family Law' },
      ],
    });
    return;
  }

  if (isPolice) {
    res.json({
      summary: 'Legal summary based on query',
      explanation: 'Detailed explanation for criminal complaint and police procedure.',
      sections: ['BNS', 'BNSS'],
      suggestedCases: ['FIR filing support'],
      lawyers: [
        { name: 'Adv. Rahul Mehta', rating: 4.8, city: 'New Delhi', specialization: 'Criminal Law' },
      ],
    });
    return;
  }

  res.json({
    summary: 'Legal summary based on query',
    explanation: 'Detailed explanation...',
    sections: ['Act 1', 'Act 2'],
    suggestedCases: ['Case type 1'],
    lawyers: [],
  });
});

aiRouter.post('/ai/analyze', async (req, res) => {
  const body = z.object({
    query: z.string().min(2),
    userId: z.string().optional(),
    language: z.enum(['en', 'hi']).default('en'),
  }).parse(req.body);

  const q = body.query.toLowerCase();
  const demoMode = !body.userId;

  if (demoMode) {
    return res.json({
      featuredAnswer: 'If you have worked and wages are due...',
      caseTypes: ['Employment', 'Wages & bonus', 'Labour forum'],
      explanation: 'Indian law protects timely payment...',
      legalSections: [
        {
          title: 'Payment of Wages Act, 1936',
          description: 'Employers must pay wages on time...',
        },
        {
          title: 'Industrial Disputes Act, 1947',
          description: 'Covers termination and disputes...',
        },
      ],
      lawyers: [
        {
          name: 'Adv. Sunita Reddy',
          rating: 4.5,
          city: 'Hyderabad',
          specialization: 'Consumer Protection',
        },
        {
          name: 'Adv. Vikram Nair',
          rating: 4.6,
          city: 'Bangalore',
          specialization: 'Employment Law',
        },
      ],
      relatedSearches: [
        'Salary slip na mile to kya kare?',
        'PF nahi jama hua to kya kare?',
        'Notice period kitna hona chahiye?',
      ],
    });
  }

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
    ? [
        { title: 'Payment of Wages Act, 1936', description: 'Ensures timely payment of wages and allows claim for delayed salary.' },
        { title: 'Industrial Disputes Act, 1947', description: 'Provides dispute resolution path between employees and employers.' },
        { title: 'Shops & Establishment Act', description: 'State-level protection for employee rights in establishments.' },
      ]
    : isDivorce
      ? [
          { title: 'Hindu Marriage Act, 1955', description: 'Governs divorce, separation, and matrimonial remedies.' },
          { title: 'Section 125 CrPC', description: 'Provides maintenance rights for spouse and dependents.' },
          { title: 'Protection of Women from Domestic Violence Act, 2005', description: 'Civil remedies for protection and support.' },
        ]
      : isLoan
        ? [
            { title: 'Consumer Protection Act, 2019', description: 'Remedy against unfair banking and lender practices.' },
            { title: 'RBI Fair Practices Code', description: 'Guidelines for transparent and fair loan recovery conduct.' },
            { title: 'SARFAESI Act (where applicable)', description: 'Framework for secured asset recovery by banks.' },
          ]
      : isProperty
        ? [
            { title: 'Transfer of Property Act, 1882', description: 'Governs transfer, sale, lease, and property rights.' },
            { title: 'Specific Relief Act, 1963', description: 'Provides injunctions and specific performance remedies.' },
            { title: 'Registration Act, 1908', description: 'Covers registration and evidentiary value of property documents.' },
          ]
        : isCriminal
          ? [
              { title: 'Bharatiya Nyaya Sanhita (BNS)', description: 'Defines offences and criminal liability in India.' },
              { title: 'Bharatiya Nagarik Suraksha Sanhita (BNSS)', description: 'Procedure for investigation, arrest, and trial.' },
              { title: 'Bharatiya Sakshya Adhiniyam', description: 'Rules regarding admissibility and proof of evidence.' },
            ]
          : [
              { title: 'Civil Procedure Code', description: 'Procedure for civil dispute filing and trial.' },
              { title: 'Limitation Act, 1963', description: 'Defines legal time limits for filing claims.' },
              { title: 'Indian Evidence principles', description: 'Guides documentary and oral proof in disputes.' },
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
    legalSections,
    lawyers: [
      { name: 'Adv. Anjali Kapoor', specialization: 'Property Law', rating: 4.9, city: 'Bengaluru' },
      { name: 'Adv. Rahul Mehta', specialization: 'Criminal Law', rating: 4.8, city: 'New Delhi' },
      { name: 'Adv. Priya Sharma', specialization: 'Family Law', rating: 4.7, city: 'Mumbai' },
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
