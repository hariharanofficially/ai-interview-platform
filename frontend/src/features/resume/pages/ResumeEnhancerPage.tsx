import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, UploadCloud, File, CheckCircle2, BrainCircuit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Card, Spinner, Badge, Skeleton } from '@components/ui';
import { resumeApi } from '../api/resumeApi';
import { useAuthStore } from '@store/authStore';

export default function ResumeEnhancerPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: resumeData, isLoading: isLoadingResume } = useQuery({
    queryKey: ['resume', user?.id],
    queryFn: () => resumeApi.getMyResume(),
  });

  const { mutate: uploadResume, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      const urlRes = await resumeApi.getUploadUrl(file.type);
      const url = urlRes.data?.data?.url;
      const key = urlRes.data?.data?.key;
      
      if (!url || !key) throw new Error("Failed to get upload URL");
      
      await resumeApi.uploadToS3(url, file);
      return resumeApi.processResume({
        fileKey: key,
        originalFilename: file.name,
        contentType: file.type,
        fileSize: file.size,
      });
    },
    onSuccess: () => {
      toast.success('Resume uploaded and analyzed successfully!');
      queryClient.invalidateQueries({ queryKey: ['resume', user?.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are supported');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      uploadResume(file);
    }
  }, [uploadResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading
  });

  const resume = resumeData?.data?.data;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileText className="text-primary-400" /> Resume Intelligence
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Upload your resume and let our AI extract your skills, analyze your experience, and tailor your future mock interviews to match your exact profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload & Current Status */}
        <div className="space-y-6 lg:col-span-1">
          <Card 
            {...getRootProps()} 
            className={`p-8 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-primary-500 bg-primary-500/10 scale-[1.02]' 
                : 'border-surface-border hover:border-slate-500 bg-surface hover:bg-surface-hover'
            }`}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="space-y-4 py-8">
                <Spinner size="lg" className="mx-auto" />
                <p className="text-sm font-medium text-slate-300">Analyzing with Gemini 1.5...</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-dark-800 flex items-center justify-center text-slate-400">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <p className="text-base font-medium text-white mb-1">
                    {isDragActive ? 'Drop your PDF here' : 'Click or drag PDF to upload'}
                  </p>
                  <p className="text-xs text-slate-500">Maximum file size: 5MB</p>
                </div>
              </div>
            )}
          </Card>

          {resume && (
            <Card className="p-6 bg-surface border-surface-border">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Current Resume</h3>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-500/10 text-primary-400 rounded-lg">
                  <File size={24} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate" title={resume.fileKey.split('/').pop()}>
                    {resume.fileKey.split('/').pop()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Successfully parsed & indexed</p>
                </div>
                <Badge variant="success"><CheckCircle2 size={12} className="mr-1" /> Active</Badge>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Parsed Data */}
        <div className="lg:col-span-2">
          {isLoadingResume ? (
            <Card className="p-8 border-surface-border space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </Card>
          ) : resume?.extractedData ? (
            <Card className="p-8 border-surface-border bg-gradient-to-b from-surface to-dark-900">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-surface-border">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">AI Extraction Results</h2>
                  <p className="text-slate-400 text-sm">We will use this data to generate tailored interview questions.</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full border-4 border-primary-500 bg-dark-900 text-xl font-bold text-white">
                    {resume.extractedData.atsScore || 85}
                  </div>
                  <p className="text-xs text-slate-500 font-medium uppercase mt-2">ATS Score</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Skills */}
                <div>
                  <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BrainCircuit size={16} /> Extracted Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resume.extractedData.skills?.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText size={16} /> Key Experience Summaries
                  </h3>
                  <div className="space-y-4">
                    {resume.extractedData.experience?.map((exp: any, i: number) => (
                      <div key={i} className="p-4 bg-dark-800 rounded-xl border border-surface-border relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500/50 group-hover:bg-primary-500 transition-colors" />
                        <h4 className="font-semibold text-white text-lg">{exp.title}</h4>
                        <p className="text-sm text-primary-400 font-medium mb-2">{exp.company}</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 border-surface-border border-dashed flex flex-col items-center justify-center text-center bg-surface/50">
              <div className="h-16 w-16 rounded-full bg-dark-800 flex items-center justify-center text-slate-500 mb-6">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Resume Found</h3>
              <p className="text-slate-400 max-w-md">
                Upload your resume on the left to extract your skills and enable highly personalized mock interviews.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
