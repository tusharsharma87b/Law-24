import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LAWYERS } from '../../data/lawyers';

export default function BookingScreen() {
    const { lawyerId } = useLocalSearchParams<{ lawyerId: string }>();
    const router = useRouter();
    const lawyer = LAWYERS.find(l => l.id === lawyerId);

    const [bookingType, setBookingType] = useState<'instant' | 'schedule'>('instant');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [walletBalance] = useState(150); // mock wallet balance
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    if (!lawyer) {
        return (
            <View style={styles.center}>
                <Text>Lawyer not found</Text>
            </View>
        );
    }

    const handleInstantBooking = () => {
        if (walletBalance < lawyer.price) {
            Alert.alert('Insufficient Balance', 'Please add money to your wallet to proceed.');
            return;
        }
        setIsConnecting(true);
        // Simulate connection
        setTimeout(() => {
            setIsConnecting(false);
            setIsConfirmed(true);
        }, 2000);
    };

    const handleScheduleBooking = () => {
        if (!selectedSlot) {
            Alert.alert('Select a time slot', 'Please choose a time slot to proceed.');
            return;
        }
        setIsConfirmed(true);
    };

    const timeSlots = [
        '10:00 AM - 10:30 AM',
        '11:00 AM - 11:30 AM',
        '2:00 PM - 2:30 PM',
        '4:00 PM - 4:30 PM',
        '6:00 PM - 6:30 PM',
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Book Consultation</Text>
                <Text style={styles.subtitle}>with {lawyer.name}</Text>
            </View>

            {!isConfirmed ? (
                <>
                    {/* Booking Type Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Booking Type</Text>
                        <View style={styles.typeContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    bookingType === 'instant' && styles.typeButtonActive,
                                ]}
                                onPress={() => setBookingType('instant')}
                            >
                                <Text
                                    style={[
                                        styles.typeButtonText,
                                        bookingType === 'instant' && styles.typeButtonTextActive,
                                    ]}
                                >
                                    Instant Call
                                </Text>
                                <Text style={styles.typeDescription}>
                                    Connect immediately with lawyer
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    bookingType === 'schedule' && styles.typeButtonActive,
                                ]}
                                onPress={() => setBookingType('schedule')}
                            >
                                <Text
                                    style={[
                                        styles.typeButtonText,
                                        bookingType === 'schedule' && styles.typeButtonTextActive,
                                    ]}
                                >
                                    Schedule
                                </Text>
                                <Text style={styles.typeDescription}>
                                    Pick a time slot for later
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Instant Call Flow */}
                    {bookingType === 'instant' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Instant Call</Text>
                            <View style={styles.walletInfo}>
                                <Text style={styles.walletLabel}>Wallet Balance</Text>
                                <Text style={styles.walletAmount}>₹{walletBalance}</Text>
                            </View>
                            <Text style={styles.costInfo}>
                                This call will cost <Text style={styles.highlight}>₹{lawyer.price}/min</Text>
                            </Text>
                            {walletBalance < lawyer.price && (
                                <Text style={styles.insufficientText}>
                                    Insufficient balance. Please add money.
                                </Text>
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    (walletBalance < lawyer.price || isConnecting) && styles.buttonDisabled,
                                ]}
                                onPress={handleInstantBooking}
                                disabled={walletBalance < lawyer.price || isConnecting}
                            >
                                {isConnecting ? (
                                    <Text style={styles.buttonText}>Connecting...</Text>
                                ) : (
                                    <Text style={styles.buttonText}>Start Instant Call</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Schedule Flow */}
                    {bookingType === 'schedule' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Time Slot</Text>
                            <View style={styles.slotsContainer}>
                                {timeSlots.map((slot, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[
                                            styles.slotButton,
                                            selectedSlot === slot && styles.slotButtonActive,
                                        ]}
                                        onPress={() => setSelectedSlot(slot)}
                                    >
                                        <Text
                                            style={[
                                                styles.slotText,
                                                selectedSlot === slot && styles.slotTextActive,
                                            ]}
                                        >
                                            {slot}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity
                                style={[styles.primaryButton, !selectedSlot && styles.buttonDisabled]}
                                onPress={handleScheduleBooking}
                                disabled={!selectedSlot}
                            >
                                <Text style={styles.buttonText}>Confirm Booking</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            ) : (
                /* Confirmation Screen */
                <View style={styles.confirmationSection}>
                    <Text style={styles.confirmationIcon}>✅</Text>
                    <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>
                    <Text style={styles.confirmationText}>
                        Your {bookingType === 'instant' ? 'instant call' : 'scheduled consultation'} with{' '}
                        {lawyer.name} has been confirmed.
                    </Text>
                    {bookingType === 'instant' && (
                        <Text style={styles.confirmationDetail}>
                            The lawyer will join the call shortly.
                        </Text>
                    )}
                    {bookingType === 'schedule' && selectedSlot && (
                        <Text style={styles.confirmationDetail}>
                            Scheduled for {selectedSlot}
                        </Text>
                    )}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.buttonText}>Back to Lawyer</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    typeButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    typeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#CBD5E1',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    typeDescription: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
    },
    walletInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    walletLabel: {
        fontSize: 14,
        color: '#94A3B8',
    },
    walletAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#10B981',
    },
    costInfo: {
        fontSize: 14,
        color: '#CBD5E1',
        marginBottom: 16,
    },
    highlight: {
        fontWeight: 'bold',
        color: '#FBBF24',
    },
    insufficientText: {
        fontSize: 14,
        color: '#EF4444',
        marginBottom: 16,
    },
    primaryButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#475569',
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    slotsContainer: {
        gap: 10,
        marginBottom: 20,
    },
    slotButton: {
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    slotButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    slotText: {
        color: '#CBD5E1',
        fontSize: 14,
        textAlign: 'center',
    },
    slotTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    confirmationSection: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    confirmationIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    confirmationTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    confirmationText: {
        fontSize: 16,
        color: '#CBD5E1',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 24,
    },
    confirmationDetail: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 30,
    },
});