import {
  ActivityIcon,
  CheckCircleIcon,
  ClockIcon,
  LeafyGreen,
  SendIcon,
  Share2Icon,
  TrendingUpIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { dummyAccountsData, dummyActivityData, dummyPostsData } from "../assets/assets";
import { data } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    scheduled: 0,
    published: 0,
    connectedAccounts: 0,
  });
  const [activites, setActivites] = useState<any[]>([]);
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [postsRes, accountsRes, activityRes] = [
        { data: dummyPostsData },
        { data: dummyAccountsData },
        { data: dummyActivityData },
      ]

      const posts = postsRes.data
      const accounts = accountsRes.data
      const activity = activityRes.data

      setStats({
        scheduled: posts.filter((p: any) => p.status === 'scheduled').length,
        published: posts.filter((p: any) => p.status === 'published').length,
        connectedAccounts: accounts.length,
      })

      setActivites(activity)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    }
  }

  fetchDashboardData()
}, [])

  const statCards = [
    {
      label: "Scheduled Posts",
      value: stats.scheduled,
      icon: ClockIcon,
      trend: "+2 today",
      color: "blue",
    },
    {
      label: "Published Posts",
      value: stats.published,
      icon: CheckCircleIcon,
      trend: "All time",
      color: "emerald",
    },
    {
      label: "Connected Accounts",
      value: stats.connectedAccounts,
      icon: Share2Icon,
      trend: "Active",
      color: "violet",
    },
  ];

  const colorStyles: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    violet: { bg: "bg-violet-50", text: "text-violet-600" },
  };

  return (
    <div className="space-y-8">
      {/* Welcome bar */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Good Morning!  </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Here's what's happening with your social accounts today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const colors = colorStyles[card.color];

          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`size-10 rounded-xl ${colors.bg} flex items-center justify-center`}
                >
                  <card.icon className={`size-5 ${colors.text}`} />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUpIcon className="size-3" />
                  {card.trend}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-semibold text-slate-900">
                  {card.value}
                </div>
                <p className="text-sm text-slate-500 mt-1">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Activity feed */}
      {/* Activity feed */}
<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
    <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
      {activites.length} events
    </span>
  </div>

  {activites.length === 0 ? (
    // Empty state
    <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
      <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
        <ActivityIcon className="size-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600">No activity yet</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Connect accounts and schedule posts to see events here.
      </p>
    </div>
  ) : (
    // Activity list
    <div className="divide-y divide-slate-100">
      {activites.map((activity) => (
        <div
          key={activity._id}
          className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <SendIcon className="size-4 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-800">Published</span>
              <span className="text-xs text-slate-400 shrink-0">
                {new Date(activity.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5 truncate">
              {activity.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
};

export default Dashboard;
