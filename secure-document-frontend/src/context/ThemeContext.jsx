import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });

    useEffect(() => {

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem(
            "theme",
            theme
        );

    }, [theme]);


    const changeTheme = (newTheme) => {
        setTheme(newTheme);
    };


    return (
        <ThemeContext.Provider
            value={{
                theme,
                changeTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};


export const useTheme = () => {

    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
};