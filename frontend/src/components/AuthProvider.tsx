import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { authApi, User } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await authApi.getCurrentUser();
                setUser(currentUser);
            } catch (err) {
                console.error('Auth check failed:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        const result = await authApi.login(email, password);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return false;
        }

        setUser(result.user);
        setLoading(false);
        return true;
    }, []);

    const signup = useCallback(async (username: string, email: string, password: string) => {
        setLoading(true);
        setError(null);

        const result = await authApi.signup(username, email, password);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return false;
        }

        setUser(result.user);
        setLoading(false);
        return true;
    }, []);

    const logout = useCallback(async () => {
        await authApi.logout();
        setUser(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            signup,
            logout,
            clearError,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};
