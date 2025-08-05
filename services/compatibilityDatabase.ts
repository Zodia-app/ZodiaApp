import { supabase } from '../lib/supabase';
import { CompatibilityAnalysis } from '../types/compatibility';

export interface CompatibilityReport {
  id: string;
  user_id: string;
  partner_name: string;
  user_sign: string;
  partner_sign: string;
  overall_score: number;
  analysis_data: CompatibilityAnalysis;
  created_at: string;
  updated_at: string;
}

export const compatibilityDatabase = {
  // Save a new compatibility report
  async saveReport(userId: string, analysis: CompatibilityAnalysis): Promise<CompatibilityReport> {
    const { data, error } = await supabase
      .from('compatibility_reports')
      .insert({
        user_id: userId,
        partner_name: analysis.user2.name,
        user_sign: analysis.user1.zodiacSign,
        partner_sign: analysis.user2.zodiacSign,
        overall_score: analysis.overallScore,
        analysis_data: analysis,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all reports for a user
  async getUserReports(userId: string, limit = 10): Promise<CompatibilityReport[]> {
    const { data, error } = await supabase
      .from('compatibility_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get a specific report
  async getReport(reportId: string): Promise<CompatibilityReport | null> {
    const { data, error } = await supabase
      .from('compatibility_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a report
  async deleteReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from('compatibility_reports')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
  },

  // Search reports by partner name
  async searchReports(userId: string, partnerName: string): Promise<CompatibilityReport[]> {
    const { data, error } = await supabase
      .from('compatibility_reports')
      .select('*')
      .eq('user_id', userId)
      .ilike('partner_name', `%${partnerName}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get report statistics
  async getReportStats(userId: string) {
    const { data, error } = await supabase
      .from('compatibility_reports')
      .select('overall_score, partner_sign')
      .eq('user_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        totalReports: 0,
        averageScore: 0,
        highestScore: 0,
        mostCompatibleSign: null,
      };
    }

    const scores = data.map(r => r.overall_score);
    const signCounts: { [key: string]: { count: number; totalScore: number } } = {};

    data.forEach(report => {
      if (!signCounts[report.partner_sign]) {
        signCounts[report.partner_sign] = { count: 0, totalScore: 0 };
      }
      signCounts[report.partner_sign].count++;
      signCounts[report.partner_sign].totalScore += report.overall_score;
    });

    const mostCompatibleSign = Object.entries(signCounts)
      .map(([sign, data]) => ({
        sign,
        averageScore: data.totalScore / data.count,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)[0];

    return {
      totalReports: data.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestScore: Math.max(...scores),
      mostCompatibleSign: mostCompatibleSign?.sign || null,
    };
  },
};