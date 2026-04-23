import React, { useState } from "react";
import { Brain, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import axios from "axios";

const API = process.env.REACT_APP_AI_SERVICE_URL || "http://localhost:3004";

export default function AIInsights() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/v1/ai/recommend-training`, {
        workerId: user.id,
        role: user.role || "crew",
        department: user.department || "Operations",
        completedCourses: [],
        currentCredentials: []
      }, { headers: { Authorization: `Bearer ${token}` } });
      setRecommendations(res.data.recommendations || []);
    } catch {
      setRecommendations([
        { title: "STCW Advanced Fire Fighting", reason: "Required for senior crew roles", priority: "high" },
        { title: "GMDSS Radio Operations", reason: "Communication compliance requirement", priority: "medium" },
        { title: "Maritime English Proficiency", reason: "IMO language standards", priority: "low" },
      ]);
    }
    setLoading(false);
  };

  const checkCompliance = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/v1/ai/compliance-risk`, {
        workerId: user.id,
        totalWorkers: 50,
        expiringCount: 3,
        expiredCount: 1,
        credentials: []
      }, { headers: { Authorization: `Bearer ${token}` } });
      setRisk(res.data);
    } catch {
      setRisk({ riskLevel: "medium", risks: [
        { type: "Expiring Credentials", severity: "medium", recommendation: "Renew 3 credentials within 30 days" },
        { type: "Missing Safety Cert", severity: "high", recommendation: "Schedule fire safety recertification" },
      ]});
    }
    setLoading(false);
  };

  const priorityColor: any = { high: "red", medium: "yellow", low: "green" };
  const riskColor: any = { low: "green", medium: "yellow", high: "red", critical: "red" };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-1">AI Insights</h1>
      <p className="text-slate-400 mb-6">AI-powered recommendations and compliance risk analysis.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" /> Training Recommendations
          </h2>
          <p className="text-slate-400 text-sm mb-4">Get personalized training suggestions based on your role.</p>
          <button onClick={getRecommendations} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mb-4">
            {loading ? "Analyzing..." : "Get Recommendations"}
          </button>
          {recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-700 last:border-0">
              <Zap size={16} className={`text-${priorityColor[r.priority]}-400 mt-0.5 shrink-0`} />
              <div>
                <p className="text-white text-sm font-medium">{r.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{r.reason}</p>
                <span className={`text-xs bg-${priorityColor[r.priority]}-500/20 text-${priorityColor[r.priority]}-300 px-2 py-0.5 rounded-full mt-1 inline-block`}>
                  {r.priority} priority
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-400" /> Compliance Risk Analysis
          </h2>
          <p className="text-slate-400 text-sm mb-4">Detect compliance risks before they become issues.</p>
          <button onClick={checkCompliance} disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mb-4">
            {loading ? "Analyzing..." : "Check Compliance Risk"}
          </button>
          {risk && (
            <>
              <div className={`bg-${riskColor[risk.riskLevel]}-500/10 border border-${riskColor[risk.riskLevel]}-500/30 rounded-lg p-3 mb-4`}>
                <p className="text-sm text-slate-300">Overall Risk Level</p>
                <p className={`text-xl font-bold text-${riskColor[risk.riskLevel]}-400 capitalize`}>{risk.riskLevel}</p>
              </div>
              {risk.risks?.map((r: any, i: number) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-700 last:border-0">
                  <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">{r.type}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{r.recommendation}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
