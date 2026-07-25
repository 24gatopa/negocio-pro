import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import BottomNav from '../components/BottomNav';
import { notify } from '../utils/alerts';

export default function InventoryScreen({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(collection(db, 'usuarios', uid, 'productos'), orderBy('nombre'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProductos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  const filtrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const estadoStock = (cantidad) => {
    const min = 15; // debajo de esto se considera "Stock bajo"
    return cantidad <= min
      ? { label: 'Stock bajo', color: '#e05353' }
      : { label: 'En Stock', color: '#2fa84f' };
  };

  const ajustarStock = async (item, delta) => {
    if ((item.cantidad || 0) + delta < 0) return;
    try {
      const uid = auth.currentUser?.uid;
      await updateDoc(doc(db, 'usuarios', uid, 'productos', item.id), {
        cantidad: increment(delta),
      });
    } catch (e) {
      notify('Error', 'No se pudo actualizar el stock, intenta de nuevo');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventario</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 2 }]}>PRODUCTO</Text>
        <Text style={[styles.th, { flex: 1 }]}>CANTIDAD</Text>
        <Text style={[styles.th, { flex: 1 }]}>STOCK</Text>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Aún no tienes productos. Agrega el primero abajo.</Text>
        }
        renderItem={({ item }) => {
          const estado = estadoStock(item.cantidad ?? 0);
          return (
            <View style={styles.row}>
              <TouchableOpacity
                style={{ flex: 2 }}
                onPress={() => navigation.navigate('AddProduct', { product: item })}
              >
                <Text style={[styles.cell, { fontWeight: '600' }]}>{item.nombre}</Text>
                <Text style={styles.editHint}>Toca para editar</Text>
              </TouchableOpacity>
              <View style={styles.stockStepper}>
                <TouchableOpacity onPress={() => ajustarStock(item, -1)} hitSlop={8}>
                  <Ionicons name="remove-circle-outline" size={19} color="#999" />
                </TouchableOpacity>
                <Text style={styles.stockValue}>{item.cantidad}</Text>
                <TouchableOpacity onPress={() => ajustarStock(item, 1)} hitSlop={8}>
                  <Ionicons name="add-circle-outline" size={19} color="#111" />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.badge, { backgroundColor: estado.color }]}>
                  <Text style={styles.badgeText}>{estado.label}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProduct')}>
        <Text style={styles.addButtonText}>+ Agregar Producto</Text>
      </TouchableOpacity>

      <BottomNav current="Inventory" />
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    height: 38,
  },
  searchInput: { marginLeft: 6, flex: 1, fontSize: 13 },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  th: { fontSize: 11, color: '#999', fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cell: { fontSize: 13 },
  editHint: { fontSize: 10, color: '#bbb', marginTop: 1 },
  stockStepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stockValue: { fontSize: 13, minWidth: 22, textAlign: 'center' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  addButton: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
});
