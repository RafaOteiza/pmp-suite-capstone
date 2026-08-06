import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                setAuthToken(token);

                // Obtener rol del backend (opcional, o decodificar token)
                // Por ahora simulamos que obtenemos el rol o datos extra
                try {
                    // Podríamos llamar a /api/auth/profile si existiera
                    // const { data } = await api.get('/auth/me');
                    setUser({ ...firebaseUser, ...firebaseUser.reloadUserInfo });
                } catch (error) {
                    console.log("Error fetching user data", error);
                    setUser(firebaseUser);
                }

            } else {
                setAuthToken(null);
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
