/**
 * Legal notice templates — India-oriented mock drafts for Nyaya “Generate notice” flow.
 * Not a substitute for lawyer-drafted notices.
 */

export type NoticeTemplateId =
  | 'salary_recovery'
  | 'divorce_maintenance'
  | 'property_dispute'
  | 'consumer_complaint'
  | 'tenant_eviction'
  | 'fraud_recovery';

export type NoticeFields = {
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  subject: string;
  /** Days for compliance (7–15 typical) */
  complianceDays: number;
};

export type NoticeTemplateMeta = {
  id: NoticeTemplateId;
  title: string;
  defaultSubject: string;
  /** Body paragraphs; use {{sender}}, {{receiver}}, {{days}} */
  paragraphs: string[];
  demandLine: string;
};

export const NOTICE_TEMPLATES: Record<NoticeTemplateId, NoticeTemplateMeta> = {
  salary_recovery: {
    id: 'salary_recovery',
    title: 'Demand notice — unpaid salary / wages',
    defaultSubject: 'Legal notice for recovery of outstanding wages',
    paragraphs: [
      'I, {{sender}}, residing at {{senderAddress}}, state that I was employed with you / your establishment and that wages/salary for the period agreed remain unpaid despite repeated requests.',
      'The non-payment attracts provisions of the Payment of Wages Act, 1936, and depending on facts, remedies under the Industrial Disputes Act, 1947, and applicable Shops & Establishment Act of the state may also arise.',
      'You are called upon to pay the entire admitted arrears along with statutory dues, if any, within {{days}} days from receipt of this notice, failing which I shall be constrained to initiate appropriate proceedings before the competent Labour authority / Civil Court without further reference to you, at your risk as to costs and consequences.',
    ],
    demandLine: 'Pay all outstanding wages/salary and provide written payment confirmation within the stated period.',
  },
  divorce_maintenance: {
    id: 'divorce_maintenance',
    title: 'Notice — maintenance / matrimonial relief',
    defaultSubject: 'Legal notice regarding maintenance and matrimonial obligations',
    paragraphs: [
      'I, {{sender}}, residing at {{senderAddress}}, am legally married to you / am entitled to maintenance under applicable personal law and Section 125 CrPC, where facts support the same.',
      'Despite my financial need and your means, reasonable maintenance and necessary expenses have not been provided. Cruelty or other matrimonial grounds, if any, will be placed before the competent Family Court with evidence.',
      'You are hereby called upon to pay monthly maintenance of a reasonable sum (to be quantified with counsel) and to co-operate in good faith within {{days}} days, failing which I shall approach the Family Court / Magistrate Court for appropriate reliefs including interim maintenance, without further notice.',
    ],
    demandLine: 'Pay interim maintenance and respond in writing with income disclosure within the stated period.',
  },
  property_dispute: {
    id: 'property_dispute',
    title: 'Notice — property / possession / title',
    defaultSubject: 'Legal notice regarding property dispute',
    paragraphs: [
      'I, {{sender}}, of {{senderAddress}}, am the lawful owner / person in possession of the property described to you (see schedule below / attached), which you have disturbed / obstructed / dealt with contrary to law and contract.',
      'Your acts attract civil remedies under the Transfer of Property Act, 1882, and the Civil Procedure Code, 1908, including injunction and possession, where facts support.',
      'Cease and desist from the aforesaid interference and comply with my lawful demands within {{days}} days, failing which I shall file a civil suit for declaration, injunction, possession, and damages at your cost and risk.',
    ],
    demandLine: 'Vacate obstruction / perform contractual obligations / deliver possession as applicable within the stated period.',
  },
  consumer_complaint: {
    id: 'consumer_complaint',
    title: 'Notice — consumer deficiency / unfair trade',
    defaultSubject: 'Legal notice under Consumer Protection Act, 2019',
    paragraphs: [
      'I, {{sender}}, residing at {{senderAddress}}, purchased / availed services from you at {{receiverAddress}} (branch / online) and there is clear deficiency in goods/services as detailed in my earlier complaints dated ______.',
      'The above is unfair trade practice / deficiency within the meaning of the Consumer Protection Act, 2019. I am entitled to refund / replacement / compensation as the case may be.',
      'You are called upon to remedy the deficiency within {{days}} days from receipt of this notice, failing which I shall file a complaint before the appropriate Consumer Commission with claim for costs and interest.',
    ],
    demandLine: 'Refund / replace the defective product or render deficient-free service and confirm in writing.',
  },
  tenant_eviction: {
    id: 'tenant_eviction',
    title: 'Notice — tenant to vacate / lease breach',
    defaultSubject: 'Legal notice to vacate premises',
    paragraphs: [
      'I, {{sender}}, landlord of the premises at {{senderAddress}}, leased the same to you on terms recorded in agreement dated ______ (copy enclosed). The tenancy has determined / you have committed breaches as: _________________.',
      'You are called upon to hand over vacant peaceful possession within {{days}} days, clear arrears of rent if any, and remove your belongings. Self-help measures are avoided in favour of due process.',
      'Failure to comply will compel me to institute a suit for possession and mesne profits under applicable law including the Transfer of Property Act, 1882, and local rent statutes, where applicable.',
    ],
    demandLine: 'Vacate and deliver possession on or before the last day of the notice period.',
  },
  fraud_recovery: {
    id: 'fraud_recovery',
    title: 'Notice — cheating / fraudulent inducement',
    defaultSubject: 'Legal notice for recovery of amounts obtained by misrepresentation',
    paragraphs: [
      'I, {{sender}}, of {{senderAddress}}, state that you induced me to part with sums / property on false representations (brief facts: ________________), which amounts to cheating and criminal breach of trust under the IPC / BNS, besides civil liability.',
      'Despite demands, you have not restored the amounts / performed obligations. Police complaint process and civil recovery are both reserved.',
      'You are called upon to repay ₹________ / perform specific obligations within {{days}} days, failing which I shall pursue criminal and civil remedies at your sole risk and cost.',
    ],
    demandLine: 'Repay the wrongful gains and confirm in writing within the stated period.',
  },
};

