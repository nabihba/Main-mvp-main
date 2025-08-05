import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';

const CalendarScreen = ({ navigation, onScreenChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'event'
  });

  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();

  // Generate calendar data
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(currentDate);

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDatePress = (date) => {
    setSelectedDate(date);
    setNewEvent({
      ...newEvent,
      date: date.toISOString().split('T')[0]
    });
    setShowAddModal(true);
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      Alert.alert(t('Error'), t('Please enter an event title'));
      return;
    }

    const event = {
      id: Date.now().toString(),
      ...newEvent,
      date: selectedDate.toISOString().split('T')[0]
    };

    setEvents([...events, event]);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'event'
    });
    setShowAddModal(false);
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert(
      t('Delete Event'),
      t('Are you sure you want to delete this event?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { 
          text: t('Delete'), 
          style: 'destructive',
          onPress: () => {
            setEvents(events.filter(event => event.id !== eventId));
          }
        }
      ]
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <View style={styles.dayView}>
        <Text style={[styles.dayViewTitle, isDarkMode && styles.dayViewTitleDark]}>
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {dayEvents.length > 0 ? (
          <FlatList
            data={dayEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.eventItem, isDarkMode && styles.eventItemDark]}>
                <View style={styles.eventHeader}>
                  <View style={[
                    styles.eventTypeIndicator,
                    { backgroundColor: item.type === 'event' ? '#556B2F' : '#6B7280' }
                  ]} />
                  <Text style={[styles.eventTitle, isDarkMode && styles.eventTitleDark]}>
                    {item.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                {item.description && (
                  <Text style={[styles.eventDescription, isDarkMode && styles.eventDescriptionDark]}>
                    {item.description}
                  </Text>
                )}
                {item.time && (
                  <Text style={[styles.eventTime, isDarkMode && styles.eventTimeDark]}>
                    {item.time}
                  </Text>
                )}
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyDay}>
            <Ionicons name="calendar-outline" size={48} color="#6B7280" />
            <Text style={[styles.emptyDayText, isDarkMode && styles.emptyDayTextDark]}>
              {t('No events for this day')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }

    return (
      <View style={styles.weekView}>
        <View style={styles.weekHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDayHeader}>
              <Text style={[styles.weekDayName, isDarkMode && styles.weekDayNameDark]}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[
                styles.weekDayNumber,
                isDarkMode && styles.weekDayNumberDark,
                day.toDateString() === new Date().toDateString() && styles.today
              ]}>
                {day.getDate()}
              </Text>
            </View>
          ))}
        </View>
        
        <ScrollView style={styles.weekContent}>
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            return (
              <View key={index} style={styles.weekDayColumn}>
                <TouchableOpacity 
                  style={styles.weekDayCell}
                  onPress={() => handleDatePress(day)}
                >
                  {dayEvents.map((event, eventIndex) => (
                    <View key={eventIndex} style={[
                      styles.weekEvent,
                      { backgroundColor: event.type === 'event' ? '#556B2F' : '#6B7280' }
                    ]}>
                      <Text style={styles.weekEventText} numberOfLines={1}>
                        {event.title}
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderMonthView = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <View style={styles.monthView}>
        <View style={styles.monthHeader}>
          <Text style={[styles.monthTitle, isDarkMode && styles.monthTitleDark]}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
        </View>
        
        <View style={styles.weekDaysHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={[styles.weekDayHeaderText, isDarkMode && styles.weekDayHeaderTextDark]}>
              {day}
            </Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  isDarkMode && styles.calendarDayDark,
                  !isCurrentMonth && styles.otherMonthDay,
                  isToday && styles.today
                ]}
                onPress={() => handleDatePress(day)}
              >
                <Text style={[
                  styles.dayNumber,
                  isDarkMode && styles.dayNumberDark,
                  !isCurrentMonth && styles.otherMonthDayText,
                  isToday && styles.todayText
                ]}>
                  {day.getDate()}
                </Text>
                {dayEvents.length > 0 && (
                  <View style={styles.dayEvents}>
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <View key={eventIndex} style={[
                        styles.dayEventDot,
                        { backgroundColor: event.type === 'event' ? '#556B2F' : '#6B7280' }
                      ]} />
                    ))}
                    {dayEvents.length > 2 && (
                      <Text style={styles.moreEventsText}>+{dayEvents.length - 2}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const headerStyle = isDarkMode ? styles.headerDark : styles.header;

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => onScreenChange('Home')}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          {t('Calendar')}
        </Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'day' && styles.activeViewMode]}
          onPress={() => setViewMode('day')}
        >
          <Text style={[styles.viewModeText, viewMode === 'day' && styles.activeViewModeText]}>
            {t('Day')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'week' && styles.activeViewMode]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.viewModeText, viewMode === 'week' && styles.activeViewModeText]}>
            {t('Week')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'month' && styles.activeViewMode]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[styles.viewModeText, viewMode === 'month' && styles.activeViewModeText]}>
            {t('Month')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={() => {
          const newDate = new Date(currentDate);
          if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() - 1);
          } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() - 7);
          } else {
            newDate.setMonth(newDate.getMonth() - 1);
          }
          setCurrentDate(newDate);
        }}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setCurrentDate(new Date())}>
          <Text style={[styles.todayButton, isDarkMode && styles.todayButtonDark]}>
            {t('Today')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => {
          const newDate = new Date(currentDate);
          if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + 1);
          } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + 7);
          } else {
            newDate.setMonth(newDate.getMonth() + 1);
          }
          setCurrentDate(newDate);
        }}>
          <Ionicons name="chevron-forward" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </ScrollView>
      
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>
                {t('Add Event')}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.eventTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.eventTypeButton,
                  newEvent.type === 'event' && styles.selectedEventType
                ]}
                onPress={() => setNewEvent({...newEvent, type: 'event'})}
              >
                <Ionicons name="calendar" size={20} color={newEvent.type === 'event' ? '#FFFFFF' : '#6B7280'} />
                <Text style={[
                  styles.eventTypeText,
                  newEvent.type === 'event' && styles.selectedEventTypeText
                ]}>
                  {t('Event')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.eventTypeButton,
                  newEvent.type === 'note' && styles.selectedEventType
                ]}
                onPress={() => setNewEvent({...newEvent, type: 'note'})}
              >
                <Ionicons name="document-text" size={20} color={newEvent.type === 'note' ? '#FFFFFF' : '#6B7280'} />
                <Text style={[
                  styles.eventTypeText,
                  newEvent.type === 'note' && styles.selectedEventTypeText
                ]}>
                  {t('Note')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.modalInputDark]}
              placeholder={t('Event title')}
              placeholderTextColor="#6B7280"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({...newEvent, title: text})}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, isDarkMode && styles.modalInputDark]}
              placeholder={t('Description (optional)')}
              placeholderTextColor="#6B7280"
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({...newEvent, description: text})}
              multiline={true}
              numberOfLines={3}
            />
            
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.modalInputDark]}
              placeholder={t('Time (optional)')}
              placeholderTextColor="#6B7280"
              value={newEvent.time}
              onChangeText={(text) => setNewEvent({...newEvent, time: text})}
            />
            
            <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
              <Text style={styles.addButtonText}>{t('Add')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  containerDark: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF' },
  headerDark: { backgroundColor: '#1F2937' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  headerTitleDark: { color: '#F9FAFB' },
  viewModeSelector: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  viewModeButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#F3F4F6' },
  activeViewMode: { backgroundColor: '#556B2F' },
  viewModeText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  activeViewModeText: { color: '#FFFFFF' },
  navigationButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  todayButton: { fontSize: 16, fontWeight: '600', color: '#556B2F' },
  todayButtonDark: { color: '#10B981' },
  content: { flex: 1 },
  
  // Day View Styles
  dayView: { padding: 20 },
  dayViewTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 20 },
  dayViewTitleDark: { color: '#F9FAFB' },
  eventItem: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  eventItemDark: { backgroundColor: '#1F2937' },
  eventHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  eventTypeIndicator: { width: 4, height: 20, borderRadius: 2, marginRight: 12 },
  eventTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1F2937' },
  eventTitleDark: { color: '#F9FAFB' },
  eventDescription: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  eventDescriptionDark: { color: '#9CA3AF' },
  eventTime: { fontSize: 12, color: '#9CA3AF' },
  eventTimeDark: { color: '#6B7280' },
  emptyDay: { alignItems: 'center', paddingVertical: 60 },
  emptyDayText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  emptyDayTextDark: { color: '#9CA3AF' },
  
  // Week View Styles
  weekView: { flex: 1 },
  weekHeader: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  weekDayHeader: { flex: 1, alignItems: 'center' },
  weekDayName: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  weekDayNameDark: { color: '#9CA3AF' },
  weekDayNumber: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  weekDayNumberDark: { color: '#F9FAFB' },
  weekContent: { flex: 1 },
  weekDayColumn: { flex: 1, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  weekDayCell: { minHeight: 100, padding: 8 },
  weekEvent: { padding: 4, borderRadius: 4, marginBottom: 2 },
  weekEventText: { fontSize: 10, color: '#FFFFFF', fontWeight: '500' },
  
  // Month View Styles
  monthView: { flex: 1 },
  monthHeader: { paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' },
  monthTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  monthTitleDark: { color: '#F9FAFB' },
  weekDaysHeader: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  weekDayHeaderText: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#6B7280' },
  weekDayHeaderTextDark: { color: '#9CA3AF' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20 },
  calendarDay: { width: '14.28%', aspectRatio: 1, borderWidth: 1, borderColor: '#E5E7EB', padding: 4 },
  calendarDayDark: { borderColor: '#374151' },
  otherMonthDay: { backgroundColor: '#F9FAFB' },
  otherMonthDayText: { color: '#9CA3AF' },
  today: { backgroundColor: '#556B2F' },
  todayText: { color: '#FFFFFF', fontWeight: '700' },
  dayNumber: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  dayNumberDark: { color: '#F9FAFB' },
  dayEvents: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  dayEventDot: { width: 6, height: 6, borderRadius: 3, marginRight: 2, marginBottom: 2 },
  moreEventsText: { fontSize: 10, color: '#6B7280', marginLeft: 2 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, margin: 20, width: '90%', maxWidth: 400 },
  modalContentDark: { backgroundColor: '#1F2937' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  modalTitleDark: { color: '#F9FAFB' },
  eventTypeSelector: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  eventTypeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#F3F4F6', gap: 8 },
  selectedEventType: { backgroundColor: '#556B2F' },
  eventTypeText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  selectedEventTypeText: { color: '#FFFFFF' },
  modalInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1F2937', backgroundColor: '#FFFFFF', marginBottom: 16 },
  modalInputDark: { borderColor: '#374151', color: '#F9FAFB', backgroundColor: '#374151' },
  modalTextArea: { minHeight: 80, textAlignVertical: 'top' },
  addButton: { backgroundColor: '#556B2F', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default CalendarScreen; 