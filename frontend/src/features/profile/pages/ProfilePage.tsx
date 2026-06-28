import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import { MapPin, Phone, Briefcase, Link as LinkIcon, Save, X, BrainCircuit, ArrowRight, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Card, Spinner, Badge } from '@components/ui';
import { profileApi, type ProfileUpdateRequest } from '../api/profileApi';
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload';
import { interviewApi } from '@features/interview/api/interviewApi';

const schema = z.object({
  firstName: z.string().min(2).max(100),
  lastName:  z.string().min(2).max(100),
  phone:     z.string().max(20).nullable().optional(),
  location:  z.string().max(200).nullable().optional(),
  bio:       z.string().nullable().optional(),
  currentRole: z.string().max(200).nullable().optional(),
  targetRole:  z.string().max(200).nullable().optional(),
  yearsExperience: z.coerce.number().min(0).max(50).nullable().optional(),
  linkedinUrl: z.string().url().max(500).nullable().optional().or(z.literal('')),
  githubUrl:   z.string().url().max(500).nullable().optional().or(z.literal('')),
  portfolioUrl: z.string().url().max(500).nullable().optional().or(z.literal('')),
  skills:    z.array(z.string()).default([]),
});

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [skillInput, setSkillInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn:  () => profileApi.getProfile(),
  });
  
  const profile = data?.data?.data;

  const { data: interviewsData } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewApi.getMyInterviews(),
  });

  const interviews = interviewsData?.data?.data || [];

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (req: ProfileUpdateRequest) => profileApi.updateProfile(req),
    onSuccess: (res) => {
      toast.success('Profile updated successfully');
      queryClient.setQueryData(['profile'], res);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProfileUpdateRequest>({
    resolver: zodResolver(schema),
    defaultValues: { skills: [] },
  });

  const skills = watch('skills') || [];

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        currentRole: profile.currentRole || '',
        targetRole: profile.targetRole || '',
        yearsExperience: profile.yearsExperience ?? 0,
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
        skills: profile.skills || [],
      });
    }
  }, [profile, reset]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setValue('skills', [...skills, skillInput.trim()], { shouldDirty: true });
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue('skills', skills.filter((s) => s !== skillToRemove), { shouldDirty: true });
  };

  const onSubmit = (formData: ProfileUpdateRequest) => updateProfile(formData);

  if (isLoading || !profile) {
    return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <UserCircle className="text-primary-400" />
          My Profile
        </h1>
        <p className="text-slate-400 text-lg">Manage your personal information, career goals, and review past mock interviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photo & Interviews */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="p-8 border-surface-border text-center">
            <div className="flex justify-center mb-6">
              <ProfilePhotoUpload currentPhotoUrl={profile.photoUrl} name={profile.fullName} />
            </div>
            <h3 className="font-bold text-xl text-white tracking-tight">{profile.fullName}</h3>
            <p className="text-slate-400 text-sm mb-4">{profile.email}</p>
            {profile.currentRole && (
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                <Briefcase size={12} className="mr-1.5" />
                {profile.currentRole}
              </Badge>
            )}
          </Card>

          <Card className="p-6 border-surface-border bg-gradient-to-br from-surface to-dark-900">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BrainCircuit className="text-primary-400" />
                History
              </h3>
              <Link to="/interview/setup">
                <Button variant="outline" size="sm" className="h-8 rounded-md text-xs">New</Button>
              </Link>
            </div>

            {interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.map((interview: any) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg border border-surface-border hover:border-slate-700 transition-colors group">
                    <div className="overflow-hidden">
                      <p className="font-semibold text-white text-sm truncate" title={interview.targetRole}>{interview.targetRole}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(interview.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-base font-bold text-primary-400 leading-none">{interview.overallScore || 0}</p>
                      </div>
                      <Link to={`/interview/${interview.id}/report`}>
                        <div className="h-8 w-8 rounded-full bg-dark-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-primary-500 transition-colors">
                          <ArrowRight size={14} />
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-surface-border rounded-xl">
                No interviews completed yet.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Profile Form */}
        <div className="lg:col-span-2">
          <Card className="p-8 border-surface-border">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Personal Info */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-surface-border pb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
                  <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Phone" leftIcon={<Phone size={14} />} error={errors.phone?.message} {...register('phone')} />
                  <Input label="Location" leftIcon={<MapPin size={14} />} error={errors.location?.message} {...register('location')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full bg-dark-900 border border-surface-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Career Info */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-surface-border pb-3">
                  Career Goals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Current Role" placeholder="e.g. Software Engineer" error={errors.currentRole?.message} {...register('currentRole')} />
                  <Input label="Target Role" placeholder="e.g. Senior Backend Engineer" error={errors.targetRole?.message} {...register('targetRole')} />
                </div>
                <div>
                  <Input 
                    type="number" 
                    label="Years of Experience" 
                    min="0" 
                    max="50" 
                    error={errors.yearsExperience?.message}
                    {...register('yearsExperience')} 
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-surface-border pb-3">
                  Skills
                </h3>
                <div>
                  <Input
                    placeholder="Type a skill and press Enter..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm font-medium pr-1.5">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1.5 p-0.5 rounded-full text-slate-400 hover:text-danger-400 hover:bg-white/10 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-slate-500 text-sm">No skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-surface-border pb-3">
                  Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input label="LinkedIn" placeholder="URL" leftIcon={<LinkIcon size={14} />} error={errors.linkedinUrl?.message} {...register('linkedinUrl')} />
                  <Input label="GitHub" placeholder="URL" leftIcon={<LinkIcon size={14} />} error={errors.githubUrl?.message} {...register('githubUrl')} />
                  <Input label="Portfolio" placeholder="URL" leftIcon={<LinkIcon size={14} />} error={errors.portfolioUrl?.message} {...register('portfolioUrl')} />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-surface-border">
                <Button type="submit" loading={isUpdating} className="rounded-full px-8">
                  <Save size={16} className="mr-2" /> Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
