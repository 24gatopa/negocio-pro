import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import BottomNav from '../components/BottomNav';

export default function EarningsScreen() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(collection(db, 'usuarios', uid, 'ventas'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVentas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  const ventasTotales = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
  const ventasRealizadas = ventas.length;

  // "Clientes que deben" -> ventas marcadas como pendientes de pago (deuda: true)
  const clientesQueDeben = ventas.filter((v) => v.deuda);

  const formatearFecha = (fecha) => (fecha?.toDate ? fecha.toDate().toLocaleDateString() : '');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Usuario</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Ventas Totales</Text>
          <Text style={styles.statValue}>S/ {ventasTotales.toFixed(2)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Ventas realizadas</Text>
          <Text style={styles.statValue}>{ventasRealizadas}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Clientes que deben:</Text>

      <FlatList
        data={clientesQueDeben}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No tienes clientes con deudas pendientes.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ flex: 2 }}>{item.cliente}</Text>
            <Text style={{ flex: 1 }}>S/ {item.total?.toFixed(2)}</Text>
            <Text style={{ flex: 1, fontSize: 11, color: '#999' }}>{formatearFecha(item.fecha)}</Text>
          </View>
        )}
      />

      <BottomNav current="Earnings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  statBox: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 14 },
  statLabel: { fontSize: 11, color: '#999' },
  statValue: { fontSize: 17, fontWeight: 'bold', marginTop: 6 },
  sectionTitle: { paddingHorizontal: 16, fontWeight: '600', marginBottom: 10 },
  empty: { textAlign: 'center', color: '#999', marginTop: 30 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 10,
  },
});
