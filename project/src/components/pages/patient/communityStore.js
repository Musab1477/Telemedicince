// Simple localStorage-backed store for community groups and posts
const GROUPS_KEY = 'community:groups'
const POSTS_KEY = 'community:posts'

const defaultGroups = [
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
]

const defaultPosts = [
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
]

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.warn('communityStore read error', e)
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('communityStore write error', e)
  }
}

export function getGroups() {
  const groups = readJSON(GROUPS_KEY, null)
  if (!groups) {
    writeJSON(GROUPS_KEY, defaultGroups)
    return defaultGroups.slice()
  }
  return groups
}

export function saveGroups(groups) {
  writeJSON(GROUPS_KEY, groups)
}

export function getPosts() {
  const posts = readJSON(POSTS_KEY, null)
  if (!posts) {
    writeJSON(POSTS_KEY, defaultPosts)
    return defaultPosts.slice()
  }
  return posts
}

export function savePosts(posts) {
  writeJSON(POSTS_KEY, posts)
}
