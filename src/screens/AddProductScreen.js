import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import BottomNav from '../components/BottomNav';
import { notify, confirmAsync } from '../utils/alerts';

export default function AddProductScreen({ navigation, route }) {
  const producto = route.params?.product;
  const editando = !!producto;

  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [precio, setPrecio] = useState(producto?.precio?.toString() || '');
  const [cantidad, setCantidad] = useState(producto?.cantidad?.toString() || '');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (!nombre || !precio || !cantidad) {
      notify('Faltan datos', 'Completa nombre, precio y cantidad');
      return;
    }
    const uid = auth.currentUser?.uid;
    setGuardando(true);
    try {
      const data = {
        nombre,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad, 10),
      };
      if (editando) {
        await updateDoc(doc(db, 'usuarios', uid, 'productos', producto.id), data);
      } else {
        await addDoc(collection(db, 'usuarios', uid, 'productos'), {
          ...data,
          estado: 'Activo',
          creadoEn: serverTimestamp(),
        });
      }
      navigation.navigate('Inventory');
    } catch (e) {
      notify('Error', 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    const ok = await confirmAsync(
      'Eliminar producto',
      `¿Seguro que quieres eliminar "${nombre}"?`,
      'Eliminar'
    );
    if (!ok) return;
    const uid = auth.currentUser?.uid;
    await deleteDoc(doc(db, 'usuarios', uid, 'productos', producto.id));
    navigation.navigate('Inventory');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editando ? 'Editar producto' : 'Producto nuevo'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.label}>Nombre del producto</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Yogurt Gloria" />

        <Text style={styles.label}>Precio de venta (S/)</Text>
        <TextInput
          style={styles.input}
          value={precio}
          onChangeText={setPrecio}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />

        <Text style={styles.label}>Cantidad en stock</Text>
        <TextInput
          style={styles.input}
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="number-pad"
          placeholder="0"
        />

        <TouchableOpacity style={styles.button} onPress={handleGuardar} disabled={guardando}>
          <Text style={styles.buttonText}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar Producto'}
          </Text>
        </TouchableOpacity>

        {editando && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleEliminar}>
            <Ionicons name="trash-outline" size={16} color="#c0392b" />
            <Text style={styles.deleteText}>Eliminar producto</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNav current="AddProduct" />
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
  label: { fontSize: 12, color: '#666', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
  },
  button: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    padding: 10,
  },
  deleteText: { color: '#c0392b', fontWeight: '600', fontSize: 13 },
});
