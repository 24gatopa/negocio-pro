import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const menuItems = [
  {
    key: 'Inventory',
    title: 'Inventario',
    desc: 'Controla todos tus productos, stock disponible.',
    icon: 'cube-outline',
  },
  {
    key: 'Sales',
    title: 'Registro de ventas',
    desc: 'Registra las ventas de los productos de la tienda.',
    icon: 'cart-outline',
  },
  {
    key: 'SalesHistory',
    title: 'Historial de Ventas',
    desc: 'Guarda todos los registros de los productos que vende.',
    icon: 'time-outline',
  },
  {
    key: 'Earnings',
    title: 'Mis Ganancias',
    desc: 'Consulta ingresos, ganancias y rendimiento del negocio.',
    icon: 'stats-chart-outline',
  },
];

export default function WelcomeScreen({ navigation }) {
  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Bienvenido Usuario</Text>
        <TouchableOpacity onPress={() => signOut(auth)} style={{ marginLeft: 'auto' }}>
          <Ionicons name="log-out-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            onPress={() => navigation.navigate(item.key)}
          >
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={26} color="#111" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  list: { padding: 20, gap: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  iconBox: { width: 40, alignItems: 'center' },
  cardTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  cardDesc: { color: '#666', fontSize: 12 },
});
