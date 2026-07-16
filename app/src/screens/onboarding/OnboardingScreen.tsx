import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AuthNavigationProp } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/ui/Button';
import Svg, { Path } from 'react-native-svg';
import Feather from '@expo/vector-icons/Feather';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    headline: 'Where Fashion Meets\n',
    italicPart: 'Effortless Shopping',
    tail: '',
    sub: 'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor incididunt',
    image: require('../../../assets/images/onboarding/first.png'),
  },
  {
    id: '2',
    headline: 'Your Personal Collection\nof ',
    italicPart: 'Favorite Styles',
    tail: '',
    sub: 'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor incididunt',
    image: require('../../../assets/images/onboarding/second.png'),
  },
  {
    id: '3',
    headline: 'Your ',
    italicPart: 'Personal Fashion App\n',
    tail: 'for Every Occasion',
    sub: 'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor incididunt',
    image: require('../../../assets/images/onboarding/onboarding_bg_3_1784115148797.jpg'),
  },
];

const WavyHeader = () => {
  return (
    <View style={styles.waveContainer}>
      <Svg height="60" width={SCREEN_W} viewBox={`0 0 ${SCREEN_W} 60`} preserveAspectRatio="none">
        <Path 
          d={`M0 60 L0 0 Q${SCREEN_W/2} 80 ${SCREEN_W} 0 L${SCREEN_W} 60 Z`} 
          fill={colors.white} 
        />
      </Svg>
    </View>
  );
};

export function OnboardingScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex((i) => i + 1);
    } else {
      navigation.replace('SignUp');
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex((i) => i - 1);
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => navigation.replace('SignUp')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.imageBg} />
            
            <View style={styles.contentContainer}>
              <WavyHeader />
              <View style={styles.textCard}>
                <Text style={styles.headline}>
                  {item.headline}
                  <Text style={styles.italic}>{item.italicPart}</Text>
                  {item.tail}
                </Text>
                <Text style={styles.subText}>{item.sub}</Text>

                {/* Controls inside the text card area */}
                {!isLast && (
                  <View style={styles.controls}>
                    <TouchableOpacity
                      onPress={goToPrev}
                      style={[styles.arrowBtn, currentIndex === 0 && styles.arrowInvisible]}
                    >
                      <View style={styles.arrowCircleOutline}>
                        <Feather name="arrow-left" size={24} color={colors.primary} />
                      </View>
                    </TouchableOpacity>

                    <View style={styles.dots}>
                      {SLIDES.map((_, i) => (
                        <View
                          key={i}
                          style={[styles.dot, i === currentIndex && styles.dotActive]}
                        />
                      ))}
                    </View>

                    <TouchableOpacity
                      onPress={goToNext}
                      style={styles.arrowBtn}
                    >
                      <View style={styles.arrowCircle}>
                        <Feather name="arrow-right" size={24} color={colors.white} />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
                
                {isLast && (
                  <View style={styles.ctaArea}>
                    <Button title="Let's Get Started" onPress={() => navigation.replace('SignUp')} />
                    <TouchableOpacity onPress={() => navigation.replace('SignIn')} style={{marginTop: spacing.xl}}>
                      <Text style={styles.signInLink}>
                        Already have an account?{' '}
                        <Text style={styles.signInLinkBold}>Sign In</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop:35,
    flex: 1,
    backgroundColor: '#F7F7F7', // Light gray to match the mockup background
  },
  skipBtn: {
    position: 'absolute',
    top: 10,
    right: spacing.screenHorizontal,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: '#FFB873', // Orange/accent color from design
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  slide: {
    width: SCREEN_W,
    height: SCREEN_H,
    position: 'relative',
    backgroundColor: '#F7F7F7',
  },
  imageBg: {
    width: '85%',
    height: SCREEN_H * 0.55,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 30,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: SCREEN_H * 0.45,
  },
  waveContainer: {
    width: '100%',
    height: 60,
    backgroundColor: 'transparent',
    marginTop: -59, // Pull it up over the image
  },
  textCard: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headline: {
    fontSize: 26,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  italic: {
    fontStyle: 'italic',
    color: colors.primary,
  },
  subText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 25,
    backgroundColor: '#F5E1CE', // Light orange/brown dot
  },
  dotActive: {
    backgroundColor: '#FFB873',
  },
  arrowBtn: {
    padding: 4,
  },
  arrowInvisible: {
    opacity: 0,
  },
  arrowCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircleOutline: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  ctaArea: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  signInLink: {
    textAlign: 'center',
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  signInLinkBold: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    textDecorationLine: 'underline',
  },
});
