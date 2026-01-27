'use client';

import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { XPDisplay, StreakDisplay, LevelProgress } from '@/components/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Brain, Code, ChevronRight, Trophy, Target, Zap } from 'lucide-react';

// Hardcoded user ID for demo - in real app this comes from auth
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

export default function Dashboard() {
  const { data: domains, isLoading: domainsLoading } = trpc.course.getDomains.useQuery();
  const { data: profile, isLoading: profileLoading } = trpc.gamification.getProfile.useQuery(undefined, {
    context: { headers: { 'x-user-id': TEST_USER_ID } },
  });
  const { data: achievements } = trpc.gamification.getAchievements.useQuery(undefined, {
    context: { headers: { 'x-user-id': TEST_USER_ID } },
  });

  const domainIcons: Record<string, React.ReactNode> = {
    python: <Code className="h-6 w-6" />,
    'data-science': <Brain className="h-6 w-6" />,
    'machine-learning': <Zap className="h-6 w-6" />,
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground">Continue your learning journey</p>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <>
                <XPDisplay xp={profile.totalXp || 0} />
                <StreakDisplay streak={profile.currentStreak || 0} />
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.level || 1}</div>
              <p className="text-xs text-muted-foreground">
                {profile?.levelProgress?.percentage || 0}% to next level
              </p>
              <Progress value={profile?.levelProgress?.percentage || 0} className="mt-2 h-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(profile?.totalXp || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Keep learning to earn more!</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.currentStreak || 0} days</div>
              <p className="text-xs text-muted-foreground">
                Longest: {profile?.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {achievements?.filter((a: any) => a.earned).length || 0} / {achievements?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
              <CardDescription>
                {profile.levelProgress?.current || 0} / {profile.levelProgress?.required || 100} XP to Level {(profile.level || 1) + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LevelProgress
                level={profile.level || 1}
                currentXP={profile.levelProgress?.current || 0}
                requiredXP={profile.levelProgress?.required || 100}
              />
            </CardContent>
          </Card>
        )}

        {/* Learning Domains */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Explore Domains</h2>
          {domainsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="h-4 w-48 bg-muted rounded mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {domains?.map((domain: any) => (
                <Card key={domain.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {domainIcons[domain.slug] || <BookOpen className="h-6 w-6" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{domain.name}</CardTitle>
                          <CardDescription>{domain.description}</CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Achievements Preview */}
        {achievements && achievements.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Achievements</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {achievements.slice(0, 4).map((achievement: any) => (
                <Card key={achievement.id} className={achievement.earned ? '' : 'opacity-50'}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className={`h-5 w-5 ${achievement.earned ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                      <CardTitle className="text-sm">{achievement.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <Badge variant={achievement.earned ? 'default' : 'outline'} className="mt-2">
                      {achievement.earned ? 'Earned' : `+${achievement.xpReward} XP`}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
