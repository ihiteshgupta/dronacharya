'use client';

import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Star,
  Zap,
  Flame,
  BookOpen,
  Award,
  Lock,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const achievementCategories = [
  { id: 'all', label: 'All', icon: Trophy },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'streak', label: 'Streaks', icon: Flame },
  { id: 'mastery', label: 'Mastery', icon: Star },
  { id: 'special', label: 'Special', icon: Award },
];

const categoryColors: Record<string, string> = {
  learning: 'from-emerald-400 to-cyan-500',
  streak: 'from-amber-400 to-rose-500',
  mastery: 'from-violet-400 to-purple-500',
  special: 'from-amber-400 via-amber-500 to-rose-500',
};

export default function AchievementsPage() {
  const { data: achievements, isLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: profile } = trpc.gamification.getProfile.useQuery();

  const earnedCount = achievements?.filter((a) => a.earned).length || 0;
  const totalCount = achievements?.length || 0;
  const progressPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Achievements</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your progress and unlock rewards
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl gradient-brand shrink-0">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold tabular-nums">{earnedCount}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted shrink-0">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold tabular-nums">{totalCount - earnedCount}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Locked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-amber/20 shrink-0">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-amber" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold tabular-nums">{(profile?.totalXp || 0).toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total XP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-rose/20 shrink-0">
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-rose" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold tabular-nums">{profile?.longestStreak || 0}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Best Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Achievement Progress</span>
              <span className="text-sm text-muted-foreground">
                {earnedCount} / {totalCount}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progressPercentage)}% complete - {totalCount - earnedCount} achievements remaining
            </p>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full sm:w-auto overflow-x-auto flex-nowrap">
            {achievementCategories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
                <cat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.slice(0, 3)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="h-16 w-16 rounded-xl bg-muted mb-4" />
                      <div className="h-5 w-32 bg-muted rounded mb-2" />
                      <div className="h-4 w-48 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                achievements?.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={cn(
                      'card-hover border-0 shadow-md relative overflow-hidden',
                      !achievement.earned && 'opacity-70'
                    )}
                  >
                    {achievement.earned && (
                      <div className="absolute top-0 left-0 right-0 h-1 gradient-success" />
                    )}
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Badge Icon */}
                        <div className={cn(
                          'relative p-3 sm:p-4 rounded-lg sm:rounded-xl shrink-0',
                          achievement.earned
                            ? `bg-gradient-to-br ${categoryColors[achievement.category] || 'from-slate-400 to-slate-500'}`
                            : 'bg-muted'
                        )}>
                          <Trophy className={cn(
                            'h-6 w-6 sm:h-8 sm:w-8',
                            achievement.earned ? 'text-white animate-float' : 'text-muted-foreground'
                          )} />
                          {achievement.earned && (
                            <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-emerald bg-background rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{achievement.name}</h3>
                            <Badge variant="outline" className="text-xs capitalize shrink-0">
                              {achievement.category}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                            {achievement.description}
                          </p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <Badge
                              className={cn(
                                'shrink-0',
                                achievement.earned
                                  ? 'gradient-success text-white border-0'
                                  : 'bg-amber/15 text-amber border-0'
                              )}
                            >
                              {achievement.earned ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" /> Earned
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3 w-3 mr-1" /> +{achievement.xpReward} XP
                                </>
                              )}
                            </Badge>
                            {achievement.earnedAt && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                                <Clock className="h-3 w-3" />
                                {new Date(achievement.earnedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Other category tabs show same but filtered */}
          {achievementCategories.slice(1).map((cat) => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-0 shadow-md border-dashed">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      Category filtering coming soon...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
