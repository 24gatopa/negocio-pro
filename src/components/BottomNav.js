import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const items = [
  { key: 'Inventory', label: 'Inventario', icon: 'cube-outline' },
  { key: 'AddProduct', label: 'Producto', icon: 'add-circle-outline' },
  { key: 'Sales', label: 'Ventas', icon: 'cart-outline' },
  { key: 'SalesHistory', label: 'Historial', icon: 'time-outline' },
  { key: 'Earnings', label: 'Ganancias', icon: 'stats-chart-outline' },
];

export default function BottomNav({ current }) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.item}
          onPress={() => navigation.navigate(item.key)}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={current === item.key ? '#000' : '#999'}
          />
          <Text style={[styles.label, current === item.key && styles.labelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  item: { flex: 1, alignItems: 'center' },
  label: { fontSize: 10, color: '#999', marginTop: 2 },
  labelActive: { color: '#000', fontWeight: '600' },
});
