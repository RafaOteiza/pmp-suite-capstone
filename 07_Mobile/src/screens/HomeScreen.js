import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getGlobalStyles, getTheme, colors } from '../constants/styles';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const theme = getTheme();
    const styles = getGlobalStyles(theme);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={{ height: 20 }} />
            
            {/* Perfil de Usuario Premium */}
            <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary }]}>
                <View style={localStyles.avatarCircle}>
                    <Text style={localStyles.avatarText}>{user?.email?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ marginLeft: 15 }}>
                    <Text style={[styles.label, { color: 'rgba(0,0,0,0.6)', marginBottom: 0 }]}>
                        {user?.rol === 'tecnico_terreno' ? 'Técnico en Terreno' : 
                         user?.rol === 'admin' ? 'Administrador' : 
                         user?.rol === 'jefe_taller' ? 'Jefe de Taller' : 
                         user?.rol?.toUpperCase() || 'Usuario'}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#000' }}>{user?.email?.split('@')[0]}</Text>
                </View>
            </View>

            <Text style={[styles.title, { fontSize: 22, marginTop: 10, marginBottom: 15, textAlign: 'left' }]}>Acciones Rápidas</Text>

            <View style={{ gap: 16 }}>
                <TouchableOpacity
                    style={[styles.card, localStyles.actionCard]}
                    onPress={() => navigation.navigate('NewOrder')}
                >
                    <View style={[localStyles.iconContainer, { backgroundColor: 'rgba(240, 185, 11, 0.1)' }]}>
                        <Ionicons name="add-circle" size={32} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={[styles.label, { color: theme.text, marginBottom: 2 }]}>Nueva Orden</Text>
                        <Text style={{ color: theme.muted, fontSize: 14 }}>Reportar equipo retirado de bus</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={theme.border} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, localStyles.actionCard]}
                    onPress={() => navigation.navigate('MyOrders')}
                >
                    <View style={[localStyles.iconContainer, { backgroundColor: 'rgba(14, 203, 129, 0.1)' }]}>
                        <Ionicons name="list" size={32} color={colors.success} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={[styles.label, { color: theme.text, marginBottom: 2 }]}>Mis Órdenes</Text>
                        <Text style={{ color: theme.muted, fontSize: 14 }}>Ver registro de órdenes enviadas</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={theme.border} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, localStyles.actionCard]}
                    onPress={() => Alert.alert('Info', 'Módulo de Soporte Próximamente')}
                >
                    <View style={[localStyles.iconContainer, { backgroundColor: 'rgba(49, 130, 206, 0.1)' }]}>
                        <Ionicons name="help-buoy" size={32} color={colors.info} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={[styles.label, { color: theme.text, marginBottom: 2 }]}>Soporte</Text>
                        <Text style={{ color: theme.muted, fontSize: 14 }}>Contactar con administración</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={theme.border} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.danger, shadowOpacity: 0, marginTop: 40, marginBottom: 40 }]}
                onPress={logout}
            >
                <Text style={[styles.buttonText, { color: colors.danger }]}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const localStyles = StyleSheet.create({
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000'
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20, // Añadido para mejor alineación
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4, // Pequeño ajuste para centrar el bloque de texto
    }
});
