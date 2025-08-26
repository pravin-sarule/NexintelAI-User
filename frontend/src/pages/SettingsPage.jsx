import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell, Palette, Globe, Download, Trash2, LogOut, ChevronRight, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

const SettingsPage = () => {
  const { theme, setTheme } = useTheme(); // Use context for theme
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });
  const [userData, setUserData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: 'January 2024'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleProfileSave = () => {
    setIsEditingProfile(false);
    // Here you would typically save to your backend
  };

  const SettingSection = ({ icon: Icon, title, children, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-gray-600 mr-3" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && <div className="text-sm text-gray-500">{description}</div>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-green-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          
          {/* Account Section */}
          <SettingSection icon={User} title="Account">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{userData.fullName}</div>
                    <div className="text-sm text-gray-500">Joined {userData.joinDate}</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditingProfile ? (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={userData.fullName}
                      onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({...userData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={userData.location}
                      onChange={(e) => setUserData({...userData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleProfileSave}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{userData.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{userData.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{userData.location}</span>
                  </div>
                </div>
              )}
            </div>
          </SettingSection>

          {/* Appearance */}
          <SettingSection icon={Palette} title="Appearance">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {['light', 'dark'].map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => handleThemeChange(themeOption)}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      theme === themeOption
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${
                          themeOption === 'light' ? 'bg-white border-2 border-gray-300' : 'bg-gray-800'
                        }`} />
                        <span className="text-sm font-medium capitalize">{themeOption}</span>
                      </div>
                      {theme === themeOption && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </SettingSection>

          {/* Language & Region */}
          <SettingSection icon={Globe} title="Language & Region">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                  <option value="German">Deutsch</option>
                  <option value="Chinese">中文</option>
                </select>
              </div>
            </div>
          </SettingSection>

          {/* Notifications */}
          <SettingSection icon={Bell} title="Notifications">
            <div className="space-y-1">
              <ToggleSwitch
                enabled={notifications.email}
                onChange={() => handleNotificationChange('email')}
                label="Email notifications"
                description="Receive updates about your conversations via email"
              />
              <ToggleSwitch
                enabled={notifications.push}
                onChange={() => handleNotificationChange('push')}
                label="Push notifications"
                description="Get notified about important updates"
              />
              <ToggleSwitch
                enabled={notifications.marketing}
                onChange={() => handleNotificationChange('marketing')}
                label="Marketing emails"
                description="Receive product updates and feature announcements"
              />
            </div>
          </SettingSection>

          {/* Privacy & Security */}
          <SettingSection icon={Shield} title="Privacy & Security">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium text-gray-900">Two-factor authentication</div>
                  <div className="text-sm text-gray-500">Add an extra layer of security</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium text-gray-900">Login activity</div>
                  <div className="text-sm text-gray-500">See your recent login history</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">Connected apps</div>
                  <div className="text-sm text-gray-500">Manage third-party integrations</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </SettingSection>

          {/* Data & Storage */}
          <SettingSection icon={Download} title="Data & Storage">
            <div className="space-y-3">
              <button className="flex items-center justify-between w-full py-3 text-left">
                <div>
                  <div className="text-sm font-medium text-gray-900">Export data</div>
                  <div className="text-sm text-gray-500">Download your conversation history</div>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </button>
              <div className="border-t pt-3">
                <button className="flex items-center text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Delete all conversations</span>
                </button>
              </div>
            </div>
          </SettingSection>

          {/* Account Actions */}
          <SettingSection icon={LogOut} title="Account Actions" className="border-red-200">
            <div className="space-y-3">
              <button className="flex items-center text-red-600 hover:text-red-700">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Sign out</span>
              </button>
              <div className="border-t pt-3">
                <button className="flex items-center text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Delete account</span>
                </button>
                <p className="text-xs text-gray-500 mt-1">This action cannot be undone</p>
              </div>
            </div>
          </SettingSection>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;