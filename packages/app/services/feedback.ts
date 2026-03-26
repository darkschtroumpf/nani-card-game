import * as Haptics from 'expo-haptics';

/** Light tap feedback — card selection, navigation */
export function tapFeedback() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Medium impact — card played, action confirmed */
export function playCardFeedback() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Heavy impact — duel reveal, damage taken */
export function impactFeedback() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/** Success — win duel, claim victory */
export function successFeedback() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Error — lose duel, eliminated */
export function errorFeedback() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/** Warning — being attacked, low health */
export function warningFeedback() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
