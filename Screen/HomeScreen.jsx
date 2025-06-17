import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Provider as PaperProvider,
  Modal,
  Portal,
  Button,
  FAB,
  Chip,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import api from '../src/services/api';

const HomeScreen = ({ navigation }) => {
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClinicas = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/clinica');
      setClinicas(response.data);
    } catch (e) {
      console.error('Erro ao buscar clínicas:', e);
      setError('Não foi possível carregar as clínicas. Verifique sua conexão.');
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível carregar as clínicas',
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('authToken');
          const userRole = await AsyncStorage.getItem('userRole');

          if (token) {
            setIsLoggedIn(true);
            setIsAdmin(userRole === 'admin');
            const profileResponse = await api.get('/users/profile');
            setUser(profileResponse.data);
          } else {
            setIsLoggedIn(false);
            setUser(null);
            setIsAdmin(false);
          }
          await fetchClinicas();
        } catch (err) {
          if (err.response?.status === 401) {
            handleLogout(true); 
          } else {
            setError('Ocorreu um erro ao carregar os dados.');
            Toast.show({
              type: 'error',
              text1: 'Erro ao carregar',
              text2: 'Tente novamente mais tarde',
            });
          }
        }
      };
      loadData();
    }, [])
  );

  const handleLogout = async (isSilent = false) => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userData', 'userRole']);
      
      setIsLoggedIn(false);
      setUser(null);
      setIsAdmin(false);
      
      if (!isSilent) {
        Toast.show({ 
          type: 'success', 
          text1: 'Desconectado',
          text2: 'Você saiu da sua conta' 
        });
      }
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Public' }],
      });

    } catch (e) {
      console.error('Falha ao fazer logout', e);
      Toast.show({
        type: 'error',
        text1: 'Erro ao sair',
        text2: 'Tente novamente'
      });
    }
  };
  
  const handleMarcarConsulta = (clinica) => {
    const clinicToPass = clinica || selectedClinic;
    if (!clinicToPass) return;

    if (isLoggedIn) {
      navigation.navigate('User', { 
        screen: 'MyConsultations',
        params: { clinicaId: clinicToPass.id },
      });
    } else {
      Toast.show({ 
        type: 'info', 
        text1: 'Login Necessário',
        text2: 'Faça login para marcar consultas' 
      });
      navigation.navigate('EscolhaLogin');
    }
  };
  
  const handleEditarClinica = (clinica) => {
    navigation.navigate('EditarClinica', { clinicaData: clinica });
  };

  const handleVerMais = (clinica) => {
    setSelectedClinic(clinica);
    setModalVisible(true);
  };
  
  const closeModal = () => setModalVisible(false);

  const renderAddress = (enderecos) => {
    if (!enderecos || enderecos.length === 0) {
      return <Text style={styles.addressText}>Endereço não informado</Text>;
    }
    return enderecos.map((endereco, index) => (
      <View key={index} style={styles.addressItem}>
        <View style={styles.addressIconRow}>
          <Icon name="map-marker" size={16} color="#3A7EC3" />
          <Text style={styles.addressTitle}>Endereço {enderecos.length > 1 ? index + 1 : ''}</Text>
        </View>
        <Text style={styles.addressText}>
          {`${endereco.endereco_logradouro}, ${endereco.endereco_numero_casa}`}
        </Text>
        <Text style={styles.addressText}>
          {`${endereco.endereco_bairro}, ${endereco.endereco_uf}`}
        </Text>
        <Text style={styles.addressText}>
          {`CEP: ${endereco.endereco_cep}`}
        </Text>
      </View>
    ));
  };

  const renderClinicItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleVerMais(item)} activeOpacity={0.9}>
      <View style={styles.card}>
        {item.logo_clinica ? (
          <Image
            source={{ uri: item.logo_clinica }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="hospital-building" size={40} color="#3A7EC3" />
          </View>
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.nome_clinica || 'Nome Indisponível'}</Text>
            <Chip 
              style={styles.specialtyChip}
              textStyle={styles.specialtyText}
            >
              {item.especialidade_consulta || 'Geral'}
            </Chip>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="phone" size={16} color="#3A7EC3" />
            <Text style={styles.infoText}>{item.telefone_clinica || 'Telefone não informado'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={16} color="#3A7EC3" />
            <Text style={styles.infoText}>{item.horario_funcionamento || 'Horário não informado'}</Text>
          </View>
          
          <View style={styles.addressPreview}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={16} color="#3A7EC3" />
              <Text style={styles.addressPreviewText} numberOfLines={1}>
                {item.enderecos?.[0]?.endereco_bairro || 'Endereço não informado'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <Button 
            mode="outlined" 
            onPress={() => handleVerMais(item)}
            style={styles.moreButton}
            labelStyle={styles.moreButtonLabel}
          >
            Detalhes
          </Button>
          
          {isAdmin ? (
            <Button 
              mode="contained" 
              icon="pencil" 
              onPress={() => handleEditarClinica(item)}
              style={styles.adminButton}
              labelStyle={styles.adminButtonLabel}
            >
              Editar
            </Button>
          ) : (
            <Button 
              mode="contained" 
              onPress={() => handleMarcarConsulta(item)}
              style={styles.appointmentButton}
              labelStyle={styles.appointmentButtonLabel}
            >
              Agendar
            </Button>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A7EC3" />
        <Text style={styles.loadingText}>Carregando clínicas...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          {isLoggedIn && user ? (
            <View style={styles.userInfoContainer}>
              <View style={styles.userGreeting}>
                <Icon name="account-circle" size={28} color="#3A7EC3" />
                <Text style={styles.greetingText}>Olá, {user.user_nome || 'Usuário'}!</Text>
              </View>
              
              <View style={styles.headerActions}>
                {isAdmin && (
                  <Chip 
                    style={styles.adminBadge}
                    textStyle={styles.adminBadgeText}
                    icon="shield-account"
                  >
                    Administrador
                  </Chip>
                )}
                <Button 
                  mode="outlined" 
                  onPress={handleLogout}
                  style={styles.logoutButton}
                  labelStyle={styles.logoutButtonLabel}
                  icon="logout"
                >
                  Sair
                </Button>
              </View>
            </View>
          ) : (
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('EscolhaLogin')}
              style={styles.loginButton}
              labelStyle={styles.loginButtonLabel}
              icon="login"
            >
              Fazer Login
            </Button>
          )}
        </View>

        <Text style={styles.mainTitle}>Clínicas Disponíveis</Text>
        <Text style={styles.subtitle}>Selecione uma clínica para agendar sua consulta</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained" 
              onPress={fetchClinicas}
              style={styles.retryButton}
              labelStyle={styles.retryButtonLabel}
            >
              Tentar Novamente
            </Button>
          </View>
        ) : (
          <FlatList
            data={clinicas}
            renderItem={renderClinicItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="hospital-box" size={48} color="#CFD8DC" />
                <Text style={styles.emptyText}>Nenhuma clínica encontrada</Text>
                <Text style={styles.emptySubtext}>Tente novamente mais tarde</Text>
              </View>
            }
            refreshing={refreshing}
            onRefresh={fetchClinicas}
          />
        )}

        {isAdmin && (
          <FAB
            style={styles.fab}
            icon="plus"
            color="white"
            onPress={() => navigation.navigate('CadastroClinica')}
          />
        )}

        {selectedClinic && (
          <Portal>
            <Modal 
              visible={modalVisible} 
              onDismiss={closeModal} 
              contentContainerStyle={styles.modalContainer}
            >
              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalHeader}>
                  {selectedClinic.logo_clinica ? (
                    <Image
                      source={{ uri: selectedClinic.logo_clinica }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.modalImagePlaceholder}>
                      <Icon name="hospital-building" size={48} color="#3A7EC3" />
                    </View>
                  )}
                  <Text style={styles.modalTitle}>{selectedClinic.nome_clinica}</Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Informações</Text>
                  <View style={styles.infoRow}>
                    <Icon name="phone" size={20} color="#3A7EC3" />
                    <Text style={styles.modalInfoText}>
                      {selectedClinic.telefone_clinica || 'Telefone não informado'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="clock-outline" size={20} color="#3A7EC3" />
                    <Text style={styles.modalInfoText}>
                      {selectedClinic.horario_funcionamento || 'Horário não informado'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Especialidade</Text>
                  <Chip 
                    style={styles.modalSpecialtyChip}
                    textStyle={styles.modalSpecialtyText}
                  >
                    {selectedClinic.especialidade_consulta || 'Geral'}
                  </Chip>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Endereços</Text>
                  {renderAddress(selectedClinic.enderecos)}
                </View>
                
                <View style={styles.modalActions}>
                  <Button 
                    mode="outlined" 
                    onPress={closeModal}
                    style={styles.modalCloseButton}
                    labelStyle={styles.modalCloseButtonLabel}
                  >
                    Fechar
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={() => handleMarcarConsulta(selectedClinic)}
                    style={styles.modalActionButton}
                    labelStyle={styles.modalActionButtonLabel}
                  >
                    Agendar Consulta
                  </Button>
                </View>
              </ScrollView>
            </Modal>
          </Portal>
        )}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFF' 
  },
  header: { 
    padding: 16,
    paddingTop: 24,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 8,
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBadge: {
    backgroundColor: '#E0F7FA',
    marginRight: 10,
    height: 32,
    alignItems: 'center',
  },
  adminBadgeText: {
    color: '#00838F',
    fontWeight: '600',
    fontSize: 13,
  },
  logoutButton: {
    borderColor: '#FF6B6B',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 36,
  },
  logoutButtonLabel: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    backgroundColor: '#3A7EC3',
    paddingVertical: 6,
    shadowColor: '#3A7EC3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  listContainer: { 
    paddingBottom: 100, 
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#3A7EC3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#E0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    flex: 1,
  },
  specialtyChip: {
    backgroundColor: '#E0F0FF',
    height: 28,
  },
  specialtyText: {
    color: '#3A7EC3',
    fontWeight: '600',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#34495E',
    marginLeft: 12,
    flexShrink: 1,
  },
  addressPreview: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  addressPreviewText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 12,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  moreButton: {
    borderColor: '#3A7EC3',
    borderWidth: 1.5,
    borderRadius: 12,
  },
  moreButtonLabel: {
    color: '#3A7EC3',
    fontWeight: '600',
    fontSize: 14,
  },
  appointmentButton: {
    borderRadius: 12,
    backgroundColor: '#3A7EC3',
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: '#3A7EC3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  appointmentButtonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  adminButton: {
    borderRadius: 12,
    backgroundColor: '#00838F',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  adminButtonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#7F8C8D',
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalScroll: {
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
  modalImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#E0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 8,
  },
  addressItem: {
    marginBottom: 20,
  },
  addressIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  addressText: {
    fontSize: 15,
    color: '#34495E',
    lineHeight: 22,
    marginLeft: 24,
  },
  modalInfoText: {
    fontSize: 16,
    color: '#34495E',
    marginLeft: 12,
  },
  modalSpecialtyChip: {
    backgroundColor: '#E0F0FF',
    alignSelf: 'flex-start',
    height: 32,
  },
  modalSpecialtyText: {
    color: '#3A7EC3',
    fontWeight: '600',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCloseButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#95A5A6',
    borderWidth: 1.5,
    borderRadius: 12,
  },
  modalCloseButtonLabel: {
    color: '#95A5A6',
    fontWeight: '600',
  },
  modalActionButton: {
    flex: 2,
    borderRadius: 12,
    backgroundColor: '#3A7EC3',
  },
  modalActionButtonLabel: {
    color: 'white',
    fontWeight: '600',
  },
  adminBadge: {
    backgroundColor: '#E0F7FA',
    marginRight: 10,
    height: 32,
    alignItems: 'center',
  },
  adminBadgeText: {
    color: '#00838F',
    fontWeight: '600',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: '#3A7EC3',
    borderRadius: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '500',
  },
  retryButton: {
    borderRadius: 12,
    backgroundColor: '#3A7EC3',
    paddingVertical: 6,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  retryButtonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;