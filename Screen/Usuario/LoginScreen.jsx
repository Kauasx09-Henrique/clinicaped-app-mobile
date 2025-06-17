import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Card, ActivityIndicator, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api from '../../src/services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Toast.show({
        type: 'error',
        text1: 'Campos Obrigatórios',
        text2: 'Por favor, preencha e-mail e senha.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/users/login', {
        user_email: email,
        user_senha: senha,
      });

      const { access_token, user } = response.data;

      if (access_token && user) {
        await AsyncStorage.setItem('authToken', access_token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        await AsyncStorage.setItem('userRole', user.role || 'user');

        Toast.show({
          type: 'success',
          text1: `Bem-vindo, ${user.user_nome || 'Usuário'}!`,
          text2: 'Login realizado com sucesso',
        });

        if (user.role === 'admin') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Admin' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'User' }],
          });
        }

      } else {
        throw new Error('Resposta de login incompleta do servidor.');
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'E-mail ou senha incorretos.';
      Toast.show({
        type: 'error',
        text1: 'Erro no Login',
        text2: errorMessage,
      });
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar.Image 
              size={120} 
              source={require('../Usuario/Icons/icons_user.png')} 
              style={styles.avatar}
            />
            <View style={styles.avatarBackground} />
          </View>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" color="#7F8C8D" />}
              mode="outlined"
              outlineColor="#E0E8F0"
              activeOutlineColor="#3A7EC3"
              theme={{ colors: { primary: '#3A7EC3' } }}
            />

            <TextInput
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock-outline" color="#7F8C8D" />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                  color="#7F8C8D"
                />
              }
              mode="outlined"
              outlineColor="#E0E8F0"
              activeOutlineColor="#3A7EC3"
              theme={{ colors: { primary: '#3A7EC3' } }}
            />

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('RecuperarSenha')}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator 
                animating={true} 
                style={styles.loader} 
                size="large" 
                color="#3A7EC3" 
              />
            ) : (
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
              >
                Entrar
              </Button>
            )}

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('CadastroUsuarioScreen')}
              style={styles.registerButton}
              labelStyle={styles.registerButtonLabel}
              icon="account-plus"
            >
              Criar nova conta
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    zIndex: 2,
  },
  avatarBackground: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E0F0FF',
    top: -10,
    left: -10,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7F8C8D',
  },
  card: {
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#3A7EC3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3A7EC3',
    fontWeight: '500',
  },
  button: {
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E8F0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#7F8C8D',
  },
  registerButton: {
    borderColor: '#3A7EC3',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
  },
  registerButtonLabel: {
    color: '#3A7EC3',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LoginScreen;