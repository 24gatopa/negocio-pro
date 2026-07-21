import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import BottomNav from '../components/BottomNav';

export default function AddProductScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (!nombre || !precio || !cantidad) {
      Alert.alert('Faltan datos', 'Completa nombre, precio y cantidad');
      return;
    }
    const uid = auth.currentUser?.uid;
    setGuardando(true);
    try {
      await addDoc(collection(db, 'usuarios', uid, 'productos'), {
        nombre,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad, 10),
        estado: 'Activo',
        creadoEn: serverTimestamp(),
      });
      Alert.alert('Listo', 'Producto guardado');
      navigation.navigate('Inventory');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Producto nuevo</Text>
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
          <Text style={styles.buttonText}>{guardando ? 'Guardando...' : 'Guardar Producto'}</Text>
        </TouchableOpacity>
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
});
