export const hairstyles = ['short', 'long', 'curly', 'bun', 'ponytail', 'buzz'] as const;
export const outfits = ['crew', 'hoodie', 'blazer', 'overalls', 'dress', 'jacket'] as const;
export const accessories = ['none', 'glasses', 'round-glasses', 'headphones', 'cap', 'beanie'] as const;
export const characterPresets = [
  { label: 'The Maker', style: 'curly', outfit: 'overalls', accessory: 'none', shirt: '#648d9f', skin: '#b67a55', hair: '#302332' },
  { label: 'The Dreamer', style: 'long', outfit: 'dress', accessory: 'round-glasses', shirt: '#8a70bc', skin: '#f1c9a6', hair: '#70452e' },
  { label: 'The Explorer', style: 'ponytail', outfit: 'jacket', accessory: 'cap', shirt: '#5c8e75', skin: '#d8a17b', hair: '#302332' },
  { label: 'The Thinker', style: 'bun', outfit: 'blazer', accessory: 'glasses', shirt: '#a46c65', skin: '#845538', hair: '#302332' },
  { label: 'The Listener', style: 'buzz', outfit: 'hoodie', accessory: 'headphones', shirt: '#b4845d', skin: '#563a31', hair: '#302332' },
  { label: 'The Daydream', style: 'short', outfit: 'crew', accessory: 'beanie', shirt: '#6997c6', skin: '#f1c9a6', hair: '#b8b5ca' },
] as const;
