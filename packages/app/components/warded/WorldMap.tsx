import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { warded, wardedFonts, wardColor, demonColor, WARD_SYMBOLS, DEMON_SYMBOLS } from '../../theme-warded';
import type { Location, LocationId, DemonAtLocation } from '../../../engine/src/warded/types';

const WARD_IMAGES: Record<string, any> = {
  fire: require('../../assets/images/ward_fire.png'),
  stone: require('../../assets/images/ward_stone.png'),
  wind: require('../../assets/images/ward_wind.png'),
  light: require('../../assets/images/ward_light.png'),
  bone: require('../../assets/images/ward_bone.png'),
};

const LOCATION_IMAGES: Record<string, any> = {
  desert_spear: require('../../assets/images/loc_desert_spear.png'),
  cutters_hollow: require('../../assets/images/loc_cutters_hollow.png'),
  lakton: require('../../assets/images/loc_lakton.png'),
  miln: require('../../assets/images/loc_miln.png'),
};

const DEMON_IMAGES: Record<string, any> = {
  flame: require('../../assets/images/demon_flame.png'),
  wood: require('../../assets/images/demon_wood.png'),
  wind: require('../../assets/images/demon_wind.png'),
  water: require('../../assets/images/demon_water.png'),
  rock: require('../../assets/images/demon_rock.png'),
  mind: require('../../assets/images/demon_mind.png'),
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MAP_SIZE = Math.min(SCREEN_W - 32, SCREEN_H * 0.35, 300);

interface Props {
  locations: Location[];
  presenceLocation: LocationId;
  demonsAtLocations: Record<LocationId, DemonAtLocation[]>;
  selectedLocation: LocationId | null;
  onLocationPress: (id: LocationId) => void;
  isNight: boolean;
  forecast?: Record<string, string>;
  isPositioning?: boolean;
  activationsUsedAt?: LocationId[];
}

function forecastBorderColor(level?: string): string {
  if (!level) return warded.border;
  switch (level) {
    case 'low': return warded.success;
    case 'medium': return warded.warning;
    case 'high': return warded.danger;
    case 'extreme': return warded.danger;
    default: return warded.border;
  }
}

const POSITIONS: Record<string, { top: number; left: number }> = {
  north: { top: 0, left: 0.5 },
  west: { top: 0.5, left: 0 },
  east: { top: 0.5, left: 1 },
  south: { top: 1, left: 0.5 },
};

export default function WorldMap({ locations, presenceLocation, demonsAtLocations, selectedLocation, onLocationPress, isNight, forecast, isPositioning, activationsUsedAt }: Props) {
  return (
    <View style={[styles.mapContainer, { width: MAP_SIZE, height: MAP_SIZE }]}>
      {/* Connection lines (hide if endpoint is hidden) */}
      {(() => {
        const visible = new Set(locations.filter(l => !(l.fallen && l.maxPopulation === 0)).map(l => l.position as string));
        const lines: { positions: [string, string]; top: number; left: number; width: number; rotate: string }[] = [
          { positions: ['north', 'west'], top: 0.25, left: 0.15, width: 0.35, rotate: '45deg' },
          { positions: ['north', 'east'], top: 0.25, left: 0.5, width: 0.35, rotate: '-45deg' },
          { positions: ['west', 'south'], top: 0.65, left: 0.15, width: 0.35, rotate: '-45deg' },
          { positions: ['east', 'south'], top: 0.65, left: 0.5, width: 0.35, rotate: '45deg' },
        ];
        return (
          <View style={styles.linesLayer}>
            {lines.filter(l => visible.has(l.positions[0]) && visible.has(l.positions[1])).map((l, i) => (
              <View key={i} style={[styles.line, { top: MAP_SIZE * l.top, left: MAP_SIZE * l.left, width: MAP_SIZE * l.width, transform: [{ rotate: l.rotate }] }]} />
            ))}
          </View>
        );
      })()}

      {/* Location nodes */}
      {locations.filter(l => !(l.fallen && l.maxPopulation === 0)).map((loc) => {
        const pos = POSITIONS[loc.position];
        const isPresence = loc.id === presenceLocation;
        const isActivated = activationsUsedAt?.includes(loc.id) ?? false;
        const isSelected = loc.id === selectedLocation;
        const demons = demonsAtLocations[loc.id] ?? [];
        const demonCount = demons.length;
        const totalStr = demons.reduce((s, d) => s + d.currentStrength, 0);
        const nodeSize = isNight ? 100 : 80;
        const threatLevel = forecast?.[loc.id];
        const threatBorder = forecastBorderColor(threatLevel);

        return (
          <TouchableOpacity
            key={loc.id}
            style={[
              styles.locationNode,
              {
                width: nodeSize,
                top: pos.top * (MAP_SIZE - nodeSize),
                left: pos.left * (MAP_SIZE - nodeSize),
                borderColor: isSelected ? warded.accent : isPresence ? warded.accent : threatBorder,
              },
              loc.fallen && styles.locationFallen,
              isPresence && styles.locationPresence,
              isSelected && styles.locationSelected,
              isActivated && styles.locationActivated,
              // FIX 3: extreme threat pulsing glow
              threatLevel === 'extreme' && !isSelected && !isPresence && {
                shadowColor: '#ff0000',
                shadowOpacity: 0.6,
                shadowRadius: 12,
                elevation: 8,
              },
            ]}
            onPress={() => onLocationPress(loc.id)}
            activeOpacity={0.7}
          >
            {/* Location illustration */}
            {LOCATION_IMAGES[loc.id] && (
              <Image source={LOCATION_IMAGES[loc.id]} style={styles.locationImage} />
            )}
            {/* Name */}
            <Text style={[styles.locationName, loc.fallen && styles.textFallen]} numberOfLines={1}>
              {loc.name}
            </Text>

            {/* Population bar */}
            {!loc.fallen && (
              <View style={styles.popBar}>
                <View style={[styles.popFill, {
                  width: `${(loc.population / loc.maxPopulation) * 100}%`,
                  backgroundColor: loc.population > 3 ? warded.success : loc.population > 1 ? warded.warning : warded.danger,
                }]} />
                <Text style={styles.popText}>{loc.population}</Text>
              </View>
            )}
            {loc.fallen && (
              <View style={styles.fallenOverlay} pointerEvents="none">
                <Text style={styles.fallenStamp}>FALLEN</Text>
              </View>
            )}

            {/* Ward indicators — FIX 2: bigger at night */}
            <View style={styles.wardRow}>
              {loc.wards.map((ws, i) => (
                <View key={i} style={[
                  styles.wardDot,
                  isNight && styles.wardDotNight,
                  ws.ward ? { backgroundColor: wardColor(ws.ward) } : styles.wardEmpty,
                  ws.ward && ws.enhanced && { borderWidth: 1, borderColor: '#FFD740' },
                ]}>
                  {ws.ward && WARD_IMAGES[ws.ward] && (
                    <Image source={WARD_IMAGES[ws.ward]} style={[styles.wardImage, isNight && styles.wardImageNight]} />
                  )}
                  {ws.ward && !ws.isTemporary && ws.durability < 3 && (
                    <View style={{ position: 'absolute', bottom: -3, width: 14, height: 3, borderRadius: 1, backgroundColor: 'rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                      <View style={{ width: `${(ws.durability / 3) * 100}%`, height: '100%', backgroundColor: ws.durability <= 1 ? '#F44336' : '#FF9800', borderRadius: 1 } as any} />
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* FIX 2: Inline demon icons (replaces tiny badge) */}
            {isNight && demonCount > 0 && (
              <View style={styles.demonInlineRow}>
                <View style={styles.demonIconsRow}>
                  {demons.map((d, i) => (
                    <Image key={i} source={DEMON_IMAGES[d.demon.type]} style={styles.demonInlineImage} />
                  ))}
                </View>
                <Text style={styles.demonStrengthText}>⚔{totalStr}</Text>
              </View>
            )}

            {/* Presence indicator — FIX 5A: bigger when positioning */}
            {isPresence && (
              <View style={[styles.presenceBadge, isPositioning && styles.presenceBadgeLarge]}>
                <Text style={[styles.presenceIcon, isPositioning && styles.presenceIconLarge]}>⚔</Text>
              </View>
            )}

            {/* MAJOR 2: Activated checkmark */}
            {isActivated && (
              <View style={styles.activatedBadge}>
                <Text style={styles.activatedIcon}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    alignSelf: 'center',
    position: 'relative',
  },
  linesLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: warded.border,
  },
  locationNode: {
    position: 'absolute',
    width: 90,
    backgroundColor: warded.bgCard,
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: warded.border,
    gap: 3,
  } as any,
  locationFallen: {
    backgroundColor: '#1a0a0a',
    borderColor: warded.danger + '60',
    opacity: 0.6,
  },
  locationPresence: {
    borderColor: warded.accent,
    shadowColor: warded.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  locationSelected: {
    borderColor: warded.accent,
    borderWidth: 3,
  },
  locationImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  locationName: {
    color: warded.text,
    fontSize: wardedFonts.xs,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textFallen: {
    color: warded.danger,
  },
  popBar: {
    width: '100%',
    height: 8,
    backgroundColor: warded.bgLight,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  popFill: {
    height: '100%',
    borderRadius: 4,
  },
  popText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: warded.text,
    fontSize: 7,
    fontWeight: 'bold',
  },
  fallenOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    zIndex: 10,
  },
  fallenStamp: {
    color: warded.danger,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 3,
    transform: [{ rotate: '-25deg' }],
    borderWidth: 1.5,
    borderColor: warded.danger,
    paddingHorizontal: 4,
    paddingVertical: 1,
    textTransform: 'uppercase',
  },
  fallenText: {
    color: warded.danger,
    fontSize: 8,
    fontWeight: 'bold',
  },
  wardRow: {
    flexDirection: 'row',
    gap: 4,
  },
  wardDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wardEmpty: {
    borderWidth: 1,
    borderColor: warded.textDark,
    borderStyle: 'dashed',
  },
  wardSymbol: {
    fontSize: 10,
    color: '#fff',
  },
  wardImage: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  wardImageNight: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  // FIX 2: Bigger ward dots at night
  wardDotNight: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  wardSymbolNight: {
    fontSize: 13,
  },
  // FIX 2: Inline demon row (replaces tiny absolute badge)
  demonInlineRow: {
    alignItems: 'center',
    gap: 1,
  },
  demonIconsRow: {
    flexDirection: 'row',
    gap: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  demonInlineIcon: {
    fontSize: 12,
  },
  demonInlineImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  demonStrengthText: {
    color: warded.danger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  presenceBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: warded.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presenceIcon: {
    fontSize: 11,
    color: warded.bg,
  },
  // FIX 5A: Larger presence badge during positioning
  presenceBadgeLarge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    bottom: -12,
    borderWidth: 2,
    borderColor: warded.wardLight,
  },
  presenceIconLarge: {
    fontSize: 14,
  },
  // MAJOR 2: Activated location styles
  locationActivated: {
    opacity: 0.55,
  },
  activatedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: warded.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activatedIcon: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});
