import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BrainCircuit, Play, Settings2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Input } from '@components/ui';
import { interviewApi, type InterviewSetupRequest } from '../api/interviewApi';

const DIFFICULTIES = ['JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD'];

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('MID_LEVEL');

  const { mutate: createInterview, isPending } = useMutation({
    mutationFn: (req: InterviewSetupRequest) => interviewApi.setupInterview(req),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview session created!');
      navigate(`/interview/${res.data.data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create interview');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInterview({ targetRole, difficulty, questionCount: 5 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10 text-primary-400 mb-6">
          <BrainCircuit size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-4">Configure Mock Interview</h1>
        <p className="text-slate-400 text-lg">
          We will generate a custom technical interview tailored to your uploaded resume and the role you're targeting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-8 border-surface-border">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Settings2 className="text-primary-400" size={20} /> Role Configuration
          </h3>
          
          <div className="space-y-6">
            <div>
              <Input
                label="Target Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, Backend Developer, Data Scientist"
                required
              />
              <p className="text-xs text-slate-500 mt-2">Questions will be generated specifically for this domain.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Difficulty Level</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DIFFICULTIES.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      difficulty === level 
                        ? 'border-primary-500 bg-primary-500/10' 
                        : 'border-surface-border bg-dark-900 hover:border-slate-500 hover:bg-dark-800'
                    }`}
                  >
                    {difficulty === level && (
                      <div className="absolute top-2 right-2 text-primary-400">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                    <span className={`block text-sm font-semibold capitalize ${difficulty === level ? 'text-primary-400' : 'text-slate-400'}`}>
                      {level.replace('_', ' ').toLowerCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-warning-400/5 border-warning-400/20">
          <div className="flex gap-4">
            <div className="mt-1 text-warning-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-warning-400 mb-1">Before you begin</h4>
              <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                <li>Ensure you are in a quiet environment.</li>
                <li>Your browser will ask for Microphone permissions.</li>
                <li>The AI will wait for you to finish speaking before grading.</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full md:w-auto rounded-full px-8 shadow-glow-primary" 
            loading={isPending}
          >
            Start Interview <Play size={18} className="ml-2" fill="currentColor" />
          </Button>
        </div>
      </form>
    </div>
  );
}
