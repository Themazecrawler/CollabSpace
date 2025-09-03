import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Users,
  BarChart3,
  PieChart,
  Activity,
  Calendar
} from 'lucide-react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Mock analytics data
      const mockAnalytics = {
        totalProjects: 4,
        activeProjects: 3,
        totalTasks: 25,
        completedTasks: 18,
        teamMembers: 6,
        productivity: 85,
        projectPerformance: [
          { name: 'Website Redesign', completion: 75, tasks: 12, efficiency: 'High' },
          { name: 'Mobile App', completion: 45, tasks: 8, efficiency: 'Medium' },
          { name: 'Marketing Campaign', completion: 90, tasks: 6, efficiency: 'High' },
          { name: 'API Integration', completion: 30, tasks: 15, efficiency: 'Low' }
        ],
        recentActivity: [
          { action: 'Task completed', project: 'Website Redesign', time: '2 hours ago' },
          { action: 'New team member added', project: 'Mobile App', time: '1 day ago' },
          { action: 'Project milestone reached', project: 'Marketing Campaign', time: '3 days ago' }
        ]
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Use default analytics data if there's an error
      setAnalytics({
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        teamMembers: 0,
        productivity: 0,
        projectPerformance: [],
        recentActivity: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Active Projects',
      value: analytics?.activeProjects || 0,
      change: `+${analytics?.activeProjects || 0} this week`,
      trend: 'up',
      icon: Target,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Total Tasks',
      value: analytics?.totalTasks || 0,
      change: `${analytics?.completedTasks || 0} completed`,
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Team Productivity',
      value: `${analytics?.productivity || 0}%`,
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Team Members',
      value: analytics?.teamMembers || 0,
      change: '+2 this month',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  const projectPerformance = [
    { name: 'Website Redesign', completion: 75, tasks: 12, efficiency: 'High' },
    { name: 'Mobile App', completion: 45, tasks: 8, efficiency: 'Medium' },
    { name: 'Marketing Campaign', completion: 90, tasks: 6, efficiency: 'High' },
    { name: 'API Integration', completion: 30, tasks: 15, efficiency: 'Low' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your team's performance and productivity insights</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select className="border-none focus:ring-0 focus:outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>This year</option>
            </select>
          </div>
          
          <button 
            onClick={() => {
              const reportData = {
                analytics,
                projectPerformance,
                generatedAt: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                <span>{metric.change}</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Weekly Progress</h2>
          </div>
          
          <div className="space-y-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const progress = [65, 80, 45, 90, 75, 30, 85][index];
              return (
                <div key={day} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-8">{day}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10">{progress}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Task Distribution</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { status: 'Completed', count: 24, color: 'bg-green-500', percentage: 40 },
              { status: 'In Progress', count: 18, color: 'bg-blue-500', percentage: 30 },
              { status: 'To Do', count: 12, color: 'bg-gray-400', percentage: 20 },
              { status: 'Review', count: 6, color: 'bg-orange-500', percentage: 10 }
            ].map(item => (
              <div key={item.status} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm text-gray-700 flex-1">{item.status}</span>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Project Performance</h2>
          </div>
          <button 
            onClick={() => {
              const detailsWindow = window.open('', '_blank');
              if (detailsWindow) {
                detailsWindow.document.write(`
                  <html>
                    <head><title>Project Performance Details</title></head>
                    <body>
                      <h1>Project Performance Details</h1>
                      <table border="1" style="width:100%; border-collapse: collapse;">
                        <tr><th>Project</th><th>Completion</th><th>Tasks</th><th>Efficiency</th></tr>
                        ${projectPerformance.map(p => `
                          <tr>
                            <td>${p.name}</td>
                            <td>${p.completion}%</td>
                            <td>${p.tasks}</td>
                            <td>${p.efficiency}</td>
                          </tr>
                        `).join('')}
                      </table>
                    </body>
                  </html>
                `);
                detailsWindow.document.close();
              }
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View details
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Project</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Completion</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tasks</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {projectPerformance.map((project, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{project.name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${project.completion}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{project.completion}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">{project.tasks}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.efficiency === 'High' ? 'text-green-700 bg-green-100' :
                      project.efficiency === 'Medium' ? 'text-yellow-700 bg-yellow-100' :
                      'text-red-700 bg-red-100'
                    }`}>
                      {project.efficiency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}