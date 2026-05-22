import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Modal, Platform, ScrollView,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useApp } from '../store/AppContext';
import { MedicationSchema } from '../store/types';
import { getTheme } from '../theme';

function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}
function toTimeStr(d: Date) {
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}
function dateFromStr(s: string) {
  return new Date(s + 'T12:00:00');
}

const TR_DAYS = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];

const CELL_W = 50;
const PAST_DAYS = 2;
const FUTURE_DAYS = 30;

// ── Takvim Şeridi (geçmiş + gelecek, yatay kaydırmalı) ───────────────────────
function CalendarStrip({ selected, onSelect, c }: {
  selected: string; onSelect: (d: string) => void; c: any;
}) {
  const today = new Date();
  const todayStr = toDateStr(today);
  const listRef = useRef<any>(null);

  const days: Date[] = [];
  for (let i = -PAST_DAYS; i <= FUTURE_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: PAST_DAYS,
        animated: false,
        viewPosition: 0.5,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <FlatList
      ref={listRef}
      data={days}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.border }}
      contentContainerStyle={{ paddingVertical: 10 }}
      getItemLayout={(_, index) => ({ length: CELL_W, offset: CELL_W * index, index })}
      initialScrollIndex={PAST_DAYS}
      onScrollToIndexFailed={() => {
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index: PAST_DAYS, animated: false, viewPosition: 0.5 });
        }, 300);
      }}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item: d }) => {
        const s = toDateStr(d);
        const isSel = s === selected;
        const isPast = s < todayStr;
        return (
          <TouchableOpacity
            style={[{ width: CELL_W, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
              isSel && { backgroundColor: c.primary }]}
            onPress={() => onSelect(s)}
            activeOpacity={0.75}
          >
            <Text style={{
              fontSize: 11, fontWeight: '600', marginBottom: 4,
              color: isSel ? '#fff' : isPast ? c.subtext + 'AA' : c.subtext,
            }}>
              {s === todayStr ? 'Bug.' : TR_DAYS[d.getDay()]}
            </Text>
            <Text style={{
              fontSize: 16, fontWeight: '800',
              color: isSel ? '#fff' : isPast ? c.subtext : c.text,
            }}>
              {d.getDate()}
            </Text>
            {s === todayStr && !isSel && (
              <View style={{ width: 4, height: 4, borderRadius: 2, marginTop: 3, backgroundColor: c.primary }} />
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

// ── Ana Ekran ──────────────────────────────────────────────────────────────────
export default function ReminderScreen() {
  const { t } = useTranslation();
  const {
    medications, settings,
    addMedication, addMedications, takeMedication, removeMedication, updateMedication,
  } = useApp();
  const theme = getTheme(settings.theme === 'dark');
  const c = theme.colors;

  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));

  const [modalVisible,     setModalVisible]     = useState(false);
  const [recurringVisible, setRecurringVisible] = useState(false);

  // Form state
  const [medName,     setMedName]     = useState('');
  const [medNotes,    setMedNotes]    = useState('');
  const [pickerDate,  setPickerDate]  = useState(new Date());
  const [editingMed,  setEditingMed]  = useState<MedicationSchema | null>(null);

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [isScheduled,    setIsScheduled]    = useState(false);
  const [scheduleStart,  setScheduleStart]  = useState(new Date());
  const [scheduleEnd,    setScheduleEnd]    = useState(new Date());
  const [timesPerDay,    setTimesPerDay]    = useState(1);
  const [timeSlots,      setTimeSlots]      = useState<Date[]>([new Date()]);
  const [showStartDate,  setShowStartDate]  = useState(false);
  const [showEndDate,    setShowEndDate]    = useState(false);
  const [activeSlot,     setActiveSlot]     = useState<number | null>(null);

  const [lastXp, setLastXp] = useState<number | null>(null);

  const minAllowedDate = new Date();
  minAllowedDate.setDate(minAllowedDate.getDate() - 2);
  minAllowedDate.setHours(0, 0, 0, 0);

  const activeMeds    = medications.filter(m => !m.isRecurring);
  const recurringMeds = medications.filter(m => m.isRecurring);
  const dayMeds       = activeMeds.filter(m => m.date === selectedDate);

  const closeAllPickers = () => {
    setShowDate(false); setShowTime(false);
    setShowStartDate(false); setShowEndDate(false); setActiveSlot(null);
  };

  const resetForm = () => {
    setMedName('');
    setMedNotes('');
    setEditingMed(null);
    const d = dateFromStr(selectedDate);
    const now = new Date();
    d.setHours(now.getHours(), now.getMinutes());
    setPickerDate(d);
    closeAllPickers();
    setIsScheduled(false);
    setScheduleStart(dateFromStr(selectedDate));
    setScheduleEnd(dateFromStr(selectedDate));
    setTimesPerDay(1);
    setTimeSlots([new Date()]);
  };

  const handleOpenEdit = (med: MedicationSchema) => {
    setEditingMed(med);
    setMedName(med.name);
    setMedNotes(med.notes ?? '');
    const d = dateFromStr(med.date);
    const [h, m] = med.time.split(':').map(Number);
    d.setHours(h, m);
    setPickerDate(d);
    setIsScheduled(false);
    closeAllPickers();
    setModalVisible(true);
  };

  const handleTimesPerDay = (n: number) => {
    const v = Math.max(1, Math.min(5, n));
    setTimesPerDay(v);
    setTimeSlots(prev =>
      v > prev.length
        ? [...prev, ...Array(v - prev.length).fill(new Date())]
        : prev.slice(0, v)
    );
  };

  const handleAdd = async () => {
    if (!medName.trim()) return;

    if (editingMed) {
      await updateMedication(editingMed.id, {
        name: medName.trim(),
        time: toTimeStr(pickerDate),
        date: toDateStr(pickerDate),
        notes: medNotes.trim() || undefined,
      });
    } else if (isScheduled) {
      const start = dateFromStr(toDateStr(scheduleStart));
      let end = dateFromStr(toDateStr(scheduleEnd));
      if (end < start) end = new Date(start);

      const allMeds: MedicationSchema[] = [];
      const cur = new Date(start);
      while (cur <= end) {
        for (const slot of timeSlots) {
          allMeds.push({
            id: generateId(),
            name: medName.trim(),
            time: toTimeStr(slot),
            date: toDateStr(cur),
            isTaken: false,
            isRecurring: false,
            notes: medNotes.trim() || undefined,
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
      await addMedications(allMeds);
    } else {
      await addMedication({
        id: generateId(),
        name: medName.trim(),
        time: toTimeStr(pickerDate),
        date: toDateStr(pickerDate),
        isTaken: false,
        isRecurring: false,
        notes: medNotes.trim() || undefined,
      });
    }

    resetForm();
    setModalVisible(false);
  };

  const handleTake = async (id: string) => {
    await takeMedication(id);
    setLastXp(5);
    setTimeout(() => setLastXp(null), 2000);
  };

  const handleQuickAdd = async (med: MedicationSchema) => {
    await addMedication({ ...med, id: generateId(), date: selectedDate, isTaken: false, isRecurring: false });
    setRecurringVisible(false);
  };

  // ── Picker geri çağrıları ──
  const onDateChange = (e: DateTimePickerEvent, sel?: Date) => {
    if (Platform.OS === 'android') setShowDate(false);
    if (e.type === 'set' && sel) setPickerDate(p => { const n = new Date(sel); n.setHours(p.getHours(), p.getMinutes()); return n; });
  };
  const onTimeChange = (e: DateTimePickerEvent, sel?: Date) => {
    if (Platform.OS === 'android') setShowTime(false);
    if (e.type === 'set' && sel) setPickerDate(p => { const n = new Date(p); n.setHours(sel.getHours(), sel.getMinutes()); return n; });
  };
  const onStartDateChange = (e: DateTimePickerEvent, sel?: Date) => {
    if (Platform.OS === 'android') setShowStartDate(false);
    if (e.type === 'set' && sel) setScheduleStart(sel);
  };
  const onEndDateChange = (e: DateTimePickerEvent, sel?: Date) => {
    if (Platform.OS === 'android') setShowEndDate(false);
    if (e.type === 'set' && sel) setScheduleEnd(sel);
  };
  const onSlotTimeChange = (e: DateTimePickerEvent, sel?: Date) => {
    if (Platform.OS === 'android') setActiveSlot(null);
    if (e.type === 'set' && sel && activeSlot !== null) {
      setTimeSlots(prev => prev.map((s, i) => {
        if (i !== activeSlot) return s;
        const n = new Date(s); n.setHours(sel.getHours(), sel.getMinutes()); return n;
      }));
    }
  };

  const renderMed = ({ item }: { item: MedicationSchema }) => (
    <View style={[styles.medCard, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.medInfo}>
        <Text style={[styles.medName, { color: c.text }]}>{item.name}</Text>
        <Text style={[styles.medTime, { color: c.subtext }]}>{item.time}</Text>
        {item.notes ? (
          <Text style={[styles.medNotes, { color: c.subtext }]} numberOfLines={2}>{item.notes}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={[styles.iconBtn, { backgroundColor: c.secondary + '22', borderColor: c.secondary + '55' }]}
        onPress={() => handleOpenEdit(item)}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 14 }}>✏️</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.iconBtn, { backgroundColor: c.danger + '22', borderColor: c.danger + '55' }]}
        onPress={() => removeMedication(item.id)}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 15 }}>🗑</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.takeBtn, { backgroundColor: c.primary }]}
        onPress={() => handleTake(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.takeBtnText}>✓</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Takvim şeridi — geçmiş + gelecek */}
      <CalendarStrip selected={selectedDate} onSelect={s => setSelectedDate(s)} c={c} />

      {/* Güncel ilaçlar banner */}
      {recurringMeds.length > 0 && (
        <TouchableOpacity
          style={[styles.banner, { backgroundColor: c.accent + '22', borderColor: c.accent }]}
          onPress={() => setRecurringVisible(true)} activeOpacity={0.8}
        >
          <Text style={[styles.bannerText, { color: c.accent }]}>
            💊 {t('reminder.currentMeds')} ({recurringMeds.length})
          </Text>
        </TouchableOpacity>
      )}

      {lastXp !== null && (
        <View style={[styles.xpToast, { backgroundColor: c.primary }]}>
          <Text style={styles.xpToastText}>+{lastXp} XP</Text>
        </View>
      )}

      <FlatList
        data={[...dayMeds].sort((a, b) => a.time.localeCompare(b.time))}
        renderItem={renderMed}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={[styles.empty, { color: c.subtext }]}>{t('reminder.emptyList')}</Text>}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => { resetForm(); setModalVisible(true); }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* ── İlaç Ekleme / Düzenleme Modal ── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalTitle, { color: c.text }]}>
                {editingMed ? 'İlacı Düzenle' : t('reminder.addMed')}
              </Text>

              {/* İlaç adı */}
              <TextInput
                style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
                placeholder={t('reminder.medName')}
                placeholderTextColor={c.subtext}
                value={medName}
                onChangeText={setMedName}
              />

              {/* Tekli ilaç: tarih + saat */}
              {!isScheduled && <>
                <Text style={[styles.label, { color: c.subtext }]}>{t('reminder.medDate')}</Text>
                <TouchableOpacity
                  style={[styles.pickerRow, { backgroundColor: c.inputBg, borderColor: c.border }]}
                  onPress={() => { closeAllPickers(); setShowDate(true); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerIcon}>📅</Text>
                  <Text style={[styles.pickerVal, { color: c.text }]}>{toDateStr(pickerDate)}</Text>
                </TouchableOpacity>
                {Platform.OS === 'ios' && showDate && (
                  <DateTimePicker value={pickerDate} mode="date" display="spinner" onChange={onDateChange}
                    minimumDate={minAllowedDate}
                    locale={settings.language === 'tr' ? 'tr-TR' : 'en-US'} style={styles.iosPicker} />
                )}
                <Text style={[styles.label, { color: c.subtext }]}>{t('reminder.medTime')}</Text>
                <TouchableOpacity
                  style={[styles.pickerRow, { backgroundColor: c.inputBg, borderColor: c.border }]}
                  onPress={() => { closeAllPickers(); setShowTime(true); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerIcon}>🕐</Text>
                  <Text style={[styles.pickerVal, { color: c.text }]}>{toTimeStr(pickerDate)}</Text>
                </TouchableOpacity>
                {Platform.OS === 'ios' && showTime && (
                  <DateTimePicker value={pickerDate} mode="time" display="spinner" onChange={onTimeChange}
                    locale={settings.language === 'tr' ? 'tr-TR' : 'en-US'} style={styles.iosPicker} />
                )}
              </>}

              {/* İlaca özel açıklama */}
              <Text style={[styles.label, { color: c.subtext }]}>Açıklama (İsteğe Bağlı)</Text>
              <TextInput
                style={[styles.input, styles.notesInput, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
                placeholder="Örn: Tok karna iç, sabah yarım al..."
                placeholderTextColor={c.subtext}
                value={medNotes}
                onChangeText={setMedNotes}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />

              {/* Güncel İlaç toggle — düzenleme modunda gizli */}
              {!editingMed && (
                <TouchableOpacity
                  style={[styles.scheduleToggle, {
                    backgroundColor: isScheduled ? c.primary + '1A' : c.inputBg,
                    borderColor: isScheduled ? c.primary : c.border,
                  }]}
                  onPress={() => { setIsScheduled(p => !p); closeAllPickers(); }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 18, marginRight: 10 }}>{isScheduled ? '☑️' : '⬜'}</Text>
                  <View>
                    <Text style={[styles.scheduleToggleTitle, { color: isScheduled ? c.primary : c.text }]}>
                      Güncel İlaç
                    </Text>
                    <Text style={[styles.scheduleToggleSub, { color: c.subtext }]}>
                      Tarih aralığı ve günlük dozları ayarla
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Güncel İlaç genişletilmiş içerik */}
              {!editingMed && isScheduled && <>
                <Text style={[styles.label, { color: c.subtext, marginTop: 14 }]}>Başlangıç Tarihi</Text>
                <TouchableOpacity
                  style={[styles.pickerRow, { backgroundColor: c.inputBg, borderColor: c.border }]}
                  onPress={() => { closeAllPickers(); setShowStartDate(true); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerIcon}>📅</Text>
                  <Text style={[styles.pickerVal, { color: c.text }]}>{toDateStr(scheduleStart)}</Text>
                </TouchableOpacity>
                {Platform.OS === 'ios' && showStartDate && (
                  <DateTimePicker value={scheduleStart} mode="date" display="spinner" onChange={onStartDateChange}
                    minimumDate={minAllowedDate}
                    locale={settings.language === 'tr' ? 'tr-TR' : 'en-US'} style={styles.iosPicker} />
                )}

                <Text style={[styles.label, { color: c.subtext }]}>Bitiş Tarihi</Text>
                <TouchableOpacity
                  style={[styles.pickerRow, { backgroundColor: c.inputBg, borderColor: c.border }]}
                  onPress={() => { closeAllPickers(); setShowEndDate(true); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerIcon}>📅</Text>
                  <Text style={[styles.pickerVal, { color: c.text }]}>{toDateStr(scheduleEnd)}</Text>
                </TouchableOpacity>
                {Platform.OS === 'ios' && showEndDate && (
                  <DateTimePicker value={scheduleEnd} mode="date" display="spinner" onChange={onEndDateChange}
                    minimumDate={minAllowedDate}
                    locale={settings.language === 'tr' ? 'tr-TR' : 'en-US'} style={styles.iosPicker} />
                )}

                <Text style={[styles.label, { color: c.subtext, marginTop: 6 }]}>Günde Kaç Kez?</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity style={[styles.stepBtn, { backgroundColor: c.border }]} onPress={() => handleTimesPerDay(timesPerDay - 1)}>
                    <Text style={[styles.stepBtnTxt, { color: c.text }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.stepVal, { color: c.text }]}>{timesPerDay}</Text>
                  <TouchableOpacity style={[styles.stepBtn, { backgroundColor: c.border }]} onPress={() => handleTimesPerDay(timesPerDay + 1)}>
                    <Text style={[styles.stepBtnTxt, { color: c.text }]}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: c.subtext }]}>Saatler</Text>
                {timeSlots.map((slot, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.pickerRow, { backgroundColor: c.inputBg, borderColor: c.border }]}
                    onPress={() => { closeAllPickers(); setActiveSlot(idx); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerIcon}>🕐</Text>
                    <Text style={[styles.pickerVal, { color: c.text }]}>
                      {idx + 1}. doz — {toTimeStr(slot)}
                    </Text>
                  </TouchableOpacity>
                ))}
                {Platform.OS === 'ios' && activeSlot !== null && (
                  <DateTimePicker
                    value={timeSlots[activeSlot] ?? new Date()}
                    mode="time" display="spinner" onChange={onSlotTimeChange}
                    locale={settings.language === 'tr' ? 'tr-TR' : 'en-US'} style={styles.iosPicker}
                  />
                )}
              </>}

              <View style={[styles.actions, { marginTop: 18 }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: c.border }]}
                  onPress={() => { resetForm(); setModalVisible(false); }}
                >
                  <Text style={{ color: c.text }}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.primary }]} onPress={handleAdd}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    {editingMed ? 'Kaydet' : t('common.add')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Android pickers — modal dışında */}
      {Platform.OS === 'android' && showDate      && <DateTimePicker value={pickerDate}    mode="date" display="default" minimumDate={minAllowedDate} onChange={onDateChange} />}
      {Platform.OS === 'android' && showTime      && <DateTimePicker value={pickerDate}    mode="time" display="default" is24Hour onChange={onTimeChange} />}
      {Platform.OS === 'android' && showStartDate && <DateTimePicker value={scheduleStart} mode="date" display="default" minimumDate={minAllowedDate} onChange={onStartDateChange} />}
      {Platform.OS === 'android' && showEndDate   && <DateTimePicker value={scheduleEnd}   mode="date" display="default" minimumDate={minAllowedDate} onChange={onEndDateChange} />}
      {Platform.OS === 'android' && activeSlot !== null && (
        <DateTimePicker value={timeSlots[activeSlot] ?? new Date()} mode="time" display="default" is24Hour onChange={onSlotTimeChange} />
      )}

      {/* ── Güncel İlaçlar Modal ── */}
      <Modal visible={recurringVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>{t('reminder.currentMeds')}</Text>
            {recurringMeds.map(med => (
              <View key={med.id} style={[styles.recRow, { borderColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text }}>{med.name}</Text>
                  {med.notes ? (
                    <Text style={{ color: c.subtext, fontSize: 12, marginTop: 2, fontStyle: 'italic' }} numberOfLines={1}>
                      {med.notes}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: c.primary }]} onPress={() => handleQuickAdd(med)}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>{t('reminder.quickAdd')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: c.danger, marginLeft: 6 }]} onPress={() => removeMedication(med.id)}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: c.border, alignSelf: 'stretch', marginTop: 12 }]}
              onPress={() => setRecurringVisible(false)}
            >
              <Text style={{ color: c.text, textAlign: 'center' }}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 88 },
  medCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  medInfo: { flex: 1 },
  medName: { fontSize: 16, fontWeight: '600' },
  medTime: { fontSize: 13, marginTop: 2 },
  medNotes: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  iconBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  takeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  takeBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  banner: { margin: 16, marginBottom: 0, borderRadius: 12, borderWidth: 1, padding: 12 },
  bannerText: { fontWeight: '600', fontSize: 14 },
  xpToast: { position: 'absolute', top: 100, alignSelf: 'center', zIndex: 999, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  xpToastText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40, maxHeight: '92%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15, marginBottom: 12 },
  notesInput: { minHeight: 64, paddingTop: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10 },
  pickerIcon: { fontSize: 18, marginRight: 10 },
  pickerVal: { fontSize: 16, fontWeight: '500' },
  iosPicker: { height: 180, marginBottom: 8 },
  scheduleToggle: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 14, marginTop: 4 },
  scheduleToggleTitle: { fontSize: 15, fontWeight: '700' },
  scheduleToggleSub: { fontSize: 12, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  stepBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepBtnTxt: { fontSize: 22, fontWeight: '700' },
  stepVal: { fontSize: 22, fontWeight: '800', minWidth: 32, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  recRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 10 },
  smallBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
});
