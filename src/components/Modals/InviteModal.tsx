import React, { useState } from 'react';
import { X, Mail, UserPlus, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { emailService } from '../../services/email';
import { useAuth } from '../../contexts/AuthContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export default function InviteModal({ isOpen, onClose, projectId, projectName }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/invite?project=${projectId}&token=${Math.random().toString(36).substr(2, 9)}`;
    setInviteLink(link);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sendInvite = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    if (!user) {
      setError('You must be logged in to send invitations');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const inviteLink = `${window.location.origin}/invite?project=${projectId}&token=${Math.random().toString(36).substr(2, 9)}`;
      
      const success = await emailService.sendProjectInvite({
        to: email,
        projectName,
        projectId,
        inviterName: user.name,
        role: role === 'admin' ? 'Administrator' : 'Team Member',
        inviteLink
      });

      if (success) {
        setSuccess(`Invitation sent successfully to ${email}!`);
        setInviteLink(inviteLink);
        setEmail('');
        setRole('member');
      } else {
        setError('Failed to send invitation. Please try again.');
      }
      
    } catch (error) {
      setError('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invite Team Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {projectName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={sendInvite}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{isLoading ? 'Sending...' : 'Send Invite'}</span>
            </button>
            
            <button
              onClick={generateInviteLink}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Link</span>
            </button>
          </div>

          {inviteLink && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Share this link with team members to invite them to the project
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
