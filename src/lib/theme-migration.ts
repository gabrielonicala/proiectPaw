// Migration function to convert old theme names to new ones
export const migrateTheme = (oldTheme: string): string => {
  const themeMap: Record<string, string> = {
    'dark-academia': 'velour-nights',
    'melancholy': 'echoes-of-dawn',
    'shonen': 'blazeheart-saga',
    'cyberpunk': 'neon-ashes',
    'medieval': 'ivory-quill',
    'steampunk': 'ivory-quill',
    'fantasy': 'ivory-quill',
    'wild-west': 'wild-west', // Already correct, but included for completeness
    'crimson-tides': 'crimson-tides' // Already correct, but included for completeness
  };
  
  return themeMap[oldTheme] || oldTheme; // Return the original theme if not in migration map
};
