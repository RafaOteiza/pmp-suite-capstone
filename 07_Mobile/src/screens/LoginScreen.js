import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getGlobalStyles, getTheme, colors } from '../constants/styles';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const theme = getTheme();
    const styles = getGlobalStyles(theme);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingrese correo y contraseña');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert('Error de Autenticación', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={[styles.container, { justifyContent: 'center' }]}>
                
                <View style={localStyles.logoContainer}>
                    <View style={localStyles.logoIcon}>
                        <Ionicons name="bus" size={40} color="#000" />
                    </View>
                    <Text style={styles.title}>PMP Suite</Text>
                    <Text style={[styles.label, { textAlign: 'center', color: theme.muted }]}>Módulo de Terreno</Text>
                </View>

                <View style={[styles.card, { padding: 30, borderRadius: 32 }]}>
                    <Text style={[styles.label, { marginBottom: 20, fontSize: 16, textAlign: 'center' }]}>Acceso Técnicos</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Correo Institucional"
                        placeholderTextColor={theme.muted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor={theme.muted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Validando...' : 'Entrar al Sistema'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ textAlign: 'center', color: theme.muted, marginTop: 30, fontSize: 12 }}>
                    Versión 3.0.0 - © 2026 Duoc UC Taller de Tesis
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const localStyles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    }
});
