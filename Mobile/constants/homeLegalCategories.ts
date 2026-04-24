/**
 * Home Legal Categories — user-facing copy → Lawyers tab `category` param.
 */
import type { DirectoryCategory } from './lawyersDirectory';

export type HomeLegalCategoryItem = {
  id: string;
  label: string;
  icon: string;
  color: string;
  categoryParam: DirectoryCategory;
};

export const HOME_LEGAL_CATEGORIES: HomeLegalCategoryItem[] = [
  { id: 'police_fir', label: 'Police / FIR', icon: 'gavel', color: '#F85149', categoryParam: 'criminal' },
  { id: 'family_divorce', label: 'Family / Divorce', icon: 'family-restroom', color: '#FF9F43', categoryParam: 'family' },
  { id: 'property', label: 'Property Dispute', icon: 'home', color: '#3FB950', categoryParam: 'property' },
  { id: 'job', label: 'Job Issues', icon: 'work', color: '#58A6FF', categoryParam: 'employment' },
  { id: 'consumer', label: 'Consumer Complaint', icon: 'shopping-cart', color: '#F5A623', categoryParam: 'civil' },
  { id: 'banking', label: 'Loan / Banking', icon: 'account-balance', color: '#A78BFA', categoryParam: 'corporate' },
  { id: 'accident', label: 'Accident / Insurance', icon: 'directions-car', color: '#60A5FA', categoryParam: 'civil' },
  { id: 'documents', label: 'Legal Documents', icon: 'description', color: '#34D399', categoryParam: 'civil' },
];
