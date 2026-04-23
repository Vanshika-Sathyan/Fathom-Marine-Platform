const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(helmet()); app.use(cors()); app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/v1/ai/recommend-training
app.post('/api/v1/ai/recommend-training', async (req, res) => {
  try {
    const { workerId, currentCredentials, completedCourses, role, department } = req.body;

    const prompt = `You are a training recommendation AI for Fathom Marine Consultants.
Worker Profile:
- Role: ${role}
- Department: ${department}
- Current Credentials: ${currentCredentials?.join(', ') || 'None'}
- Completed Courses: ${completedCourses?.join(', ') || 'None'}

Recommend 3 specific training courses this worker should take next. 
Focus on maritime industry compliance, safety, and skill development.
Return JSON array: [{"title":"...", "reason":"...", "priority":"high|medium|low"}]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const recommendations = JSON.parse(completion.choices[0].message.content);
    res.json({ recommendations });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/v1/ai/wellbeing-insights
app.post('/api/v1/ai/wellbeing-insights', async (req, res) => {
  try {
    const { averageScore, atRiskCount, totalResponses, recentTrends } = req.body;

    const prompt = `Analyze this employee wellbeing data for a maritime company:
- Average Score: ${averageScore}/5
- At-Risk Employees: ${atRiskCount}
- Total Survey Responses: ${totalResponses}
- Trends: ${JSON.stringify(recentTrends)}

Provide 3 actionable insights and recommendations.
Return JSON: {"insights": [{"title":"...","description":"...","action":"..."}], "overallRisk":"low|medium|high"}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/v1/ai/compliance-risk
app.post('/api/v1/ai/compliance-risk', async (req, res) => {
  try {
    const { credentials, expiringCount, expiredCount, totalWorkers } = req.body;

    const prompt = `Analyze compliance risk for a maritime company:
- Total Workers: ${totalWorkers}
- Expiring Credentials (30 days): ${expiringCount}
- Expired Credentials: ${expiredCount}
- Credential Types: ${JSON.stringify(credentials)}

Identify risks and provide compliance recommendations.
Return JSON: {"riskLevel":"low|medium|high|critical","risks":[{"type":"...","severity":"...","recommendation":"..."}]}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/v1/ai/chat — AI Assistant
app.post('/api/v1/ai/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    const systemMessage = `You are Fathom AI, a helpful assistant for Fathom Marine Consultants. 
You help with credential management, training guidance, compliance, and wellbeing.
Context: ${JSON.stringify(context || {})}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemMessage }, ...messages]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ai-service' }));

app.listen(process.env.PORT || 3004, () => console.log('AI Service running on port 3004'));