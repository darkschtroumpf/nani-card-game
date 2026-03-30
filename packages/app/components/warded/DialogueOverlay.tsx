import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Animated, Dimensions } from 'react-native';
import { warded, wardedFonts } from '../../theme-warded';
import type { DialogueNode, DialogueChoice } from '../../../engine/src/warded/campaign-types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Scene backgrounds
const SCENE_IMAGES: Record<string, any> = {
  village_sunset: require('../../assets/images/scene_village_sunset.png'),
  messenger: require('../../assets/images/scene_messenger.png'),
  refugees: require('../../assets/images/scene_refugees.png'),
  ward_book: require('../../assets/images/scene_ward_book.png'),
  dawn_victory: require('../../assets/images/scene_dawn_victory.png'),
  village_burning: require('../../assets/images/scene_village_burning.png'),
};

// Character sprites (half-body, VN style)
const SPRITES: Record<string, any> = {
  arlen_young: require('../../assets/images/sprite_arlen_young.png'),
  jeph: require('../../assets/images/sprite_jeph.png'),
  silvy: require('../../assets/images/sprite_silvy.png'),
  ragen: require('../../assets/images/sprite_ragen.png'),
  refugee: require('../../assets/images/sprite_refugee.png'),
  // Fallbacks to hero portraits for characters without sprites
  arlen: require('../../assets/images/hero_arlen.png'),
  jardir: require('../../assets/images/hero_jardir.png'),
  rojer: require('../../assets/images/hero_rojer.png'),
  leesha: require('../../assets/images/hero_leesha.png'),
};

const SPEAKER_COLORS: Record<string, string> = {
  arlen: '#FFD740',
  arlen_young: '#FFD740',
  jardir: '#FF5252',
  rojer: '#7C4DFF',
  leesha: '#69F0AE',
  jeph: '#8D6E63',
  silvy: '#CE93D8',
  ragen: '#42A5F5',
  narrator: '#90A4AE',
  refugee: '#A1887F',
};

const SPEAKER_NAMES: Record<string, string> = {
  arlen: 'Arlen',
  arlen_young: 'Arlen',
  jardir: 'Jardir',
  rojer: 'Rojer',
  leesha: 'Leesha',
  jeph: 'Jeph Bales',
  silvy: 'Silvy Bales',
  ragen: 'Ragen',
  narrator: '',
  refugee: 'Réfugié',
};

const EMOTION_ICONS: Record<string, string> = {
  scared: '😨',
  angry: '😠',
  determined: '💪',
  sad: '😢',
  hopeful: '✨',
  neutral: '',
};

interface Props {
  nodes: DialogueNode[];
  onChoice: (choiceId: string) => void;
  onComplete: () => void;
}

const TYPEWRITER_SPEED = 22;

