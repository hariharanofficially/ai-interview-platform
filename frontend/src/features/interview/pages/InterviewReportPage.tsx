import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BrainCircuit, ChevronLeft, Target, Trophy, CheckCircle2, Mic, Activity } from 'lucide-react';
import { Card, Spinner, Badge } from '@components/ui';
import { interviewApi } from '../api/interviewApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function InterviewReportPage() {
  const { id } = useParams<{ id: string }>();

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.getInterviewSession(id!),
    enabled: !!id,
  });

  if (isLoading || !sessionData || !sessionData.data.data) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  const session = sessionData.data.data;
  const questions = session.questions || [];

  const chartData = {
    labels: questions.map((_: any, i: number) => `Q${i + 1}`),
    datasets: [
      {
        label: 'Score (0-100)',
        data: questions.map((q: any) => q.score || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // primary-500/20
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.4)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#121212',
        titleColor: '#EDEDED',
        bodyColor: '#A1A1AA',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Fira Code' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter' } },
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="h-10 w-10 flex items-center justify-center rounded-full bg-surface border border-surface-border text-slate-400 hover:text-white hover:bg-surface-hover transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white tracking-tight">
            Interview Report
          </h1>
          <p className="text-slate-400 mt-1">Detailed analytics and Gemini 1.5 feedback for your mock interview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-surface-border bg-gradient-to-br from-surface to-dark-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Overall Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white tracking-tight">{session.overallScore || 0}</span>
                <span className="text-lg text-slate-500 font-medium">/100</span>
              </div>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
              <Trophy size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-surface-border bg-gradient-to-br from-surface to-dark-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Target Role</p>
              <span className="text-xl font-bold text-white tracking-tight line-clamp-1" title={session.targetRole}>{session.targetRole}</span>
              <p className="text-xs text-slate-400 capitalize mt-1 flex items-center gap-1">
                <Target size={12} /> {session.difficulty.toLowerCase()} Level
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-surface-border bg-gradient-to-br from-surface to-dark-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Completion</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white tracking-tight">
                  {questions.filter((q: any) => q.score != null).length}
                </span>
                <span className="text-lg text-slate-500 font-medium">/ {questions.length}</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8 border-surface-border">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2 tracking-tight">
            <Activity className="text-primary-400" size={20} /> Performance Distribution
          </h3>
        </div>
        <div className="h-72 w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>

      <div className="space-y-6 pt-6 border-t border-surface-border">
        <h3 className="text-xl font-semibold text-white tracking-tight px-2">Question Breakdown</h3>
        
        {questions.map((q: any, index: number) => (
          <Card key={q.id} className="p-8 border-surface-border bg-surface hover:border-slate-700 transition-colors space-y-6 group">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-2 block">
                  Question {index + 1}
                </span>
                <h4 className="text-xl font-medium text-white leading-snug">{q.questionText}</h4>
              </div>
              <div className="shrink-0 flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-bold text-white tracking-tight">{q.score || 0}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Score</span>
                </div>
              </div>
            </div>

            {q.userAnswerTranscript && (
              <div className="bg-dark-900 rounded-xl border border-surface-border p-6 mt-6">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Mic size={14} /> Transcript
                </h5>
                <p className="text-slate-300 leading-relaxed font-medium">"{q.userAnswerTranscript}"</p>
              </div>
            )}

            {q.aiFeedback && (
              <div className="bg-primary-500/5 rounded-xl border border-primary-500/20 p-6">
                <h5 className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BrainCircuit size={14} /> AI Evaluation
                </h5>
                <p className="text-slate-200 leading-relaxed">{q.aiFeedback}</p>
              </div>
            )}

            {q.expectedKeyPoints && q.expectedKeyPoints.length > 0 && (
              <div className="pt-4 border-t border-surface-border/50">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Expected Concepts
                </h5>
                <div className="flex flex-wrap gap-2">
                  {q.expectedKeyPoints.map((kp: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {kp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
