import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import BottomNav from '../components/BottomNav';

export default function SalesHistoryScreen({ navigation }) {
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

  const totalDinero = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
  const ventasRealizadas = ventas.length;
  const productosVendidos = ventas.reduce(
    (sum, v) => sum + (v.productos?.reduce((s, p) => s + p.cantidad, 0) || 0),
    0
  );

  const formatearFecha = (fecha) => {
    if (!fecha?.toDate) return '';
    const d = fecha.toDate();
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de ventas</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total de dinero</Text>
          <Text style={styles.statValue}>S/ {totalDinero.toFixed(2)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Ventas realizadas</Text>
          <Text style={styles.statValue}>{ventasRealizadas}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Productos vendidos</Text>
          <Text style={styles.statValue}>{productosVendidos}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Historial de ventas</Text>

      <FlatList
        data={ventas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={<Text style={styles.empty}>Todavía no registras ventas.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardDate}>{formatearFecha(item.fecha)}</Text>
              <Text style={styles.cardProducts}>
                {item.productos?.map((p) => p.nombre).join(', ')}
              </Text>
              <Text style={styles.cardClient}>{item.cliente}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>EFECTIVO</Text>
              </View>
              <Text style={styles.cardTotal}>S/ {item.total?.toFixed(2)}</Text>
            </View>
          </View>
        )}
      />

      <BottomNav current="SalesHistory" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statBox: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 10 },
  statLabel: { fontSize: 10, color: '#999' },
  statValue: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  sectionTitle: { paddingHorizontal: 16, fontWeight: '600', marginBottom: 8 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardDate: { fontSize: 11, color: '#999', marginBottom: 4 },
  cardProducts: { fontSize: 13, fontWeight: '500' },
  cardClient: { fontSize: 11, color: '#666', marginTop: 2 },
  badge: { backgroundColor: '#2fa84f', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '600' },
  cardTotal: { marginTop: 6, fontWeight: 'bold' },
});
