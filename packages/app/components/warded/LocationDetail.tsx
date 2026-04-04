import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useState, memo } from 'react';
import { warded, wardedFonts, wardColor, demonColor, WARD_SYMBOLS, DEMON_SYMBOLS } from '../../theme-warded';
import type { Location, DemonAtLocation, WardType, MeshAnalysis, WardCombo } from '../../../engine/src/warded/types';
import { WARD_TYPES } from '../../../engine/src/warded/constants';
import { useAudio } from '../../hooks/useAudio';
import WardChain from './WardChain';

const DEMON_IMAGES: Record<string, any> = {
  flame: require('../../assets/images/demon_flame.png'),
  wood: require('../../assets/images/demon_wood.png'),
  wind: require('../../assets/images/demon_wind.png'),
  water: require('../../assets/images/demon_water.png'),
  rock: require('../../assets/images/demon_rock.png'),
  mind: require('../../assets/images/demon_mind.png'),
};


interface Props {
  location: Location;
  demons: DemonAtLocation[];
  isPresence: boolean;
  isNight: boolean;
  onClose: () => void;
  // Day actions
  onCraft?: (wardType: WardType) => void;
  onFortify?: (wardType: WardType) => void;
  onGather?: () => void;
  // Night actions
  onActivateWard?: (useCombo: boolean) => void;
  availableWardReserves?: WardType[];
  availableWards?: WardType[];
  canCraft?: boolean;
  canFortify?: boolean;
  canGather?: boolean;
  canActivate?: boolean;
  // CRITICAL 1: Warded Flesh
  onWardedFlesh?: (wardType: WardType) => void;
  // Ward management
  onRepairWard?: (slotIndex: number) => void;
  onRemoveWard?: (slotIndex: number) => void;
  onSwapWards?: (slotA: number, slotB: number) => void;
  // MAJOR 2: Activation indicator
  isActivated?: boolean;
  // Ward chain
  mesh?: MeshAnalysis;
  activeCombos?: WardCombo[];
}

