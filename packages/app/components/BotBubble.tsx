import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  message: string | null;
  type?: 'action' | 'reaction' | 'nani';
}

const EMOJIS: Record<string, string[]> = {
  buy: ['Hmm...', 'Interessant!', 'Ca me plait'],
  deploy: ['A moi!', 'En garde!', 'Prepare-toi!'],
  attack: ['YAAAH!', 'Prends ca!', 'En avant!'],
  meditate: ['Ommm...', 'Focus...', 'Patience...'],
  nani_call: ['NANI?!', 'Menteur!', 'Je le savais!'],
  nani_correct: ['Haha!', 'Grille!', 'Trop facile!'],
  nani_wrong: ['Oups...', 'Zut!', 'Argh...'],
  skip: ['...', 'On verra', 'Pas maintenant'],
};

export function getRandomBubble(action: string): string {
  const pool = EMOJIS[action] ?? EMOJIS.skip;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function BotBubble({ message, type = 'action' }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!message) return;

    opacity.setValue(0);
    translateY.setValue(10);
    scale.setValue(0.8);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 10 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 8 }),
    ]).start();

    // Auto-hide after delay
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, type === 'nani' ? 1500 : 800);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  const bgColor = type === 'nani' ? colors.primary : type === 'reaction' ? colors.secondary : colors.bgCard;

  return (
    <Animated.View style={[
      styles.bubble,
      { backgroundColor: bgColor, opacity, transform: [{ translateY }, { scale }] },
    ]}>
      <Text style={[styles.text, type === 'nani' && styles.naniText]}>{message}</Text>
      <View style={[styles.arrow, { borderTopColor: bgColor }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    top: -36,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 50,
  },
  text: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  naniText: {
    fontSize: fonts.sizes.lg,
    letterSpacing: 2,
  },
  arrow: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
