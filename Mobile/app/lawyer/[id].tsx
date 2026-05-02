import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LAWYERS } from '../../data/lawyers';
import { Colors } from '../../constants/colors';
import { Avatar } from '../../components/ui/Avatar';
import { Chip } from '../../components/ui/Chip';
import { useState } from 'react';

export default function LawyerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

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

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Avatar
              name={lawyer.name}
              initials={lawyer.initials}
              color={lawyer.avatarColor}
              size={80}
              verified={lawyer.verified}
              online={isOnline}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{lawyer.name}</Text>
              <Text style={styles.meta}>{lawyer.city} • {lawyer.expertise}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ {lawyer.rating.average.toFixed(1)}</Text>
                <Text style={styles.reviews}>({totalReviews} reviews)</Text>
                <Text style={styles.price}>₹{lawyer.price}/min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TRUST SECTION */}
        <View style={styles.trustSection}>
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Text style={styles.trustLabel}>Verified</Text>
              <Text style={styles.trustValue}>{lawyer.verified ? '✅ Yes' : '❌ No'}</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustLabel}>Bar Council ID</Text>
              <Text style={styles.trustValue}>{barCouncilId}</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustLabel}>Experience</Text>
              <Text style={styles.trustValue}>{experience} years</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustLabel}>Consultations</Text>
              <Text style={styles.trustValue}>{totalConsultations}+</Text>
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

        {/* AVAILABILITY CARD */}
        <View style={styles.availabilityCard}>
          <Text style={styles.availabilityTitle}>Availability</Text>
          {isOnline ? (
            <>
              <Text style={styles.availabilityStatus}>🟢 Online Now</Text>
              <Text style={styles.availabilitySubtext}>
                {isBusy ? `Available in ${nextAvailableIn} minutes` : 'Available for instant consultation'}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.availabilityStatus}>⚫ Offline</Text>
              <Text style={styles.availabilitySubtext}>Next slot: Tomorrow 10 AM</Text>
            </>
          )}
        </View>

        {/* CTA SECTION */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push({
              pathname: "/booking/[lawyerId]",
              params: { lawyerId: lawyer.id }
            })}
          >
            <Text style={styles.primaryBtnText}>{getPrimaryButtonText()}</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            {isOnline ? (
              <>
                <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Call</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Schedule Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Padding bottom for floating button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120, // for floating button
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  reviews: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  trustSection: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  trustItem: {
    minWidth: '45%',
  },
  trustLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  trustValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  availabilityStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
    marginBottom: 4,
  },
  availabilitySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
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
});
