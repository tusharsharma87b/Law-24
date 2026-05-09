import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';

export const lawyersRouter = Router();

// GET /lawyers - Return mock lawyers data
lawyersRouter.get('/', (_req, res) => {
  const mockLawyers = [
    {
      id: '1',
      name: 'Adv. Rajesh Kumar',
      specialization: 'Criminal Law',
      rating: 4.8,
      city: 'New Delhi',
      availability: true,
    },
    {
      id: '2',
      name: 'Adv. Priya Sharma',
      specialization: 'Family Law',
      rating: 4.7,
      city: 'Mumbai',
      availability: true,
    },
    {
      id: '3',
      name: 'Adv. Vikram Nair',
      specialization: 'Employment Law',
      rating: 4.6,
      city: 'Bangalore',
      availability: true,
    },
  ];
  res.json(mockLawyers);
});

lawyersRouter.get('/match', requireAuth, (req, res) => {
  // Mock response for lawyer matching
  const mockLawyers = [
    {
      id: '1',
      name: 'Adv. Rajesh Kumar',
      specialization: 'Criminal Law',
      rating: 4.8,
      city: 'New Delhi',
      pricePerMin: 50,
      availability: true,
    },
    {
      id: '2',
      name: 'Adv. Priya Sharma',
      specialization: 'Family Law',
      rating: 4.7,
      city: 'Mumbai',
      pricePerMin: 45,
      availability: true,
    },
    {
      id: '3',
      name: 'Adv. Vikram Nair',
      specialization: 'Employment Law',
      rating: 4.6,
      city: 'Bangalore',
      pricePerMin: 55,
      availability: true,
    },
  ];
  
  // Filter based on query params (simplified)
  const caseType = String(req.query.caseType ?? '').toLowerCase();
  const state = String(req.query.state ?? '').toLowerCase();
  
  let filtered = mockLawyers;
  if (caseType) {
    filtered = filtered.filter(l => l.specialization.toLowerCase().includes(caseType));
  }
  if (state) {
    filtered = filtered.filter(l => l.city.toLowerCase().includes(state));
  }
  
  const bucket = [
    filtered[0],
    filtered[Math.floor(filtered.length / 2)],
    filtered[filtered.length - 1],
  ].filter(Boolean);
  
  res.json({
    budget: bucket[0] ?? null,
    mid: bucket[1] ?? bucket[0] ?? null,
    premium: bucket[2] ?? bucket[1] ?? bucket[0] ?? null,
  });
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
