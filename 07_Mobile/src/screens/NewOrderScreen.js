import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch, Image, Modal, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getGlobalStyles, getTheme, colors } from '../constants/styles';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'; // Asegúrate de tener expo-vector-icons

export default function NewOrderScreen() {
    const [form, setForm] = useState({
        tipo: 'VALIDADOR',
        bus_ppu: '',
        serie_equipo: '',
        falla: '',
        modelo: '',
        marca: '',
        terminal_id: null,
        pst_codigo: null,
        ticket_aranda: ''
    });

    const [masterData, setMasterData] = useState({
        terminales: [],
        psts: [],
        loading: true
    });

    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [simulatingAranda, setSimulatingAranda] = useState(false);

    // Efecto para simular la búsqueda automática en SONDA Aranda con Debounce
    useEffect(() => {
        const type = form.tipo;
        const serial = form.serie_equipo.trim();
        
        // Determinar longitud mínima razonable según el equipo
        const minLength = type === 'VALIDADOR' ? 7 : 8;

        if (serial.length >= minLength && !form.ticket_aranda) {
            const timer = setTimeout(() => {
                setSimulatingAranda(true);
                // Retardo adicional simulando el "Fetch" a internet
                setTimeout(() => {
                    const fakeTicket = String(Math.floor(800000 + Math.random() * 90000));
                    handleChange('ticket_aranda', fakeTicket);
                    setSimulatingAranda(false);
                }, 1000);
            }, 2500); // Debounce elevado a 2.5 segundos de inactividad total
            
            return () => clearTimeout(timer);
        }
    }, [form.serie_equipo, form.tipo]);

    // Estados para Modales de Selección
    const [modalTerminalVisible, setModalTerminalVisible] = useState(false);
    const [modalPstVisible, setModalPstVisible] = useState(false);
    const [isOtroFalla, setIsOtroFalla] = useState(false);

    const FALLAS_COMUNES = [
        "Pantalla oscura / No enciende",
        "No lee tarjeta Bip!",
        "Problema de audio",
        "Falla de impresión",
        "Touch no responde",
        "Daño físico (Vandalismo)",
        "Otro"
    ];

    const navigation = useNavigation();
    const theme = getTheme();
    const styles = getGlobalStyles(theme);

    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [resTerm, resPst] = await Promise.all([
                api.get('/master/terminales'),
                api.get('/master/psts')
            ]);
            
            setMasterData({
                terminales: resTerm.data,
                psts: resPst.data,
                loading: false
            });

            // Seleccionar por defecto el primero si existen
            if (resTerm.data.length > 0) handleChange('terminal_id', resTerm.data[0].id);
            if (resPst.data.length > 0) handleChange('pst_codigo', resPst.data[0].codigo);

        } catch (error) {
            console.error("Error loading master data", error);
            Alert.alert("Error", "No se pudieron cargar los datos maestros");
            setMasterData(prev => ({ ...prev, loading: false }));
        }
    };

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleTipoChange = (nuevoTipo) => {
        setForm(prev => ({ ...prev, tipo: nuevoTipo }));
    };

    const validatePPU = (ppu) => {
        const regex = /^[A-Z0-9]{6}$/; // Simplificado para Chile
        return regex.test(ppu);
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permiso requerido", "Se requiere acceso a la cámara");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!form.bus_ppu || !form.serie_equipo || !form.falla) {
            Alert.alert('Error', 'Complete PPU, Serie y Falla');
            return;
        }

        if (!validatePPU(form.bus_ppu)) {
            Alert.alert('PPU Inválida', 'La patente debe tener 6 caracteres (ej: ABCD12)');
            return;
        }

        if (form.es_pod && !image) {
            Alert.alert('Requerido', 'Debe tomar una foto si el equipo es POD');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                imagen_b64: image ? `data:image/jpeg;base64,...` : null // Simulado
            };
            const response = await api.post('/os/crear', form);
            Alert.alert('Éxito', 'OS Creada: ' + response.data.os.codigo_os);
            navigation.goBack();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || error.message;
            Alert.alert('Error', 'No se pudo crear la OS: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const handleFallaSelect = (fallaSeleccionada) => {
        if (fallaSeleccionada === "Otro") {
            setIsOtroFalla(true);
            setForm({ ...form, falla: '' });
        } else {
            setIsOtroFalla(false);
            setForm({ ...form, falla: fallaSeleccionada });
        }
    };

    if (masterData.loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const getTerminalNombre = () => masterData.terminales.find(t => t.id === form.terminal_id)?.nombre || 'Seleccionar';
    const getPstNombre = () => masterData.psts.find(p => p.codigo === form.pst_codigo)?.nombre || 'Seleccionar';

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={{ height: 10 }} />
            <Text style={styles.title}>Nueva Orden</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Tipo de Equipo</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        style={[localStyles.selectorBtn, form.tipo === 'VALIDADOR' && localStyles.activeBtn]}
                        onPress={() => handleTipoChange('VALIDADOR')}
                    >
                        <Text style={[localStyles.selectorText, form.tipo === 'VALIDADOR' && { color: '#000' }]}>Validador</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[localStyles.selectorBtn, form.tipo === 'CONSOLA' && localStyles.activeBtn]}
                        onPress={() => handleTipoChange('CONSOLA')}
                    >
                        <Text style={[localStyles.selectorText, form.tipo === 'CONSOLA' && { color: '#000' }]}>Consola</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.card}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Terminal</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setModalTerminalVisible(true)}>
                            <Text style={{ color: theme.text }}>{getTerminalNombre()}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Operador (PST)</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setModalPstVisible(true)}>
                            <Text style={{ color: theme.text }}>{getPstNombre()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View>
                    <Text style={[styles.label, { marginBottom: 2 }]}>¿Es equipo POD?</Text>
                    <Text style={{ color: theme.muted, fontSize: 12 }}>Requiere evidencia fotográfica</Text>
                </View>
                <Switch
                    value={form.es_pod}
                    onValueChange={(val) => handleChange('es_pod', val)}
                    trackColor={{ false: theme.border, true: colors.primary }}
                />
            </View>

            {form.es_pod && (
                <View style={[styles.card, { alignItems: 'center' }]}>
                    <TouchableOpacity onPress={pickImage} style={localStyles.cameraBtn}>
                        {image ? (
                            <Image source={{ uri: image }} style={localStyles.photoPreview} />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="camera" size={32} color={colors.primary} />
                                <Text style={{ color: colors.primary, marginTop: 4, fontWeight: '600' }}>Tomar Foto</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.card}>
                <Text style={styles.label}>Ticket ITSM (SONDA)</Text>
                {simulatingAranda ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 12, borderRadius: 12, gap: 10 }}>
                        <ActivityIndicator color={colors.primary} size="small" />
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>Consultando Caso en Aranda...</Text>
                    </View>
                ) : (
                    <TextInput
                        style={[styles.input, form.ticket_aranda ? { borderColor: colors.primary, borderWidth: 1 } : {}]}
                        placeholder="N° Caso Aranda (Generación automática)"
                        placeholderTextColor={theme.muted}
                        value={form.ticket_aranda}
                        onChangeText={(text) => handleChange('ticket_aranda', text)}
                        keyboardType="numeric"
                    />
                )}
                {form.ticket_aranda && !simulatingAranda && (
                    <Text style={{ color: colors.primary, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                        ¡Caso enlazado a N° de Serie correctamente!
                    </Text>
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Identificación</Text>
                <TextInput
                    style={styles.input}
                    placeholder="PPU / Patente (ej: ABCD12)"
                    placeholderTextColor={theme.muted}
                    value={form.bus_ppu}
                    onChangeText={(text) => handleChange('bus_ppu', text.toUpperCase())}
                    maxLength={6}
                />
                <TextInput
                    style={styles.input}
                    placeholder={form.tipo === 'VALIDADOR' ? "Serie (ej: 7XXXXXX)" : "Serie (ej: 9715XXXXXXXX)"}
                    placeholderTextColor={theme.muted}
                    value={form.serie_equipo}
                    onChangeText={(text) => handleChange('serie_equipo', text)}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Falla Reportada</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {FALLAS_COMUNES.map((f, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[localStyles.chip, form.falla === f && localStyles.activeChip]}
                            onPress={() => handleFallaSelect(f)}
                        >
                            <Text style={[localStyles.chipText, form.falla === f && { color: '#000' }]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {isOtroFalla && (
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        placeholder="Escriba el detalle de la falla..."
                        placeholderTextColor={theme.muted}
                        multiline
                        value={form.falla}
                        onChangeText={(text) => handleChange('falla', text)}
                    />
                )}
            </View>

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Crear Orden de Servicio</Text>}
            </TouchableOpacity>

            <View style={{ height: 50 }} />

            {/* MODALES */}
            <SelectionModal
                visible={modalTerminalVisible}
                onClose={() => setModalTerminalVisible(false)}
                title="Seleccionar Terminal"
                data={masterData.terminales}
                selectedId={form.terminal_id}
                onSelect={(id) => {
                    handleChange('terminal_id', id);
                    setModalTerminalVisible(false);
                }}
                theme={theme}
            />

            <SelectionModal
                visible={modalPstVisible}
                onClose={() => setModalPstVisible(false)}
                title="Seleccionar Operador (PST)"
                data={masterData.psts}
                selectedId={form.pst_codigo}
                onSelect={(code) => {
                    handleChange('pst_codigo', code);
                    setModalPstVisible(false);
                }}
                theme={theme}
                isPST
            />
        </ScrollView>
    );
}

const SelectionModal = ({ visible, onClose, title, data, selectedId, onSelect, theme, isPST }) => (
    <Modal visible={visible} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
            <View style={[localStyles.modalBody, { backgroundColor: theme.panel }]}>
                <Text style={[localStyles.modalTitle, { color: theme.text }]}>{title}</Text>
                <FlatList
                    data={data}
                    keyExtractor={item => (isPST ? item.codigo : item.id.toString())}
                    renderItem={({ item }) => {
                        const id = isPST ? item.codigo : item.id;
                        const isSelected = id === selectedId;
                        return (
                            <TouchableOpacity
                                style={[localStyles.modalItem, isSelected && { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}
                                onPress={() => onSelect(id)}
                            >
                                <Text style={{ color: theme.text, fontSize: 16, fontWeight: isSelected ? '700' : '400' }}>
                                    {item.nombre} {isPST ? `(${item.codigo})` : ''}
                                </Text>
                                {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                            </TouchableOpacity>
                        );
                    }}
                />
                <TouchableOpacity onPress={onClose} style={localStyles.closeBtn}>
                    <Text style={{ color: colors.danger, fontWeight: '700' }}>Cerrar</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const localStyles = StyleSheet.create({
    selectorBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderWidth: 1,
        borderColor: 'transparent'
    },
    activeBtn: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    selectorText: {
        fontWeight: '600',
        color: '#666'
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderWidth: 1,
        borderColor: '#eee'
    },
    activeChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666'
    },
    cameraBtn: {
        width: '100%',
        height: 160,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    photoPreview: {
        width: '100%',
        height: '100%',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    modalBody: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 20,
    },
    modalItem: {
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee'
    },
    closeBtn: {
        marginTop: 16,
        padding: 16,
        alignItems: 'center'
    }
});
