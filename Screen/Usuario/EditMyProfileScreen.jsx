import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Card, ActivityIndicator, Text, Appbar, HelperText } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { mask } from 'remask';

import api from '../../src/services/api'; 

const MASKS = {
  telefone: ['(99) 9999-9999', '(99) 9 9999-9999'],
};

export default function EditMyProfileScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Busca os dados do perfil 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        const userData = response.data;
        
        setNome(userData.user_nome || '');
        setEmail(userData.user_email || '');
        setTelefone(userData.user_telefone || '');
      } catch (error) {
        Toast.show({ 
          type: 'error', 
          text1: 'Erro ao carregar perfil', 
          text2: 'Verifique sua conexão e tente novamente' 
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'E-mail inválido';
    
    // Validação de telefone (mínimo 10 dígitos)
    const phoneDigits = telefone.replace(/\D/g, '');
    if (phoneDigits.length > 0 && phoneDigits.length < 10) {
      newErrors.telefone = 'Telefone inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) {
      Toast.show({ 
        type: 'error', 
        text1: 'Campos inválidos', 
        text2: 'Verifique os campos destacados' 
      });
      return;
    }
    setUpdating(true);

    // Ajustado para o formato esperado pelo backend
    const payload = {
      user_nome: nome,
      user_email: email,
      user_telefone: telefone.replace(/\D/g, ''),
    };

    try {
      // Usando a nova rota de auto-atualização
      await api.patch('/users/profile/me', payload);
      
      Toast.show({ 
        type: 'success', 
        text1: 'Perfil atualizado!', 
        text2: 'Suas informações foram salvas com sucesso' 
      });
      navigation.goBack();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erro desconhecido';
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: errorMsg.includes('email') 
          ? 'Este e-mail já está em uso' 
          : 'Tente novamente mais tarde',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Carregando seu perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction 
          onPress={() => navigation.goBack()} 
          color="#FFF"
        />
        <Appbar.Content 
          title="Editar Perfil" 
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              
              <TextInput
                label="Nome completo"
                value={nome}
                onChangeText={setNome}
                error={!!errors.nome}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor="#3F51B5"
                left={<TextInput.Icon icon="account" color="#757575" />}
              />
              {errors.nome && <HelperText type="error" style={styles.errorText}>{errors.nome}</HelperText>}

              <TextInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor="#3F51B5"
                left={<TextInput.Icon icon="email" color="#757575" />}
              />
              {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}

              <TextInput
                label="Telefone"
                value={telefone}
                onChangeText={v => setTelefone(mask(v, MASKS.telefone))}
                keyboardType="phone-pad"
                maxLength={15}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor="#3F51B5"
                left={<TextInput.Icon icon="phone" color="#757575" />}
              />
              {errors.telefone && <HelperText type="error" style={styles.errorText}>{errors.telefone}</HelperText>}
              <HelperText type="info" style={styles.helperText}>
                Exemplo: (11) 98765-4321
              </HelperText>

              <Button
                mode="contained"
                onPress={handleUpdate}
                loading={updating}
                disabled={updating}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                icon="content-save"
              >
                {updating ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}



const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#F5F7FB' 
  },
  header: {
    backgroundColor: '#3F51B5',
    elevation: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  keyboardView: { 
    flex: 1 
  },
  scrollContainer: { 
    padding: 20, 
    paddingBottom: 40 
  },
  card: { 
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  input: {
    marginVertical: 8,
    backgroundColor: '#FFF',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3F51B5',
    shadowColor: '#3F51B5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  errorText: {
    fontSize: 14,
    marginTop: -4,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    marginTop: -8,
    color: '#757575',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
});