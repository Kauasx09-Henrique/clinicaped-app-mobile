import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { TextInput, Button, Text, RadioButton, HelperText, Appbar, Card, ActivityIndicator } from 'react-native-paper';
import { mask } from 'remask';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import api from '../../src/services/api'; 

const MASKS = {
  cpf: '999.999.999-99',
  telefone: ['(99) 9999-9999', '(99) 9 9999-9999'],
  dataNascimento: '99/99/9999',
};

export default function CadastroUsuarioScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // validaçoes 
  const validate = () => {
    const newErrors = {};

    const validationRules = [
      { field: 'nome', condition: !nome.trim(), message: 'Nome é obrigatório' },
      { field: 'email', condition: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), message: 'E-mail inválido' },
      { field: 'senha', condition: senha.length < 6, message: 'A senha deve ter no mínimo 6 caracteres' },
      { field: 'confirmarSenha', condition: senha !== confirmarSenha, message: 'As senhas não conferem' },
      { field: 'cpf', condition: cpf.replace(/\D/g, '').length !== 11, message: 'CPF inválido' },
      { field: 'telefone', condition: telefone.replace(/\D/g, '').length < 11, message: 'Telefone inválido' },
      { field: 'genero', condition: !genero, message: 'Selecione um gênero' },
      { field: 'dataNascimento', condition: dataNascimento.length !== 10, message: 'Data de nascimento inválida' },
    ];

    validationRules.forEach(({ field, condition, message }) => {
      if (condition) {
        newErrors[field] = message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Toast.show({
        type: 'error',
        text1: 'Formulário incompleto',
        text2: 'Por favor, preencha todos os campos corretamente',
      });
      return;
    }

    setLoading(true);

    const payload = {
      user_nome: nome,
      user_email: email,
      user_senha: senha,
      user_genero: genero,
      user_telefone: telefone.replace(/\D/g, ''),
      user_cpf: cpf.replace(/\D/g, ''),
      user_data_nascimento: dataNascimento,
    };

    try {
      await api.post('/users', payload);
      
      Toast.show({
        type: 'success',
        text1: 'Cadastro realizado!',
        text2: `Bem-vindo(a), ${nome}!`,
      });
      
      navigation.goBack();
    } catch (err) {
      console.error('Erro no cadastro:', err.response?.data || err.message);
      Toast.show({
        type: 'error',
        text1: 'Erro no Cadastro',
        text2: err.response?.data?.message || 'Não foi possível completar o cadastro',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
        <Appbar.Content 
          title="Criar Conta" 
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContent}>
            <Icon name="account-plus" size={60} color="#3A7EC3" style={styles.headerIcon} />
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>Preencha os campos abaixo para se cadastrar</Text>
          </View>
          
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <TextInput
                label="Nome completo"
                value={nome}
                onChangeText={setNome}
                error={!!errors.nome}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E8F0"
                activeOutlineColor="#3A7EC3"
                left={<TextInput.Icon icon="account" color="#7F8C8D" />}
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
                outlineColor="#E0E8F0"
                activeOutlineColor="#3A7EC3"
                left={<TextInput.Icon icon="email" color="#7F8C8D" />}
              />
              {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}

              <TextInput
                label="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showPassword}
                error={!!errors.senha}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E8F0"
                activeOutlineColor="#3A7EC3"
                left={<TextInput.Icon icon="lock" color="#7F8C8D" />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                    color="#7F8C8D"
                  />
                }
              />
              {errors.senha && <HelperText type="error" style={styles.errorText}>{errors.senha}</HelperText>}

              <TextInput
                label="Confirmar senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!showPassword}
                error={!!errors.confirmarSenha}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E8F0"
                activeOutlineColor="#3A7EC3"
                left={<TextInput.Icon icon="lock-check" color="#7F8C8D" />}
              />
              {errors.confirmarSenha && <HelperText type="error" style={styles.errorText}>{errors.confirmarSenha}</HelperText>}
              
              <TextInput
                label="CPF"
                value={cpf}
                onChangeText={v => setCpf(mask(v, MASKS.cpf))}
                keyboardType="numeric"
                maxLength={14} 
                error={!!errors.cpf}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E8F0"
                activeOutlineColor="#3A7EC3"
                left={<TextInput.Icon icon="card-account-details" color="#7F8C8D" />}
              />
              {errors.cpf && <HelperText type="error" style={styles.errorText}>{errors.cpf}</HelperText>}

              <TextInput
                label="Telefone"
                value={telefone}
                onChangeText={v => setTelefone(mask(v, MASKS.telefone))}
                keyboardType="phone-pad"
                maxLength={18}
                error={!!errors.telefone}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E8F0"
                activeOutlineColor="#3A7EC3"
                left={<TextInput.Icon icon="phone" color="#7F8C8D" />}
              />
              {errors.telefone && <HelperText type="error" style={styles.errorText}>{errors.telefone}</HelperText>}

              <TextInput
                label="Data de nascimento"
                value={dataNascimento}
                onChangeText={v => setDataNascimento(mask(v, MASKS.dataNascimento))}
                keyboardType="numeric"
                placeholder="DD/MM/AAAA"
                maxLength={10} 
                error={!!errors.dataNascimento}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E8F0"
                activeOutlineColor="#3A7EC3"
                left={<TextInput.Icon icon="calendar" color="#7F8C8D" />}
              />
              {errors.dataNascimento && <HelperText type="error" style={styles.errorText}>{errors.dataNascimento}</HelperText>}

              <Text style={styles.label}>Gênero</Text>
              <RadioButton.Group onValueChange={setGenero} value={genero}>
                <View style={styles.radioGroup}>
                  <View style={styles.radioItem}>
                    <RadioButton.Android 
                      value="Masculino" 
                      color="#3A7EC3"
                      uncheckedColor="#95A5A6"
                    />
                    <Text style={styles.radioText}>Masculino</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton.Android 
                      value="Feminino" 
                      color="#3A7EC3"
                      uncheckedColor="#95A5A6"
                    />
                    <Text style={styles.radioText}>Feminino</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton.Android 
                      value="Outro" 
                      color="#3A7EC3"
                      uncheckedColor="#95A5A6"
                    />
                    <Text style={styles.radioText}>Outro</Text>
                  </View>
                </View>
              </RadioButton.Group>
              {errors.genero && <HelperText type="error" style={[styles.errorText, {marginTop: -10}]}>{errors.genero}</HelperText>}

              {loading ? (
                <ActivityIndicator 
                  animating={true} 
                  size="large" 
                  color="#3A7EC3" 
                  style={styles.loader}
                />
              ) : (
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                  contentStyle={styles.buttonContent}
                  icon="account-check"
                >
                  Finalizar Cadastro
                </Button>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    backgroundColor: '#3A7EC3',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#3A7EC3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: 'white',
  },
  cardContent: {
    padding: 24,
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  errorText: {
    marginTop: -8,
    marginBottom: 8,
    fontSize: 13,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: '#34495E',
    marginLeft: 8,
  },
  button: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#3A7EC3',
    paddingVertical: 8,
    shadowColor: '#3A7EC3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonContent: {
    height: 48,
  },
  loader: {
    marginVertical: 24,
  },
});