import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { PatientLayout } from '../../ui/PatientLayout'

export function Community() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Diabetes Support Group',
      description: 'Support and tips for managing diabetes',
      members: 1234,
      posts: 89,
      category: 'Chronic Conditions',
      joined: false,
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Heart Health Community',
      description: 'Cardiovascular health discussions and support',
      members: 856,
      posts: 156,
      category: 'Heart Health',
      joined: true,
      lastActivity: '1 hour ago'
    },
    {
      id: 3,
      name: 'Mental Wellness Circle',
      description: 'Mental health support and mindfulness',
      members: 2145,
      posts: 234,
      category: 'Mental Health',
      joined: true,
      lastActivity: '30 minutes ago'
    },
    {
      id: 4,
      name: 'New Parents Support',
      description: 'Support for new parents and childcare tips',
      members: 678,
      posts: 123,
      category: 'Parenting',
      joined: false,
      lastActivity: '4 hours ago'
    }
  ])

  // navigation to a dedicated group page instead of inline detail

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Sarah M.',
      group: 'Heart Health Community',
      content: 'Just completed my first month of regular walking. Feeling much better!',
      time: '2 hours ago',
      likes: 12,
      comments: 5
    },
    {
      id: 2,
      author: 'Raj K.',
      group: 'Diabetes Support Group',
      content: 'Found a great recipe for diabetic-friendly desserts. Anyone interested?',
      time: '4 hours ago',
      likes: 8,
      comments: 3
    },
    {
      id: 3,
      author: 'Priya S.',
      group: 'Mental Wellness Circle',
      content: 'Meditation has really helped me manage stress. Highly recommend the 10-minute daily practice.',
      time: '6 hours ago',
      likes: 15,
      comments: 7
    }
  ])

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'joined' && group.joined) ||
                      (activeTab === 'available' && !group.joined)
    return matchesSearch && matchesTab
  })

  const handleJoinGroup = (groupId, e) => {
    // prevent card click
    if (e && e.stopPropagation) e.stopPropagation()
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g))
  }

  const openGroup = (groupId) => {
    route(`/patient/community/${groupId}`)
  }

  const handleAddPost = (groupName, content) => {
    if (!content || !content.trim()) return
    const newPost = {
      id: Date.now(),
      author: 'You',
      group: groupName,
      content: content.trim(),
      time: 'just now',
      likes: 0,
      comments: 0
    }
    setPosts(prev => [newPost, ...prev])
    // increment posts count in groups
    setGroups(prev => prev.map(g => g.name === groupName ? { ...g, posts: g.posts + 1 } : g))
    setComposerText('')
  }

  return (
    <PatientLayout title="Health Community" subtitle={`${filteredGroups.length} groups available`}>
      <div className="max-w-7xl mx-auto">
        {/* Search and Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search health groups..."
              />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Groups
              </button>
              <button
                onClick={() => setActiveTab('joined')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'joined' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                My Groups
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'available' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Available Groups
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {filteredGroups.length} groups found
              </h2>

              {filteredGroups.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
                  <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No groups found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or browse all groups</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGroups.map(group => (
                    <div 
                      key={group.id}
                      onClick={() => openGroup(group.id)}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl">👥</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{group.description}</p>
                              <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">👥 {group.members}</span>
                                <span className="flex items-center gap-1">📝 {group.posts}</span>
                                <span className="flex items-center gap-1">🕒 {group.lastActivity}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full sm:w-auto">
                          {group.joined ? (
                            <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-medium">
                              ✓ Joined
                            </span>
                          ) : (
                            <button 
                              onClick={(e) => handleJoinGroup(group.id, e)}
                              className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Join Group
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h2>
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">{post.author}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{post.time}</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mb-1">{post.group}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{post.content}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>👍 {post.likes}</span>
                          <span>💬 {post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-4">Community Guidelines</h2>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-400">
                <li>• Be respectful and supportive</li>
                <li>• Share experiences, not medical advice</li>
                <li>• Protect privacy - no personal details</li>
                <li>• Report inappropriate content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  )
}