import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LAWYERS } from '../../data/lawyers';
import { Colors } from '../../constants/colors';
import { Avatar } from '../../components/ui/Avatar';
import { Chip } from '../../components/ui/Chip';
import { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LawyerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Animation refs for button press scaling
  const primaryBtnScale = useRef(new Animated.Value(1)).current;
  const chatBtnScale = useRef(new Animated.Value(1)).current;
  const callBtnScale = useRef(new Animated.Value(1)).current;
  const scheduleBtnScale = useRef(new Animated.Value(1)).current;
  const writeReviewBtnScale = useRef(new Animated.Value(1)).current;
  const modalCancelBtnScale = useRef(new Animated.Value(1)).current;
  const modalSubmitBtnScale = useRef(new Animated.Value(1)).current;
  const starRatingScale = useRef(new Animated.Value(1)).current;

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
    if (isOnline && !isBusy) return 'Start Consultation';
    if (isBusy) return `Start Consultation (${nextAvailableIn} min wait)`;
    return 'Book Consultation';
  };

  const handleWriteReview = () => {
    animateButtonPress(writeReviewBtnScale);
    setTimeout(() => setReviewModalVisible(true), 150);
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
        toValue: 0.96,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
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

  // Calculate bottom padding for scroll view and sticky CTA
  const scrollViewBottomPadding = 180 + insets.bottom;
  const stickyCtaBottomPadding = 24 + insets.bottom;

  return (
    <View style={styles.rootContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.contentContainer, { paddingBottom: scrollViewBottomPadding }]}>
        {/* PREMIUM HEADER WITH ONLINE STATUS */}
        <View style={styles.premiumHeader}>
          <View style={styles.headerTopRow}>
            <View style={styles.avatarContainerPremium}>
              <Avatar
                name={lawyer.name}
                initials={lawyer.initials}
                color={lawyer.avatarColor}
                size={100}
                verified={lawyer.verified}
                online={false}
              />
              {isOnline && <View style={styles.onlineDotPremium} />}
              {lawyer.verified && (
                <View style={styles.verifiedBadgePremium}>
                  <Text style={styles.verifiedTextPremium}>✓</Text>
                </View>
              )}
            </View>
            <View style={styles.headerInfoPremium}>
              <View style={styles.nameRow}>
                <Text style={styles.namePremium}>{lawyer.name}</Text>
                {isOnline && (
                  <View style={styles.onlineBadge}>
                    <View style={styles.onlinePulse} />
                    <Text style={styles.onlineText}>Online</Text>
                  </View>
                )}
              </View>
              <Text style={styles.metaPremium}>{lawyer.expertise} • {experience} years experience</Text>
            </View>
          </View>
        </View>

        {/* RATING BLOCK - LARGE RATING WITH STARS BELOW */}
        <View style={styles.ratingBlock}>
          <Text style={styles.ratingLarge}>{lawyer.rating.average.toFixed(1)}</Text>
          <Text style={styles.ratingStarsLarge}>★★★★★</Text>
          <Text style={styles.ratingCountSmall}>({totalReviews} reviews)</Text>
        </View>

        {/* PRICING - CONSULTATION FEE */}
        <View style={styles.pricingBlock}>
          <Text style={styles.pricingLabel}>Consultation Fee</Text>
          <Text style={styles.pricingAmount}>₹{lawyer.price}</Text>
          <Text style={styles.pricingUnit}>per minute</Text>
        </View>

        {/* TRUST STATS - HORIZONTAL SCROLL CARDS */}
        <View style={styles.statsScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
          >
            {/* Win Rate Card */}
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>{lawyer.cases?.winRatePercent || 90}%</Text>
              <Text style={styles.statCardLabel}>Win Rate</Text>
              <Text style={styles.statCardSubtext}>High success</Text>
            </View>

            {/* Accuracy Card */}
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>98%</Text>
              <Text style={styles.statCardLabel}>Accuracy</Text>
              <Text style={styles.statCardSubtext}>Legal advice</Text>
            </View>

            {/* Settlements Card */}
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>{lawyer.cases?.settled || 16}</Text>
              <Text style={styles.statCardLabel}>Settlements</Text>
              <Text style={styles.statCardSubtext}>Out of court</Text>
            </View>

            {/* Courts Card */}
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>{lawyer.courts?.length || 1}</Text>
              <Text style={styles.statCardLabel}>Courts</Text>
              <Text style={styles.statCardSubtext}>Practiced in</Text>
            </View>

            {/* Experience Card */}
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>{experience}</Text>
              <Text style={styles.statCardLabel}>Years</Text>
              <Text style={styles.statCardSubtext}>Experience</Text>
            </View>
          </ScrollView>
        </View>

        {/* ABOUT & EXPERTISE */}
        <View style={styles.sectionPremium}>
          <Text style={styles.sectionTitlePremium}>About & Expertise</Text>
          <Text style={styles.paragraphPremium}>{about}</Text>
          <Text style={styles.expertiseText}>Specializes in {lawyer.specializations?.join(', ')} with {experience} years of practice in {lawyer.courts?.map(c => c.name).join(', ') || 'various courts'}.</Text>
        </View>

        {/* LANGUAGES - INLINE TEXT */}
        <View style={styles.sectionPremium}>
          <Text style={styles.sectionTitlePremium}>Languages</Text>
          <Text style={styles.languagesInline}>
            {languages.map((lang: string, idx: number) => (
              <Text key={idx}>
                {lang}{idx < languages.length - 1 ? ' • ' : ''}
              </Text>
            ))}
          </Text>
        </View>

        {/* PRACTICED COURTS */}
        <View style={styles.sectionPremium}>
          <Text style={styles.sectionTitlePremium}>Practiced Courts</Text>
          <View style={styles.courtsContainer}>
            {lawyer.courts?.map((court, idx) => (
              <View key={idx} style={styles.courtChip}>
                <Text style={styles.courtChipText}>{court.name}</Text>
              </View>
            )) || (
              <Text style={styles.courtsFallback}>Various courts across jurisdiction</Text>
            )}
          </View>
        </View>

        {/* REVIEWS - PREMIUM DESIGN */}
        <View style={styles.sectionPremium}>
          <View style={styles.reviewsHeaderPremium}>
            <Text style={styles.sectionTitlePremium}>Recent Reviews</Text>
            <Animated.View style={[styles.writeReviewButtonPremium, { transform: [{ scale: writeReviewBtnScale }] }]}>
              <TouchableOpacity
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                onPress={handleWriteReview}
                activeOpacity={0.8}
              >
                <Text style={styles.writeReviewTextPremium}>Write a Review</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* Review 1 */}
          <View style={styles.reviewCardPremium}>
            <View style={styles.reviewHeaderPremium}>
              <View style={styles.reviewerInfoPremium}>
                <Text style={styles.reviewerNamePremium}>Rohan Sharma</Text>
                <Text style={styles.reviewDatePremium}>2 days ago</Text>
              </View>
              <Text style={styles.reviewStarsPremium}>★★★★★</Text>
            </View>
            <Text style={styles.reviewTextPremium}>"Great lawyer, very helpful! Explained everything clearly and helped me win my case."</Text>
          </View>
          
          <View style={styles.reviewDivider} />
          
          {/* Review 2 */}
          <View style={styles.reviewCardPremium}>
            <View style={styles.reviewHeaderPremium}>
              <View style={styles.reviewerInfoPremium}>
                <Text style={styles.reviewerNamePremium}>Priya Mehta</Text>
                <Text style={styles.reviewDatePremium}>1 week ago</Text>
              </View>
              <Text style={styles.reviewStarsPremium}>★★★★</Text>
            </View>
            <Text style={styles.reviewTextPremium}>"Professional and timely advice. Would recommend for family law matters."</Text>
          </View>
          
          <View style={styles.reviewDivider} />
          
          {/* Review 3 */}
          <View style={styles.reviewCardPremium}>
            <View style={styles.reviewHeaderPremium}>
              <View style={styles.reviewerInfoPremium}>
                <Text style={styles.reviewerNamePremium}>Amit Patel</Text>
                <Text style={styles.reviewDatePremium}>2 weeks ago</Text>
              </View>
              <Text style={styles.reviewStarsPremium}>★★★★★</Text>
            </View>
            <Text style={styles.reviewTextPremium}>"Excellent service. Very knowledgeable about corporate law. Will hire again."</Text>
          </View>
        </View>

        {/* AVAILABILITY */}
        <View style={styles.availabilitySimple}>
          <View style={styles.availabilityRow}>
            <View style={styles.availabilityDotSimple}>
              <View style={[styles.availabilityDotInner, isOnline ? styles.availabilityOnline : styles.availabilityOffline]} />
            </View>
            <Text style={styles.availabilityStatus}>
              {isOnline ? 'Online now' : 'Offline'}
            </Text>
          </View>
          <Text style={styles.availabilityNext}>
            {isOnline
              ? (isBusy ? `Next available in ${nextAvailableIn} min` : 'Available for instant consultation')
              : 'Next slot: Tomorrow 10 AM'
            }
          </Text>
        </View>

        {/* Padding bottom for sticky CTA */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* STICKY BOTTOM CTA */}
      <View style={[styles.stickyCtaContainer, { paddingBottom: stickyCtaBottomPadding }]}>
        <Animated.View style={[styles.stickyPrimaryBtn, { transform: [{ scale: primaryBtnScale }] }]}>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            onPress={handlePrimaryButtonPress}
            activeOpacity={0.8}
          >
            <Text style={styles.stickyPrimaryBtnText}>{getPrimaryButtonText()}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.stickySecondaryActions}>
          {isOnline ? (
            <>
              <Animated.View style={[styles.stickySecondaryBtn, { transform: [{ scale: chatBtnScale }] }]}>
                <TouchableOpacity
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  onPress={handleChatPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stickySecondaryBtnText}>Chat</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View style={[styles.stickySecondaryBtn, { transform: [{ scale: callBtnScale }] }]}>
                <TouchableOpacity
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  onPress={handleCallPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stickySecondaryBtnText}>Call Now</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            <Animated.View style={[styles.stickySecondaryBtn, { transform: [{ scale: scheduleBtnScale }] }]}>
              <TouchableOpacity
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                onPress={handleSchedulePress}
                activeOpacity={0.8}
              >
                <Text style={styles.stickySecondaryBtnText}>Schedule Call</Text>
              </TouchableOpacity>
            </Animated.View>
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
                <Animated.View key={star} style={{ transform: [{ scale: starRatingScale }] }}>
                  <TouchableOpacity
                    onPress={() => {
                      animateButtonPress(starRatingScale);
                      setReviewRating(star);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.star, star <= reviewRating ? styles.starSelected : styles.starUnselected]}>
                      {star <= reviewRating ? '⭐' : '☆'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
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
              <Animated.View style={[styles.modalCancel, { transform: [{ scale: modalCancelBtnScale }] }]}>
                <TouchableOpacity
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => {
                    animateButtonPress(modalCancelBtnScale);
                    setTimeout(() => setReviewModalVisible(false), 150);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View style={[styles.modalSubmit, { transform: [{ scale: modalSubmitBtnScale }] }]}>
                <TouchableOpacity
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => {
                    animateButtonPress(modalSubmitBtnScale);
                    setTimeout(submitReview, 150);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalSubmitText}>Submit Review</Text>
                </TouchableOpacity>
              </Animated.View>
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
    padding: 24,
    paddingBottom: 180, // for sticky CTA
  },
  headerContainer: {
    marginBottom: 32,
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
    marginBottom: 32,
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
    marginBottom: 32,
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
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
    backgroundColor: Colors.glassLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassMedium,
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
  reviewItemClean: {
    paddingVertical: 12,
  },
  reviewTextClean: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthorClean: {
    color: Colors.textTertiary,
    fontSize: 12,
  },
  reviewStars: {
    color: Colors.gold,
    fontSize: 12,
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  availabilitySimple: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: Colors.glassLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassMedium,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityDotSimple: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  availabilityDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  availabilityOnline: {
    backgroundColor: Colors.success,
  },
  availabilityOffline: {
    backgroundColor: Colors.textTertiary,
  },
  availabilityStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  availabilityNext: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
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
    padding: 22,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
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
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(79, 124, 255, 0.05)',
  },
  stickySecondaryBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  // Premium header styles
  premiumHeader: {
    marginBottom: 32,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  avatarContainerPremium: {
    position: 'relative',
  },
  onlineDotPremium: {
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
  verifiedBadgePremium: {
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
  verifiedTextPremium: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerInfoPremium: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  namePremium: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  onlinePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  metaPremium: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  headerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratingValuePremium: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  ratingStarsPremium: {
    fontSize: 16,
    color: Colors.gold,
    letterSpacing: 1,
  },
  ratingCountPremium: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  // New rating block styles
  ratingBlock: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  ratingLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.gold,
    marginBottom: 4,
  },
  ratingStarsLarge: {
    fontSize: 20,
    color: Colors.gold,
    letterSpacing: 2,
    marginBottom: 4,
  },
  ratingCountSmall: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  // Pricing block styles
  pricingBlock: {
    backgroundColor: 'rgba(79, 124, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.2)',
  },
  pricingLabel: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pricingUnit: {
    fontSize: 16,
    color: Colors.textTertiary,
  },
  pricingPremium: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pricePremium: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  priceUnitPremium: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  // Stats scroll cards
  statsScrollContainer: {
    marginBottom: 32,
  },
  statsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    width: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 2,
    textAlign: 'center',
  },
  statCardSubtext: {
    fontSize: 11,
    color: Colors.textTertiary,
    opacity: 0.7,
    textAlign: 'center',
  },
  // Premium sections
  sectionPremium: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitlePremium: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  paragraphPremium: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  expertiseText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  languagesInline: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  // Courts styles
  courtsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courtChip: {
    backgroundColor: 'rgba(79, 124, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  courtChipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  courtsFallback: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  // Premium reviews styles
  reviewsHeaderPremium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButtonPremium: {
    backgroundColor: 'rgba(79, 124, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  writeReviewTextPremium: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  reviewCardPremium: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  reviewHeaderPremium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfoPremium: {
    flex: 1,
  },
  reviewerNamePremium: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  reviewDatePremium: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  reviewStarsPremium: {
    fontSize: 14,
    color: Colors.gold,
    marginLeft: 8,
  },
  reviewTextPremium: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginVertical: 8,
  },
});
