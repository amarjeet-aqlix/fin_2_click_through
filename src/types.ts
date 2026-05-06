export type UserRole = 'admin' | 'consultant' | 'customer';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company_id: string;
}

export interface Consultant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile?: string;
  phone_office?: string;
  address?: { street: string; number?: string; zip: string; city: string };
  profile_text?: string;
  areas_of_expertise?: string[];
  company_id: string;
  rights: string[];
  status: 'active' | 'inactive';
  customers_count: number;
  created_at: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile?: string;
  birth_date: string;
  address: {
    street: string;
    zip: string;
    city: string;
  };
  consultant_id: string;
  consultant_name: string;
  company_id: string;
  status: 'active' | 'inactive' | 'support';
  created_at: string;
  last_edited: string;
  sex: 'm' | 'f' | 'd';
  personal_wishes: string[];
  income: number;
  income_partner?: number;
  has_partner: boolean;
}

export interface FinancialData {
  customer_id: string;
  income: {
    gross_salary: number;
    net_salary: number;
    partner_gross?: number;
    partner_net?: number;
    rental_income: number;
    other_income: number;
  };
  expenses: {
    rent: number;
    insurance: number;
    loans: number;
    living: number;
    other: number;
  };
  retirement: {
    desired_age: number;
    monthly_need: number;
    state_pension: number;
    private_pension: number;
    gap: number;
  };
  savings: number;
  investments: Investment[];
  insurances: Insurance[];
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
  monthly_contribution: number;
  return_rate: number;
}

export interface Insurance {
  id: string;
  name: string;
  type: string;
  provider: string;
  monthly_premium: number;
  coverage: number;
  status: 'active' | 'expired' | 'pending';
}

export interface Plan {
  id: string;
  name: string;
  price_eur: number;
  max_consultants: number;
  isDisabled: {
    download?: boolean;
    companyDesign?: boolean;
    hierarchy?: boolean;
    suggestionReasons?: boolean;
    taaIntegration?: boolean;
    fbExpertIntegration?: boolean;
    dioneraIntegration?: boolean;
    investmentAnalysis?: boolean;
    companyIntroductionPages?: boolean;
  };
}

export interface Subscription {
  plan_id: string;
  plan_name: string;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  valid_until: string;
  cancel_at_period_end: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  plan_name: string;
  status: 'paid' | 'pending' | 'failed';
  invoice_url?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface ConsultationNote {
  id: string;
  date: string;
  title: string;
  content: string;
  consultant_name: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  created_at: string;
  url: string;
}

// Virtual partner — linked to a customer via relationships[]
// user_id === null identifies it as virtual (cannot log in)
export interface VirtualPartner {
  id: string;                          // virtual customer _id
  main_customer_id: string;            // the real customer this is linked to
  rel_name: 'partner' | 'spouse';     // relationship type
  user_id: null;                       // always null — virtual flag

  // Personal data
  first_name: string;
  last_name: string;
  birth_name?: string;
  sex: 'm' | 'f' | 'd';
  birth_date: string;
  city_of_birth?: string;
  nationality: string;

  // Contact
  email?: string;
  phone?: string;
  mobile?: string;

  // Address (may share with main customer)
  street?: string;
  zip?: string;
  city?: string;

  // Employment
  employment: string;
  profession?: string;
  employer?: string;
  employed_since?: string;
  salary_gross?: number;
  salary_net?: number;

  // Health insurance
  kv_type: 'gesetzlich' | 'privat' | 'beihilfe';
  kv_provider?: string;
  kv_monthly?: number;
  smoker?: boolean;

  // Retirement
  retirement_age?: number;
  state_pension?: number;

  // Insurances
  has_bu?: boolean;
  bu_coverage?: number;
  has_life?: boolean;
  life_coverage?: number;

  // Meta
  created_at: string;
}

export type PrecautionWeighting = 'PROPERTY' | 'VERRY_IMPORTANT' | 'IMPORTANT' | 'NICE_TO_HAVE';
export type PropertyTimespan = 'SHORT' | 'MEDIUM' | 'LONG';
export type PrecautionStatus = 'UNDECIDED' | 'CONSULTATION_WANTED' | 'NO_CONSULTATION_WANTED' | 'CONSULTED_BUT_NO_TERMINATION';

export interface PrecautionType {
  id: string;
  type_id: string;
  name: string;
  icon: string;
  custom_view?: 'retirement_provisions' | 'health_insurance' | 'income' | 'decease' | 'nest_egg';
}

export interface PrecautionContract {
  id: string;
  precaution_type_id: string;
  company?: string;
  tariff?: string;
  fee: number;
  payment_frequency: 'monthly' | 'yearly' | 'quarterly';
  percentage: number;
  customer_wishes_contract?: boolean;
  hide_from_suggested_state?: boolean;
}

export interface Precaution {
  id: string;
  precaution_type: PrecautionType;
  weighting: PrecautionWeighting;
  property_timespan?: PropertyTimespan;
  status: PrecautionStatus;
  priority: number;
  progress_current_state?: number;
  progress_suggested_state?: number;
}

export interface CustomerConsultation {
  customer_id: string;
  precautions: Precaution[];
  current_state: PrecautionContract[];
  suggested_state: PrecautionContract[];
}
