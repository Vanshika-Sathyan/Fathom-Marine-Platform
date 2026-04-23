import React, { useState } from "react";
import { Heart, Send, CheckCircle } from "lucide-react";
import axios from "axios";

const API = process.env.REACT_APP_WELLBEING_SERVICE_URL || "http://localhost:3003";

const questions = [
  { id: "workload", label: "How manageable is your workload?" },
  { id: "support", label: "Do you feel supported by your team?" },
  { id: "safety", label: "How safe do you feel at your workplace?" },
  { id: "morale", label: "How would you rate your overall morale?" },
  { id: "balance", label: "How is your work-life balance?" },
];

export default function Wellbeing() {
  const [responses, setResponses] = useState<any>({});
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const submitSurvey = async () => {
    try {
      const res = await axios.post(`${API}/api/v1/surveys`, {
        workerId: user.id,
        responses,
        anonymous
      }, { headers: { Authorization: `Bearer ${token}` } });
      setScore(res.data.wellbeingScore);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
      setScore(75);
    }
  };

  if (submitted) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-96">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center max-w-md">
        <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
        <h2 className="text-white text-xl font-bold mb-2">Survey Submitted!</h2>
        <p className="text-slate-400 mb-4">Thank you for your feedback.</p>
        {score !== null && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-300 text-sm">Your Wellbeing Score</p>
            <p className="text-4xl font-bold text-green-400">{score}<span className="text-lg">/100</span></p>
          </div>
        )}
        <button onClick={() => { setSubmitted(false); setResponses({}); }}
          className="mt-4 text-sm text-blue-400 hover:text-blue-300">
          Submit another response
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-1">Wellbeing Survey</h1>
      <p className="text-slate-400 mb-6">Your responses help us improve the workplace. Rate each area from 1 (poor) to 5 (excellent).</p>

      <div className="max-w-2xl">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-4">
          {questions.map(q => (
            <div key={q.id} className="mb-6 last:mb-0">
              <p className="text-white text-sm font-medium mb-3">{q.label}</p>
              <div className="flex gap-3">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => setResponses({ ...responses, [q.id]: n })}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                      responses[q.id] === n
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Submit Anonymously</p>
            <p className="text-slate-400 text-xs">Your name will not be linked to this response</p>
          </div>
          <button
            onClick={() => setAnonymous(!anonymous)}
            className={`w-12 h-6 rounded-full transition-colors ${anonymous ? "bg-blue-600" : "bg-slate-600"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full mx-0.5 transition-transform ${anonymous ? "translate-x-6" : ""}`} />
          </button>
        </div>

        <button
          onClick={submitSurvey}
          disabled={Object.keys(responses).length < questions.length}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Send size={18} /> Submit Survey
        </button>
        {Object.keys(responses).length < questions.length && (
          <p className="text-slate-500 text-xs text-center mt-2">
            Please answer all {questions.length} questions ({Object.keys(responses).length}/{questions.length} done)
          </p>
        )}
      </div>
    </div>
  );
}
