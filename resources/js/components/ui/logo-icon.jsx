import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils.js';
import sparkLight from '../../assets/images/spark-light.png';
import sparkDark from '../../assets/images/spark-dark.png';

export default function LogoIcon({ className = '', ...props }) {
    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        const updateDarkMode = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        const observer = new MutationObserver(updateDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        updateDarkMode();

        return () => observer.disconnect();
    }, []);

    return (
        <img
            src={isDarkMode ? sparkLight : sparkDark}
            alt="Spark logo"
            className={cn('h-8', className)}
            {...props}
        />
    );
}
