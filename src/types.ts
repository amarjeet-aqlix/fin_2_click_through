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
