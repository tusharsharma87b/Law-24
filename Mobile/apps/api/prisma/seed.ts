import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const nowPlusDays = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
};

async function main() {
  // Deterministic IDs so your `/wallet/1`, `/cases/1`, and `/documents/:caseId` checks always work.
  const userId = '1';

  const lawyer1Id = 'd2c9a6b0-7f2c-4b5c-91c8-8d3e1dbb3a11';
  const lawyer2Id = 'a3d4b5c6-7e8f-4a1b-9c0d-2e3f4a5b6c77';

  const case1Id = '11111111-1111-1111-1111-111111111111';
  const case2Id = '22222222-2222-2222-2222-222222222222';
  const case3Id = '33333333-3333-3333-3333-333333333333';

  const doc1Id = '44444444-4444-4444-4444-444444444444';
  const doc2Id = '55555555-5555-5555-5555-555555555555';
  const doc3Id = '66666666-6666-6666-6666-666666666666';
  const doc4Id = '77777777-7777-7777-7777-777777777777';
  const doc5Id = '88888888-8888-8888-8888-888888888888';

  const folder1Id = '99999999-9999-9999-9999-999999999999';
  const folder2Id = '10101010-1010-1010-1010-101010101010';
  const folder3Id = '12121212-1212-1212-1212-121212121212';

  const case1Hearing = nowPlusDays(45);
  const case2Hearing = nowPlusDays(30);
  const case3Hearing = nowPlusDays(75);

  const case1Filed = nowPlusDays(-60);
  const case2Filed = nowPlusDays(-40);
  const case3Filed = nowPlusDays(-25);

  // 1) USER (id = "1")
  const conflictingUserWithPhone = await prisma.user.findUnique({
    where: { phone: '9999999999' },
    select: { id: true },
  });

  // Ensure phone uniqueness without breaking relations (wallet/cases reference userId, not phone).
  if (conflictingUserWithPhone && conflictingUserWithPhone.id !== userId) {
    await prisma.user.update({
      where: { id: conflictingUserWithPhone.id },
      data: { phone: null },
    });
  }

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      role: 'USER',
      name: 'Tushar Sharma',
      phone: '9999999999',
      email: 'tushar.sharma@law24.in',
    },
    create: {
      id: userId,
      role: 'USER',
      name: 'Tushar Sharma',
      phone: '9999999999',
      email: 'tushar.sharma@law24.in',
    },
  });

  // 2) WALLET
  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: { balance: 2950 },
    create: { userId: user.id, balance: 2950 },
  });

  // 3) CASES (3 realistic cases)
  const case1 = await prisma.case.upsert({
    where: { id: case1Id },
    update: {
      userId: user.id,
      category: 'matrimonial',
      type: 'MATRIMONIAL',
      title: 'Divorce Case',
      state: 'Delhi',
      city: 'New Delhi',
      filedDate: case1Filed,
      hearingDate: case1Hearing,
      status: 'HEARING',
      urgency: 'HIGH',
    },
    create: {
      id: case1Id,
      userId: user.id,
      category: 'matrimonial',
      type: 'MATRIMONIAL',
      title: 'Divorce Case',
      state: 'Delhi',
      city: 'New Delhi',
      filedDate: case1Filed,
      hearingDate: case1Hearing,
      status: 'HEARING',
      urgency: 'HIGH',
    },
  });

  const case2 = await prisma.case.upsert({
    where: { id: case2Id },
    update: {
      userId: user.id,
      category: 'criminal',
      type: 'CRIMINAL',
      title: 'Police Complaint',
      state: 'Maharashtra',
      city: 'Mumbai',
      filedDate: case2Filed,
      hearingDate: case2Hearing,
      status: 'FILING',
      urgency: 'MEDIUM',
    },
    create: {
      id: case2Id,
      userId: user.id,
      category: 'criminal',
      type: 'CRIMINAL',
      title: 'Police Complaint',
      state: 'Maharashtra',
      city: 'Mumbai',
      filedDate: case2Filed,
      hearingDate: case2Hearing,
      status: 'FILING',
      urgency: 'MEDIUM',
    },
  });

  const case3 = await prisma.case.upsert({
    where: { id: case3Id },
    update: {
      userId: user.id,
      category: 'property',
      type: 'PROPERTY',
      title: 'Property Dispute',
      state: 'Karnataka',
      city: 'Bangalore',
      filedDate: case3Filed,
      hearingDate: case3Hearing,
      status: 'JUDGEMENT',
      urgency: 'LOW',
    },
    create: {
      id: case3Id,
      userId: user.id,
      category: 'property',
      type: 'PROPERTY',
      title: 'Property Dispute',
      state: 'Karnataka',
      city: 'Bangalore',
      filedDate: case3Filed,
      hearingDate: case3Hearing,
      status: 'JUDGEMENT',
      urgency: 'LOW',
    },
  });

  // 4) LAWYERS (12 realistic lawyers)
  const lawyers = [
    {
      id: lawyer1Id,
      name: 'Adv. Anjali Kapoor',
      specialization: 'Property Law',
      experience: 9,
      rating: 4.9,
      pricePerMin: 25,
      languages: ['Hindi', 'English'],
      availability: false, // OFFLINE
      city: 'Bangalore',
      state: 'Karnataka',
    },
    {
      id: lawyer2Id,
      name: 'Adv. Arjun Reddy',
      specialization: 'Criminal Law',
      experience: 7,
      rating: 4.7,
      pricePerMin: 30,
      languages: ['English'],
      availability: true, // ONLINE
      city: 'Mumbai',
      state: 'Maharashtra',
    },
    {
      id: '3d4e5f6a-7b8c-4d1e-9f0a-1b2c3d4e5f6a',
      name: 'Adv. Priya Sharma',
      specialization: 'Family Law',
      experience: 11,
      rating: 4.8,
      pricePerMin: 35,
      languages: ['Hindi', 'English', 'Marathi'],
      availability: true,
      city: 'Pune',
      state: 'Maharashtra',
    },
    {
      id: '4e5f6a7b-8c9d-5e2f-0a1b-2c3d4e5f6a7b',
      name: 'Adv. Rajesh Kumar',
      specialization: 'Corporate Law',
      experience: 15,
      rating: 4.9,
      pricePerMin: 50,
      languages: ['English', 'Hindi', 'Tamil'],
      availability: true,
      city: 'Chennai',
      state: 'Tamil Nadu',
    },
    {
      id: '5f6a7b8c-9d0e-6f3a-1b2c-3d4e5f6a7b8c',
      name: 'Adv. Meera Singh',
      specialization: 'Employment Law',
      experience: 8,
      rating: 4.6,
      pricePerMin: 28,
      languages: ['Hindi', 'English', 'Bengali'],
      availability: true,
      city: 'Kolkata',
      state: 'West Bengal',
    },
    {
      id: '6a7b8c9d-0e1f-7a4b-2c3d-4e5f6a7b8c9d',
      name: 'Adv. Vikram Patel',
      specialization: 'Cyber Crime',
      experience: 6,
      rating: 4.5,
      pricePerMin: 40,
      languages: ['English', 'Gujarati', 'Hindi'],
      availability: true,
      city: 'Ahmedabad',
      state: 'Gujarat',
    },
    {
      id: '7b8c9d0e-1f2a-8b5c-3d4e-5f6a7b8c9d0e',
      name: 'Adv. Sanjay Verma',
      specialization: 'Divorce Law',
      experience: 12,
      rating: 4.7,
      pricePerMin: 32,
      languages: ['Hindi', 'English'],
      availability: false,
      city: 'Delhi',
      state: 'Delhi',
    },
    {
      id: '8c9d0e1f-2a3b-9c6d-4e5f-6a7b8c9d0e1f',
      name: 'Adv. Neha Gupta',
      specialization: 'Startup Law',
      experience: 5,
      rating: 4.4,
      pricePerMin: 45,
      languages: ['English', 'Hindi'],
      availability: true,
      city: 'Hyderabad',
      state: 'Telangana',
    },
    {
      id: '9d0e1f2a-3b4c-0d7e-5f6a-7b8c9d0e1f2a',
      name: 'Adv. Amit Desai',
      specialization: 'Tax Law',
      experience: 14,
      rating: 4.8,
      pricePerMin: 55,
      languages: ['English', 'Marathi', 'Hindi'],
      availability: true,
      city: 'Mumbai',
      state: 'Maharashtra',
    },
    {
      id: '0e1f2a3b-4c5d-1e8f-6a7b-8c9d0e1f2a3b',
      name: 'Adv. Kavita Reddy',
      specialization: 'Consumer Law',
      experience: 9,
      rating: 4.6,
      pricePerMin: 30,
      languages: ['Telugu', 'English', 'Hindi'],
      availability: false,
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
    },
    {
      id: '1f2a3b4c-5d6e-2f9a-7b8c-9d0e1f2a3b4c',
      name: 'Adv. Rohit Malhotra',
      specialization: 'Civil Law',
      experience: 10,
      rating: 4.7,
      pricePerMin: 35,
      languages: ['Hindi', 'English', 'Punjabi'],
      availability: true,
      city: 'Chandigarh',
      state: 'Punjab',
    },
    {
      id: '2a3b4c5d-6e7f-3a0b-8c9d-0e1f2a3b4c5d',
      name: 'Adv. Sonali Joshi',
      specialization: 'Intellectual Property',
      experience: 8,
      rating: 4.5,
      pricePerMin: 48,
      languages: ['English', 'Hindi', 'Marathi'],
      availability: true,
      city: 'Nagpur',
      state: 'Maharashtra',
    },
  ];

  for (const lawyer of lawyers) {
    await prisma.lawyer.upsert({
      where: { id: lawyer.id },
      update: lawyer,
      create: lawyer,
    });
  }

  // Folders (used by documents relation)
  await prisma.folder.upsert({
    where: { id: folder1Id },
    update: { caseId: case1.id, name: 'Evidence Files' },
    create: { id: folder1Id, caseId: case1.id, name: 'Evidence Files' },
  });
  await prisma.folder.upsert({
    where: { id: folder2Id },
    update: { caseId: case2.id, name: 'Court Submissions' },
    create: { id: folder2Id, caseId: case2.id, name: 'Court Submissions' },
  });
  await prisma.folder.upsert({
    where: { id: folder3Id },
    update: { caseId: case3.id, name: 'Case Documents' },
    create: { id: folder3Id, caseId: case3.id, name: 'Case Documents' },
  });

  // 5) DOCUMENTS (5 linked to cases, with tags + realistic metadata)
  const docs = [
    {
      id: doc1Id,
      caseId: case1.id,
      folderId: folder1Id,
      name: 'Divorce Petition.pdf',
      size: 512000,
      url: 'https://example.com/docs/divorce-petition.pdf',
      uploadedBy: 'USER' as const,
      type: 'document',
      tags: ['evidence', 'legal'],
      verificationStatus: 'pending',
      courtReady: false,
      status: 'PENDING' as const,
    },
    {
      id: doc2Id,
      caseId: case2.id,
      folderId: folder2Id,
      name: 'Police FIR.pdf',
      size: 388000,
      url: 'https://example.com/docs/police-fir.pdf',
      uploadedBy: 'USER' as const,
      type: 'document',
      tags: ['evidence', 'legal'],
      verificationStatus: 'verified',
      courtReady: true,
      status: 'VERIFIED' as const,
    },
    {
      id: doc3Id,
      caseId: case3.id,
      folderId: folder3Id,
      name: 'Property Agreement.pdf',
      size: 621000,
      url: 'https://example.com/docs/property-agreement.pdf',
      uploadedBy: 'USER' as const,
      type: 'document',
      tags: ['evidence', 'legal'],
      verificationStatus: 'pending',
      courtReady: false,
      status: 'PENDING' as const,
    },
    {
      id: doc4Id,
      caseId: case2.id,
      folderId: folder2Id,
      name: 'Medical Report.pdf',
      size: 275000,
      url: 'https://example.com/docs/medical-report.pdf',
      uploadedBy: 'LAWYER' as const,
      type: 'document',
      tags: ['evidence', 'legal'],
      verificationStatus: 'pending',
      courtReady: false,
      status: 'PENDING' as const,
    },
    {
      id: doc5Id,
      caseId: case1.id,
      folderId: folder1Id,
      name: 'Evidence Photos.zip',
      size: 930000,
      url: 'https://example.com/docs/evidence-photos.zip',
      uploadedBy: 'USER' as const,
      type: 'document',
      tags: ['evidence', 'legal'],
      verificationStatus: 'pending',
      courtReady: false,
      status: 'PENDING' as const,
    },
  ];

  for (const d of docs) {
    await prisma.document.upsert({
      where: { id: d.id },
      update: {
        caseId: d.caseId,
        folderId: d.folderId,
        name: d.name,
        size: d.size,
        url: d.url,
        uploadedBy: d.uploadedBy,
        type: d.type,
        tags: d.tags as any,
        verificationStatus: d.verificationStatus,
        courtReady: d.courtReady,
        status: d.status,
      },
      create: {
        id: d.id,
        caseId: d.caseId,
        folderId: d.folderId,
        name: d.name,
        size: d.size,
        url: d.url,
        uploadedBy: d.uploadedBy,
        type: d.type,
        tags: d.tags as any,
        verificationStatus: d.verificationStatus,
        courtReady: d.courtReady,
        status: d.status,
      },
    });
  }

  // Clean up any older seed artifacts so each case ends up with the exact
  // realistic document set you requested.
  await prisma.document.deleteMany({
    where: {
      caseId: case1.id,
      NOT: { id: { in: [doc1Id, doc5Id] } },
    },
  });
  await prisma.document.deleteMany({
    where: {
      caseId: case2.id,
      NOT: { id: { in: [doc2Id, doc4Id] } },
    },
  });
  await prisma.document.deleteMany({
    where: {
      caseId: case3.id,
      NOT: { id: { in: [doc3Id] } },
    },
  });

  console.log('Seed complete:', {
    userId: user.id,
    caseIds: [case1.id, case2.id, case3.id],
    lawyerIds: lawyers.map(l => l.id),
    documentIds: docs.map((d) => d.id),
  });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