export function defaultNoticeFields(templateId: NoticeTemplateId): NoticeFields {
  const meta = NOTICE_TEMPLATES[templateId];
  return {
    senderName: '[Your full name]',
    senderAddress: '[Your address with PIN]',
    receiverName: '[Opposite party / company name]',
    receiverAddress: '[Address / registered office]',
    subject: meta.defaultSubject,
    complianceDays: 15,
  };
}

export function buildNoticeBody(templateId: NoticeTemplateId, f: NoticeFields): string {
  const meta = NOTICE_TEMPLATES[templateId];
  const days = String(f.complianceDays);
  const apply = (p: string) =>
    p
      .replace(/\{\{sender\}\}/g, f.senderName)
      .replace(/\{\{senderAddress\}\}/g, f.senderAddress)
      .replace(/\{\{receiver\}\}/g, f.receiverName)
      .replace(/\{\{receiverAddress\}\}/g, f.receiverAddress)
      .replace(/\{\{days\}\}/g, days);

  const head = `To,\n${f.receiverName}\n${f.receiverAddress}\n\nFrom,\n${f.senderName}\n${f.senderAddress}\n\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nSubject: ${f.subject}\n\nSir/Madam,\n\n`;
  const body = meta.paragraphs.map((p, i) => `${i + 1}. ${apply(p)}`).join('\n\n');
  const foot = `\n\nIn the circumstances, ${apply(meta.demandLine)}\n\nSincerely,\n\n${f.senderName}`;
  return head + body + foot;
}

export function mockNoticePdfFilename(templateId: NoticeTemplateId): string {
  return `Law24_Notice_${templateId}_${Date.now()}.pdf`;
}