export default function DialogueOverlay({ nodes, onChoice, onComplete }: Props) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spriteAnim = useRef(new Animated.Value(0)).current;

  const node = nodes[nodeIndex];
  const line = node?.lines[lineIndex];
  const isLastLine = node && lineIndex >= node.lines.length - 1;
  const isLastNode = nodeIndex >= nodes.length - 1;
  const fullText = line?.text ?? '';
  const isTyping = displayedChars < fullText.length;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Typewriter reset on new line
  useEffect(() => {
    setDisplayedChars(0);
    setShowChoices(false);
    // Animate sprite entrance
    spriteAnim.setValue(0);
    Animated.spring(spriteAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }).start();
  }, [nodeIndex, lineIndex]);

  // Typewriter tick
  useEffect(() => {
    if (displayedChars < fullText.length) {
      const timer = setTimeout(() => setDisplayedChars(prev => prev + 1), TYPEWRITER_SPEED);
      return () => clearTimeout(timer);
    } else if (isLastLine && node?.choices) {
      setShowChoices(true);
    }
  }, [displayedChars, fullText.length]);

  const handleTap = () => {
    if (isTyping) { setDisplayedChars(fullText.length); return; }
    if (showChoices) return;

    if (!isLastLine) {
      setLineIndex(prev => prev + 1);
    } else if (node?.nextNodeId) {
      const nextIdx = nodes.findIndex(n => n.id === node.nextNodeId);
      if (nextIdx >= 0) { setNodeIndex(nextIdx); setLineIndex(0); }
      else onComplete();
    } else if (!isLastNode) {
      setNodeIndex(prev => prev + 1);
      setLineIndex(0);
    } else {
      onComplete();
    }
  };

  if (!node || !line) return null;

  const speakerColor = SPEAKER_COLORS[line.speaker] ?? warded.text;
  const speakerName = SPEAKER_NAMES[line.speaker] ?? line.speaker;
  const emotionIcon = line.emotion ? EMOTION_ICONS[line.emotion] ?? '' : '';
  const sprite = SPRITES[line.speaker];
  const isNarrator = line.speaker === 'narrator';
  const sceneImage = node.background ? SCENE_IMAGES[node.background] : null;

  // Find other characters present in this node (for background sprites)
  const otherSpeakers = [...new Set(node.lines.map(l => l.speaker))]
    .filter(s => s !== 'narrator' && s !== line.speaker && SPRITES[s]);

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.tapArea} activeOpacity={1} onPress={handleTap}>
        {/* Full-screen scene background */}
        {sceneImage ? (
          <ImageBackground source={sceneImage} style={StyleSheet.absoluteFillObject} imageStyle={{ resizeMode: 'cover' }}>
            <View style={styles.sceneOverlay} />
          </ImageBackground>
        ) : (
          <View style={styles.backdrop} />
        )}

        {/* Character sprites area (above text box) */}
        {!isNarrator && (
          <View style={styles.spriteArea}>
            {/* Other characters (dimmed, smaller, in background) */}
            {otherSpeakers.map((s, i) => (
              <View key={s} style={[styles.bgSpriteContainer, i === 0 ? styles.bgSpriteLeft : styles.bgSpriteRight]}>
                <Image source={SPRITES[s]} style={styles.bgSprite} />
              </View>
            ))}

            {/* Active speaker sprite (centered, larger, animated) */}
            {sprite && (
              <Animated.View style={[
                styles.activeSpriteContainer,
                {
                  transform: [
                    { translateY: spriteAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                    { scale: spriteAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
                  ],
                  opacity: spriteAnim,
                },
              ]}>
                <Image source={sprite} style={styles.activeSprite} />
                {/* Glow behind active speaker */}
                <View style={[styles.spriteGlow, { backgroundColor: speakerColor + '15' }]} />
              </Animated.View>
            )}
          </View>
        )}

        {/* Narrator: just show the scene, no sprites */}
        {isNarrator && <View style={styles.spriteArea} />}

        {/* Text box (bottom) */}
        <View style={styles.dialogueBox}>
          {/* Speaker name tag */}
          {!isNarrator && (
            <View style={[styles.nameTag, { borderColor: speakerColor, backgroundColor: speakerColor + '15' }]}>
              <Text style={[styles.nameText, { color: speakerColor }]}>
                {emotionIcon ? `${emotionIcon} ` : ''}{speakerName}
              </Text>
            </View>
          )}

          {/* Dialogue text */}
          <Text style={[styles.dialogueText, isNarrator && styles.narratorText]}>
            {fullText.substring(0, displayedChars)}
            {isTyping && <Text style={styles.cursor}>|</Text>}
          </Text>

          {/* Tap hint */}
          {!isTyping && !showChoices && (
            <Text style={styles.tapHint}>▶</Text>
          )}

          {/* Choices */}
          {showChoices && node.choices && (
            <View style={styles.choicesContainer}>
              {node.choices.map(choice => (
                <TouchableOpacity
                  key={choice.id}
                  style={styles.choiceBtn}
                  onPress={() => onChoice(choice.id)}
                >
                  <Text style={styles.choiceLabel}>{choice.label}</Text>
                  <Text style={styles.choiceHint}>{choice.hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const SPRITE_HEIGHT = SCREEN_H * 0.42;
const TEXTBOX_HEIGHT = SCREEN_H * 0.32;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  tapArea: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,15,0.92)',
  },
  sceneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  // --- Sprite area (top 55% of screen) ---
  spriteArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0,
  },
  activeSpriteContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  activeSprite: {
    width: SCREEN_W * 0.55,
    height: SPRITE_HEIGHT,
    resizeMode: 'contain',
  },
  spriteGlow: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_W * 0.6,
    height: SPRITE_HEIGHT * 0.5,
    borderRadius: SCREEN_W * 0.3,
    opacity: 0.3,
    zIndex: -1,
  },
  bgSpriteContainer: {
    position: 'absolute',
    bottom: 0,
    zIndex: 5,
    opacity: 0.35,
  },
  bgSpriteLeft: {
    left: -10,
  },
  bgSpriteRight: {
    right: -10,
  },
  bgSprite: {
    width: SCREEN_W * 0.35,
    height: SPRITE_HEIGHT * 0.75,
    resizeMode: 'contain',
  },

  // --- Text box (bottom 32%) ---
  dialogueBox: {
    backgroundColor: 'rgba(10,10,20,0.92)',
    borderTopWidth: 2,
    borderTopColor: warded.accent + '60',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: 18,
    minHeight: TEXTBOX_HEIGHT,
    gap: 8,
  },
  nameTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 2,
  },
  nameText: {
    fontSize: wardedFonts.sm,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dialogueText: {
    color: '#E8E8F0',
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  narratorText: {
    fontStyle: 'italic',
    color: '#9AA0B0',
    textAlign: 'center',
    paddingTop: 20,
  },
  cursor: {
    color: warded.accent,
    fontSize: 15,
  },
  tapHint: {
    color: warded.textDim,
    fontSize: 14,
    textAlign: 'right',
    opacity: 0.5,
  },
  choicesContainer: {
    gap: 8,
    marginTop: 4,
  },
  choiceBtn: {
    borderWidth: 1,
    borderColor: warded.accent + '80',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,215,64,0.06)',
    gap: 2,
  },
  choiceLabel: {
    color: warded.accent,
    fontSize: wardedFonts.md,
    fontWeight: 'bold',
  },
  choiceHint: {
    color: warded.textDim,
    fontSize: wardedFonts.xs,
  },
});
