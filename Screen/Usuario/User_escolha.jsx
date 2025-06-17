import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const EscolhaLoginScreen = ({ navigation }) => {
  const handleLoginPress = () => {
    navigation.navigate('Login');
    Toast.show({
      type: 'success',
      text1: 'Ótima escolha!',
      text2: 'Você selecionou a opção de login',
      position: 'bottom',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="hospital-building" 
          size={60} 
          color="#3A7EC3" 
          style={styles.logo}
        />
        <Text style={styles.title}>Bem-vindo ao MediSchedule</Text>
        <Text style={styles.subtitle}>Sua saúde em primeiro lugar</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.cardInner}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="login" size={36} color="#3A7EC3" />
              </View>
              <Text style={styles.cardTitle}>Já tem uma conta?</Text>
              <Text style={styles.cardDescription}>
                Faça login para acessar suas consultas agendadas e informações pessoais
              </Text>
              <Button
                mode="contained"
                style={styles.button}
                labelStyle={styles.buttonLabel}
                onPress={handleLoginPress}
                icon="login"
              >
                Entrar
              </Button>
            </Card.Content>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardInner}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="account-plus" size={36} color="#28a745" />
              </View>
              <Text style={styles.cardTitle}>Novo por aqui?</Text>
              <Text style={styles.cardDescription}>
                Crie uma conta para começar a agendar consultas e gerenciar sua saúde
              </Text>
              <Button
                mode="contained"
                style={[styles.button, styles.registerButton]}
                labelStyle={styles.buttonLabel}
                onPress={() => navigation.navigate('CadastroUsuarioScreen')}
                icon="account-plus"
              >
                Cadastrar-se
              </Button>
            </Card.Content>
          </View>
        </Card>
      </View>

      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.skipText}>Continuar como visitante</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#7F8C8D',
    maxWidth: 300,
  },
  content: {
    paddingHorizontal: 10,
  },
  card: {
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#3A7EC3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cardInner: {
    borderWidth: 1,
    borderColor: '#E0E8F0',
    borderRadius: 20,
  },
  cardContent: {
    alignItems: 'center',
    padding: 25,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2C3E50',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    borderRadius: 12,
    backgroundColor: '#3A7EC3',
    paddingVertical: 8,
    width: '100%',
    shadowColor: '#3A7EC3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  registerButton: {
    backgroundColor: '#28a745',
    shadowColor: '#28a745',
  },
  buttonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  skipButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  skipText: {
    color: '#3A7EC3',
    fontWeight: '600',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default EscolhaLoginScreen;