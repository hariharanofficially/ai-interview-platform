import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Mic, Square, Loader2, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { Spinner } from '@components/ui';
import { interviewApi } from '../api/interviewApi';

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: sessionData, isLoading: isLoadingSession } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.getInterviewSession(id!),
    enabled: !!id,
  });

  const { mutate: uploadAndSubmit, isPending: isSubmitting } = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const urlRes = await interviewApi.getAudioUploadUrl('audio/webm');
      const { url, key } = urlRes.data.data;

      await fetch(url, {
        method: 'PUT',
        body: audioBlob,
        headers: { 'Content-Type': 'audio/webm' },
      });

      const questionId = sessionData?.data?.data?.questions[currentQuestionIndex].id;
      if (!questionId) throw new Error('Question not found');

      return interviewApi.submitAnswer(id!, questionId, key, 'audio/webm');
    },
    onSuccess: () => {
      toast.success('Answer evaluated successfully!');
      const totalQuestions = sessionData?.data?.data?.questions.length || 0;
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        navigate(`/interview/${id}/report`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to evaluate answer');
    }
  });

  useEffect(() => {
    return () => stopRecordingTimer();
  }, []);

  const startRecordingTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        uploadAndSubmit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startRecordingTimer();
    } catch (error) {
      toast.error('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopRecordingTimer();
    }
  };

  if (isLoadingSession || !sessionData) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  const session = sessionData?.data?.data;
  const totalQuestions = session?.questions?.length || 0;
  const currentQuestion = session?.questions?.[currentQuestionIndex];
  
  if (session?.status === 'COMPLETED') {
    navigate(`/interview/${id}/report`);
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col pt-8 pb-20">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-dark-800 border border-surface-border flex items-center justify-center text-primary-400">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h2 className="text-white font-semibold">{session?.targetRole}</h2>
            <p className="text-xs text-slate-400 capitalize">{session?.difficulty?.toLowerCase()} Interview</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-slate-400">Question</span>
          <span className="px-3 py-1 bg-dark-800 rounded-full text-white border border-surface-border">
            {currentQuestionIndex + 1} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Main Interview Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-16">
                {currentQuestion.questionText}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording Controls */}
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="flex justify-center h-32 items-center">
            {isSubmitting ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-50 animate-pulse-glow" />
                  <div className="relative h-20 w-20 bg-dark-900 border border-primary-500/30 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
                  </div>
                </div>
                <p className="text-sm font-medium text-primary-400 animate-pulse">Gemini 1.5 is evaluating...</p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="group relative h-20 w-20 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center text-white shadow-glow-primary transition-all hover:scale-105"
                  >
                    <Mic size={32} />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="group relative h-20 w-20 bg-danger-500 hover:bg-danger-600 rounded-full flex items-center justify-center text-white shadow-glow-danger transition-all hover:scale-105"
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-danger-500 animate-ping opacity-20" />
                    <Square size={28} className="fill-current" />
                  </button>
                )}
                
                <div className="h-6">
                  {isRecording ? (
                    <div className="flex items-center gap-2 text-danger-400 font-mono text-xl">
                      <span className="h-2 w-2 rounded-full bg-danger-500 animate-pulse" />
                      {formatTime(recordingTime)}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">Click the microphone to start your answer</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
