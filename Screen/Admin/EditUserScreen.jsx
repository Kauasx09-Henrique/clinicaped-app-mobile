import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Card, ActivityIndicator, Text, Appbar, RadioButton, Avatar } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import api from '../../src/services/api';

const EditUserScreen = ({ route, navigation }) => {
  const { userData } = route.params;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setNome(userData.user_nome || '');
      setEmail(userData.user_email || '');
      setRole(userData.role || 'user');
    }
  }, [userData]);

  const handleUpdate = async () => {
    setLoading(true);
    const payload = { user_nome: nome, user_email: email, role };

    try {
      await api.patch(`/users/${userData.id}`, payload);
      Toast.show({ type: 'success', text1: 'Usuário atualizado com sucesso!' });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao Atualizar',
        text2: error.response?.data?.message || 'Não foi possível salvar as alterações.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <Text>Nenhum usuário selecionado.</Text>;
  }

  // Define as propriedades do Avatar com base na função do usuário
  const avatarIcon = role === 'admin' ? 'shield-crown' : 'account-circle';
  const avatarColor = role === 'admin' ? '#FFD700' : '#6200ee'; // Dourado para admin, Roxo para user

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Editar Usuário" subtitle={userData.user_nome} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            
            {/* ✅✅✅ AVATAR DINÂMICO ADICIONADO AQUI ✅✅✅ */}
            <View style={styles.avatarContainer}>
              <Avatar.Icon size={80} icon={avatarIcon} color="#fff" style={{ backgroundColor: avatarColor }} />
            </View>

            <TextInput label="Nome Completo" value={nome} onChangeText={setNome} style={styles.input} mode="outlined"/>
            <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} mode="outlined"/>
            
            <Text style={styles.roleTitle}>Função do Usuário</Text>
            <RadioButton.Group onValueChange={newValue => setRole(newValue)} value={role}>
              <View style={styles.radioItem}>
                <RadioButton value="user" />
                <Text>Usuário Padrão</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="admin" />
                <Text>Administrador</Text>
              </View>
            </RadioButton.Group>

            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              <Button mode="contained" onPress={handleUpdate} style={styles.button} icon="content-save-edit">
                Salvar Alterações
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContainer: { padding: 16 },
  card: { borderRadius: 12 },
  // ✅ Estilo para o container do avatar
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  input: { marginBottom: 16 },
  roleTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  button: { marginTop: 20, paddingVertical: 8 },
  loader: { marginVertical: 20 },
});

export default EditUserScreen;