import React, { useEffect, useState } from 'react';
import { 
    View, Text, FlatList, StyleSheet, TouchableOpacity, 
    ActivityIndicator, RefreshControl, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { getGlobalStyles, getTheme, colors } from '../constants/styles';
import { useNavigation } from '@react-navigation/native';

export default function MyOrdersScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('abiertas'); // 'abiertas' o 'historial'
    
    const theme = getTheme();
    const styles = getGlobalStyles(theme);
    const navigation = useNavigation();

    const fetchOrders = async () => {
        try {
            const response = await api.get('/os/mis-ordenes');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // Terminal states: 8 (ANULADA), 12 (ARCHIVADA), 13 (CERRADA)
    const openedOrders = orders.filter(o => ![8, 12, 13].includes(o.estado_id));
    const historyOrders = orders.filter(o => [8, 12, 13].includes(o.estado_id));

    const displayedOrders = activeTab === 'abiertas' ? openedOrders : historyOrders;

    const processInstallation = async (codigo_os, operativo, bus_ppu) => {
        try {
            setLoading(true);
            await api.post('/os/completar-instalacion', { 
                codigo_os, 
                operativo,
                bus_ppu: bus_ppu || null 
            });
            Alert.alert('Éxito', operativo ? 'Equipo instalado correctamente' : 'Equipo devuelto a bodega');
            fetchOrders();
        } catch (error) {
            console.error('Error al procesar instalación:', error);
            Alert.alert('Error', 'No se pudo procesar la acción');
            setLoading(false);
        }
    };

    const handlePressAction = (item) => {
        Alert.alert(
            "Procesar Equipo",
            "¿El equipo quedó operativo en el bus?",
            [
                {
                    text: "No (Cargar como Falla)",
                    onPress: () => processInstallation(item.codigo_os, false),
                    style: "destructive"
                },
                {
                    text: "Sí (Instalado OK)",
                    onPress: () => processInstallation(item.codigo_os, true, item.bus_ppu === 'STOCK' ? null : item.bus_ppu),
                },
                { text: "Cancelar", style: "cancel" }
            ]
        );
    };

    const renderOrderCard = ({ item }) => {
        const isHistory = [8, 12, 13].includes(item.estado_id);
        const statusColor = item.estado_id === 13 ? colors.success : 
                           (item.estado_id === 8 ? colors.danger : colors.info);

        return (
            <TouchableOpacity 
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => !isHistory && handlePressAction(item)}
            >
                <View style={localStyles.cardHeader}>
                    <View style={localStyles.osIdContainer}>
                        <Text style={[styles.label, { marginBottom: 0, color: colors.primary }]}>{item.codigo_os}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.badgeText, { color: statusColor, fontSize: 10 }]}>
                            {item.estado_nombre.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={{ marginVertical: 12 }}>
                    <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                        {item.tipo_equipo} | Serie: {item.serie || 'N/A'}
                    </Text>
                    <Text style={{ color: theme.muted, fontSize: 14 }}>
                        <Ionicons name="bus-outline" size={14} /> {item.bus_ppu === 'STOCK' ? 'ASIGNAR PPU' : item.bus_ppu}
                    </Text>
                </View>

                {activeTab === 'abiertas' && (
                    <View style={{ backgroundColor: colors.primary + '10', padding: 8, borderRadius: 8, marginTop: 5, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="construct-outline" size={16} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: 8, fontSize: 12 }}>PRESIONE PARA INSTALAR / DEVOLVER</Text>
                    </View>
                )}

                <View style={localStyles.fallaContainer}>
                    <Text style={{ color: theme.muted, fontSize: 13, fontStyle: 'italic' }}>
                        "{item.falla}"
                    </Text>
                </View>

                <View style={localStyles.cardFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Ionicons name="calendar-outline" size={12} color={theme.muted} style={{ marginRight: 4 }} />
                         <Text style={{ color: theme.muted, fontSize: 11 }}>
                            {new Date(item.fecha).toLocaleDateString()}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.border} />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* TABS DE FILTRO */}
            <View style={localStyles.tabContainer}>
                <TouchableOpacity 
                    style={[localStyles.tab, activeTab === 'abiertas' && localStyles.activeTab]}
                    onPress={() => setActiveTab('abiertas')}
                >
                    <Text style={[localStyles.tabText, activeTab === 'abiertas' && { color: '#000' }]}>
                        Abiertas ({openedOrders.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[localStyles.tab, activeTab === 'historial' && localStyles.activeTab]}
                    onPress={() => setActiveTab('historial')}
                >
                    <Text style={[localStyles.tabText, activeTab === 'historial' && { color: '#000' }]}>
                        Historial ({historyOrders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayedOrders}
                keyExtractor={(item) => item.codigo_os}
                renderItem={renderOrderCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={{ marginTop: 100, alignItems: 'center' }}>
                        <Ionicons name="document-text-outline" size={64} color={theme.border} />
                        <Text style={{ color: theme.muted, marginTop: 16, fontSize: 16 }}>
                            No hay órdenes en esta sección.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const localStyles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 16,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: colors.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontWeight: '700',
        color: '#64748B',
        fontSize: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    osIdContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(240, 185, 11, 0.1)',
        borderRadius: 8,
    },
    fallaContainer: {
        padding: 10,
        backgroundColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.02)',
        borderRadius: 10,
        borderLeftWidth: 2,
        borderLeftColor: colors.primary,
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
        paddingTop: 10,
    }
});
