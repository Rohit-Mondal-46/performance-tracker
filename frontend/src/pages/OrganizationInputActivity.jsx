import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { organizationAPI } from '../services/api';
import { 
  Keyboard, 
  Mouse, 
  Calendar,
  Clock,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader,
  Users,
  Search
} from 'lucide-react';

export function OrganizationInputActivity() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationAPI.getMyEmployees();
      
      if (response.data.success) {
        setEmployees(response.data.data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (employeeId) => {
    try {
      setLoadingActivities(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/input-activity/organization/employee-intervals-with-screenshots?employee_id=${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Ensure we're setting an array
        const data = response.data.data;
        if (Array.isArray(data)) {
          setActivities(data);
        } else if (data && Array.isArray(data.intervals)) {
          setActivities(data.intervals);
        } else if (data && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else {
          console.warn('Unexpected data structure:', data);
          setActivities([]);
        }
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.response?.data?.message || 'Failed to load activity data');
      setActivities([]);
    } finally {
      setLoadingActivities(false);
      setIsRefreshing(false);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setActivities([]);
    setExpandedItems(new Set());
    const employeeId = employee.id || employee._id;
    if (employeeId) {
      fetchActivities(employeeId);
    } else {
      console.error('Employee ID not found:', employee);
      setError('Invalid employee ID');
    }
  };

  const handleRefresh = () => {
    if (selectedEmployee) {
      setIsRefreshing(true);
      const employeeId = selectedEmployee.id || selectedEmployee._id;
      if (employeeId) {
        fetchActivities(employeeId);
      } else {
        console.error('Employee ID not found:', selectedEmployee);
        setError('Invalid employee ID');
        setIsRefreshing(false);
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="text-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Loading Employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
              Employee Input Activity
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View keyboard and mouse activity with screenshots for your employees
            </p>
          </div>
          {selectedEmployee && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Employee List Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="glass backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employees</h2>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Employee List */}
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No employees found
                </p>
              ) : (
                filteredEmployees.map((employee) => {
                  const empId = employee.id || employee._id;
                  const selectedId = selectedEmployee?.id || selectedEmployee?._id;
                  const isSelected = selectedId === empId;
                  return (
                    <button
                      key={empId}
                      onClick={() => handleEmployeeSelect(employee)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="font-semibold">{employee.name}</p>
                      <p className={`text-sm ${
                        isSelected
                          ? 'text-blue-100'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {employee.email}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Activity Content */}
        <div className="lg:col-span-8 xl:col-span-9">
          {!selectedEmployee ? (
            <div className="glass backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg p-12 text-center">
              <Users className="h-20 w-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select an Employee
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose an employee from the list to view their input activity and screenshots
              </p>
            </div>
          ) : loadingActivities ? (
            <div className="glass backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg p-12 text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading Activity Data for {selectedEmployee.name}...
              </p>
            </div>
          ) : activities.length === 0 ? (
            <div className="glass backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg p-12 text-center">
              <Keyboard className="h-20 w-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Activity Data
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No input activity recorded for {selectedEmployee.name} yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Employee Info */}
              <div className="glass backdrop-blur-xl bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl border border-white/20 p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
                    <p className="text-blue-100">{selectedEmployee.email}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold">{activities.length}</p>
                    <p className="text-sm text-blue-100">Activity Sessions</p>
                  </div>
                </div>
              </div>

              {/* Screenshots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="group glass backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Screenshot */}
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      {activity.screenshot ? (
                        <>
                          <img
                            src={activity.screenshot.url}
                            alt="Activity Screenshot"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          
                          {/* Hover Overlay with Productivity Metrics */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                  <Keyboard className="h-4 w-4" />
                                  <span className="text-sm font-medium">Keyboard</span>
                                </div>
                                <span className="text-lg font-bold">
                                  {activity.productivity?.keyboard_contribution?.toFixed(1) || 0}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                  <Mouse className="h-4 w-4" />
                                  <span className="text-sm font-medium">Mouse</span>
                                </div>
                                <span className="text-lg font-bold">
                                  {activity.productivity?.mouse_contribution?.toFixed(1) || 0}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-white border-t border-white/20 pt-2">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="h-4 w-4" />
                                  <span className="text-sm font-medium">Productivity</span>
                                </div>
                                <span className="text-lg font-bold">
                                  {activity.productivity?.productive_percentage?.toFixed(1) || 0}%
                                </span>
                              </div>
                            </div>
                            
                            {/* View Full Size Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(activity.screenshot.url, '_blank');
                              }}
                              className="mt-3 w-full px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                              View Full Size
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Date and Time Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatDate(activity.interval_start)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(activity.interval_start)} - {formatTime(activity.interval_end)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}