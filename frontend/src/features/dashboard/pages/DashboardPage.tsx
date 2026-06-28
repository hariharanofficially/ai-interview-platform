import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BrainCircuit, FileText, Trophy, Target, ArrowRight, Play, TrendingUp, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { profileApi } from '@features/profile/api/profileApi';
import { interviewApi } from '@features/interview/api/interviewApi';
import { resumeApi } from '@features/resume/api/resumeApi';
import { Card, Button, Skeleton } from '@components/ui';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
  });

  const { data: interviewsData, isLoading: isLoadingInterviews } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewApi.getMyInterviews(),
  });

  const { data: resumeDataResponse } = useQuery({
    queryKey: ['resume'],
    queryFn: () => resumeApi.getMyResume(),
  });

  const profile = profileData?.data?.data;
  const interviews = interviewsData?.data?.data || [];
  const hasResume = !!resumeDataResponse?.data?.data;

  const averageScore = interviews.length > 0 
    ? Math.round(interviews.reduce((acc: number, curr: any) => acc + (curr.overallScore || 0), 0) / interviews.length)
    : 0;

  const radarData = {
    labels: ['React', 'TypeScript', 'System Design', 'Algorithms', 'Communication', 'Behavioral'],
    datasets: [
      {
        label: 'Skill Proficiency',
        data: [85, 90, 75, 80, 95, 85], // Mock data for radar
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // primary-500
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#94a3b8', font: { size: 12 } },
        ticks: { display: false, max: 100, min: 0 },
      },
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  if (isLoadingProfile || isLoadingInterviews) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-transparent p-6 rounded-2xl border border-primary-500/20">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Welcome back, {profile?.firstName || 'Developer'}
            <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-slate-400 mt-1">
            You're in the top 15% of candidates for {profile?.targetRole || 'Software Engineering'} roles. Keep it up!
          </p>
        </div>
        <Link to="/interview/setup">
          <Button size="lg" className="rounded-full shadow-glow-primary">
            <Play className="mr-2" size={18} fill="currentColor" /> Start Interview
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-surface hover:bg-surface-hover transition-colors border-surface-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Interviews Completed</p>
              <h3 className="text-3xl font-bold text-white mt-2">{interviews.length}</h3>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
              <BrainCircuit size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-400 font-medium">
            <TrendingUp size={16} className="mr-1" /> +2 this week
          </div>
        </Card>

        <Card className="p-6 bg-surface hover:bg-surface-hover transition-colors border-surface-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Average Score</p>
              <h3 className="text-3xl font-bold text-white mt-2">{averageScore}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Trophy size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-400 font-medium">
            <TrendingUp size={16} className="mr-1" /> +5 points
          </div>
        </Card>

        <Card className="p-6 bg-surface hover:bg-surface-hover transition-colors border-surface-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Target Role</p>
              <h3 className="text-xl font-bold text-white mt-2 leading-tight truncate" title={profile?.targetRole || 'Not Set'}>
                {profile?.targetRole || 'Not Set'}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Target size={20} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/profile" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center">
              Update Profile <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-surface hover:bg-surface-hover transition-colors border-surface-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">ATS Resume Score</p>
              <h3 className="text-3xl font-bold text-white mt-2">{hasResume ? '85' : '--'}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/resume" className="text-sm text-amber-400 hover:text-amber-300 font-medium inline-flex items-center">
              {hasResume ? 'Improve Resume' : 'Upload Resume'} <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart area */}
        <Card className="lg:col-span-2 p-6 border-surface-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="text-primary-400" size={20} />
              Recent Interviews
            </h3>
            <Link to="/interview/setup">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {interviews.length > 0 ? (
              interviews.slice(0, 5).map((interview: any) => (
                <Link 
                  key={interview.id} 
                  to={`/interview/${interview.id}/report`}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-4 rounded-xl border border-surface-border bg-dark-900 group-hover:bg-dark-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-dark-800 border border-surface-border flex items-center justify-center text-slate-400 group-hover:text-primary-400 transition-colors">
                        <BrainCircuit size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{interview.targetRole}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="capitalize">{interview.difficulty.toLowerCase()}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(interview.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-400">{interview.overallScore || 0}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">Score</div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-surface-border rounded-xl">
                <BrainCircuit className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No interviews yet</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">Start your first mock interview to get baseline analytics and personalized feedback.</p>
                <Link to="/interview/setup">
                  <Button size="sm">Create Interview</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Skill Radar */}
        <Card className="p-6 border-surface-border">
          <h3 className="text-lg font-semibold text-white mb-6">Skill Analysis</h3>
          <div className="relative h-64 w-full">
            <Radar data={radarData} options={radarOptions} />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Strongest Skill</span>
              <span className="text-success-400 font-medium">Communication (95)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Needs Focus</span>
              <span className="text-warning-400 font-medium">System Design (75)</span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
