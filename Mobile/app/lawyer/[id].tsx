import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LAWYERS } from '../../data/lawyers';
import { Colors } from '../../constants/colors';
import { Avatar } from '../../components/ui/Avatar';
import { Chip } from '../../components/ui/Chip';
import { useState, useRef } from 'react';

export default function LawyerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Animation refs for button press scaling
  const primaryBtnScale = useRef(new Animated.Value(1)).current;
  const chatBtnScale = useRef(new Animated.Value(1)).current;
  const callBtnScale = useRef(new Animated.Value(1)).current;
  const scheduleBtnScale = useRef(new Animated.Value(1)).current;

  const lawyer = LAWYERS.find(l => l.id === id);

  if (!lawyer) {
    return (
      <View style={styles.center}>
        <Text>Lawyer not found</Text>
      </View>
    );
  }

  const availability = (lawyer as any).availability ?? (lawyer.isOnline ? 'online' : 'offline');
  const nextAvailableIn = (lawyer as any).nextAvailableIn ?? 0;
  const totalReviews = (lawyer as any).totalReviews ?? lawyer.rating.totalReviews;
  const experience = (lawyer as any).experience ?? lawyer.experienceYears;
  const languages = (lawyer as any).languages ?? lawyer.languages;
  const about = (lawyer as any).about ?? lawyer.bio;
  const barCouncilId = lawyer.barCouncilId ?? 'Not provided';
  const totalConsultations = lawyer.cases?.total ?? 0;

  const isOnline = availability === 'online';
  const isBusy = isOnline && nextAvailableIn > 0;

  const getPrimaryButtonText = () => {
    if (isOnline && !isBusy) return 'Join Queue';
    if (isBusy) return `Join Queue (${nextAvailableIn} min wait)`;
    return 'Book Consultation';
  };

  const handleWriteReview = () => {
    setReviewModalVisible(true);
  };

  const submitReview = () => {
    // TODO: Store review locally or send to backend
    console.log('Review submitted:', { rating: reviewRating, comment: reviewComment });
    setReviewModalVisible(false);
    setReviewRating(5);
    setReviewComment('');
  };

  // Animation functions for button press
  const animateButtonPress = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePrimaryButtonPress = () => {
    animateButtonPress(primaryBtnScale);
    setTimeout(() => {
      router.push({
        pathname: "/booking/[lawyerId]",
        params: { lawyerId: lawyer.id }
      });
    }, 150);
  };

  const handleChatPress = () => {
    animateButtonPress(chatBtnScale);
    // TODO: Implement chat functionality
  };

  const handleCallPress = () => {
    animateButtonPress(callBtnScale);
    // TODO: Implement call functionality
  };

  const handleSchedulePress = () => {
    animateButtonPress(scheduleBtnScale);
    // TODO: Implement schedule functionality
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {/* PREMIUM HEADER WITH GRADIENT */}
        <LinearGradient
          colors={['#0A0F1E', '#111827', '#0A0F1E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.avatarContainer}>
                <Avatar
                  name={lawyer.name}
                  initials={lawyer.initials}
                  color={lawyer.avatarColor}
                  size={96}
                  verified={lawyer.verified}
                  online={false}
                />
                {isOnline && <View style={styles.onlineDot} />}
                {lawyer.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{lawyer.name}</Text>
                <Text style={styles.meta}>{lawyer.city} • {lawyer.expertise} • {experience} yrs exp</Text>
                <View style={styles.ratingRow}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingStar}>⭐</Text>
                    <Text style={styles.rating}>{lawyer.rating.average.toFixed(1)}</Text>
                    <Text style={styles.reviews}>({totalReviews} reviews)</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{lawyer.price}</Text>
                    <Text style={styles.priceUnit}>/min</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* PREMIUM STATS CARD WITH GLASS EFFECT */}
        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>{lawyer.verified ? '✓' : '✗'}</Text>
              </View>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>{experience}</Text>
                <Text style={styles.statIconUnit}>y</Text>
              </View>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>{totalConsultations}</Text>
                <Text style={styles.statIconUnit}>+</Text>
              </View>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>{barCouncilId ? '✓' : '✗'}</Text>
              </View>
              <Text style={styles.statLabel}>Bar Council</Text>
            </View>
          </View>
        </View>

        {/* ABOUT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.paragraph}>{about}</Text>
        </View>

        {/* EXPERIENCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.paragraph}>{experience} years of practice in {lawyer.courts?.[0]?.name || 'various courts'}. Specializes in {lawyer.specializations?.join(', ')}.</Text>
        </View>

        {/* LANGUAGES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.chipContainer}>
            {languages.map((lang: string, idx: number) => (
              <Chip key={idx} label={lang} style={styles.languageChip} />
            ))}
          </View>
        </View>

        {/* REVIEWS */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ratingSummary}>
            <Text style={styles.ratingBig}>{lawyer.rating.average.toFixed(1)}</Text>
            <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.ratingCount}>{totalReviews} reviews</Text>
          </View>
          {/* Sample review */}
          <View style={styles.reviewItem}>
            <Text style={styles.reviewText}>"Great lawyer, very helpful!"</Text>
            <Text style={styles.reviewAuthor}>– Rohan Sharma • ⭐⭐⭐⭐⭐</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewText}>"Professional and timely advice."</Text>
            <Text style={styles.reviewAuthor}>– Priya Mehta • ⭐⭐⭐⭐</Text>
          </View>
        </View>

        {/* PREMIUM AVAILABILITY CARD */}
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.availabilityTitle}>Availability</Text>
            <View style={[styles.availabilityIndicator, isOnline ? styles.onlineIndicator : styles.offlineIndicator]}>
              <View style={[styles.availabilityDot, isOnline ? styles.availabilityOnlineDot : styles.availabilityOfflineDot]} />
              <Text style={styles.availabilityStatusText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          <Text style={styles.availabilitySubtext}>
            {isOnline
              ? (isBusy ? `Available in ${nextAvailableIn} minutes` : 'Available for instant consultation')
              : 'Next slot: Tomorrow 10 AM'
            }
          </Text>
        </View>

        {/* Padding bottom for sticky CTA */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* STICKY BOTTOM CTA */}
      <View style={styles.stickyCtaContainer}>
        <TouchableOpacity
          style={styles.stickyPrimaryBtn}
          onPress={() => router.push({
            pathname: "/booking/[lawyerId]",
            params: { lawyerId: lawyer.id }
          })}
        >
          <Text style={styles.stickyPrimaryBtnText}>{getPrimaryButtonText()}</Text>
        </TouchableOpacity>

        <View style={styles.stickySecondaryActions}>
          {isOnline ? (
            <>
              <TouchableOpacity style={styles.stickySecondaryBtn}>
                <Text style={styles.stickySecondaryBtnText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stickySecondaryBtn}>
                <Text style={styles.stickySecondaryBtnText}>Call</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.stickySecondaryBtn}>
              <Text style={styles.stickySecondaryBtnText}>Schedule Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* REVIEW MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <Text style={styles.modalSubtitle}>Rate your experience with {lawyer.name}</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Text style={[styles.star, star <= reviewRating ? styles.starSelected : styles.starUnselected]}>
                    {star <= reviewRating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience..."
              multiline
              numberOfLines={4}
              value={reviewComment}
              onChangeText={setReviewComment}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setReviewModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmit} onPress={submitReview}>
                <Text style={styles.modalSubmitText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 160, // for sticky CTA
  },
  headerGradient: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    padding: 20,
  },
  header: {
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#0B1220',
    zIndex: 10,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#0B1220',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 16,
    marginRight: 6,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gold,
    marginRight: 6,
  },
  reviews: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  priceUnit: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 124, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.2)',
  },
  statIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statIconUnit: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageChip: {
    backgroundColor: Colors.bgElevated,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  writeReviewButton: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  writeReviewText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  ratingSummary: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBig: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  ratingStars: {
    fontSize: 18,
    marginVertical: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  reviewItem: {
    backgroundColor: Colors.bgSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  reviewAuthor: {
    color: Colors.textTertiary,
    fontSize: 12,
  },
  availabilityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  availabilityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  onlineIndicator: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  offlineIndicator: {
    backgroundColor: 'rgba(156, 163, 175, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.2)',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityOnlineDot: {
    backgroundColor: Colors.success,
  },
  availabilityOfflineDot: {
    backgroundColor: Colors.textTertiary,
  },
  availabilityStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  availabilitySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaSection: {
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  bottomPadding: {
    height: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgPrimary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  star: {
    fontSize: 32,
  },
  starSelected: {
    color: Colors.gold,
  },
  starUnselected: {
    color: Colors.textTertiary,
  },
  commentInput: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalSubmit: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  // Sticky CTA styles
  stickyCtaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  stickyPrimaryBtn: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  stickyPrimaryBtnText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  stickySecondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  stickySecondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  stickySecondaryBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
