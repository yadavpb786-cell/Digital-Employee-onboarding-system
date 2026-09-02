import React from 'react';
import { WelcomeHeader } from '../components/dashboard/WelcomeHeader';
import { ProgressCard } from '../components/dashboard/ProgressCard';
import { OnboardingChecklist } from '../components/dashboard/OnboardingChecklist';
import { FirstDayCard } from '../components/dashboard/FirstDayCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TrainingProgressCard } from '../components/dashboard/TrainingProgressCard';
import { AnnouncementsFeed } from '../components/dashboard/AnnouncementsFeed';
import { UpcomingEventsCard } from '../components/dashboard/UpcomingEventsCard';
import { HRSupportCard } from '../components/dashboard/HRSupportCard';
import { ProfileSummaryCard } from '../components/dashboard/ProfileSummaryCard';

export const DashboardPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Message Banner */}
      <WelcomeHeader />

      {/* 2. Onboarding Progress Gauge & Overview */}
      <ProgressCard />

      {/* 3 & 4. Primary Row: Getting Started Checklist + First Day Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <OnboardingChecklist />
        </div>
        <div className="lg:col-span-1">
          <FirstDayCard />
        </div>
      </div>

      {/* 5. Quick Actions grid */}
      <QuickActions />

      {/* 6. Training Progress modules */}
      <TrainingProgressCard />

      {/* 7, 8, 9. Information Grid Row: Announcements, Upcoming Schedule, HR & Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnnouncementsFeed />
        <UpcomingEventsCard />
        <div className="space-y-8 flex flex-col justify-between">
          <HRSupportCard />
          <ProfileSummaryCard />
        </div>
      </div>
    </div>
  );
};
