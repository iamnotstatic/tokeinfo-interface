import { useEffect, useState } from 'react';

const useDarkMode = (): any => {
  const storedTheme = localStorage.getItem('theme');
  const [theme, setTheme] = useState(storedTheme || 'light');

  const colorTheme = theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(colorTheme);
    root.classList.add(theme);
  }, [theme, colorTheme]);

  return [colorTheme, setTheme];
};

export default useDarkMode;
