import React, { useEffect, useState } from "react";
import { BookOpen, Upload, Users, CheckCircle } from "lucide-react";
import axios from "axios";

const API = process.env.REACT_APP_LMS_SERVICE_URL || "http://localhost:3002";

export default function LMS() {
  const [courses, setCourses] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API}/api/v1/courses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setCourses(r.data.courses || []))
      .catch(() => setCourses([]));
  }, []);

  const uploadMaterial = async () => {
    if (!file || !title) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    try {
      await axios.post(`${API}/api/v1/uploads/training-material`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploadMsg("Uploaded successfully!");
    } catch {
      setUploadMsg("Upload failed - check S3 config.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-1">Learning Management</h1>
      <p className="text-slate-400 mb-6">Manage training programs and track learner progress.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <BookOpen className="text-blue-400 mb-3" size={22} />
          <p className="text-2xl font-bold text-white">{courses.length}</p>
          <p className="text-slate-400 text-sm">Total Courses</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <Users className="text-green-400 mb-3" size={22} />
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-slate-400 text-sm">Active Enrollments</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <CheckCircle className="text-teal-400 mb-3" size={22} />
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-slate-400 text-sm">Completed This Month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-400" /> Available Courses
          </h2>
          {courses.length === 0 ? (
            <p className="text-slate-500 text-sm">No courses yet. Upload training materials to get started.</p>
          ) : (
            courses.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{c.title}</p>
                  <p className="text-slate-400 text-xs">{c.category} • {c.level}</p>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{c.duration} min</span>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Upload size={18} className="text-blue-400" /> Upload Training Material
          </h2>
          <input
            placeholder="Module title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 mb-3 focus:outline-none focus:border-blue-500 text-sm"
          />
          <input
            type="file"
            accept=".pdf,.mp4,.jpg,.png"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full text-slate-400 mb-3 text-sm"
          />
          <button
            onClick={uploadMaterial}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            Upload to S3
          </button>
          {uploadMsg && (
            <p className="mt-3 text-sm text-green-400 flex items-center gap-2">
              <CheckCircle size={14} /> {uploadMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
