export type Item = {
  id: string;
  title: string;
  description: string;
  type: 'dispute' | 'service' | 'utility';
  keywords: string[];
  legalRefs?: string[];
  aiPrompt: string;
};

export type Category = {
  id: string;
  title: string;
  icon: string;
  items: Item[];
};

const refs = {
  criminal: ['BNS', 'BNSS', 'Bharatiya Sakshya Adhiniyam'],
  family: ['Hindu Marriage Act, 1955', 'Special Marriage Act, 1954', 'Protection of Women from Domestic Violence Act, 2005'],
  labour: ['Payment of Wages Act, 1936', 'Industrial Disputes Act, 1947', 'Code on Wages, 2019'],
  property: ['Transfer of Property Act, 1882', 'Registration Act, 1908', 'Specific Relief Act, 1963'],
  civil: ['Code of Civil Procedure, 1908', 'Indian Contract Act, 1872', 'Limitation Act, 1963'],
  corporate: ['Companies Act, 2013', 'LLP Act, 2008', 'SEBI regulations'],
  consumer: ['Consumer Protection Act, 2019', 'E-Commerce Rules, 2020'],
  cyber: ['Information Technology Act, 2000', 'DPDP Act, 2023', 'BNS cyber provisions'],
  services: ['Advocates Act, 1961', 'Civil and criminal procedural laws'],
  utilities: ['Stamp Act', 'Registration Act, 1908', 'Notaries Act, 1952'],
};

function item(
  category: string,
  id: string,
  title: string,
  description: string,
  type: Item['type'],
  keywords: string[],
  legalRefs: string[]
): Item {
  return {
    id,
    title,
    description,
    type,
    keywords,
    legalRefs,
    aiPrompt: `Analyze this Indian legal issue for Law24: ${title}. User context: ${description}. Cover legal category, applicable law, remedies, documents needed, immediate steps, timeline, risks, and when to consult a lawyer. Category: ${category}.`,
  };
}

