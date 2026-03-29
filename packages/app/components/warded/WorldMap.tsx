import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { warded, wardedFonts, wardColor, demonColor, WARD_SYMBOLS, DEMON_SYMBOLS } from '../../theme-warded';
import type { Location, LocationId, DemonAtLocation } from '../../../engine/src/warded/types';

const { width: SCREEN_W } = Dimensions.get('window');
const MAP_SIZE = Math.min(SCREEN_W - 32, 340);

interface Props {
  locations: Location[];
  presenceLocation: LocationId;
  demonsAtLocations: Record<LocationId, DemonAtLocation[]>;
  selectedLocation: LocationId | null;
  onLocationPress: (id: LocationId) => void;
  isNight: boolean;
}

const POSITIONS: Record<string, { top: number; left: number }> = {
  north: { top: 0, left: 0.5 },
  west: { top: 0.5, left: 0 },
  east: { top: 0.5, left: 1 },
  south: { top: 1, left: 0.5 },
};

export default function WorldMap({ locations, presenceLocation, demonsAtLocations, selectedLocation, onLocationPress, isNight }: Props) {
  return (
    <View style={[styles.mapContainer, { width: MAP_SIZE, height: MAP_SIZE }]}>
      {/* Connection lines */}
      <View style={styles.linesLayer}>
        {/* N-W */}
        <View style={[styles.line, { top: MAP_SIZE * 0.25, left: MAP_SIZE * 0.15, width: MAP_SIZE * 0.35, transform: [{ rotate: '45deg' }] }]} />
        {/* N-E */}
        <View style={[styles.line, { top: MAP_SIZE * 0.25, left: MAP_SIZE * 0.5, width: MAP_SIZE * 0.35, transform: [{ rotate: '-45deg' }] }]} />
        {/* W-S */}
        <View style={[styles.line, { top: MAP_SIZE * 0.65, left: MAP_SIZE * 0.15, width: MAP_SIZE * 0.35, transform: [{ rotate: '-45deg' }] }]} />
        {/* E-S */}
        <View style={[styles.line, { top: MAP_SIZE * 0.65, left: MAP_SIZE * 0.5, width: MAP_SIZE * 0.35, transform: [{ rotate: '45deg' }] }]} />
      </View>

      {/* Location nodes */}
      {locations.map((loc) => {
        const pos = POSITIONS[loc.position];
        const isPresence = loc.id === presenceLocation;
        const isSelected = loc.id === selectedLocation;
        const demons = demonsAtLocations[loc.id] ?? [];
        const demonCount = demons.length;
        const totalStr = demons.reduce((s, d) => s + d.currentStrength, 0);

        return (
          <TouchableOpacity
            key={loc.id}
            style={[
              styles.locationNode,
              {
                top: pos.top * (MAP_SIZE - 80),
                left: pos.left * (MAP_SIZE - 80),
              },
              loc.fallen && styles.locationFallen,
              isPresence && styles.locationPresence,
              isSelected && styles.locationSelected,
            ]}
            onPress={() => onLocationPress(loc.id)}
            activeOpacity={0.7}
          >
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
            {loc.fallen && <Text style={styles.fallenText}>TOMBÉ</Text>}

            {/* Ward indicators */}
            <View style={styles.wardRow}>
              {loc.wards.map((ws, i) => (
                <View key={i} style={[styles.wardDot, ws.ward ? { backgroundColor: wardColor(ws.ward) } : styles.wardEmpty]}>
                  {ws.ward && <Text style={styles.wardSymbol}>{WARD_SYMBOLS[ws.ward]}</Text>}
                </View>
              ))}
            </View>

            {/* Demon count (night) */}
            {isNight && demonCount > 0 && (
              <View style={styles.demonBadge}>
                <Text style={styles.demonBadgeText}>{demonCount}×{totalStr}</Text>
              </View>
            )}

            {/* Presence indicator */}
            {isPresence && (
              <View style={styles.presenceBadge}>
                <Text style={styles.presenceIcon}>⚔</Text>
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
    width: 80,
    backgroundColor: warded.bgCard,
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: warded.border,
    gap: 3,
  },
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
  demonBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: warded.danger,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  demonBadgeText: {
    color: '#fff',
    fontSize: 8,
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
});
