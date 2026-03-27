import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, universeColor } from '../theme';
import { useDojoController } from '../hooks/useDojoController';
import { useDojoOnlineHost } from '../hooks/useDojoOnlineHost';
import { useDojoOnlineGuest } from '../hooks/useDojoOnlineGuest';
import type { DojoGameController, DojoGameConfig } from '../hooks/useDojoController';
import type { Archetype, Universe, TurnPhase } from '../../engine/src/dojo/types';
import { UNIVERSES } from '../../engine/src/dojo/types';
import PhaseIndicator from '../components/PhaseIndicator';
import OpponentHUD from '../components/OpponentHUD';
import DojoMarket from '../components/DojoMarket';
import FieldView from '../components/FieldView';
import DojoCard from '../components/DojoCard';
import ResourceBar from '../components/ResourceBar';
import MessageFeed from '../components/MessageFeed';
import CombatArena from '../components/CombatArena';
import type { CombatStep } from '../components/CombatArena';
import { tapFeedback, impactFeedback, warningFeedback, playCardFeedback, successFeedback } from '../services/feedback';
import DojoTutorial, { DOJO_TUTORIAL_STEPS } from '../components/DojoTutorial';

// ============================================================
// Wrappers — one hook per mode (Rules of Hooks safe)
// ============================================================

function DojoSoloGame({ params, children }: { params: any; children: (ctrl: DojoGameController) => React.ReactNode }) {
  const ctrl = useDojoController();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    ctrl.startGame({
      playerName: params.playerName ?? 'Joueur',
      playerArchetype: (params.archetype as Archetype) ?? 'shonen_blitz',
      botCount: parseInt(params.botCount ?? '4', 10),
    });
  }, []);

  return <>{children(ctrl)}</>;
}

function DojoOnlineHostGame({ params, children }: { params: any; children: (ctrl: DojoGameController) => React.ReactNode }) {
  const ctrl = useDojoOnlineHost({
    gameId: params.gameId ?? '',
    botCount: parseInt(params.botCount ?? '2', 10),
    playerArchetype: (params.archetype as Archetype) ?? 'shonen_blitz',
  });
  return <>{children(ctrl)}</>;
}

function DojoOnlineGuestGame({ params, children }: { params: any; children: (ctrl: DojoGameController) => React.ReactNode }) {
  const ctrl = useDojoOnlineGuest({ gameId: params.gameId ?? '' });
  return <>{children(ctrl)}</>;
}

export default function GameScreen() {
  const params = useLocalSearchParams<{
    mode: string; playerName: string; botCount: string;
    archetype: string; gameId: string; isHost: string;
  }>();

  const isOnline = params.mode === 'online';
  const isHost = params.isHost === 'true';

  const Wrapper = isOnline
    ? (isHost ? DojoOnlineHostGame : DojoOnlineGuestGame)
    : DojoSoloGame;

  return (
    <Wrapper params={params}>
      {(ctrl) => <DojoGameUI ctrl={ctrl} />}
    </Wrapper>
  );
}

// ============================================================
// Action Mode State Machine
// ============================================================

type ActionMode =
  | 'idle'
  | 'deploy_pick_card'
  | 'deploy_pick_slot'
  | 'deploy_concealed_choice'
  | 'trap_pick_card'
  | 'trap_pick_slot'
  | 'equip_pick_card'
  | 'equip_pick_slot'
  | 'combat_pick_attacker'
  | 'combat_pick_target_player'
  | 'combat_pick_target_slot'
  | 'combat_declare_universe';

// ============================================================
// Main Game UI
// ============================================================

