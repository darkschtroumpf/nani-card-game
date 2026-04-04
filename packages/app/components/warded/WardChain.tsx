import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { warded, wardedFonts, wardColor, linkColor, meshGlowColor, WARD_SYMBOLS } from '../../theme-warded';
import type { Location, WardType, MeshAnalysis, WardCombo } from '../../../engine/src/warded/types';
import { MESH_TIERS, WARD_LINK_PROFILES } from '../../../engine/src/warded/constants';

const WARD_IMAGES: Record<string, any> = {
  fire: require('../../assets/images/ward_fire.png'),
  stone: require('../../assets/images/ward_stone.png'),
  wind: require('../../assets/images/ward_wind.png'),
  light: require('../../assets/images/ward_light.png'),
  bone: require('../../assets/images/ward_bone.png'),
};

interface Props {
  location: Location;
  mesh: MeshAnalysis;
  combos: WardCombo[];
  selectedSlot: number | null;
  onSlotPress: (index: number) => void;
  isNight: boolean;
}

export default function WardChain({ location, mesh, combos, selectedSlot, onSlotPress, isNight }: Props) {
  const tierInfo = MESH_TIERS.find(t => t.tier === mesh.tier);
  const glowBg = meshGlowColor(mesh.tier);

  return (
    <View style={styles.container}>
      {/* Wall background with mesh glow */}
      <View style={[styles.wall, { backgroundColor: glowBg }]}>
        <View style={styles.chain}>
          {location.wards.map((ws, i) => {
            const isSelected = selectedSlot === i;
            const leftConn = mesh.connections.find(c => c.rightSlot === i);
            const rightConn = mesh.connections.find(c => c.leftSlot === i);

            return (
              <View key={i} style={styles.slotGroup}>
                {/* Link strokes to the LEFT of this glyph */}
                {i > 0 && (
                  <View style={styles.linkContainer}>
                    {leftConn ? (
                      <LinkStrokes strength={leftConn.strength} />
                    ) : (
                      <View style={styles.linkGap} />
                    )}
                  </View>
                )}

                {/* The glyph itself */}
                <TouchableOpacity
                  style={[
                    styles.glyph,
                    ws.ward ? { borderColor: wardColor(ws.ward) } : {},
                    isSelected ? styles.glyphSelected : {},
                  ]}
                  onPress={() => onSlotPress(i)}
                  activeOpacity={0.7}
                >
                  {ws.ward ? (
                    <>
                      <Image source={WARD_IMAGES[ws.ward]} style={styles.glyphImage} />
                      {/* Link nubs — visual indicators of connection capacity */}
                      <View style={styles.nubRow}>
                        <LinkNubs count={WARD_LINK_PROFILES[ws.ward].leftLinks} side="left" ward={ws.ward} />
                        <LinkNubs count={WARD_LINK_PROFILES[ws.ward].rightLinks} side="right" ward={ws.ward} />
                      </View>
                      <Text style={[styles.glyphLabel, { color: wardColor(ws.ward) }]}>
                        {ws.ward.toUpperCase()}
                      </Text>
                      {/* Status badges */}
                      {ws.isTemporary && <Text style={styles.badge}>TEMP</Text>}
                      {ws.enhanced && <Text style={[styles.badge, { color: warded.accent }]}>★</Text>}
                      {!ws.isTemporary && ws.ward && ws.durability < 3 && (
                        <Text style={[styles.badge, {
                          color: ws.durability <= 1 ? warded.danger : warded.warning,
                        }]}>
                          {'●'.repeat(ws.durability)}{'○'.repeat(3 - ws.durability)}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text style={styles.emptyGlyph}>—</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* Mesh strength indicator */}
      <View style={styles.meshRow}>
        <Text style={[styles.meshLabel, {
          color: mesh.tier === 'fragile' ? warded.danger
            : mesh.tier === 'fortified' ? warded.accent
            : mesh.tier === 'reinforced' ? warded.success
            : warded.textDim,
        }]}>
          Maillage: {mesh.meshStrength} — {tierInfo?.label ?? 'Normal'}
        </Text>
        <View style={styles.meshBar}>
          <View style={[styles.meshFill, {
            width: `${Math.min(100, (mesh.meshStrength / 6) * 100)}%`,
            backgroundColor: mesh.tier === 'fragile' ? warded.danger
              : mesh.tier === 'fortified' ? warded.accent
              : mesh.tier === 'reinforced' ? warded.success
              : warded.textDim,
          }]} />
        </View>
        <Text style={{ color: warded.textDim, fontSize: wardedFonts.xs, marginTop: 1 }}>
          {mesh.tier === 'fragile' ? '⚠ Fragile: wards se dégradent vite !'
            : mesh.tier === 'reinforced' ? '✓ Renforcé: durabilité préservée'
            : mesh.tier === 'fortified' ? '★ Fortifié: bonus défense + dégâts'
            : 'Intervertis les runes pour améliorer les liens'}
        </Text>
      </View>

      {/* Active combos */}
      {combos.length > 0 && (
        <View style={styles.comboList}>
          {combos.map((combo, i) => (
            <View key={i} style={[styles.comboBadge, { borderColor: warded.accent }]}>
              <Text style={styles.comboName}>
                {WARD_SYMBOLS[combo.wards[0]]}→{WARD_SYMBOLS[combo.wards[1]]} {combo.name}
              </Text>
              <Text style={styles.comboEffect}>{combo.passiveEffect}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Renders 1-3 link strokes between glyphs */
function LinkStrokes({ strength }: { strength: number }) {
  const color = linkColor(strength);
  return (
    <View style={styles.linkStrokes}>
      {Array.from({ length: strength }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.linkStroke,
            {
              backgroundColor: color,
              height: strength >= 3 ? 3 : strength >= 2 ? 2 : 1,
              opacity: strength >= 3 ? 1 : strength >= 2 ? 0.8 : 0.4,
            },
          ]}
        />
      ))}
    </View>
  );
}

/** Visual nubs showing link capacity on each side of a glyph */
function LinkNubs({ count, side, ward }: { count: number; side: 'left' | 'right'; ward: WardType }) {
  const color = wardColor(ward);
  return (
    <View style={[styles.nubColumn, side === 'left' ? { alignItems: 'flex-start' } : { alignItems: 'flex-end' }]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.nub, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  wall: {
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: warded.border,
  },
  chain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyph: {
    width: 72,
    height: 88,
    backgroundColor: warded.bgLight,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: warded.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  glyphSelected: {
    borderColor: warded.accent,
    borderWidth: 3,
    shadowColor: warded.accent,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  glyphImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  glyphLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  emptyGlyph: {
    color: warded.textDark,
    fontSize: wardedFonts.lg,
  },
  badge: {
    color: warded.warning,
    fontSize: 7,
    fontWeight: 'bold',
  },
  nubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    top: 0,
    bottom: 0,
    paddingVertical: 10,
  },
  nubColumn: {
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 2,
  },
  nub: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  linkContainer: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkStrokes: {
    gap: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkStroke: {
    width: 16,
    borderRadius: 2,
  },
  linkGap: {
    width: 16,
    height: 1,
    backgroundColor: warded.border,
    opacity: 0.3,
  },
  meshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meshLabel: {
    fontSize: wardedFonts.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    minWidth: 100,
  },
  meshBar: {
    flex: 1,
    height: 6,
    backgroundColor: warded.bgLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  meshFill: {
    height: '100%',
    borderRadius: 3,
  },
  comboList: {
    gap: 4,
  },
  comboBadge: {
    backgroundColor: warded.highlight,
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
  },
  comboName: {
    color: warded.accent,
    fontSize: wardedFonts.sm,
    fontWeight: 'bold',
  },
  comboEffect: {
    color: warded.textDim,
    fontSize: wardedFonts.xs,
  },
});
