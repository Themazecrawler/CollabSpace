import React, { useState } from 'react';
import { Brain, Sparkles, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { aiService } from '../../services/ai';
import { useProjects } from '../../contexts/ProjectContext';

export default function AIInsights() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState([
    {
      type: 'productivity',
      icon: TrendingUp,
      title: 'Productivity Boost',
      content: 'Your team completed 40% more tasks this week. Great momentum!',
      color: 'text-green-600 bg-green-50'
    },
    {
      type: 'bottleneck',
      icon: AlertCircle,
      title: 'Potential Bottleneck',
      content: 'The "Review" stage has 3 tasks waiting. Consider adding reviewers.',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      type: 'suggestion',
      icon: Lightbulb,
      title: 'Smart Suggestion',
      content: 'Break down large tasks into smaller ones for better tracking.',
      color: 'text-blue-600 bg-blue-50'
    }
  ]);

  const { projects } = useProjects();

  const generateIdeas = async () => {
    setIsGenerating(true);
    try {
      // Generate insights based on project data
      const projectData = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalTasks: projects.reduce((sum, p) => sum + p.tasks.length, 0)
      };

      const newInsights = await aiService.generateInsights(projectData);
      
      // Convert AI insights to display format
      const formattedInsights = newInsights.slice(0, 3).map((insight, index) => ({
        type: index === 0 ? 'productivity' : index === 1 ? 'bottleneck' : 'suggestion',
        icon: index === 0 ? TrendingUp : index === 1 ? AlertCircle : Lightbulb,
        title: index === 0 ? 'Productivity Insight' : index === 1 ? 'Potential Issue' : 'Smart Suggestion',
        content: insight,
        color: index === 0 ? 'text-green-600 bg-green-50' : index === 1 ? 'text-orange-600 bg-orange-50' : 'text-blue-600 bg-blue-50'
      }));

      setInsights(formattedInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      // Don't show error alert, just use mock data
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
      </div>

      <div className="space-y-3 mb-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex space-x-3 p-3 rounded-lg bg-gray-50">
            <div className={`p-1 rounded-full ${insight.color}`}>
              <insight.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{insight.title}</p>
              <p className="text-xs text-gray-600 mt-1">{insight.content}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={generateIdeas}
        disabled={isGenerating}
        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        <span>{isGenerating ? 'Generating Ideas...' : 'Generate New Ideas'}</span>
      </button>
    </div>
  );
}