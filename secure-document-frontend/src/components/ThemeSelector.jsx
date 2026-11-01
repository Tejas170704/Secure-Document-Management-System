import { useEffect, useState } from "react";

function ThemeSelector() {

    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "professional"
    );

    useEffect(() => {

        const selectedTheme =
            theme === "professional"
                ? ""
                : theme;

        if (selectedTheme) {
            document.documentElement.setAttribute(
                "data-theme",
                selectedTheme
            );
        } else {
            document.documentElement.removeAttribute(
                "data-theme"
            );
        }

        localStorage.setItem("theme", theme);

    }, [theme]);


    return (
        <div className="theme-selector">

            <label htmlFor="theme-select">
                Theme
            </label>

            <select
                id="theme-select"
                value={theme}
                onChange={(event) =>
                    setTheme(event.target.value)
                }
            >

                <option value="professional">
                    ☀️ Professional
                </option>

                <option value="dark">
                    🌙 Dark
                </option>

                <option value="colorful">
                    🌈 Colorful
                </option>

            </select>

        </div>
    );
}

export default ThemeSelector;
