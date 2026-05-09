export function mockAIResponse(query: string) {
  return {
    featuredAnswer: `Based on your query "${query}", Indian law provides actionable remedies. You should first gather proof like bank statements, agreements, or communication records.`,

    caseTypes: ['Employment', 'Criminal', 'Property'],

    explanation:
      'Legal remedies depend on your situation. You can send a legal notice, file a complaint, or approach court depending on urgency.',

    legalSections: [
      {
        title: 'Payment of Wages Act, 1936',
        description: 'Ensures timely payment of wages',
      },
      {
        title: 'Industrial Disputes Act, 1947',
        description: 'Handles employment disputes',
      },
    ],

    recommendedLawyers: [
      { name: 'Adv. Sunita Reddy', city: 'Hyderabad', rating: 4.5 },
      { name: 'Adv. Vikram Nair', city: 'Bangalore', rating: 4.6 },
      { name: 'Adv. Rahul Mehta', city: 'Delhi', rating: 4.8 },
    ],

    relatedSearches: [
      'Salary not paid what to do',
      'Legal notice format',
      'Court case process India',
    ],
  };
}
