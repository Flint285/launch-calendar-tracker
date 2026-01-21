// Feb 1-14, 2026 Launch Calendar Template
// Based on PRD specifications

export interface TemplateTask {
  dayOffset: number; // Days from start date (0 = first day)
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'product' | 'funnel' | 'outreach' | 'email' | 'ads' | 'analytics' | 'support' | 'other';
  estimatedMinutes?: number;
}

export const FEB_2026_LAUNCH_TEMPLATE: TemplateTask[] = [
  // ============================================
  // DAY 1 - Feb 1: Soft Launch Kickoff
  // ============================================
  {
    dayOffset: 0,
    title: 'Final pre-launch checklist review',
    description: 'Go through complete checklist: payments working, emails loaded, tracking pixels active, support ready',
    priority: 'high',
    category: 'product',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 0,
    title: 'Enable payments and go live',
    description: 'Switch from test mode to live, verify first transaction capability',
    priority: 'high',
    category: 'product',
    estimatedMinutes: 15,
  },
  {
    dayOffset: 0,
    title: 'Monitor first sales and signups',
    description: 'Watch for any immediate issues with checkout, onboarding, or delivery',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 0,
    title: 'Send soft launch announcement to inner circle',
    description: 'Personal message to closest supporters about the launch',
    priority: 'medium',
    category: 'outreach',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 0,
    title: 'Review KPIs and log day 1 metrics',
    description: 'Daily KPI review: capture baseline metrics for all key indicators',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 2 - Feb 2: Past Payer Outreach
  // ============================================
  {
    dayOffset: 1,
    title: 'Send personal emails to past payers (batch 1)',
    description: 'Reach out to 5-7 past payers with personalized messages about the new offering',
    priority: 'high',
    category: 'outreach',
    estimatedMinutes: 90,
  },
  {
    dayOffset: 1,
    title: 'Send personal emails to past payers (batch 2)',
    description: 'Reach out to remaining 5-8 past payers with personalized messages',
    priority: 'high',
    category: 'outreach',
    estimatedMinutes: 90,
  },
  {
    dayOffset: 1,
    title: 'Monitor email deliverability metrics',
    description: 'Check bounce rates, spam complaints for initial sends',
    priority: 'medium',
    category: 'email',
    estimatedMinutes: 15,
  },
  {
    dayOffset: 1,
    title: 'Respond to any early replies or questions',
    description: 'Handle any incoming messages from past payers promptly',
    priority: 'high',
    category: 'support',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 1,
    title: 'Review KPIs and log day 2 metrics',
    description: 'Daily KPI review: track outreach response rates, any conversions',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 3 - Feb 3: Friction Fixes
  // ============================================
  {
    dayOffset: 2,
    title: 'Review checkout session recordings',
    description: 'Watch 5-10 session recordings to identify friction points in checkout flow',
    priority: 'high',
    category: 'funnel',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 2,
    title: 'Identify top 3 friction points',
    description: 'Document the biggest drop-off points or confusion areas',
    priority: 'high',
    category: 'funnel',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 2,
    title: 'Fix highest priority friction issue',
    description: 'Implement quick fix for the most impactful friction point',
    priority: 'high',
    category: 'product',
    estimatedMinutes: 90,
  },
  {
    dayOffset: 2,
    title: 'Follow up on unreplied past payer emails',
    description: 'Send gentle follow-up to past payers who haven\'t responded',
    priority: 'medium',
    category: 'outreach',
    estimatedMinutes: 45,
  },
  {
    dayOffset: 2,
    title: 'Review KPIs and log day 3 metrics',
    description: 'Daily KPI review: focus on funnel conversion metrics',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 4 - Feb 4: Cold List Warm-up Start
  // ============================================
  {
    dayOffset: 3,
    title: 'Prepare cold list email sequence',
    description: 'Finalize first warm-up email copy and segment cold list',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 3,
    title: 'Send warm-up email 1 to cold list (small batch)',
    description: 'Start with 50-100 contacts to test deliverability',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 3,
    title: 'Monitor deliverability closely',
    description: 'Check bounce rate, spam rate within first 2 hours of send',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 3,
    title: 'Fix second friction issue from day 3 review',
    description: 'Continue improving checkout/onboarding flow',
    priority: 'medium',
    category: 'product',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 3,
    title: 'Review KPIs and log day 4 metrics',
    description: 'Daily KPI review: email metrics critical today',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 5 - Feb 5: Scale Cold List
  // ============================================
  {
    dayOffset: 4,
    title: 'Review day 4 cold email performance',
    description: 'Analyze open rates, click rates, any spam issues',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 4,
    title: 'Scale cold list send to larger batch',
    description: 'If metrics healthy, send to 150-200 more contacts',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 4,
    title: 'Handle cold list replies and questions',
    description: 'Respond to any engagement from cold outreach',
    priority: 'high',
    category: 'support',
    estimatedMinutes: 45,
  },
  {
    dayOffset: 4,
    title: 'Review and improve email copy if needed',
    description: 'Based on open/click rates, adjust subject lines or body copy',
    priority: 'medium',
    category: 'email',
    estimatedMinutes: 45,
  },
  {
    dayOffset: 4,
    title: 'Review KPIs and log day 5 metrics',
    description: 'Daily KPI review: track cold list funnel progress',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 6 - Feb 6: Continue Scaling
  // ============================================
  {
    dayOffset: 5,
    title: 'Send warm-up email 2 to earlier batches',
    description: 'Second email in sequence to contacts from days 4-5',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 5,
    title: 'Continue scaling cold list (new batch)',
    description: 'Add another 100-150 contacts to the sequence',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 5,
    title: 'Review assessment completion rates',
    description: 'Check how many leads are completing the assessment funnel',
    priority: 'medium',
    category: 'funnel',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 5,
    title: 'Optimize assessment flow if completion rate low',
    description: 'Identify and fix any drop-off points in assessment',
    priority: 'medium',
    category: 'product',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 5,
    title: 'Review KPIs and log day 6 metrics',
    description: 'Daily KPI review: focus on funnel conversion and email health',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 7 - Feb 7: Mid-Launch Review
  // ============================================
  {
    dayOffset: 6,
    title: 'Mid-launch performance review',
    description: 'Comprehensive review of all metrics vs targets at halfway point',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 6,
    title: 'Decide: continue current strategy or pivot',
    description: 'Based on data, determine if changes needed to approach',
    priority: 'high',
    category: 'other',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 6,
    title: 'Continue cold list sequence',
    description: 'Maintain email cadence to active segments',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 6,
    title: 'Document learnings so far',
    description: 'Capture what\'s working and what\'s not in launch notes',
    priority: 'medium',
    category: 'other',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 6,
    title: 'Review KPIs and log day 7 metrics',
    description: 'Daily KPI review: mid-point comprehensive assessment',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 8 - Feb 8: Push and Optimize
  // ============================================
  {
    dayOffset: 7,
    title: 'Implement changes from mid-launch review',
    description: 'Execute any strategy adjustments decided yesterday',
    priority: 'high',
    category: 'product',
    estimatedMinutes: 90,
  },
  {
    dayOffset: 7,
    title: 'Scale successful email segments',
    description: 'Double down on segments showing best engagement',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 45,
  },
  {
    dayOffset: 7,
    title: 'Pause or adjust underperforming segments',
    description: 'Stop sending to segments with poor deliverability or engagement',
    priority: 'medium',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 7,
    title: 'Review KPIs and log day 8 metrics',
    description: 'Daily KPI review: track impact of any changes',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 9 - Feb 9: Continue Execution
  // ============================================
  {
    dayOffset: 8,
    title: 'Continue cold list outreach',
    description: 'Maintain email sequence to remaining contacts',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 8,
    title: 'Follow up on engaged but unconverted leads',
    description: 'Personal outreach to leads who clicked but didn\'t convert',
    priority: 'high',
    category: 'outreach',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 8,
    title: 'Review support tickets and feedback',
    description: 'Address any customer issues, gather product feedback',
    priority: 'medium',
    category: 'support',
    estimatedMinutes: 45,
  },
  {
    dayOffset: 8,
    title: 'Review KPIs and log day 9 metrics',
    description: 'Daily KPI review: conversion focus',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 10 - Feb 10: Retargeting Setup (Optional)
  // ============================================
  {
    dayOffset: 9,
    title: 'Review retargeting viability',
    description: 'Decide if budget allows for paid retargeting based on results so far',
    priority: 'medium',
    category: 'ads',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 9,
    title: 'Set up retargeting audiences (if proceeding)',
    description: 'Create audiences from site visitors, email clickers, assessment starters',
    priority: 'medium',
    category: 'ads',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 9,
    title: 'Create retargeting ad creatives (if proceeding)',
    description: 'Design simple reminder ads for retargeting campaign',
    priority: 'low',
    category: 'ads',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 9,
    title: 'Continue email sequences',
    description: 'Maintain outreach to remaining cold list segments',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 9,
    title: 'Review KPIs and log day 10 metrics',
    description: 'Daily KPI review: assess CAC if running ads',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 11 - Feb 11: Conversion Push Start
  // ============================================
  {
    dayOffset: 10,
    title: 'Launch urgency-based messaging',
    description: 'Begin "ending soon" or "limited time" messaging to engaged leads',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 45,
  },
  {
    dayOffset: 10,
    title: 'Personal outreach to hot leads',
    description: 'Direct messages to leads showing high engagement but no purchase',
    priority: 'high',
    category: 'outreach',
    estimatedMinutes: 90,
  },
  {
    dayOffset: 10,
    title: 'Launch retargeting campaign (if set up)',
    description: 'Activate paid retargeting with small daily budget',
    priority: 'medium',
    category: 'ads',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 10,
    title: 'Review KPIs and log day 11 metrics',
    description: 'Daily KPI review: track urgency messaging impact',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 12 - Feb 12: Continue Conversion Push
  // ============================================
  {
    dayOffset: 11,
    title: 'Send reminder emails to engaged non-buyers',
    description: 'Final sequence emails emphasizing deadline approaching',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 11,
    title: 'Make personal calls to highest-value leads',
    description: 'Phone outreach to top 5-10 leads who seem most likely to convert',
    priority: 'high',
    category: 'outreach',
    estimatedMinutes: 90,
  },
  {
    dayOffset: 11,
    title: 'Monitor ad spend and CAC',
    description: 'Ensure retargeting ROI is acceptable, pause if not',
    priority: 'medium',
    category: 'ads',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 11,
    title: 'Review KPIs and log day 12 metrics',
    description: 'Daily KPI review: conversion rate focus',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 13 - Feb 13: Final Push
  // ============================================
  {
    dayOffset: 12,
    title: 'Send "last day" emails',
    description: 'Final deadline messaging to all engaged contacts',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 12,
    title: 'Final personal outreach to fence-sitters',
    description: 'Last chance messages to leads who expressed interest',
    priority: 'high',
    category: 'outreach',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 12,
    title: 'Address any last-minute objections',
    description: 'Handle questions or concerns from potential buyers',
    priority: 'high',
    category: 'support',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 12,
    title: 'Prepare for launch close',
    description: 'Plan transition messaging, what happens after launch ends',
    priority: 'medium',
    category: 'other',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 12,
    title: 'Review KPIs and log day 13 metrics',
    description: 'Daily KPI review: near-final performance assessment',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 20,
  },

  // ============================================
  // DAY 14 - Feb 14: Launch Close and Review
  // ============================================
  {
    dayOffset: 13,
    title: 'Send launch closing message',
    description: 'Final email announcing end of launch offer',
    priority: 'high',
    category: 'email',
    estimatedMinutes: 30,
  },
  {
    dayOffset: 13,
    title: 'Disable launch-specific pricing/offers',
    description: 'Transition to post-launch pricing if applicable',
    priority: 'high',
    category: 'product',
    estimatedMinutes: 15,
  },
  {
    dayOffset: 13,
    title: 'Compile final launch metrics report',
    description: 'Full summary of all KPIs, conversions, revenue',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 90,
  },
  {
    dayOffset: 13,
    title: 'Document all learnings and decisions',
    description: 'What worked, what didn\'t, what to do differently next time',
    priority: 'high',
    category: 'other',
    estimatedMinutes: 60,
  },
  {
    dayOffset: 13,
    title: 'Plan next steps and follow-up actions',
    description: 'Determine immediate post-launch priorities and next sprint',
    priority: 'medium',
    category: 'other',
    estimatedMinutes: 45,
  },
  {
    dayOffset: 13,
    title: 'Final KPI review and close out tracking',
    description: 'Log final metrics and complete launch tracking',
    priority: 'high',
    category: 'analytics',
    estimatedMinutes: 30,
  },
];

// Default KPIs for the launch template
export const DEFAULT_KPIS = [
  // Email Deliverability
  {
    name: 'Delivered Rate',
    category: 'email_deliverability',
    unit: 'percent',
    targetType: 'minimum',
    targetValue: 95,
  },
  {
    name: 'Bounce Rate',
    category: 'email_deliverability',
    unit: 'percent',
    targetType: 'maximum',
    targetValue: 5,
  },
  {
    name: 'Spam Complaint Rate',
    category: 'email_deliverability',
    unit: 'percent',
    targetType: 'maximum',
    targetValue: 0.1,
  },
  {
    name: 'Open Rate',
    category: 'email_deliverability',
    unit: 'percent',
    targetType: 'minimum',
    targetValue: 25,
  },
  {
    name: 'Click Rate',
    category: 'email_deliverability',
    unit: 'percent',
    targetType: 'minimum',
    targetValue: 3,
  },
  // Funnel Conversion
  {
    name: 'Assessment Page → Email Capture',
    category: 'funnel_conversion',
    unit: 'percent',
    targetType: 'minimum',
    targetValue: 30,
  },
  {
    name: 'Assessment Started → Completed',
    category: 'funnel_conversion',
    unit: 'percent',
    targetType: 'minimum',
    targetValue: 60,
  },
  // Revenue
  {
    name: 'Leads → Starter Conversion',
    category: 'revenue',
    unit: 'percent',
    targetType: 'minimum',
    targetValue: 2,
  },
  {
    name: 'Leads → Pro Conversion',
    category: 'revenue',
    unit: 'percent',
    targetType: 'minimum',
    targetValue: 0.5,
  },
  {
    name: 'Daily Revenue',
    category: 'revenue',
    unit: 'currency',
    targetType: 'minimum',
    targetValue: 100,
  },
  // Activation
  {
    name: 'New Users → First Output (24h)',
    category: 'activation',
    unit: 'percent',
    targetType: 'minimum',
    targetValue: 50,
  },
  // Ads (optional)
  {
    name: 'Daily Ad Spend',
    category: 'ads',
    unit: 'currency',
    targetType: 'maximum',
    targetValue: 50,
  },
  {
    name: 'CAC (Customer Acquisition Cost)',
    category: 'ads',
    unit: 'currency',
    targetType: 'maximum',
    targetValue: 100,
  },
];