function DojoGameUI({ ctrl }: { ctrl: DojoGameController }) {
  const router = useRouter();
  const { view, turnPhase, combatStep, combatEvents, isMyTurn, botBubbles } = ctrl;

  const [actionMode, setActionMode] = useState<ActionMode>('idle');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showDominance, setShowDominance] = useState(false);
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);
  const [selectedFieldSlot, setSelectedFieldSlot] = useState<number | null>(null);
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState<string | null>(null);
  const [selectedTargetSlot, setSelectedTargetSlot] = useState<number | null>(null);

  // Loading
  if (!view) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  const me = view.me;
  const isGameOver = me.lp <= 0 || (view as any).me === undefined;
  const gameState = ctrl.view;

  // Game Over
  if (view.turnPhase === undefined && ctrl.gameStarted) {
    // Fallback game over detection
  }

  // --- Handlers ---

  const resetAction = () => {
    setActionMode('idle');
    setSelectedHandIndex(null);
    setSelectedFieldSlot(null);
    setSelectedTargetPlayer(null);
    setSelectedTargetSlot(null);
  };

  const onHandCardPress = (index: number) => {
    tapFeedback();
    const card = me.hand[index];

    if (actionMode === 'deploy_pick_card' && card.card.type === 'fighter') {
      setSelectedHandIndex(index);
      setActionMode('deploy_pick_slot');
    } else if (actionMode === 'trap_pick_card') {
      setSelectedHandIndex(index);
      setActionMode('trap_pick_slot');
    } else if (actionMode === 'equip_pick_card' && card.card.type === 'equipment') {
      setSelectedHandIndex(index);
      setActionMode('equip_pick_slot');
    }
  };

  const onMyFieldSlotPress = (slot: number) => {
    tapFeedback();
    if (actionMode === 'deploy_pick_slot' && selectedHandIndex !== null) {
      setSelectedFieldSlot(slot);
      setActionMode('deploy_concealed_choice');
    } else if (actionMode === 'equip_pick_slot' && selectedHandIndex !== null) {
      ctrl.doEquip(selectedHandIndex, slot, false);
      resetAction();
    } else if (actionMode === 'combat_pick_attacker' && me.field[slot].fighter) {
      setSelectedFieldSlot(slot);
      setActionMode('combat_pick_target_player');
    }
  };

  const onTrapSlotPress = (slot: number) => {
    if (actionMode === 'trap_pick_slot' && selectedHandIndex !== null) {
      ctrl.doSetTrap(selectedHandIndex, slot);
      resetAction();
    }
  };

  const onDeployConcealedChoice = (concealed: boolean) => {
    if (selectedHandIndex !== null && selectedFieldSlot !== null) {
      impactFeedback();
      ctrl.doDeployFighter(selectedHandIndex, selectedFieldSlot, concealed);
      resetAction();
    }
  };

  const onOpponentPress = (oppId: string) => {
    if (actionMode === 'combat_pick_target_player') {
      setSelectedTargetPlayer(oppId);
      const opp = view.opponents.find(o => o.id === oppId);
      const hasFighters = opp?.field.some(s => s.hasFighter);
      if (!hasFighters) {
        // Direct attack — go to universe declaration
        setSelectedTargetSlot(null);
        setActionMode('combat_declare_universe');
      } else {
        setActionMode('combat_pick_target_slot');
      }
    }
  };

  const onOpponentSlotPress = (slot: number) => {
    if (actionMode === 'combat_pick_target_slot') {
      setSelectedTargetSlot(slot);
      setActionMode('combat_declare_universe');
    }
  };

  const onUniverseSelect = (u: Universe) => {
    if (actionMode === 'combat_declare_universe' && selectedFieldSlot !== null && selectedTargetPlayer) {
      impactFeedback();
      ctrl.selectAttack(selectedFieldSlot, selectedTargetPlayer, selectedTargetSlot, u);
      resetAction();
    }
  };

  // --- Status message ---
  const getStatus = (): string => {
    if (!isMyTurn && !combatStep) return 'En attente...';
    switch (turnPhase) {
      case 'dojo': return 'Phase Dojo — Achete, medite ou passe';
      case 'deploy':
        switch (actionMode) {
          case 'deploy_pick_card': return 'Choisis un fighter dans ta main';
          case 'deploy_pick_slot': return 'Choisis un emplacement sur le terrain';
          case 'deploy_concealed_choice': return 'Face visible ou cachee?';
          case 'trap_pick_card': return 'Choisis une carte a poser comme piege';
          case 'trap_pick_slot': return 'Choisis un emplacement piege';
          case 'equip_pick_card': return 'Choisis un equipement';
          case 'equip_pick_slot': return 'Choisis un fighter a equiper';
          default: return 'Phase Deploy — Deploie tes cartes';
        }
      case 'combat_select':
        switch (actionMode) {
          case 'combat_pick_attacker': return 'Choisis ton attaquant';
          case 'combat_pick_target_player': return 'Choisis ta cible';
          case 'combat_pick_target_slot': return 'Choisis le fighter adverse';
          case 'combat_declare_universe': return 'Declare un univers (tu peux bluffer!)';
          default: return 'Phase Combat — Attaque ou passe';
        }
      default: return '';
    }
  };

  // --- Render ---

  return (
    <SafeAreaView style={styles.container}>
      {/* Phase indicator + help button */}
      <View style={styles.topBar}>
        {turnPhase && (
          <View style={{ flex: 1 }}>
            <PhaseIndicator phase={turnPhase} turnNumber={view.turnNumber} />
          </View>
        )}
        <TouchableOpacity style={styles.helpBtn} onPress={() => setShowDominance(true)}>
          <Text style={styles.helpBtnText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Opponents */}
      <ScrollView
        horizontal
        style={styles.opponentsScroll}
        contentContainerStyle={styles.opponentsContent}
        showsHorizontalScrollIndicator={false}
      >
        {view.opponents.map((opp) => (
          <OpponentHUD
            key={opp.id}
            opponent={opp}
            isCurrentTurn={view.currentPlayerIndex === parseInt(opp.id.replace('p', ''))}
            isTargetable={actionMode === 'combat_pick_target_player' && opp.lp > 0}
            onPress={() => onOpponentPress(opp.id)}
            bubbleMessage={botBubbles[opp.id]?.message}
            bubbleType={botBubbles[opp.id]?.type}
          />
        ))}
      </ScrollView>

      {/* Opponent target field (when selecting target slot) */}
      {actionMode === 'combat_pick_target_slot' && selectedTargetPlayer && (
        <View style={styles.targetField}>
          <Text style={styles.targetLabel}>Choisis le fighter a attaquer :</Text>
          <View style={styles.targetSlots}>
            {view.opponents.find(o => o.id === selectedTargetPlayer)?.field.map((slot, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.targetSlot, slot.hasFighter && styles.targetSlotActive]}
                onPress={() => slot.hasFighter && onOpponentSlotPress(i)}
                disabled={!slot.hasFighter}
              >
                {slot.hasFighter ? (
                  <DojoCard card={slot.fighter ?? undefined} concealed={slot.concealed} small />
                ) : (
                  <Text style={styles.targetSlotEmpty}>Vide</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Main area */}
      <View style={styles.mainArea}>
        {/* Status */}
        {!combatStep && (
          <Text style={styles.statusText}>{getStatus()}</Text>
        )}

        {/* DOJO PHASE */}
        {turnPhase === 'dojo' && isMyTurn && !combatStep && (
          <DojoMarket
            dojoCards={view.dojo.cards}
            onBuy={(i) => { tapFeedback(); ctrl.dojoBuy(i); }}
            onMeditate={() => { tapFeedback(); ctrl.dojoMeditate(); }}
            onSkip={() => { tapFeedback(); ctrl.dojoSkip(); }}
            playerKi={me.ki}
            disabled={false}
          />
        )}

        {/* DEPLOY PHASE */}
        {turnPhase === 'deploy' && isMyTurn && !combatStep && (
          <>
            {/* My field */}
            <FieldView
              field={me.field}
              traps={me.traps}
              targetableSlots={
                actionMode === 'deploy_pick_slot'
                  ? me.field.map((s, i) => !s.fighter ? i : -1).filter(i => i >= 0)
                  : actionMode === 'equip_pick_slot'
                  ? me.field.map((s, i) => s.fighter && !s.fighter.attachedEquipment ? i : -1).filter(i => i >= 0)
                  : undefined
              }
              onSlotPress={onMyFieldSlotPress}
            />

            {/* Concealed choice */}
            {actionMode === 'deploy_concealed_choice' && (
              <View style={styles.concealedChoice}>
                <TouchableOpacity style={styles.concealBtn} onPress={() => onDeployConcealedChoice(false)}>
                  <Text style={styles.concealBtnText}>Face visible</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.concealBtn, styles.concealBtnHidden]} onPress={() => onDeployConcealedChoice(true)}>
                  <Text style={styles.concealBtnText}>Face cachee (-1 Ki)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Deploy action buttons — only show viable actions */}
            {actionMode === 'idle' && (() => {
              const hasFighterInHand = me.hand.some(c => c.card.type === 'fighter');
              const hasEmptyFieldSlot = me.field.some(s => !s.fighter);
              const canDeployFighter = hasFighterInHand && hasEmptyFieldSlot && me.ki >= 1;
              const canSetTrap = me.hand.length > 0 && me.traps.some(t => !t.card) && me.ki >= 1;
              const hasEquipInHand = me.hand.some(c => c.card.type === 'equipment');
              const hasFighterToEquip = me.field.some(s => s.fighter && !s.fighter.attachedEquipment);
              const canEquip = hasEquipInHand && hasFighterToEquip;
              const sig = me.hand.find(c => c.card.type === 'signature');
              const canSig = sig && me.ki >= sig.card.kiCost && me.focus >= (sig.card.focusCost ?? 0);

              return (
                <View style={styles.deployActions}>
                  {canDeployFighter && (
                    <TouchableOpacity style={styles.deployBtn} onPress={() => setActionMode('deploy_pick_card')}>
                      <Text style={styles.deployBtnText}>Deployer Fighter</Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.deployRow}>
                    {canSetTrap && (
                      <TouchableOpacity style={styles.deployBtnHalf} onPress={() => setActionMode('trap_pick_card')}>
                        <Text style={styles.deployBtnText}>Piege</Text>
                      </TouchableOpacity>
                    )}
                    {canEquip && (
                      <TouchableOpacity style={styles.deployBtnHalf} onPress={() => setActionMode('equip_pick_card')}>
                        <Text style={styles.deployBtnText}>Equiper</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {canSig && (
                    <TouchableOpacity
                      style={[styles.deployBtn, { backgroundColor: colors.accent }]}
                      onPress={() => {
                        const sigIdx = me.hand.findIndex(c => c.card.type === 'signature');
                        if (sigIdx >= 0) { impactFeedback(); ctrl.doActivateSignature(sigIdx); }
                      }}
                    >
                      <Text style={[styles.deployBtnText, { color: colors.bg }]}>Signature!</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.endPhaseBtn} onPress={() => ctrl.endDeploy()}>
                    <Text style={styles.endPhaseText}>Fin du deploiement</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </>
        )}

        {/* COMBAT SELECT PHASE */}
        {turnPhase === 'combat_select' && isMyTurn && !combatStep && (
          <>
            {actionMode === 'idle' && (
              <View style={styles.deployActions}>
                <TouchableOpacity
                  style={[styles.deployBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setActionMode('combat_pick_attacker')}
                >
                  <Text style={styles.deployBtnText}>Attaquer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.endPhaseBtn} onPress={() => ctrl.skipCombat()}>
                  <Text style={styles.endPhaseText}>Passer le combat</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* My field for attacker selection */}
            {actionMode === 'combat_pick_attacker' && (
              <FieldView
                field={me.field}
                traps={me.traps}
                targetableSlots={me.field.map((s, i) => s.fighter ? i : -1).filter(i => i >= 0)}
                onSlotPress={onMyFieldSlotPress}
              />
            )}

            {/* Universe declaration */}
            {actionMode === 'combat_declare_universe' && (
              <View style={styles.universeGrid}>
                <Text style={styles.universeTitle}>Declare un univers:</Text>
                {UNIVERSES.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.universeBtn, { backgroundColor: universeColor(u as any) }]}
                    onPress={() => onUniverseSelect(u)}
                  >
                    <Text style={styles.universeBtnText}>{u.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* ALWAYS show my field (unified board) */}
        {!combatStep && turnPhase !== 'deploy' && turnPhase !== 'combat_select' && (
          <View style={styles.waitingArea}>
            <FieldView field={me.field} traps={me.traps} />
            {!isMyTurn && (
              <Text style={styles.waitingText}>En attente des adversaires...</Text>
            )}
          </View>
        )}

        {/* Cancel button */}
        {actionMode !== 'idle' && !combatStep && (
          <TouchableOpacity style={styles.cancelBtn} onPress={resetAction}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        )}

        {/* Recent messages (3 max) */}
        {!combatStep && <MessageFeed entries={view.log} maxVisible={3} />}
      </View>

      {/* Resource bar */}
      <ResourceBar
        lp={me.lp}
        ki={me.ki}
        maxKi={me.maxKi}
        focus={me.focus}
      />

      {/* Hand */}
      <ScrollView
        horizontal
        style={styles.handScroll}
        contentContainerStyle={styles.handContent}
        showsHorizontalScrollIndicator={false}
      >
        {me.hand.map((card, i) => {
          const selectable =
            (actionMode === 'deploy_pick_card' && card.card.type === 'fighter') ||
            (actionMode === 'trap_pick_card') ||
            (actionMode === 'equip_pick_card' && card.card.type === 'equipment');
          return (
            <DojoCard
              key={card.instanceId}
              instance={card}
              selected={selectedHandIndex === i}
              onPress={selectable ? () => onHandCardPress(i) : undefined}
              disabled={!selectable && actionMode !== 'idle'}
            />
          );
        })}
      </ScrollView>

      {/* Combat overlay — animated */}
      {combatStep && (
        <CombatArena
          step={combatStep}
          attackerName={
            view.opponents.find(o => o.id === view.combat?.attackerId)?.name ??
            (view.combat?.attackerId === me.id ? me.name : '???')
          }
          defenderName={
            view.opponents.find(o => o.id === view.combat?.defenderId)?.name ??
            (view.combat?.defenderId === me.id ? me.name : '???')
          }
          declaredUniverse={view.combat?.declaredUniverse ?? 'shonen'}
          attackerConcealed={
            view.opponents.find(o => o.id === view.combat?.attackerId)
              ?.field[view.combat?.attackerSlot ?? 0]?.concealed ?? false
          }
          naniCalled={view.combat?.naniCalled ?? false}
          events={combatEvents}
          isDefender={view.combat?.defenderId === me.id}
          canCallNani={true}
          onContinue={ctrl.advanceCombat}
          onNaniCall={() => { warningFeedback(); ctrl.doCallNani(); }}
          onPassDefense={() => ctrl.passDefense()}
        />
      )}

      {/* Game over overlay */}
      {me.lp <= 0 && ctrl.gameStarted && (
        <View style={styles.gameOverOverlay}>
          <View style={styles.gameOverBox}>
            <Text style={styles.gameOverEmoji}>💀</Text>
            <Text style={styles.gameOverTitle}>DEFAITE</Text>
            <TouchableOpacity style={styles.menuBtn} onPress={() => router.replace('/')}>
              <Text style={styles.menuBtnText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Dominance modal */}
      <Modal visible={showDominance} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowDominance(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cycle de Dominance</Text>
            <Text style={styles.modalSubtitle}>+3 ATK quand tu domines</Text>
            <View style={styles.domRow}>
              <Text style={[styles.domText, { color: colors.shonen }]}>Shonen</Text>
              <Text style={styles.domArrow}>&gt;</Text>
              <Text style={[styles.domText, { color: colors.magical }]}>Magical</Text>
              <Text style={styles.domArrow}>&gt;</Text>
              <Text style={[styles.domText, { color: colors.mecha }]}>Mecha</Text>
            </View>
            <View style={styles.domRow}>
              <Text style={[styles.domText, { color: colors.mecha }]}>Mecha</Text>
              <Text style={styles.domArrow}>&gt;</Text>
              <Text style={[styles.domText, { color: colors.isekai }]}>Isekai</Text>
              <Text style={styles.domArrow}>&gt;</Text>
              <Text style={[styles.domText, { color: colors.seinen }]}>Seinen</Text>
            </View>
            <View style={styles.domRow}>
              <Text style={[styles.domText, { color: colors.seinen }]}>Seinen</Text>
              <Text style={styles.domArrow}>&gt;</Text>
              <Text style={[styles.domText, { color: colors.shonen }]}>Shonen</Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowDominance(false)}>
              <Text style={styles.modalCloseBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tutorial */}
      {showTutorial && tutorialStep < DOJO_TUTORIAL_STEPS && (
        <DojoTutorial
          step={tutorialStep}
          onNext={() => {
            if (tutorialStep >= DOJO_TUTORIAL_STEPS - 1) setShowTutorial(false);
            else setTutorialStep(tutorialStep + 1);
          }}
          onSkip={() => setShowTutorial(false)}
        />
      )}
    </SafeAreaView>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingText: { color: colors.text, fontSize: fonts.sizes.xl, textAlign: 'center', marginTop: 100 },

  opponentsScroll: { maxHeight: 110, marginTop: 4 },
  opponentsContent: { paddingHorizontal: 8, gap: 6 },

  mainArea: { flex: 1, paddingHorizontal: 10, paddingVertical: 4, gap: 6 },
  statusText: { color: colors.text, fontSize: fonts.sizes.md, textAlign: 'center', fontWeight: 'bold', paddingVertical: 2 },

  // Deploy
  deployActions: { gap: 8 },
  deployBtn: { backgroundColor: colors.secondary, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  deployBtnHalf: { flex: 1, backgroundColor: colors.bgCard, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  deployBtnText: { color: colors.text, fontSize: fonts.sizes.md, fontWeight: 'bold' },
  deployRow: { flexDirection: 'row', gap: 8 },
  endPhaseBtn: { paddingVertical: 10, alignItems: 'center' },
  endPhaseText: { color: colors.textDim, fontSize: fonts.sizes.md },

  concealedChoice: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  concealBtn: { backgroundColor: colors.success, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10 },
  concealBtnHidden: { backgroundColor: colors.bgCard },
  concealBtnText: { color: colors.text, fontSize: fonts.sizes.md, fontWeight: 'bold' },

  // Combat target
  targetField: { alignItems: 'center', gap: 6 },
  targetLabel: { color: colors.accent, fontSize: fonts.sizes.md, fontWeight: 'bold' },
  targetSlots: { flexDirection: 'row', gap: 8 },
  targetSlot: { borderRadius: 8, padding: 2 },
  targetSlotActive: { borderWidth: 2, borderColor: colors.accent },
  targetSlotEmpty: { color: colors.textDark, fontSize: fonts.sizes.sm },

  // Universe picker
  universeGrid: { alignItems: 'center', gap: 8 },
  universeTitle: { color: colors.text, fontSize: fonts.sizes.lg, fontWeight: 'bold' },
  universeBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, width: '80%', alignItems: 'center' },
  universeBtnText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: 'bold' },

  waitingArea: { alignItems: 'center', paddingVertical: 8, gap: 8 },
  waitingText: { color: colors.textDim, fontSize: fonts.sizes.md, fontStyle: 'italic' },

  cancelBtn: { paddingVertical: 8, alignItems: 'center' },
  cancelText: { color: colors.danger, fontSize: fonts.sizes.md, fontWeight: '600' },

  // Hand
  handScroll: { maxHeight: 112, marginBottom: 6 },
  handContent: { paddingHorizontal: 10, alignItems: 'center', gap: 4 },

  // Game over
  gameOverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
  gameOverBox: { alignItems: 'center', gap: 12 },
  gameOverEmoji: { fontSize: 64 },
  gameOverTitle: { fontSize: 48, fontWeight: 'bold', color: colors.primary },
  menuBtn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10 },
  menuBtnText: { color: colors.text, fontSize: fonts.sizes.lg, fontWeight: 'bold' },

  // Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 8 },
  helpBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bgLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.accent },
  helpBtnText: { color: colors.accent, fontSize: 18, fontWeight: 'bold' },

  // Dominance modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.75)' },
  modalContent: { width: '80%', maxWidth: 320, backgroundColor: colors.bgLight, borderRadius: 16, padding: 24, alignItems: 'center', gap: 12, borderWidth: 2, borderColor: colors.accent },
  modalTitle: { color: colors.accent, fontSize: fonts.sizes.xl, fontWeight: 'bold' },
  modalSubtitle: { color: colors.textDim, fontSize: fonts.sizes.md },
  domRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  domText: { fontSize: fonts.sizes.lg, fontWeight: 'bold' },
  domArrow: { color: colors.textDim, fontSize: fonts.sizes.lg },
  modalCloseBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8, marginTop: 8 },
  modalCloseBtnText: { color: colors.text, fontSize: fonts.sizes.md, fontWeight: 'bold' },
});
