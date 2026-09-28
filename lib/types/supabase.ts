/**
 * supabase/migrations/0001_init.sql 스키마와 1:1로 대응하는 타입.
 * 스키마를 바꾸면 이 파일도 같이 업데이트할 것.
 * (추후 `supabase gen types typescript`로 자동 생성한 파일로 교체해도 무방)
 */

import type { DiagnosisType, Answer, DiagnosisResult } from './diagnosis';

export interface DiagnosisResultRow {
  id: string;
  nickname: string;
  access_token: string;
  diagnosis_type: DiagnosisType;
  answers_json: Answer[];
  result_json: DiagnosisResult;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type AdminAuditAction = 'view' | 'pdf_download' | 'export';

export interface AdminAuditLogRow {
  id: string;
  admin_id: string;
  result_id: string | null;
  action: AdminAuditAction;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      diagnosis_results: {
        Row: DiagnosisResultRow;
        Insert: Omit<DiagnosisResultRow, 'id' | 'access_token' | 'created_at'> & {
          id?: string;
          access_token?: string;
          created_at?: string;
        };
        Update: Partial<DiagnosisResultRow>;
      };
      admin_audit_logs: {
        Row: AdminAuditLogRow;
        Insert: Omit<AdminAuditLogRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AdminAuditLogRow>;
      };
    };
  };
}
