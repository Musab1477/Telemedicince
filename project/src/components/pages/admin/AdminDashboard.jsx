import { route } from 'preact-router'

export function AdminDashboard() {
  const handleVerifyEntities = () => {
    route('/admin/verify-entities')
  }

  const handleVerificationQueue = () => {
    route('/admin/verification-queue')
  }

  const handleViewLogs = () => {
    route('/admin/logs')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Platform Management</p>
            </div>
            <button 
              onClick={() => route('/')}
              className="bg-gray-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={handleVerifyEntities}
              className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              <div className="text-3xl mb-3">✅</div>
              <div className="text-lg font-medium mb-2">Verify Entities</div>
              <div className="text-sm opacity-90">Review hospital & doctor applications</div>
            </button>
            
            <button 
              onClick={handleVerificationQueue}
              className="bg-orange-600 text-white p-6 rounded-xl hover:bg-orange-700 transition-colors text-center"
            >
              <div className="text-3xl mb-3">📋</div>
              <div className="text-lg font-medium mb-2">Verification Queue</div>
              <div className="text-sm opacity-90">Manage bulk verification operations</div>
            </button>
            
            <button 
              onClick={handleViewLogs}
              className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-colors text-center"
            >
              <div className="text-3xl mb-3">📊</div>
              <div className="text-lg font-medium mb-2">System Logs</div>
              <div className="text-sm opacity-90">Monitor platform activities</div>
            </button>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Platform Overview</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">1,234</div>
                  <div className="text-sm text-gray-600">Total Hospitals</div>
                  <div className="text-xs text-green-600 mt-1">↑ 12% this month</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">5,678</div>
                  <div className="text-sm text-gray-600">Total Doctors</div>
                  <div className="text-xs text-green-600 mt-1">↑ 8% this month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">12,345</div>
                  <div className="text-sm text-gray-600">Total Patients</div>
                  <div className="text-xs text-green-600 mt-1">↑ 15% this month</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">2,456</div>
                  <div className="text-sm text-gray-600">Consultations</div>
                  <div className="text-xs text-green-600 mt-1">↑ 20% this month</div>
                </div>
              </div>

              {/* Verification Status */}
              <h3 className="text-md font-semibold text-gray-900 mb-4">Verification Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-yellow-900">Pending Hospital Verifications</h4>
                    <p className="text-sm text-yellow-800">23 hospitals waiting for approval</p>
                  </div>
                  <button 
                    onClick={handleVerifyEntities}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Review Now
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-blue-900">Pending Doctor Verifications</h4>
                    <p className="text-sm text-blue-800">45 doctors waiting for approval</p>
                  </div>
                  <button 
                    onClick={handleVerifyEntities}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Review Now
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Flagged Accounts</h4>
                    <p className="text-sm text-red-800">3 accounts flagged for review</p>
                  </div>
                  <button 
                    onClick={handleVerifyEntities}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Review Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-semibold text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-semibold text-blue-600">245ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Error Rate:</span>
                  <span className="font-semibold text-green-600">0.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users:</span>
                  <span className="font-semibold text-purple-600">1,456</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Hospital verified: Apollo Mumbai</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Doctor approved: Dr. Smith</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Account flagged for review</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleViewLogs}
                className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                View All Logs
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Today's Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>New Registrations:</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Verifications Done:</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Consultations:</span>
                  <span className="font-semibold">156</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}