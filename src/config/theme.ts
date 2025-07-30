export const themes = {
  default: {
    primary: 'blue',
    secondary: 'gray',
    accent: 'green',
    warning: 'yellow',
    danger: 'red',
  },
  corporate: {
    primary: 'slate',
    secondary: 'gray',
    accent: 'blue',
    warning: 'amber',
    danger: 'red',
  },
  modern: {
    primary: 'indigo',
    secondary: 'gray',
    accent: 'emerald',
    warning: 'orange',
    danger: 'rose',
  },
  elegant: {
    primary: 'purple',
    secondary: 'gray',
    accent: 'teal',
    warning: 'yellow',
    danger: 'red',
  }
};

export type ThemeName = keyof typeof themes;

export const getThemeColors = (themeName: ThemeName = 'default') => {
  return themes[themeName];
};