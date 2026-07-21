import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import BottomNav from '../components/BottomNav';

export default function SalesScreen({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState({}); // { productoId: cantidad }
  const [cliente, setCliente] = useState('');
  const [guardando, setGuardando] = useState(false);

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

  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) => {
      const actual = prev[id] || 0;
      const nueva = Math.max(0, actual + delta);
      return { ...prev, [id]: nueva };
    });
  };

  const itemsCarrito = productos
    .filter((p) => (carrito[p.id] || 0) > 0)
    .map((p) => ({ ...p, cantidadVenta: carrito[p.id] }));

  const total = itemsCarrito.reduce((sum, p) => sum + p.cantidadVenta * (p.precio || 0), 0);

  const handleGuardarVenta = async () => {
    if (itemsCarrito.length === 0) {
      Alert.alert('Carrito vacío', 'Selecciona al menos un producto');
      return;
    }
    const uid = auth.currentUser?.uid;
    setGuardando(true);
    try {
      // Guardar la venta
      await addDoc(collection(db, 'usuarios', uid, 'ventas'), {
        productos: itemsCarrito.map((p) => ({
          nombre: p.nombre,
          cantidad: p.cantidadVenta,
          precio: p.precio,
        })),
        total,
        cliente: cliente || 'Sin nombre',
        fecha: serverTimestamp(),
      });

      // Descontar stock de cada producto vendido
      await Promise.all(
        itemsCarrito.map((p) =>
          updateDoc(doc(db, 'usuarios', uid, 'productos', p.id), {
            cantidad: increment(-p.cantidadVenta),
          })
        )
      );

      Alert.alert('Venta guardada', `Total cobrado: S/ ${total.toFixed(2)}`);
      setCarrito({});
      setCliente('');
      navigation.navigate('SalesHistory');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la venta');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro de ventas del producto</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.label}>Seleccionar Producto</Text>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: 220 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No tienes productos en tu inventario todavía.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Text style={{ flex: 2 }}>{item.nombre}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => cambiarCantidad(item.id, -1)}>
                <Ionicons name="remove-circle-outline" size={20} />
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 8 }}>{carrito[item.id] || 0}</Text>
              <TouchableOpacity onPress={() => cambiarCantidad(item.id, 1)}>
                <Ionicons name="add-circle-outline" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={{ flex: 1, textAlign: 'right' }}>
              S/ {((carrito[item.id] || 0) * (item.precio || 0)).toFixed(2)}
            </Text>
          </View>
        )}
      />

      <View style={styles.efectivoBox}>
        <Text style={styles.efectivoLabel}>EFECTIVO</Text>
        <Text style={styles.totalLabel}>Total a cobrar</Text>
        <Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text>
      </View>

      <TextInput
        style={styles.inputCliente}
        placeholder="Nombre del cliente (opcional)"
        value={cliente}
        onChangeText={setCliente}
      />

      <TouchableOpacity style={styles.button} onPress={handleGuardarVenta} disabled={guardando}>
        <Text style={styles.buttonText}>{guardando ? 'Guardando...' : 'Guardar Venta'}</Text>
      </TouchableOpacity>

      <BottomNav current="Sales" />
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
  headerTitle: { fontSize: 14, fontWeight: 'bold', flex: 1, marginLeft: 10 },
  label: { paddingHorizontal: 16, fontSize: 12, color: '#666', marginBottom: 6 },
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
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stepper: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', color: '#999', marginTop: 10 },
  efectivoBox: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
  },
  efectivoLabel: { fontSize: 11, color: '#999', marginBottom: 6 },
  totalLabel: { fontSize: 13, color: '#666' },
  totalValue: { fontSize: 22, fontWeight: 'bold' },
  inputCliente: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
