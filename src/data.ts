export const friends = [
  { id: 'maya', name: 'Maya', color: 'peach', note: 'Always has a good study playlist' },
  { id: 'jordan', name: 'Jordan', color: 'blue', note: 'The calm one with great notes' },
  { id: 'lebron', name: 'LeBron', color: 'lavender', note: 'Brings the best energy' },
] as const

export type FriendId = typeof friends[number]['id']
export type EnvironmentId = 'library' | 'garden' | 'cafe'

export const environments: { id: EnvironmentId; name: string; description: string; ambience: string }[] = [
  { id: 'library', name: 'The Library', description: 'A quiet place surrounded by books and warm lights.', ambience: 'Rain on the windows · warm lamplight' },
  { id: 'garden', name: 'The Garden', description: 'Fresh air, sunshine, and peaceful surroundings.', ambience: 'Soft breeze · falling petals' },
  { id: 'cafe', name: 'The Café', description: 'A cozy atmosphere with soft background chatter.', ambience: 'Rainy windows · fresh coffee' },
]

export const prompts = [
  "What's something good that happened this week?",
  'If you could travel anywhere right now, where would you go?',
  "What's your favorite study snack?",
  "What's one thing you're looking forward to?",
  "What's your dream place to study?",
  'What would you do with a completely free day?',
]
