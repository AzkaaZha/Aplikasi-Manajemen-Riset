import { createContext, useState, useEffect } from "react";
import { getToken, saveToken, removeToken } from "../utils/tokenStorage";
import { getMe } from "../api/authApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (err) {
                console.error("Failed to parse initial user", err);
                return null;
            }
        }
        return null;
    });
    const [token, setTokenState] = useState(getToken());
    const [isLoading, setIsLoading] = useState(false); // No longer loading since we hydrate sync

    useEffect(() => {
        if (!token) {
            setUser(null);
            return;
        }

        const restoreUser = async () => {
            setIsLoading(true);
            try {
                const userData = await getMe();
                setUser(userData);
            } catch (err) {
                removeToken();
                setTokenState(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (!user) {
            restoreUser();
        }
    }, [token]);

    const loginContext = (userData, tokenData) => {
        setUser(userData);
        setTokenState(tokenData);
        saveToken(tokenData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logoutContext = () => {
        setUser(null);
        setTokenState(null);
        removeToken();
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoggedIn: !!token,
                isLoading,
                loginContext,
                logoutContext,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
