export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    balance: number | null
                    code: string
                    created_at: string | null
                    deposit_total: number | null
                    id: string
                    ref_code: string | null
                    team_count: number | null
                    user_id: string
                    verified: boolean | null
                    withdraw_total: number | null
                }
                Insert: {
                    balance?: number | null
                    code: string
                    created_at?: string | null
                    deposit_total?: number | null
                    id?: string
                    ref_code?: string | null
                    team_count?: number | null
                    user_id: string
                    verified?: boolean | null
                    withdraw_total?: number | null
                }
                Update: {
                    balance?: number | null
                    code?: string
                    created_at?: string | null
                    deposit_total?: number | null
                    id?: string
                    ref_code?: string | null
                    team_count?: number | null
                    user_id?: string
                    verified?: boolean | null
                    withdraw_total?: number | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            generate_profile_code: { Args: never; Returns: string }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