export const LEGAL_SYSTEM: Category[] = [
  {
    id: 'criminal-law',
    title: 'Criminal Law',
    icon: 'gavel',
    items: [
      item('Criminal Law', 'fir-not-registered', 'FIR not registered', 'Police refuses to register a cognizable offence complaint.', 'dispute', ['fir', 'police complaint', '154', 'sho', 'cognizable'], refs.criminal),
      item('Criminal Law', 'anticipatory-bail', 'Anticipatory bail', 'User fears arrest after complaint or FIR.', 'service', ['anticipatory bail', 'arrest', '438', 'pre arrest'], refs.criminal),
      item('Criminal Law', 'regular-bail', 'Regular bail', 'Accused is arrested or in custody and needs bail.', 'service', ['bail', 'custody', 'remand', '437', '439'], refs.criminal),
      item('Criminal Law', 'domestic-violence-criminal', 'Domestic violence complaint', 'Physical or emotional abuse at home requiring urgent protection.', 'dispute', ['domestic violence', 'abuse', 'protection', 'women'], refs.criminal),
      item('Criminal Law', 'cheque-bounce', 'Cheque bounce case', 'Cheque returned unpaid and legal notice or complaint is needed.', 'dispute', ['cheque bounce', '138', 'dishonour', 'notice'], ['Negotiable Instruments Act, 1881']),
      item('Criminal Law', 'theft-robbery', 'Theft or robbery complaint', 'Property was stolen or taken by force.', 'dispute', ['theft', 'robbery', 'stolen', 'snatching'], refs.criminal),
      item('Criminal Law', 'assault-threats', 'Assault and threats', 'User is facing physical assault, intimidation, or threats.', 'dispute', ['assault', 'threat', 'injury', 'intimidation'], refs.criminal),
      item('Criminal Law', 'fraud-cheating', 'Fraud or cheating', 'Money or property was taken through deception.', 'dispute', ['fraud', 'cheating', 'scam', '420'], refs.criminal),
      item('Criminal Law', 'defamation-criminal', 'Criminal defamation', 'False statements harmed reputation.', 'dispute', ['defamation', 'reputation', 'false allegation'], refs.criminal),
      item('Criminal Law', 'cyber-crime-complaint', 'Cyber crime complaint', 'Online fraud, hacking, or impersonation requires police action.', 'dispute', ['cyber crime', 'hacking', 'online fraud', 'impersonation'], refs.cyber),
      item('Criminal Law', 'quashing-fir', 'FIR quashing', 'User wants High Court quashing of false or settled FIR.', 'service', ['quashing', '482', 'false fir', 'high court'], refs.criminal),
      item('Criminal Law', 'criminal-trial-defense', 'Criminal trial defence', 'Summons, charges, or trial defence strategy is needed.', 'service', ['trial', 'summons', 'charges', 'defence'], refs.criminal),
      item('Criminal Law', 'victim-compensation', 'Victim compensation', 'Victim needs compensation or support after offence.', 'service', ['victim compensation', 'injury', 'compensation'], refs.criminal),
      item('Criminal Law', 'police-harassment', 'Police harassment', 'Repeated calls, pressure, or illegal detention by police.', 'dispute', ['police harassment', 'illegal detention', 'notice'], refs.criminal),
      item('Criminal Law', 'criminal-appeal', 'Criminal appeal', 'Appeal against conviction, acquittal, or sentence.', 'service', ['appeal', 'conviction', 'sentence', 'revision'], refs.criminal),
    ],
  },
  {
    id: 'family-law',
    title: 'Family Law',
    icon: 'family-restroom',
    items: [
      item('Family Law', 'mutual-divorce', 'Mutual consent divorce', 'Both spouses agree to end marriage peacefully.', 'service', ['mutual divorce', 'divorce', 'consent'], refs.family),
      item('Family Law', 'contested-divorce', 'Contested divorce', 'One spouse wants divorce and the other does not agree.', 'dispute', ['contested divorce', 'cruelty', 'desertion'], refs.family),
      item('Family Law', 'maintenance-wife', 'Maintenance for spouse', 'Spouse needs monthly financial support.', 'dispute', ['maintenance', 'alimony', '125', 'support'], refs.family),
      item('Family Law', 'child-custody', 'Child custody', 'Parents dispute custody, visitation, or guardianship.', 'dispute', ['child custody', 'visitation', 'guardian'], refs.family),
      item('Family Law', 'domestic-violence-family', 'Domestic violence protection', 'Protection, residence, and monetary relief for abuse.', 'dispute', ['domestic violence', 'protection order', 'residence order'], refs.family),
      item('Family Law', 'dowry-harassment', 'Dowry harassment', 'Cruelty or harassment connected with dowry demand.', 'dispute', ['dowry', '498a', 'harassment', 'cruelty'], refs.family),
      item('Family Law', 'marriage-registration', 'Marriage registration', 'Register marriage or obtain certificate.', 'service', ['marriage registration', 'certificate', 'special marriage'], refs.family),
      item('Family Law', 'court-marriage', 'Court marriage', 'Legal marriage under Special Marriage Act.', 'service', ['court marriage', 'special marriage', 'notice'], refs.family),
      item('Family Law', 'adoption', 'Adoption process', 'Guidance on legal adoption and documentation.', 'service', ['adoption', 'cara', 'guardian'], ['Juvenile Justice Act', 'CARA Guidelines']),
      item('Family Law', 'inheritance-family', 'Family inheritance dispute', 'Dispute over ancestral or self-acquired family assets.', 'dispute', ['inheritance', 'succession', 'ancestral property'], ['Hindu Succession Act, 1956']),
      item('Family Law', 'partition-family', 'Family partition', 'Divide joint family property or assets.', 'service', ['partition', 'family settlement', 'coparcenary'], ['Hindu Succession Act, 1956', 'Partition Act']),
      item('Family Law', 'name-change-minor', 'Minor name change', 'Name change or correction for child records.', 'utility', ['name change', 'minor', 'gazette'], refs.utilities),
      item('Family Law', 'guardianship', 'Guardianship petition', 'Appoint or challenge legal guardian for minor.', 'service', ['guardianship', 'minor', 'guardian'], ['Guardians and Wards Act, 1890']),
      item('Family Law', 'restitution-conjugal', 'Restitution of conjugal rights', 'Spouse has withdrawn from marriage without reason.', 'service', ['restitution', 'conjugal rights', 'section 9'], refs.family),
      item('Family Law', 'family-mediation', 'Family mediation', 'Resolve matrimonial or family disputes through settlement.', 'service', ['mediation', 'settlement', 'family counselling'], refs.family),
    ],
  },
  {
    id: 'labour-law',
    title: 'Labour Law',
    icon: 'work',
    items: [
      item('Labour Law', 'salary-not-paid', 'Salary not paid', 'Employer delayed or refused salary payment.', 'dispute', ['salary', 'wages', 'unpaid', 'employer'], refs.labour),
      item('Labour Law', 'wrongful-termination', 'Wrongful termination', 'Employee was fired without proper reason or process.', 'dispute', ['termination', 'fired', 'dismissal', 'job loss'], refs.labour),
      item('Labour Law', 'notice-period', 'Notice period dispute', 'Employer or employee disputes notice period or recovery.', 'dispute', ['notice period', 'recovery', 'resignation'], refs.labour),
      item('Labour Law', 'pf-not-deposited', 'PF not deposited', 'Employer deducted PF but did not deposit it.', 'dispute', ['pf', 'epf', 'provident fund', 'deduction'], ['EPF Act, 1952']),
      item('Labour Law', 'gratuity-claim', 'Gratuity claim', 'Eligible employee did not receive gratuity.', 'dispute', ['gratuity', 'five years', 'payment'], ['Payment of Gratuity Act, 1972']),
      item('Labour Law', 'workplace-harassment', 'Workplace harassment', 'Harassment, bullying, or hostile workplace.', 'dispute', ['harassment', 'workplace', 'bullying'], refs.labour),
      item('Labour Law', 'sexual-harassment-posh', 'Sexual harassment at work', 'POSH complaint, ICC process, or retaliation issue.', 'dispute', ['posh', 'sexual harassment', 'icc'], ['POSH Act, 2013']),
      item('Labour Law', 'bonus-incentive', 'Bonus or incentive unpaid', 'Variable pay, bonus, or commission has been withheld.', 'dispute', ['bonus', 'incentive', 'commission', 'variable pay'], refs.labour),
      item('Labour Law', 'contract-labour', 'Contract labour rights', 'Contract worker rights, wages, or absorption issue.', 'dispute', ['contract labour', 'vendor', 'contractor'], ['Contract Labour Act, 1970']),
      item('Labour Law', 'factory-accident', 'Workplace injury compensation', 'Injury or accident occurred during employment.', 'dispute', ['work injury', 'accident', 'compensation'], ['Employees Compensation Act, 1923']),
      item('Labour Law', 'employment-contract-review', 'Employment contract review', 'Review offer letter, bond, non-compete, or policy.', 'service', ['employment contract', 'offer letter', 'bond'], refs.labour),
      item('Labour Law', 'labour-court-filing', 'Labour court filing', 'File claim before labour authority or court.', 'service', ['labour court', 'conciliation', 'claim'], refs.labour),
      item('Labour Law', 'maternity-benefits', 'Maternity benefits', 'Denied maternity leave, pay, or job protection.', 'dispute', ['maternity', 'pregnancy', 'leave'], ['Maternity Benefit Act, 1961']),
      item('Labour Law', 'overtime-wages', 'Overtime wages', 'Employee worked extra hours without overtime payment.', 'dispute', ['overtime', 'extra hours', 'wages'], refs.labour),
      item('Labour Law', 'relieving-letter', 'Relieving letter issue', 'Employer refuses experience or relieving letter.', 'dispute', ['relieving letter', 'experience letter', 'fnf'], refs.labour),
    ],
  },
  {
    id: 'property-law',
    title: 'Property Law',
    icon: 'home-work',
    items: [
      item('Property Law', 'title-verification', 'Property title verification', 'Check ownership and encumbrances before purchase.', 'service', ['title search', 'property verification', 'encumbrance'], refs.property),
      item('Property Law', 'sale-deed-review', 'Sale deed review', 'Review sale deed before signing or registration.', 'service', ['sale deed', 'registration', 'buyer'], refs.property),
      item('Property Law', 'builder-delay', 'Builder delay', 'Builder delayed possession or project completion.', 'dispute', ['builder delay', 'rera', 'possession'], ['RERA Act, 2016']),
      item('Property Law', 'tenant-eviction', 'Tenant eviction', 'Landlord needs lawful eviction of tenant.', 'dispute', ['tenant eviction', 'rent', 'lease'], refs.property),
      item('Property Law', 'rent-agreement', 'Rent agreement', 'Draft or review rent agreement.', 'service', ['rent agreement', 'lease', 'licence'], refs.property),
      item('Property Law', 'partition-property', 'Property partition suit', 'Co-owners need partition of property.', 'dispute', ['partition', 'co-owner', 'ancestral'], refs.property),
      item('Property Law', 'encroachment', 'Encroachment dispute', 'Neighbour or third party encroached land.', 'dispute', ['encroachment', 'boundary', 'illegal construction'], refs.property),
      item('Property Law', 'illegal-possession', 'Illegal possession', 'Someone is occupying property unlawfully.', 'dispute', ['illegal possession', 'trespass', 'occupant'], refs.property),
      item('Property Law', 'mutation-records', 'Mutation and revenue records', 'Update ownership in municipal or revenue records.', 'utility', ['mutation', 'revenue record', 'khata'], refs.property),
      item('Property Law', 'gift-deed', 'Gift deed', 'Transfer property by gift to family or others.', 'service', ['gift deed', 'transfer', 'stamp duty'], refs.property),
      item('Property Law', 'will-probate', 'Will and probate', 'Make will or obtain probate after death.', 'service', ['will', 'probate', 'succession'], ['Indian Succession Act, 1925']),
      item('Property Law', 'mortgage-dispute', 'Mortgage dispute', 'Dispute with bank or lender over secured property.', 'dispute', ['mortgage', 'sarfaesi', 'loan'], ['SARFAESI Act, 2002']),
      item('Property Law', 'rera-complaint', 'RERA complaint', 'Complaint against builder before RERA.', 'service', ['rera complaint', 'builder', 'flat'], ['RERA Act, 2016']),
      item('Property Law', 'property-injunction', 'Property injunction', 'Urgent court order to stop sale or construction.', 'service', ['injunction', 'stay order', 'construction'], refs.property),
      item('Property Law', 'land-acquisition', 'Land acquisition compensation', 'Government acquisition or compensation dispute.', 'dispute', ['land acquisition', 'compensation', 'government'], ['Land Acquisition Act, 2013']),
    ],
  },
  {
    id: 'civil-law',
    title: 'Civil Law',
    icon: 'account-balance',
    items: [
      item('Civil Law', 'money-recovery', 'Money recovery', 'Recover loan, advance, or unpaid dues.', 'dispute', ['money recovery', 'loan', 'dues'], refs.civil),
      item('Civil Law', 'contract-breach', 'Breach of contract', 'Agreement was violated and damages are needed.', 'dispute', ['contract breach', 'agreement', 'damages'], refs.civil),
      item('Civil Law', 'legal-notice-civil', 'Civil legal notice', 'Send notice before civil action.', 'service', ['legal notice', 'civil notice', 'demand'], refs.civil),
      item('Civil Law', 'injunction-civil', 'Civil injunction', 'Need urgent stay or restraining order.', 'service', ['injunction', 'stay', 'restrain'], refs.civil),
      item('Civil Law', 'defamation-civil', 'Civil defamation', 'Seek damages for reputational harm.', 'dispute', ['defamation', 'damages', 'reputation'], refs.civil),
      item('Civil Law', 'specific-performance', 'Specific performance', 'Force completion of contract or sale agreement.', 'dispute', ['specific performance', 'sale agreement', 'contract'], ['Specific Relief Act, 1963']),
      item('Civil Law', 'debt-settlement', 'Debt settlement', 'Negotiate settlement with lender or creditor.', 'service', ['debt settlement', 'creditor', 'loan'], refs.civil),
      item('Civil Law', 'civil-appeal', 'Civil appeal', 'Challenge civil court order or decree.', 'service', ['civil appeal', 'decree', 'order'], refs.civil),
      item('Civil Law', 'execution-decree', 'Execution of decree', 'Enforce court decree or award.', 'service', ['execution', 'decree', 'award'], refs.civil),
      item('Civil Law', 'recovery-summary-suit', 'Summary suit', 'Fast recovery based on written contract or cheque.', 'service', ['summary suit', 'order 37', 'written contract'], refs.civil),
      item('Civil Law', 'mediation-settlement', 'Mediation settlement', 'Resolve civil dispute through settlement.', 'service', ['mediation', 'settlement', 'compromise'], refs.civil),
      item('Civil Law', 'consumer-civil-overlap', 'Service deficiency civil claim', 'Service failure may need civil or consumer remedy.', 'dispute', ['service deficiency', 'compensation', 'refund'], refs.consumer),
      item('Civil Law', 'limitation-advice', 'Limitation check', 'Check if claim is within filing time limit.', 'utility', ['limitation', 'time barred', 'delay'], ['Limitation Act, 1963']),
      item('Civil Law', 'document-evidence-review', 'Evidence review', 'Review documents before filing case.', 'utility', ['evidence', 'documents', 'proof'], refs.civil),
      item('Civil Law', 'civil-suit-filing', 'Civil suit filing', 'Prepare and file civil plaint.', 'service', ['civil suit', 'plaint', 'filing'], refs.civil),
    ],
  },
  {
    id: 'corporate-law',
    title: 'Corporate Law',
    icon: 'business-center',
    items: [
      item('Corporate Law', 'company-incorporation', 'Company incorporation', 'Register private limited company.', 'service', ['company registration', 'incorporation', 'private limited'], refs.corporate),
      item('Corporate Law', 'llp-registration', 'LLP registration', 'Register limited liability partnership.', 'service', ['llp', 'partnership', 'registration'], refs.corporate),
      item('Corporate Law', 'founders-agreement', 'Founders agreement', 'Define founder roles, equity, vesting, and exits.', 'service', ['founders agreement', 'equity', 'vesting'], refs.corporate),
      item('Corporate Law', 'shareholders-agreement', 'Shareholders agreement', 'Draft investor and shareholder rights.', 'service', ['shareholders agreement', 'sha', 'investor'], refs.corporate),
      item('Corporate Law', 'startup-compliance', 'Startup compliance', 'Annual filings, registers, and board compliance.', 'utility', ['compliance', 'roc', 'annual filing'], refs.corporate),
      item('Corporate Law', 'director-dispute', 'Director dispute', 'Dispute between directors or board control issues.', 'dispute', ['director dispute', 'board', 'oppression'], refs.corporate),
      item('Corporate Law', 'vendor-contract', 'Vendor contract', 'Draft or review commercial vendor contract.', 'service', ['vendor agreement', 'msa', 'sla'], refs.corporate),
      item('Corporate Law', 'nda-confidentiality', 'NDA and confidentiality', 'Protect confidential information and trade secrets.', 'service', ['nda', 'confidentiality', 'trade secret'], refs.corporate),
      item('Corporate Law', 'employment-policy', 'Company HR policies', 'Draft employment, POSH, leave, and remote work policies.', 'service', ['hr policy', 'posh policy', 'employee handbook'], refs.labour),
      item('Corporate Law', 'term-sheet-review', 'Term sheet review', 'Review investment or acquisition term sheet.', 'service', ['term sheet', 'investment', 'startup funding'], refs.corporate),
      item('Corporate Law', 'ip-assignment', 'IP assignment', 'Transfer intellectual property from founders or contractors.', 'service', ['ip assignment', 'copyright', 'software'], refs.corporate),
      item('Corporate Law', 'data-processing-agreement', 'Data processing agreement', 'Privacy and data processing contract review.', 'service', ['dpa', 'privacy', 'data processing'], refs.cyber),
      item('Corporate Law', 'partnership-dispute', 'Partnership dispute', 'Profit sharing, exit, or management dispute.', 'dispute', ['partnership dispute', 'profit sharing', 'exit'], refs.corporate),
      item('Corporate Law', 'winding-up-closure', 'Company closure', 'Close company or LLP compliantly.', 'service', ['company closure', 'strike off', 'winding up'], refs.corporate),
      item('Corporate Law', 'contract-negotiation', 'Commercial contract negotiation', 'Negotiate risk, liability, payment, and termination terms.', 'service', ['contract negotiation', 'liability', 'termination'], refs.corporate),
    ],
  },
  {
    id: 'consumer-law',
    title: 'Consumer Law',
    icon: 'shopping-bag',
    items: [
      item('Consumer Law', 'refund-not-received', 'Refund not received', 'Seller or platform has not issued refund.', 'dispute', ['refund', 'return', 'ecommerce'], refs.consumer),
      item('Consumer Law', 'defective-product', 'Defective product', 'Product is defective or unsafe.', 'dispute', ['defective product', 'warranty', 'replacement'], refs.consumer),
      item('Consumer Law', 'service-deficiency', 'Service deficiency', 'Paid service was incomplete or poor quality.', 'dispute', ['service deficiency', 'poor service', 'compensation'], refs.consumer),
      item('Consumer Law', 'medical-negligence', 'Medical negligence', 'Hospital or doctor negligence caused harm.', 'dispute', ['medical negligence', 'hospital', 'doctor'], refs.consumer),
      item('Consumer Law', 'insurance-claim-denied', 'Insurance claim denied', 'Insurer rejected or delayed valid claim.', 'dispute', ['insurance claim', 'denied', 'policy'], ['Insurance Act', 'IRDAI Regulations', 'Consumer Protection Act, 2019']),
      item('Consumer Law', 'banking-complaint', 'Banking complaint', 'Bank charges, failed transaction, or account issue.', 'dispute', ['bank complaint', 'failed transaction', 'charges'], refs.consumer),
      item('Consumer Law', 'real-estate-consumer', 'Homebuyer consumer complaint', 'Homebuyer seeks refund, possession, or compensation.', 'dispute', ['homebuyer', 'builder', 'consumer complaint'], refs.consumer),
      item('Consumer Law', 'airline-travel', 'Airline or travel refund', 'Flight, hotel, or travel service dispute.', 'dispute', ['airline refund', 'travel', 'hotel booking'], refs.consumer),
      item('Consumer Law', 'telecom-billing', 'Telecom billing dispute', 'Wrong mobile, broadband, or DTH billing.', 'dispute', ['telecom', 'billing', 'broadband'], ['TRAI Regulations', 'Consumer Protection Act, 2019']),
      item('Consumer Law', 'education-service', 'Education service dispute', 'Coaching, school, or university service/refund issue.', 'dispute', ['education refund', 'coaching', 'fees'], refs.consumer),
      item('Consumer Law', 'consumer-notice', 'Consumer legal notice', 'Send notice before consumer complaint.', 'service', ['consumer notice', 'legal notice', 'refund notice'], refs.consumer),
      item('Consumer Law', 'consumer-complaint-filing', 'Consumer complaint filing', 'File consumer case before commission.', 'service', ['consumer court', 'complaint filing', 'commission'], refs.consumer),
      item('Consumer Law', 'warranty-claim', 'Warranty claim', 'Brand refuses warranty repair or replacement.', 'dispute', ['warranty', 'guarantee', 'repair'], refs.consumer),
      item('Consumer Law', 'misleading-advertisement', 'Misleading advertisement', 'Ad or claim misled consumer.', 'dispute', ['misleading ad', 'false claim', 'advertisement'], refs.consumer),
      item('Consumer Law', 'loan-recovery-harassment', 'Loan recovery harassment', 'Recovery agents are threatening or harassing borrower.', 'dispute', ['loan recovery', 'harassment', 'rbi'], ['RBI Fair Practices Code', 'Consumer Protection Act, 2019']),
    ],
  },
  {
    id: 'cyber-law',
    title: 'Cyber Law',
    icon: 'security',
    items: [
      item('Cyber Law', 'upi-fraud', 'UPI or bank fraud', 'Money lost through UPI, card, or banking scam.', 'dispute', ['upi fraud', 'bank fraud', 'cyber fraud'], refs.cyber),
      item('Cyber Law', 'social-media-impersonation', 'Social media impersonation', 'Fake profile or impersonation online.', 'dispute', ['fake profile', 'impersonation', 'instagram'], refs.cyber),
      item('Cyber Law', 'hacking-account', 'Account hacking', 'Email, social, or business account hacked.', 'dispute', ['hacking', 'account hacked', 'password'], refs.cyber),
      item('Cyber Law', 'online-blackmail', 'Online blackmail', 'Threats to publish private images or information.', 'dispute', ['blackmail', 'sextortion', 'threat online'], refs.cyber),
      item('Cyber Law', 'data-breach', 'Data breach', 'Personal or company data leaked or misused.', 'dispute', ['data breach', 'privacy', 'leak'], refs.cyber),
      item('Cyber Law', 'cyber-bullying', 'Cyber bullying', 'Online harassment, abuse, or stalking.', 'dispute', ['cyber bullying', 'online harassment', 'stalking'], refs.cyber),
      item('Cyber Law', 'domain-dispute', 'Domain name dispute', 'Brand or domain squatting issue.', 'dispute', ['domain dispute', 'cybersquatting', 'trademark'], refs.cyber),
      item('Cyber Law', 'app-privacy-policy', 'App privacy policy', 'Draft privacy policy for app or website.', 'service', ['privacy policy', 'app', 'website'], refs.cyber),
      item('Cyber Law', 'terms-of-use', 'Terms of use', 'Draft terms for platform, app, or SaaS.', 'service', ['terms of use', 'terms and conditions', 'saas'], refs.cyber),
      item('Cyber Law', 'intermediary-compliance', 'Intermediary compliance', 'Platform content and grievance compliance.', 'utility', ['intermediary', 'it rules', 'grievance officer'], refs.cyber),
      item('Cyber Law', 'takedown-request', 'Content takedown request', 'Remove illegal or harmful online content.', 'service', ['takedown', 'remove content', 'platform complaint'], refs.cyber),
      item('Cyber Law', 'digital-evidence', 'Digital evidence preservation', 'Preserve chats, emails, screenshots, and metadata.', 'utility', ['digital evidence', 'screenshots', 'metadata'], refs.cyber),
      item('Cyber Law', 'crypto-fraud', 'Crypto fraud', 'Investment scam involving crypto or trading platform.', 'dispute', ['crypto fraud', 'trading scam', 'investment'], refs.cyber),
      item('Cyber Law', 'online-defamation', 'Online defamation', 'Defamatory post, review, or comment online.', 'dispute', ['online defamation', 'bad review', 'post'], refs.cyber),
      item('Cyber Law', 'cyber-complaint-filing', 'Cyber complaint filing', 'File complaint on cyber crime portal or police station.', 'service', ['cyber complaint', 'cyber portal', '1930'], refs.cyber),
    ],
  },
  {
    id: 'legal-services',
    title: 'Legal Services',
    icon: 'support-agent',
    items: [
      item('Legal Services', 'lawyer-consultation', 'Lawyer consultation', 'Book consultation with suitable lawyer.', 'service', ['lawyer', 'consultation', 'advocate'], refs.services),
      item('Legal Services', 'legal-notice-drafting', 'Legal notice drafting', 'Draft and send legal notice.', 'service', ['legal notice', 'draft notice', 'notice'], refs.services),
      item('Legal Services', 'case-filing', 'Case filing support', 'Prepare and file court case.', 'service', ['case filing', 'petition', 'plaint'], refs.services),
      item('Legal Services', 'document-review', 'Document review', 'Review legal documents and contracts.', 'service', ['document review', 'contract review', 'papers'], refs.services),
      item('Legal Services', 'contract-drafting', 'Contract drafting', 'Draft business or personal agreement.', 'service', ['contract drafting', 'agreement', 'terms'], refs.services),
      item('Legal Services', 'court-representation', 'Court representation', 'Engage advocate for hearings.', 'service', ['court representation', 'hearing', 'advocate'], refs.services),
      item('Legal Services', 'legal-opinion', 'Legal opinion', 'Written opinion on legal position.', 'service', ['legal opinion', 'advice', 'written opinion'], refs.services),
      item('Legal Services', 'mediation-service', 'Mediation service', 'Resolve dispute through structured mediation.', 'service', ['mediation', 'settlement', 'negotiation'], refs.services),
      item('Legal Services', 'notice-reply', 'Reply to legal notice', 'Respond to received notice.', 'service', ['reply notice', 'received notice', 'response'], refs.services),
      item('Legal Services', 'police-complaint-drafting', 'Police complaint drafting', 'Prepare complaint for police or cyber cell.', 'service', ['police complaint', 'draft complaint', 'cyber cell'], refs.services),
      item('Legal Services', 'bail-lawyer', 'Bail lawyer', 'Find lawyer for bail or arrest protection.', 'service', ['bail lawyer', 'arrest', 'criminal lawyer'], refs.services),
      item('Legal Services', 'property-lawyer', 'Property lawyer', 'Find lawyer for real estate or land issue.', 'service', ['property lawyer', 'land lawyer', 'real estate'], refs.services),
      item('Legal Services', 'family-lawyer', 'Family lawyer', 'Find lawyer for divorce, custody, or maintenance.', 'service', ['family lawyer', 'divorce lawyer', 'custody'], refs.services),
      item('Legal Services', 'consumer-lawyer', 'Consumer lawyer', 'Find lawyer for refund, warranty, or service dispute.', 'service', ['consumer lawyer', 'refund lawyer', 'consumer court'], refs.services),
      item('Legal Services', 'startup-lawyer', 'Startup lawyer', 'Find lawyer for startup contracts and compliance.', 'service', ['startup lawyer', 'company lawyer', 'contracts'], refs.services),
    ],
  },
  {
    id: 'legal-utilities',
    title: 'Legal Utilities',
    icon: 'fact-check',
    items: [
      item('Legal Utilities', 'stamp-duty-check', 'Stamp duty check', 'Estimate stamp duty for document or property.', 'utility', ['stamp duty', 'registration fee', 'duty'], refs.utilities),
      item('Legal Utilities', 'court-fee-check', 'Court fee check', 'Estimate court fee for filing.', 'utility', ['court fee', 'filing fee', 'valuation'], refs.utilities),
      item('Legal Utilities', 'limitation-calculator', 'Limitation calculator', 'Check filing deadline for claim.', 'utility', ['limitation calculator', 'deadline', 'time limit'], refs.utilities),
      item('Legal Utilities', 'case-status-help', 'Case status help', 'Understand court case status and next date.', 'utility', ['case status', 'next date', 'ecourts'], refs.utilities),
      item('Legal Utilities', 'document-checklist', 'Document checklist', 'Generate checklist for legal matter.', 'utility', ['document checklist', 'documents needed', 'proof'], refs.utilities),
      item('Legal Utilities', 'notice-generator', 'Legal notice generator', 'Generate first draft of legal notice.', 'utility', ['notice generator', 'draft notice', 'template'], refs.utilities),
      item('Legal Utilities', 'affidavit-format', 'Affidavit format', 'Prepare affidavit draft or checklist.', 'utility', ['affidavit', 'notary', 'format'], refs.utilities),
      item('Legal Utilities', 'will-draft', 'Will draft helper', 'Create basic will draft checklist.', 'utility', ['will draft', 'succession', 'executor'], refs.utilities),
      item('Legal Utilities', 'rent-agreement-generator', 'Rent agreement generator', 'Create rent agreement draft inputs.', 'utility', ['rent agreement generator', 'lease draft'], refs.utilities),
      item('Legal Utilities', 'consumer-complaint-draft', 'Consumer complaint draft', 'Prepare consumer complaint outline.', 'utility', ['consumer complaint draft', 'consumer court'], refs.utilities),
      item('Legal Utilities', 'police-complaint-format', 'Police complaint format', 'Prepare police complaint format.', 'utility', ['police complaint format', 'fir draft'], refs.utilities),
      item('Legal Utilities', 'legal-term-explainer', 'Legal term explainer', 'Explain legal words in plain language.', 'utility', ['legal terms', 'explain law', 'meaning'], refs.utilities),
      item('Legal Utilities', 'lawyer-fee-estimate', 'Lawyer fee estimate', 'Estimate typical lawyer cost range.', 'utility', ['lawyer fee', 'cost estimate', 'fees'], refs.utilities),
      item('Legal Utilities', 'risk-score', 'Legal risk score', 'Assess urgency and risk level of issue.', 'utility', ['risk score', 'urgency', 'legal risk'], refs.utilities),
      item('Legal Utilities', 'evidence-organizer', 'Evidence organizer', 'Organize evidence before consultation.', 'utility', ['evidence organizer', 'proof list', 'documents'], refs.utilities),
    ],
  },
];

export function getLegalSystemCategory(id: string): Category | undefined {
  return LEGAL_SYSTEM.find((category) => category.id === id);
}

export function getLegalSystemItem(categoryId: string, itemId: string): Item | undefined {
  return getLegalSystemCategory(categoryId)?.items.find((item) => item.id === itemId);
}
