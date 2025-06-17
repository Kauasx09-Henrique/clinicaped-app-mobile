import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import {
  TextInput, Button, Card, ActivityIndicator, Appbar,
  Chip, Provider as PaperProvider, Divider, useTheme
} from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';

import api from '../../src/services/api';

// Configuração do idioma do calendário
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

// Paleta de cores para o nosso tema
const themeColors = {
  primary: '#3F51B5',
  accent: '#00C853',
  background: '#F7F9FC',
  surface: '#FFFFFF',
  text: '#263238',
  placeholder: '#78909C',
};

export default function MarcarConsultaScreen({ route, navigation }) {
  const { clinicaId, usuarioId } = route.params || {};

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [clinica, setClinica] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para buscar detalhes da clínica quando a tela carrega
  useEffect(() => {
    if (!clinicaId) {
      Alert.alert('Erro', 'Nenhuma clínica selecionada.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      return;
    }
    const fetchClinicDetails = async () => {
      try {
        setPageLoading(true);
        const response = await api.get(`/clinica/${clinicaId}`);
        setClinica(response.data);
      } catch (error) {
        console.error('Erro ao buscar detalhes da clínica:', error);
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar os dados da clínica.' });
        navigation.goBack();
      } finally {
        setPageLoading(false);
      }
    };
    fetchClinicDetails();
  }, [clinicaId, navigation]);

  // Efeito para buscar horários disponíveis quando uma data é selecionada
  useEffect(() => {
    if (selectedDate) {
      const fetchAvailableTimes = async () => {
        setIsFetchingTimes(true);
        setSelectedTime(null); // Reseta o horário selecionado ao mudar a data
        setAvailableTimes([]); // Limpa os horários antigos

        try {
          // *** IMPORTANTE: Crie esta rota no seu back-end! ***
          // Exemplo: GET /clinica/1/horarios-disponiveis?data=2025-12-25
          // const response = await api.get(`/clinica/${clinicaId}/horarios-disponiveis?data=${selectedDate}`);
          // setAvailableTimes(response.data);

          // Por enquanto, vamos usar dados FALSOS para teste:
          setTimeout(() => {
            setAvailableTimes(['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
            setIsFetchingTimes(false);
          }, 500);

        } catch (error) {
          console.error('Erro ao buscar horários:', error);
          Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar os horários.' });
          setIsFetchingTimes(false);
        }
      };
      fetchAvailableTimes();
    }
  }, [selectedDate, clinicaId]);

  // Função para lidar com o envio do formulário
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Por favor, selecione uma data e um horário.' });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      data_consulta: selectedDate,
      horario_consulta: selectedTime,
      motivo_consulta: motivo,
      userId: usuarioId,
      clinicaId: clinicaId,
    };

    try {
      // Usando a rota de criação de consulta que definimos no back-end
      await api.post('/consultas', payload);
      
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Sua consulta foi agendada.',
      });

      // Volta para a tela anterior ou para a tela de "Minhas Consultas"
      navigation.goBack();

    } catch (error) {
      console.error('Erro ao agendar consulta:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Não foi possível agendar a consulta.';
      Toast.show({
        type: 'error',
        text1: 'Erro no Agendamento',
        text2: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return <ActivityIndicator style={styles.centered} color={themeColors.primary} size="large" />;
  }

  return (
    <PaperProvider>
      <Appbar.Header style={{ backgroundColor: themeColors.surface, elevation: 2 }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={themeColors.primary} />
        <Appbar.Content title="Agendar Consulta" titleStyle={{ color: themeColors.text, fontWeight: 'bold' }} />
      </Appbar.Header>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content>

            {/* SEÇÃO 1: DATA */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="calendar-month-outline" size={24} color={themeColors.primary} />
                <Text style={styles.label}>1. Selecione a Data</Text>
              </View>
              <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: themeColors.primary, disableTouchEvent: true }
                }}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  arrowColor: themeColors.primary,
                  todayTextColor: themeColors.primary,
                  textDayFontWeight: '500',
                  selectedDayTextColor: '#FFFFFF',
                  monthTextColor: themeColors.primary,
                  textMonthFontWeight: 'bold',
                }}
              />
            </View>
            <Divider style={styles.divider} />

            {/* SEÇÃO 2: HORÁRIO */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="clock-time-four-outline" size={24} color={themeColors.primary} />
                <Text style={styles.label}>2. Escolha o Horário</Text>
              </View>
              {isFetchingTimes ? (
                <ActivityIndicator style={{ marginVertical: 30 }} color={themeColors.primary} />
              ) : (
                <View style={styles.timeContainer}>
                  {selectedDate ? (
                    availableTimes.length > 0 ? (
                      availableTimes.map((time) => (
                        <Chip
                          key={time}
                          selected={selectedTime === time}
                          onPress={() => setSelectedTime(time)}
                          style={selectedTime === time ? styles.chipSelected : styles.chip}
                          textStyle={selectedTime === time ? styles.chipTextSelected : styles.chipText}
                          mode="outlined"
                        >
                          {time}
                        </Chip>
                      ))
                    ) : (
                      <Text style={styles.infoText}>Nenhum horário disponível para esta data.</Text>
                    )
                  ) : (
                    <Text style={styles.infoText}>Selecione uma data para ver os horários.</Text>
                  )}
                </View>
              )}
            </View>
            <Divider style={styles.divider} />

            {/* SEÇÃO 3: MOTIVO */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="pencil-outline" size={24} color={themeColors.primary} />
                <Text style={styles.label}>3. Motivo da Consulta (Opcional)</Text>
              </View>
              <TextInput
                label="Descreva brevemente o motivo"
                value={motivo}
                onChangeText={setMotivo}
                multiline
                numberOfLines={4}
                style={styles.input}
                mode="outlined"
                outlineColor="#BDBDBD"
                activeOutlineColor={themeColors.primary}
              />
            </View>

            {/* Botão de confirmação */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || !selectedTime || !usuarioId}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              icon="calendar-check"
              color={themeColors.primary}
            >
              Confirmar Agendamento
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.background
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    backgroundColor: themeColors.surface,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.text,
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E0E0E0'
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Centraliza os chips
  },
  chip: {
    margin: 6,
    borderColor: '#BDBDBD',
    backgroundColor: '#FAFAFA',
  },
  chipSelected: {
    margin: 6,
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  chipText: {
    color: themeColors.text,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  infoText: {
    flex: 1,
    textAlign: 'center',
    marginVertical: 20,
    color: themeColors.placeholder,
    fontSize: 16,
  },
  input: {
    backgroundColor: themeColors.surface
  },
  button: {
    marginTop: 32,
    paddingVertical: 8,
    borderRadius: 50, // Deixa o botão mais arredondado
    elevation: 2,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase', // Estilo clássico de botão
  }
});