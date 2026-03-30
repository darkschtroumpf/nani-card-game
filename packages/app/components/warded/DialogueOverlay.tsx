import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Animated } from 'react-native';
import { warded, wardedFonts } from '../../theme-warded';
import type { DialogueNode, DialogueChoice } from '../../../engine/src/warded/campaign-types';

const SCENE_IMAGES: Record<string, any> = {
  village_sunset: require('../../assets/images/scene_village_sunset.png'),
  messenger: require('../../assets/images/scene_messenger.png'),
  refugees: require('../../assets/images/scene_refugees.png'),
  ward_book: require('../../assets/images/scene_ward_book.png'),
  dawn_victory: require('../../assets/images/scene_dawn_victory.png'),
  village_burning: require('../../assets/images/scene_village_burning.png'),
};

const HERO_PORTRAITS: Record<string, any> = {
  arlen: require('../../assets/images/hero_arlen.png'),
  arlen_young: require('../../assets/images/hero_arlen_young.png'),
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

const TYPEWRITER_SPEED = 25; // ms per character

export default function DialogueOverlay({ nodes, onChoice, onComplete }: Props) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const node = nodes[nodeIndex];
  const line = node?.lines[lineIndex];
  const isLastLine = node && lineIndex >= node.lines.length - 1;
  const isLastNode = nodeIndex >= nodes.length - 1;
  const fullText = line?.text ?? '';
  const isTyping = displayedChars < fullText.length;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Typewriter effect
  useEffect(() => {
    setDisplayedChars(0);
    setShowChoices(false);
  }, [nodeIndex, lineIndex]);

  useEffect(() => {
    if (displayedChars < fullText.length) {
      const timer = setTimeout(() => setDisplayedChars(prev => prev + 1), TYPEWRITER_SPEED);
      return () => clearTimeout(timer);
    } else if (isLastLine && node?.choices) {
      setShowChoices(true);
    }
  }, [displayedChars, fullText.length]);

  const handleTap = () => {
    if (isTyping) {
      // Skip to full text
      setDisplayedChars(fullText.length);
      return;
    }

    if (showChoices) return; // wait for choice

    if (!isLastLine) {
      // Next line
      setLineIndex(prev => prev + 1);
    } else if (node?.nextNodeId) {
      // Jump to linked node
      const nextIdx = nodes.findIndex(n => n.id === node.nextNodeId);
      if (nextIdx >= 0) {
        setNodeIndex(nextIdx);
        setLineIndex(0);
      } else {
        onComplete();
      }
    } else if (!isLastNode) {
      // Next node
      setNodeIndex(prev => prev + 1);
      setLineIndex(0);
    } else {
      onComplete();
    }
  };

  const handleChoice = (choice: DialogueChoice) => {
    onChoice(choice.id);
  };

  if (!node || !line) return null;

  const speakerColor = SPEAKER_COLORS[line.speaker] ?? warded.text;
  const speakerName = SPEAKER_NAMES[line.speaker] ?? line.speaker;
  const emotionIcon = line.emotion ? EMOTION_ICONS[line.emotion] ?? '' : '';
  const portrait = HERO_PORTRAITS[line.speaker];
  const isNarrator = line.speaker === 'narrator';

  const sceneImage = node.background ? SCENE_IMAGES[node.background] : null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.tapArea} activeOpacity={1} onPress={handleTap}>
        {/* Scene background image */}
        {sceneImage ? (
          <ImageBackground source={sceneImage} style={styles.sceneBackground} imageStyle={styles.sceneImage}>
            <View style={styles.sceneOverlay} />
          </ImageBackground>
        ) : (
          <View style={styles.backdrop} />
        )}

        {/* Dialogue box */}
        <View style={styles.dialogueBox}>
          {/* Portrait + speaker */}
          {!isNarrator && (
            <View style={styles.speakerRow}>
              {portrait && (
                <Image source={portrait} style={[styles.portrait, { borderColor: speakerColor }]} />
              )}
              {!portrait && (
                <View style={[styles.portraitPlaceholder, { backgroundColor: speakerColor + '30', borderColor: speakerColor }]}>
                  <Text style={[styles.portraitInitial, { color: speakerColor }]}>
                    {speakerName.charAt(0)}
                  </Text>
                </View>
              )}
              <View>
                <Text style={[styles.speakerName, { color: speakerColor }]}>
                  {emotionIcon} {speakerName}
                </Text>
              </View>
            </View>
          )}

          {/* Text */}
          <Text style={[styles.dialogueText, isNarrator && styles.narratorText]}>
            {fullText.substring(0, displayedChars)}
            {isTyping && <Text style={styles.cursor}>▌</Text>}
          </Text>

          {/* Tap hint */}
          {!isTyping && !showChoices && (
            <Text style={styles.tapHint}>Tape pour continuer ▶</Text>
          )}

          {/* Choices */}
          {showChoices && node.choices && (
            <View style={styles.choicesContainer}>
              {node.choices.map(choice => (
                <TouchableOpacity
                  key={choice.id}
                  style={styles.choiceBtn}
                  onPress={() => handleChoice(choice)}
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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  tapArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  sceneBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  sceneImage: {
    resizeMode: 'cover',
  },
  sceneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  dialogueBox: {
    backgroundColor: warded.bgCard,
    borderTopWidth: 2,
    borderTopColor: warded.accent,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    minHeight: 180,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  portrait: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  portraitPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portraitInitial: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  speakerName: {
    fontSize: wardedFonts.md,
    fontWeight: 'bold',
  },
  dialogueText: {
    color: warded.text,
    fontSize: wardedFonts.md,
    lineHeight: 24,
  },
  narratorText: {
    fontStyle: 'italic',
    color: '#90A4AE',
  },
  cursor: {
    color: warded.accent,
    fontSize: wardedFonts.md,
  },
  tapHint: {
    color: warded.textDim,
    fontSize: wardedFonts.xs,
    textAlign: 'right',
  },
  choicesContainer: {
    gap: 8,
    marginTop: 4,
  },
  choiceBtn: {
    borderWidth: 1,
    borderColor: warded.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: warded.accent + '10',
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
