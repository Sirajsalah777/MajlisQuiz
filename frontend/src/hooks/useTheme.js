import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';

export const useTheme = () => {
  const theme = 'light'; // Thème fixe à 'light'

  useEffect(() => {
    // Appliquer le thème au body (toujours 'light')
    document.body.className = theme;
    // Supprimer la sauvegarde du thème dans le localStorage car il est fixe
    localStorage.removeItem('theme');
  }, [theme]);

  return { theme };
}; 