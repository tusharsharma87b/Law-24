import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { prisma } from '../../lib/prisma.js';

export const lawyersRouter = Router();

// GET /lawyers - Return real lawyers from database
lawyersRouter.get('/', async (_req, res) => {
  try {
    const lawyers = await prisma.lawyer.findMany({
      orderBy: { rating: 'desc' },
      take: 50, // Limit for performance
    });
    
    // Transform to match frontend expected format
    const transformedLawyers = lawyers.map((lawyer, idx) => {
      // Generate initials from name
      const initials = lawyer.name
        .split(' ')
        .map(part => part[0] || '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
      
      // Default values for missing fields
      const reviewCount = Math.floor(Math.random() * 100) + 10; // Simulate review count
      const barCouncilId = `BAR/${lawyer.state?.substring(0, 3).toUpperCase() || 'ALL'}/${2000 + lawyer.experience}/${1000 + idx}`;
      const bio = `${lawyer.name} is a specialized ${lawyer.specialization} lawyer with ${lawyer.experience} years of experience. Based in ${lawyer.city || lawyer.state || 'India'}.`;
      const responseTimeMinutes = Math.floor(Math.random() * 5) + 1; // 1-5 minutes
      const court = lawyer.city ? `${lawyer.city} District Court` : 'District Court';
      const since = 2000 + lawyer.experience;
      
      return {
        id: lawyer.id,
        name: lawyer.name,
        specialization: lawyer.specialization,
        rating: Number(lawyer.rating),
        city: lawyer.city || '',
        availability: lawyer.availability,
        pricePerMin: lawyer.pricePerMin ? Number(lawyer.pricePerMin) : undefined,
        experienceYears: lawyer.experience,
        languages: lawyer.languages,
        state: lawyer.state || '',
        // Additional fields for frontend compatibility
        barCouncilId,
        reviewCount,
        bio,
        responseTimeMinutes,
        court,
        since,
        initials,
      };
    });
    
    res.json(transformedLawyers);
  } catch (error) {
    console.error('Failed to fetch lawyers:', error);
    res.status(500).json({ error: 'Failed to fetch lawyers' });
  }
});

lawyersRouter.get('/match', requireAuth, async (req, res) => {
  try {
    const caseType = String(req.query.caseType ?? '').toLowerCase();
    const state = String(req.query.state ?? '').toLowerCase();
    
    // Build filter conditions
    const where: any = {};
    
    if (caseType) {
      where.specialization = {
        contains: caseType,
        mode: 'insensitive' as any,
      };
    }
    
    if (state) {
      where.OR = [
        { city: { contains: state, mode: 'insensitive' as any } },
        { state: { contains: state, mode: 'insensitive' as any } },
      ];
    }
    
    const lawyers = await prisma.lawyer.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: 20,
    });
    
    // Transform to match frontend expected format
    const transformedLawyers = lawyers.map((lawyer, idx) => {
      // Generate initials from name
      const initials = lawyer.name
        .split(' ')
        .map(part => part[0] || '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
      
      // Default values for missing fields
      const reviewCount = Math.floor(Math.random() * 100) + 10; // Simulate review count
      const barCouncilId = `BAR/${lawyer.state?.substring(0, 3).toUpperCase() || 'ALL'}/${2000 + lawyer.experience}/${1000 + idx}`;
      const bio = `${lawyer.name} is a specialized ${lawyer.specialization} lawyer with ${lawyer.experience} years of experience. Based in ${lawyer.city || lawyer.state || 'India'}.`;
      const responseTimeMinutes = Math.floor(Math.random() * 5) + 1; // 1-5 minutes
      const court = lawyer.city ? `${lawyer.city} District Court` : 'District Court';
      const since = 2000 + lawyer.experience;
      
      return {
        id: lawyer.id,
        name: lawyer.name,
        specialization: lawyer.specialization,
        rating: Number(lawyer.rating),
        city: lawyer.city || '',
        availability: lawyer.availability,
        pricePerMin: lawyer.pricePerMin ? Number(lawyer.pricePerMin) : undefined,
        experienceYears: lawyer.experience,
        languages: lawyer.languages,
        state: lawyer.state || '',
        // Additional fields for frontend compatibility
        barCouncilId,
        reviewCount,
        bio,
        responseTimeMinutes,
        court,
        since,
        initials,
      };
    });
    
    // Create budget, mid, premium buckets
    const bucket = [
      transformedLawyers[0],
      transformedLawyers[Math.floor(transformedLawyers.length / 2)],
      transformedLawyers[transformedLawyers.length - 1],
    ].filter(Boolean);
    
    res.json({
      budget: bucket[0] ?? null,
      mid: bucket[1] ?? bucket[0] ?? null,
      premium: bucket[2] ?? bucket[1] ?? bucket[0] ?? null,
    });
  } catch (error) {
    console.error('Failed to match lawyers:', error);
    res.status(500).json({ error: 'Failed to match lawyers' });
  }
});

// POST /call-request - Create a call session with a lawyer
lawyersRouter.post('/call-request', (req, res) => {
  const { lawyerId, userId } = req.body;
  
  // Simple validation
  if (!lawyerId || !userId) {
    return res.status(400).json({
      error: 'Missing lawyerId or userId',
    });
  }
  
  // Mock session creation
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const mockSession = {
    sessionId,
    lawyerId,
    userId,
    status: 'pending',
    scheduledAt: new Date().toISOString(),
    estimatedWaitTime: '5 minutes',
    callDetails: {
      type: 'audio',
      maxDuration: 30,
      costPerMinute: 50,
    },
  };
  
  res.json({
    success: true,
    message: 'Call session created successfully',
    session: mockSession,
  });
});

// POST /review - Submit a review
lawyersRouter.post('/review', (req, res) => {
  const { rating, comment } = req.body;
  
  // Simple validation
  if (rating === undefined || rating < 1 || rating > 5) {
    return res.status(400).json({
      error: 'Rating must be between 1 and 5',
    });
  }
  
  // Mock save response
  const reviewId = `rev_${Date.now()}`;
  const mockResponse = {
    reviewId,
    rating,
    comment: comment || '',
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    message: 'Thank you for your review!',
  };
  
  res.json({
    success: true,
    review: mockResponse,
  });
});
