// Run `npm run db:types` to regenerate this file from your live Supabase project.
// Hand-maintained fallback so the app type-checks before the first `db push`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ContactStatus = "active" | "unsubscribed" | "bounced" | "replied";
export type CampaignStatus = "draft" | "scheduled" | "running" | "paused" | "completed";
export type SendStatus = "queued" | "sent" | "failed" | "skipped";
export type ModuleCategory = "subject" | "hook" | "story" | "cta" | "proof" | "signoff";

export interface Contact {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  role: string | null;
  industry: string | null;
  city: string | null;
  whatsapp: string | null;
  source: string | null;
  referrer_name: string | null;
  status: ContactStatus;
  unsubscribed_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  daily_batch_size: number;
  send_hour_ist: number;
  timezone: string;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  track_unsubscribe: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailModule {
  id: string;
  category: ModuleCategory;
  variant_key: string;
  weight: number;
  body: string;
  is_active: boolean;
  created_at: string;
}

export interface SendLog {
  id: string;
  campaign_id: string;
  contact_id: string;
  day_index: number;
  scheduled_for: string;
  status: SendStatus;
  subject_used: string | null;
  body_used: string | null;
  provider_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

export interface VariationAssignment {
  id: string;
  campaign_id: string;
  contact_id: string;
  day_index: number;
  subject_key: string;
  hook_key: string;
  story_key: string;
  cta_key: string;
  proof_key: string;
  signoff_key: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      contacts:              { Row: Contact;            Insert: Partial<Contact>            & { email: string }; Update: Partial<Contact> };
      campaigns:             { Row: Campaign;           Insert: Partial<Campaign>           & { name: string; start_date: string; end_date: string; from_name: string; from_email: string }; Update: Partial<Campaign> };
      email_modules:         { Row: EmailModule;        Insert: Partial<EmailModule>        & { category: ModuleCategory; variant_key: string; body: string }; Update: Partial<EmailModule> };
      send_log:              { Row: SendLog;            Insert: Partial<SendLog>            & { campaign_id: string; contact_id: string; day_index: number; scheduled_for: string }; Update: Partial<SendLog> };
      variation_assignments: { Row: VariationAssignment; Insert: Partial<VariationAssignment> & { campaign_id: string; contact_id: string; day_index: number; subject_key: string; hook_key: string; story_key: string; cta_key: string; proof_key: string; signoff_key: string }; Update: Partial<VariationAssignment> };
    };
    Functions: {
      mark_unsubscribed: { Args: { p_email: string }; Returns: void };
    };
    Enums: {
      contact_status:  ContactStatus;
      campaign_status: CampaignStatus;
      send_status:     SendStatus;
    };
  };
}
