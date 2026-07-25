import { Alert, Platform } from 'react-native';

// Alert.alert no hace nada en la versión web (limitación conocida de
// react-native-web). Estas funciones eligen automáticamente la forma correcta
// de mostrar el mensaje según la plataforma, así los avisos SIEMPRE se ven.

export function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

// Devuelve una Promise<boolean>: true si el usuario confirmó, false si canceló.
export function confirmAsync(title, message, confirmLabel = 'Confirmar') {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(message ? `${title}\n\n${message}` : title));
    } else {
      Alert.alert(title, message, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ]);
    }
  });
}
