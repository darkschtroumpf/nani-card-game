import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { colors, fonts, universeColor } from '../theme';
import { impactFeedback, warningFeedback, successFeedback, errorFeedback } from '../services/feedback';
import DojoCard from './DojoCard';
import type { CardDef, Universe } from '../../engine/src/dojo/types';

export type CombatStep = 'declaration' | 'choose_blocker' | 'trap_choice' | 'defense' | 'nani_call' | 'reveal' | 'resolution';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  step: CombatStep;
  attackerName: string;
  defenderName: string;
  attackerFighter?: CardDef;
  defenderFighter?: CardDef;
  declaredUniverse: Universe;
  attackerConcealed: boolean;
  naniCalled: boolean;
  naniResult?: 'correct' | 'wrong' | null;
  events: string[];
  isDefender: boolean;
  canCallNani: boolean;
  myFighters?: { name: string; universe: string; atk: number; hp: number; slot: number }[];
  onContinue: () => void;
  onNaniCall?: () => void;
  onPassDefense?: () => void;
  onChooseBlocker?: (slot: number) => void;
  onTriggerTrap?: () => void;
  onSkipTrap?: () => void;
}

export default function CombatArena(props: Props) {
  const {
    step, attackerName, defenderName, attackerFighter, defenderFighter,
    declaredUniverse, attackerConcealed, naniCalled, naniResult,
    events, isDefender, canCallNani, myFighters,
    onContinue, onNaniCall, onPassDefense, onChooseBlocker,
    onTriggerTrap, onSkipTrap,
  } = props;

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const cardLeftX = useRef(new Animated.Value(-SCREEN_W)).current;
  const cardRightX = useRef(new Animated.Value(SCREEN_W)).current;
  const vsScale = useRef(new Animated.Value(0)).current;
  const naniScale = useRef(new Animated.Value(0)).current;
  const naniFlash = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const damageOpacity = useRef(new Animated.Value(0)).current;
  const damageY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset and play entrance animation per step
    fadeIn.setValue(0);
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    if (step === 'declaration') {
      cardLeftX.setValue(-SCREEN_W);
      cardRightX.setValue(SCREEN_W);
      vsScale.setValue(0);
      Animated.parallel([
        Animated.spring(cardLeftX, { toValue: 0, useNativeDriver: true, damping: 12 }),
        Animated.spring(cardRightX, { toValue: 0, useNativeDriver: true, damping: 12 }),
        Animated.sequence([
          Animated.delay(400),
          Animated.spring(vsScale, { toValue: 1, useNativeDriver: true, damping: 8 }),
        ]),
      ]).start();
      impactFeedback();
    }

    if (step === 'nani_call' && isDefender && attackerConcealed) {
      warningFeedback();
    }

    if (step === 'reveal') {
      // Cards clash together
      cardLeftX.setValue(-40);
      cardRightX.setValue(40);
      Animated.sequence([
        Animated.parallel([
          Animated.spring(cardLeftX, { toValue: 10, useNativeDriver: true, damping: 6, stiffness: 200 }),
          Animated.spring(cardRightX, { toValue: -10, useNativeDriver: true, damping: 6, stiffness: 200 }),
        ]),
        Animated.parallel([
          Animated.spring(cardLeftX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(cardRightX, { toValue: 0, useNativeDriver: true }),
        ]),
      ]).start();
      impactFeedback();

      if (naniResult === 'correct') {
        setTimeout(() => successFeedback(), 500);
      } else if (naniResult === 'wrong') {
        setTimeout(() => errorFeedback(), 500);
      }
    }

    if (step === 'resolution') {
      damageOpacity.setValue(1);
      damageY.setValue(0);
      Animated.parallel([
        Animated.timing(damageY, { toValue: -60, duration: 1200, useNativeDriver: true }),
        Animated.timing(damageOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]).start();
      impactFeedback();
    }
  }, [step]);

  // NANI animation
  const triggerNani = () => {
    naniScale.setValue(0.3);
    naniFlash.setValue(1);

    // Screen flash
    Animated.timing(naniFlash, { toValue: 0, duration: 400, useNativeDriver: true }).start();

    // Text spring
    Animated.spring(naniScale, { toValue: 1, useNativeDriver: true, damping: 6, stiffness: 150 }).start();

    // Screen shake
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    // Triple haptic
    impactFeedback();
    setTimeout(() => impactFeedback(), 100);
    setTimeout(() => impactFeedback(), 200);

    setTimeout(() => onNaniCall?.(), 800);
  };

  const uColor = universeColor(declaredUniverse as any);

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeIn, transform: [{ translateX: shakeX }] }]}>
      {/* Red flash for NANI */}
      <Animated.View style={[styles.naniFlash, { opacity: naniFlash }]} pointerEvents="none" />

      <View style={styles.content}>
        {/* DECLARATION */}
        {step === 'declaration' && (
          <>
            <View style={styles.combatRow}>
              <Animated.View style={[styles.fighterCol, { transform: [{ translateX: cardLeftX }] }]}>
                {attackerConcealed ? (
                  <DojoCard concealed />
                ) : (
                  <DojoCard card={attackerFighter} />
                )}
                <Text style={styles.nameLabel}>{attackerName}</Text>
              </Animated.View>

              <Animated.View style={{ transform: [{ scale: vsScale }] }}>
                <Text style={styles.vsText}>VS</Text>
              </Animated.View>

              <Animated.View style={[styles.fighterCol, { transform: [{ translateX: cardRightX }] }]}>
                {defenderFighter ? (
                  <DojoCard card={defenderFighter} />
                ) : (
                  <View style={styles.directLP}>
                    <Text style={styles.directLPText}>LP</Text>
                  </View>
                )}
                <Text style={styles.nameLabel}>{defenderName}</Text>
              </Animated.View>
            </View>

            {defenderFighter ? (
              <View style={[styles.universeBadge, { backgroundColor: uColor }]}>
                <Text style={styles.universeText}>{declaredUniverse.toUpperCase()}</Text>
              </View>
            ) : (
              <View style={[styles.universeBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.universeText}>ATTAQUE DIRECTE</Text>
              </View>
            )}

            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* CHOOSE BLOCKER (Mode B: defender picks which fighter blocks) */}
        {step === 'choose_blocker' && isDefender && (
          <>
            <Text style={styles.title}>Qui bloque?</Text>
            <Text style={styles.subtitle}>{attackerName} t'attaque en declarant {declaredUniverse}!</Text>
            <Text style={styles.subtitle}>Choisis ton defenseur :</Text>
            <View style={styles.combatRow}>
              {(myFighters ?? []).map((f) => (
                <TouchableOpacity
                  key={f.slot}
                  style={styles.blockerBtn}
                  onPress={() => onChooseBlocker?.(f.slot)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.blockerName, { color: universeColor(f.universe as any) }]}>{f.name}</Text>
                  <Text style={styles.blockerStats}>{f.atk}/{f.hp}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 'choose_blocker' && !isDefender && (
          <>
            <Text style={styles.subtitle}>{defenderName} choisit son defenseur...</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* TRAP CHOICE */}
        {step === 'trap_choice' && isDefender && (
          <>
            <Text style={styles.title}>Piege!</Text>
            <Text style={styles.subtitle}>Tu as un piege pose. L'activer?</Text>
            <View style={styles.combatRow}>
              <TouchableOpacity style={[styles.blockerBtn, { borderColor: colors.trap }]} onPress={onTriggerTrap}>
                <Text style={[styles.blockerName, { color: colors.trap }]}>Activer!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.blockerBtn} onPress={onSkipTrap}>
                <Text style={styles.blockerName}>Garder</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'trap_choice' && !isDefender && (
          <>
            <Text style={styles.subtitle}>{defenderName} decide...</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* DEFENSE */}
        {step === 'defense' && (
          <>
            <Text style={styles.title}>{isDefender ? 'Tu es attaque!' : 'Defense...'}</Text>
            <Text style={styles.subtitle}>
              {isDefender
                ? `${attackerName} t'attaque en declarant ${declaredUniverse}!`
                : `${defenderName} decide...`}
            </Text>
            <TouchableOpacity style={styles.continueBtn} onPress={isDefender ? onPassDefense : onContinue}>
              <Text style={styles.continueBtnText}>{isDefender ? 'Pas de technique' : 'Continuer'}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* NANI CALL */}
        {step === 'nani_call' && (
          <>
            {isDefender && attackerConcealed && canCallNani ? (
              <>
                <Text style={styles.title}>Fighter cache!</Text>
                <Text style={styles.subtitle}>Bluff ou verite?</Text>

                <TouchableOpacity style={styles.naniBtn} onPress={triggerNani} activeOpacity={0.8}>
                  <Text style={styles.naniBtnText}>NANI?!</Text>
                  <Text style={styles.naniBtnSub}>Risque: -3 LP si tu te trompes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.passBtn} onPress={onContinue}>
                  <Text style={styles.passBtnText}>Laisser passer</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {naniCalled ? (
                  <Animated.Text style={[styles.naniShout, { transform: [{ scale: naniScale }] }]}>
                    NANI?!
                  </Animated.Text>
                ) : (
                  <Text style={styles.subtitle}>Le combat continue.</Text>
                )}
                <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
                  <Text style={styles.continueBtnText}>Continuer</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* REVEAL */}
        {step === 'reveal' && (
          <>
            <Text style={styles.title}>Revelation!</Text>

            {naniResult === 'correct' && (
              <Text style={styles.naniCorrect}>BLUFF DEMASQUE!</Text>
            )}
            {naniResult === 'wrong' && (
              <Text style={styles.naniWrong}>NANI raté! -3 LP</Text>
            )}

            <View style={styles.combatRow}>
              <Animated.View style={[styles.fighterCol, { transform: [{ translateX: cardLeftX }] }]}>
                <DojoCard card={attackerFighter} />
                <Text style={styles.nameLabel}>{attackerName}</Text>
              </Animated.View>

              <Text style={styles.vsSmall}>vs</Text>

              <Animated.View style={[styles.fighterCol, { transform: [{ translateX: cardRightX }] }]}>
                {defenderFighter ? (
                  <DojoCard card={defenderFighter} />
                ) : (
                  <Text style={styles.directLPText}>LP</Text>
                )}
                <Text style={styles.nameLabel}>{defenderName}</Text>
              </Animated.View>
            </View>

            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* RESOLUTION */}
        {step === 'resolution' && (
          <>
            <Text style={styles.title}>Resolution</Text>

            {/* Floating damage numbers */}
            <Animated.View style={[styles.damageContainer, { opacity: damageOpacity, transform: [{ translateY: damageY }] }]}>
              {events.slice(0, 3).map((e, i) => (
                <Text key={i} style={styles.damageText}>{e}</Text>
              ))}
            </Animated.View>

            {/* Remaining events */}
            {events.slice(3).map((e, i) => (
              <Text key={i + 3} style={styles.eventText}>{e}</Text>
            ))}

            {events.length === 0 && (
              <Text style={styles.eventText}>Combat termine.</Text>
            )}

            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>OK</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  naniFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    zIndex: 101,
  },
  content: {
    width: '92%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 16,
    zIndex: 102,
  },

  // Cards row
  combatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  fighterCol: {
    alignItems: 'center',
    gap: 8,
  },
  nameLabel: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  vsText: {
    color: colors.accent,
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  vsSmall: {
    color: colors.textDim,
    fontSize: fonts.sizes.lg,
  },
  directLP: {
    width: 72,
    height: 104,
    borderRadius: 8,
    backgroundColor: 'rgba(233,69,96,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  directLPText: {
    color: colors.danger,
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
  },

  // Universe badge
  universeBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  universeText: {
    color: '#fff',
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  // Titles
  title: {
    color: colors.primary,
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    textShadowColor: 'rgba(233,69,96,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: fonts.sizes.lg,
    textAlign: 'center',
  },

  // NANI button
  naniBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff6b6b',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 16,
  },
  naniBtnText: {
    color: colors.text,
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  naniBtnSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
  },
  naniShout: {
    color: colors.primary,
    fontSize: 64,
    fontWeight: 'bold',
    letterSpacing: 8,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  naniCorrect: {
    color: colors.success,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    textShadowColor: colors.success,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  naniWrong: {
    color: colors.danger,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },

  // Buttons
  continueBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
  },
  continueBtnText: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
  passBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  passBtnText: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
  },

  // Damage
  damageContainer: {
    alignItems: 'center',
    gap: 4,
  },
  damageText: {
    color: colors.warning,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255,152,0,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  eventText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
  blockerBtn: {
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    gap: 4,
    minWidth: 80,
  },
  blockerName: {
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  blockerStats: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
  },
});