function LocationDetailInner({
  location, demons, isPresence, isNight, onClose,
  onCraft, onFortify, onGather, onActivateWard,
  availableWardReserves, availableWards, canCraft, canFortify, canGather, canActivate,
  onWardedFlesh, onRepairWard, onRemoveWard, onSwapWards, isActivated,
  mesh, activeCombos,
}: Props) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
  const audio = useAudio();
  const combo = activeCombos && activeCombos.length > 0 ? activeCombos[0] : null;

  const handleSlotPress = (index: number) => {
    if (isNight) return;
    if (selectedSlot === null) {
      setSelectedSlot(index);
    } else if (selectedSlot === index) {
      setSelectedSlot(null);
    } else {
      // Swap the two slots
      onSwapWards?.(selectedSlot, index);
      setSelectedSlot(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{location.name}</Text>
          {isPresence && <Text style={styles.presenceLabel}>⚔ PRÉSENCE</Text>}
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Population */}
      {!location.fallen ? (
        <View style={styles.popSection}>
          <Text style={styles.label}>Population</Text>
          <View style={styles.popBar}>
            <View style={[styles.popFill, {
              width: `${(location.population / location.maxPopulation) * 100}%`,
              backgroundColor: location.population > 3 ? warded.success : location.population > 1 ? warded.warning : warded.danger,
            }]} />
          </View>
          <Text style={styles.popValue}>{location.population}/{location.maxPopulation}</Text>
        </View>
      ) : (
        <Text style={styles.fallenBanner}>LIEU TOMBÉ</Text>
      )}

      {/* Resources */}
      <View style={styles.sectionDivider} />
      <View style={styles.resRow}>
        <ResChip label="Bois" value={location.stockpile.wood} color={warded.wood} />
        <ResChip label="Encre" value={location.stockpile.ink} color={warded.ink} />
        <ResChip label="Nourriture" value={location.stockpile.food} color={warded.food} />
      </View>

      {/* Ward Chain */}
      <View style={styles.sectionDivider} />
      <View style={styles.section}>
        <Text style={styles.label}>Chaîne de Wards</Text>
        {mesh ? (
          <WardChain
            location={location}
            mesh={mesh}
            combos={activeCombos ?? []}
            selectedSlot={selectedSlot}
            onSlotPress={handleSlotPress}
            isNight={isNight}
          />
        ) : (
          <Text style={styles.emptySlotText}>Aucun ward</Text>
        )}
        {selectedSlot !== null && !isNight && (
          <Text style={{ color: warded.accent, fontSize: wardedFonts.xs, textAlign: 'center' }}>
            Sélectionne un autre slot pour intervertir
          </Text>
        )}
        {/* Ward management (day only) */}
        {!isNight && !location.fallen && (onRemoveWard || onRepairWard) && (
          <View style={styles.wardManageRow}>
            {location.wards.map((ws, i) => ws.ward && !ws.isTemporary ? (
              <View key={`mgmt${i}`} style={{ flexDirection: 'row', gap: 4 }}>
                {ws.durability < 4 && onRepairWard && (
                  <TouchableOpacity style={[styles.wardSwapBtn, { borderColor: '#4CAF50' }]}
                    onPress={() => { onRepairWard(i); audio?.playSfx('ward_place'); }}>
                    <Text style={[styles.wardSwapText, { color: '#4CAF50' }]}>🔧 Réparer (1 AP)</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.wardRemoveBtn}
                  onPress={() => {
                    if (confirmRemove === i) {
                      onRemoveWard?.(i);
                      audio?.playSfx('damage');
                      setConfirmRemove(null);
                    } else {
                      setConfirmRemove(i);
                    }
                  }}>
                  <Text style={styles.wardRemoveText}>
                    {confirmRemove === i ? '⚠ Confirmer ?' : '✕ Retirer'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null)}
          </View>
        )}
      </View>

      {/* Demons (night) */}
      {isNight && demons.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionDivider} />
          <Text style={styles.label}>Démons ({demons.length})</Text>
          <View style={styles.demonList}>
            {demons.map((d, i) => (
              <View key={i} style={[styles.demonChip, { borderColor: demonColor(d.demon.type) }]}>
                <Image source={DEMON_IMAGES[d.demon.type]} style={styles.demonImage} />
                <Text style={[styles.demonStr, { color: demonColor(d.demon.type) }]}>{d.currentStrength}</Text>
                {d.swarmed && <Text style={styles.swarmBadge}>S</Text>}
                {d.demon.isLocked && <Text style={styles.lockedBadge}>L</Text>}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Actions */}
      {!isNight && !location.fallen && (
        <View style={styles.actionSection}>
          {canGather && (
            <TouchableOpacity style={styles.actionBtn} onPress={onGather}>
              <Text style={styles.actionText}>Récolter +2 {location.primaryResource}</Text>
            </TouchableOpacity>
          )}
          {canFortify && availableWardReserves && availableWardReserves.length > 0 && (
            availableWardReserves.map((w, i) => (
              <TouchableOpacity key={i} style={[styles.actionBtn, { borderColor: wardColor(w) }]} onPress={() => onFortify?.(w)}>
                <Text style={styles.actionText}>Placer {WARD_SYMBOLS[w]} {w}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* CRITICAL 1: Warded Flesh — place temp ward on this location */}
      {onWardedFlesh && (
        <View style={styles.actionSection}>
          <Text style={styles.wardedFleshLabel}>⚔ Ward Temporaire (1 AP)</Text>
          <View style={styles.wardedFleshRow}>
            {(availableWards ?? WARD_TYPES).map(w => (
              <TouchableOpacity
                key={w}
                style={[styles.wardedFleshBtn, { borderColor: wardColor(w) }]}
                onPress={() => onWardedFlesh(w)}
              >
                <Text style={[styles.wardedFleshIcon, { color: wardColor(w) }]}>{WARD_SYMBOLS[w]}</Text>
                <Text style={styles.wardedFleshName}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* MAJOR 2: Activated indicator */}
      {isActivated && (
        <View style={styles.activatedBanner}>
          <Text style={styles.activatedText}>✓ Wards activées ce tour</Text>
        </View>
      )}

      {/* Night ward activation */}
      {isNight && canActivate && !isActivated && (
        <View style={styles.actionSection}>
          {combo && (
            <TouchableOpacity style={[styles.actionBtn, styles.comboBtn]} onPress={() => onActivateWard?.(true)}>
              <Text style={styles.actionText}>{combo.activeName}</Text>
              <Text style={styles.actionDesc}>{combo.activeEffect}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionBtn} onPress={() => onActivateWard?.(false)}>
            <Text style={styles.actionText}>Activer les wards individuellement</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function ResChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.resChip, { borderColor: color + '60' }]}>
      <Text style={[styles.resValue, { color }]}>{value}</Text>
      <Text style={styles.resLabel}>{label}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: warded.bgCard,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: warded.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: warded.text,
    fontSize: wardedFonts.lg,
    fontWeight: 'bold',
  },
  presenceLabel: {
    color: warded.accent,
    fontSize: wardedFonts.xs,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: warded.textDim,
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: warded.bgLight,
    borderRadius: 20,
    width: 40,
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
    overflow: 'hidden',
  },
  popSection: {
    gap: 3,
  },
  label: {
    color: warded.textDim,
    fontSize: wardedFonts.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  popBar: {
    height: 12,
    backgroundColor: warded.bgLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  popFill: {
    height: '100%',
    borderRadius: 6,
  },
  popValue: {
    color: warded.text,
    fontSize: wardedFonts.sm,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  fallenBanner: {
    color: warded.danger,
    fontSize: wardedFonts.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 8,
  },
  resRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  resChip: {
    flex: 1,
    backgroundColor: warded.bgLight,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  resValue: {
    fontSize: wardedFonts.lg,
    fontWeight: 'bold',
  },
  resLabel: {
    color: warded.textDim,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: warded.border,
    marginVertical: 2,
  },
  section: {
    gap: 6,
  },
  emptySlotText: {
    color: warded.textDark,
    fontSize: wardedFonts.sm,
    textAlign: 'center',
  },
  demonList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: warded.bgLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  demonIcon: {
    fontSize: 14,
  },
  demonImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  demonStr: {
    fontSize: wardedFonts.md,
    fontWeight: 'bold',
  },
  swarmBadge: {
    color: warded.warning,
    fontSize: 8,
    fontWeight: 'bold',
  },
  lockedBadge: {
    color: warded.demonWater,
    fontSize: 8,
    fontWeight: 'bold',
  },
  actionSection: {
    gap: 6,
  },
  actionBtn: {
    backgroundColor: warded.bgLight,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: warded.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  comboBtn: {
    borderColor: warded.accent,
    backgroundColor: warded.highlight,
  },
  actionText: {
    color: warded.text,
    fontSize: wardedFonts.md,
    fontWeight: 'bold',
  },
  actionDesc: {
    color: warded.textDim,
    fontSize: wardedFonts.xs,
    textAlign: 'center',
  },
  // CRITICAL 1: Warded Flesh styles
  wardedFleshLabel: {
    color: warded.accent,
    fontSize: wardedFonts.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  wardedFleshRow: {
    flexDirection: 'row',
    gap: 6,
  },
  wardedFleshBtn: {
    flex: 1,
    backgroundColor: warded.bgLight,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    gap: 2,
  },
  wardedFleshIcon: {
    fontSize: 16,
  },
  wardedFleshName: {
    color: warded.text,
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  // MAJOR 2: Activated banner
  activatedBanner: {
    backgroundColor: warded.success + '20',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: warded.success + '40',
    alignItems: 'center',
  },
  activatedText: {
    color: warded.success,
    fontSize: wardedFonts.sm,
    fontWeight: 'bold',
  },
  wardManageRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  wardRemoveBtn: {
    borderWidth: 1,
    borderColor: warded.danger + '60',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  wardRemoveText: {
    color: warded.danger,
    fontSize: 10,
    fontWeight: '600',
  },
  wardSwapBtn: {
    borderWidth: 1,
    borderColor: warded.wardLight + '60',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  wardSwapText: {
    color: warded.wardLight,
    fontSize: 10,
    fontWeight: '600',
  },
});

const LocationDetail = memo(LocationDetailInner);
export default LocationDetail;
