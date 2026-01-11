import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { getGroups, saveGroups, getPosts, savePosts } from './communityStore'
import { PatientLayout } from '../../ui/PatientLayout'

export default function GroupPage({ id }) {
  const [groups, setGroups] = useState([])
  const [posts, setPosts] = useState([])
  const [composerText, setComposerText] = useState('')
  const groupId = parseInt(id, 10)

  useEffect(() => {
    // Load groups and posts from localStorage
    const loadedGroups = getGroups()
    const loadedPosts = getPosts()
    setGroups(loadedGroups)
    setPosts(loadedPosts)
    console.log('📥 Loaded posts from localStorage:', loadedPosts)
  }, [groupId])

  // Persist groups/posts when they change
  useEffect(() => {
    if (groups.length > 0) {
      saveGroups(groups)
      console.log('💾 Saved groups to localStorage')
    }
  }, [groups])

  useEffect(() => {
    if (posts.length > 0) {
      savePosts(posts)
      console.log('💾 Saved posts to localStorage:', posts)
    }
  }, [posts])

  const group = groups.find(g => g.id === groupId)
  if (!group) {
    return (
      <PatientLayout title="Group Not Found" subtitle="This community group could not be found">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Group not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">This community group may have been removed or doesn't exist</p>
            <button onClick={() => route('/patient/community')} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">Back to Communities</button>
          </div>
        </div>
      </PatientLayout>
    )
  }

  const groupPosts = posts.filter(p => p.group === group.name)

  const toggleJoin = () => {
    const updated = groups.map(g => g.id === groupId ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g)
    setGroups(updated)
  }

  const handleAddPost = () => {
    if (!composerText || !composerText.trim()) return
    
    // Get current user info from localStorage
    const currentUser = JSON.parse(localStorage.getItem('swasthlink_user') || '{}')
    const authorName = currentUser.name || 'Anonymous'
    
    const newPost = {
      id: Date.now(),
      author: authorName,
      group: group.name,
      content: composerText.trim(),
      time: 'just now',
      likes: 0,
      comments: 0
    }
    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    console.log('✅ New post added:', newPost)

    // increment posts count in groups (local update only)
    const updatedGroups = groups.map(g => g.name === group.name ? { ...g, posts: (g.posts || 0) + 1 } : g)
    setGroups(updatedGroups)

    setComposerText('')
  }

  return (
    <PatientLayout title={group.name} subtitle={`${group.members} members • ${group.category || 'Health Community'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => route('/patient/community')} 
          className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Communities</span>
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center text-3xl flex-shrink-0">👥</div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{group.name}</h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">👥 {group.members} members</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">📝 {group.posts} posts</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">🕒 {group.lastActivity}</span>
                  </div>
                </div>
                <div>
                  {group.joined ? (
                    <button onClick={toggleJoin} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-medium">✓ Joined</button>
                  ) : (
                    <button onClick={toggleJoin} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">Join Group</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300">{group.description}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Share with the group</label>
            <textarea
              placeholder="Share a message with this group..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              value={composerText}
              onInput={(e) => setComposerText(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button onClick={handleAddPost} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg">Post</button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Posts</h3>
            {groupPosts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to post!</p>
              </div>
            ) : (
              groupPosts.map(post => (
                <div key={post.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">👤</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">{post.author}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{post.time}</div>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{post.content}</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <button className="hover:text-green-600 dark:hover:text-green-400 transition-colors">👍 {post.likes}</button>
                        <button className="hover:text-green-600 dark:hover:text-green-400 transition-colors">💬 {post.comments}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
    </PatientLayout>
  )
}
