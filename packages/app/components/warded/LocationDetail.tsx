import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { warded, wardedFonts, wardColor, demonColor, WARD_SYMBOLS, DEMON_SYMBOLS } from '../../theme-warded';
import type { Location, DemonAtLocation, WardType } from '../../../engine/src/warded/types';
import { WARD_COMBOS, WARD_TYPES } from '../../../engine/src/warded/constants';

const DEMON_IMAGES: Record<string, any> = {
  flame: require('../../assets/images/demon_flame.png'),
  wood: require('../../assets/images/demon_wood.png'),
  wind: require('../../assets/images/demon_wind.png'),
  water: require('../../assets/images/demon_water.png'),
  rock: require('../../assets/images/demon_rock.png'),
  mind: require('../../assets/images/demon_mind.png'),
};

const WARD_IMAGES: Record<string, any> = {
  fire: require('../../assets/images/ward_fire.png'),
  stone: require('../../assets/images/ward_stone.png'),
  wind: require('../../assets/images/ward_wind.png'),
  light: require('../../assets/images/ward_light.png'),
  bone: require('../../assets/images/ward_bone.png'),
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
  canCraft?: boolean;
  canFortify?: boolean;
  canGather?: boolean;
  canActivate?: boolean;
  // CRITICAL 1: Warded Flesh
  onWardedFlesh?: (wardType: WardType) => void;
  // MAJOR 2: Activation indicator
  isActivated?: boolean;
}

export default function LocationDetail({
  location, demons, isPresence, isNight, onClose,
  onCraft, onFortify, onGather, onActivateWard,
  availableWardReserves, canCraft, canFortify, canGather, canActivate,
  onWardedFlesh, isActivated,
}: Props) {
  const combo = getCombo(location);

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
      <View style={styles.resRow}>
        <ResChip label="Bois" value={location.stockpile.wood} color={warded.wood} />
        <ResChip label="Encre" value={location.stockpile.ink} color={warded.ink} />
        <ResChip label="Nourriture" value={location.stockpile.food} color={warded.food} />
      </View>

      {/* Wards */}
      <View style={styles.section}>
        <Text style={styles.label}>Wards</Text>
        <View style={styles.wardSlots}>
          {location.wards.map((ws, i) => (
            <View key={i} style={[styles.wardSlot, ws.ward ? { borderColor: wardColor(ws.ward) } : {}]}>
              {ws.ward ? (
                <>
                  <Image source={WARD_IMAGES[ws.ward]} style={styles.wardSlotImage} />
                  <Text style={[styles.wardName, { color: wardColor(ws.ward) }]}>{ws.ward.toUpperCase()}</Text>
                  {ws.isTemporary && <Text style={styles.tempBadge}>TEMP</Text>}
                </>
              ) : (
                <Text style={styles.emptySlotText}>Vide</Text>
              )}
            </View>
          ))}
        </View>
        {combo && (
          <View style={[styles.comboBanner, { borderColor: warded.accent }]}>
            <Text style={styles.comboName}>{combo.name}</Text>
            <Text style={styles.comboEffect}>{combo.passiveEffect}</Text>
          </View>
        )}
      </View>

      {/* Demons (night) */}
      {isNight && demons.length > 0 && (
        <View style={styles.section}>
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
            {WARD_TYPES.map(w => (
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

      {/* MAJOR 1+3: Night ward activation - both slots, only if location has wards */}
      {isNight && canActivate && !isActivated && (
        <View style={styles.actionSection}>
          {combo && (
            <TouchableOpacity style={[styles.actionBtn, styles.comboBtn]} onPress={() => onActivateWard?.(true)}>
              <Text style={styles.actionText}>{combo.activeName}</Text>
              <Text style={styles.actionDesc}>{combo.activeEffect}</Text>
            </TouchableOpacity>
          )}
          {location.wards.map((ws, i) => ws.ward ? (
            <TouchableOpacity key={i} style={[styles.actionBtn, { borderColor: wardColor(ws.ward) }]} onPress={() => onActivateWard?.(false)}>
              <Text style={styles.actionText}>Activer {WARD_SYMBOLS[ws.ward]} {ws.ward} (slot {i + 1})</Text>
            </TouchableOpacity>
          ) : null)}
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

function getCombo(loc: Location) {
  const w1 = loc.wards[0].ward;
  const w2 = loc.wards[1].ward;
  if (!w1 || !w2) return null;
  return WARD_COMBOS.find(c =>
    (c.wards[0] === w1 && c.wards[1] === w2) || (c.wards[0] === w2 && c.wards[1] === w1)
  ) ?? null;
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
    fontSize: 8,
  },
  section: {
    gap: 6,
  },
  wardSlots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  wardSlot: {
    flex: 1,
    backgroundColor: warded.bgLight,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: warded.border,
    gap: 2,
  },
  wardIcon: {
    fontSize: 20,
  },
  wardName: {
    fontSize: wardedFonts.xs,
    fontWeight: 'bold',
  },
  tempBadge: {
    color: warded.warning,
    fontSize: 7,
    fontWeight: 'bold',
  },
  emptySlotText: {
    color: warded.textDark,
    fontSize: wardedFonts.sm,
  },
  comboBanner: {
    backgroundColor: warded.highlight,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  comboName: {
    color: warded.accent,
    fontSize: wardedFonts.md,
    fontWeight: 'bold',
  },
  comboEffect: {
    color: warded.textDim,
    fontSize: wardedFonts.xs,
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
  wardSlotImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: warded.border,
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
});
