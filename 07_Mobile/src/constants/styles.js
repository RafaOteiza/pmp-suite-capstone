import { StyleSheet, Appearance, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const colors = {
    // PMP Suite Palette
    primary: '#f0b90b', // Yellow
    success: '#0ecb81', // Green
    danger: '#f6465d',  // Red
    info: '#3182ce',    // Blue
    warning: '#ed8936', // Orange

    // Theme Aware Colors
    light: {
        bg: '#F8F9FD',
        panel: '#ffffff',
        card: '#ffffff',
        text: '#1A202C',
        border: '#EDF2F7',
        muted: '#718096',
        inputBg: '#FFFFFF',
        navBg: '#FFFFFF',
        surface: 'rgba(255, 255, 255, 0.8)',
    },
    dark: {
        bg: '#0F172A',
        panel: '#1E293B',
        card: '#1E293B',
        text: '#F8FAFC',
        border: '#334155',
        muted: '#94A3B8',
        inputBg: '#0F172A',
        navBg: '#1E293B',
        surface: 'rgba(30, 41, 59, 0.8)',
    }
};

export const getTheme = () => {
    const scheme = Appearance.getColorScheme();
    return scheme === 'dark' ? colors.dark : colors.light;
};

export const getGlobalStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: theme.bg,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 24,
        color: theme.text,
        letterSpacing: -0.5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.muted,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: theme.inputBg,
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: theme.border,
        color: theme.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 18,
    },
    card: {
        backgroundColor: theme.card,
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
        // Premium Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: theme.bg === '#F8F9FD' ? 0.05 : 0.2,
        shadowRadius: 20,
        elevation: 4,
    },
    glassCard: {
        backgroundColor: theme.surface,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
        backdropFilter: 'blur(10px)', // Solo web, en RN se simula con opacidad y elevación
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: theme.border,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'Bold',
        color: theme.text,
    }
});
