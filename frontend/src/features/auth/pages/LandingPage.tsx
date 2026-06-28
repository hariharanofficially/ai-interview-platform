import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, FileText, Code2, LineChart, Mic, ArrowRight } from 'lucide-react';
import { Button, Card } from '@components/ui';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary-500/30 overflow-hidden relative">
      {/* Animated Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-primary-500" size={28} />
          <span className="text-xl font-bold tracking-tight text-white">ElevateAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/register">
            <Button size="sm" className="rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-surface-border text-sm font-medium text-slate-300 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            Introducing Gemini 1.5 Pro Integration
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
            Master your next interview with <span className="text-gradient">Artificial Intelligence.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ElevateAI is the most advanced platform to practice technical and behavioral interviews. Experience real-time voice conversations and live coding challenges graded by AI.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-glow-primary">
                Start Practicing Free <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base bg-surface/50 backdrop-blur-md">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Bento Box Features */}
        <motion.div 
          className="mt-32 grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Card className="md:col-span-2 bg-gradient-to-br from-surface to-dark-900 border-surface-border p-8 overflow-hidden group">
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-6">
                  <Mic size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Real-time Voice Interviews</h3>
                <p className="text-slate-400 text-lg max-w-md">Speak naturally. Our multimodal AI listens to your tone, transcribes your answer, and grades your technical accuracy instantly.</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-surface to-dark-900 border-surface-border p-8 overflow-hidden">
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                  <Code2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Live Coding</h3>
                <p className="text-slate-400">Integrated Monaco editor with real-time compilation and automated test case evaluation.</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-surface to-dark-900 border-surface-border p-8 overflow-hidden">
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                  <FileText size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">ATS Resume Parsing</h3>
                <p className="text-slate-400">Upload your PDF. We extract your skills and instantly generate custom interview questions tailored to your experience.</p>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-2 bg-gradient-to-br from-surface to-dark-900 border-surface-border p-8 overflow-hidden">
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6">
                  <LineChart size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Comprehensive Analytics</h3>
                <p className="text-slate-400 text-lg max-w-md">Track your progress over time. Identify your weaknesses with granular radar charts and AI-generated feedback loops.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
