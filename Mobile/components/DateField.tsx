import React, { useMemo, useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

type DateFieldProps = {
  label: string;
  value?: string | null;
  onChange: (nextValue: string) => void;
  minimumDate?: string;
  maximumDate?: string;
};

function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function shiftMonth(isoDate: string, delta: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setMonth(d.getMonth() + delta);
  d.setDate(1);
  return toIso(d);
}

function getMonthCells(isoDate: string): Array<{ iso: string; day: number } | null> {
  const base = new Date(`${isoDate}T00:00:00`);
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const firstWeekday = start.getDay();
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const cells: Array<{ iso: string; day: number } | null> = [];

  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(start.getFullYear(), start.getMonth(), day);
    cells.push({ iso: toIso(current), day });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DateField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || toIso(new Date()));
  const years = useMemo(() => Array.from({ length: 20 }, (_, i) => 2015 + i), []);
  const [showYear, setShowYear] = useState(false);

  const selectedIso = value || '';

  const isBlocked = (iso: string) => {
    if (minimumDate && iso < minimumDate) return true;
    if (maximumDate && iso > maximumDate) return true;
    return false;
  };

  if (Platform.OS === 'web') {
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={{ color: '#9CA3AF', marginBottom: 6 }}>{label}</Text>
        <input
          type="date"
          value={value || ''}
          min={minimumDate || ''}
          max={maximumDate || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #1e293b',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: '#9CA3AF', marginBottom: 6 }}>{label}</Text>

      <TouchableOpacity
        onPress={() => {
          setCurrentMonth(value || toIso(new Date()));
          setOpen(true);
        }}
        style={{
          padding: 14,
          borderRadius: 12,
          backgroundColor: '#0f172a',
          borderWidth: 1,
          borderColor: '#1e293b',
        }}
      >
        <Text style={{ color: '#fff' }}>{value ? formatDate(value) : 'Select date'}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          <View
            style={{
              backgroundColor: '#020617',
              padding: 16,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            {Platform.OS !== 'web' ? (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity onPress={() => setCurrentMonth((prev) => shiftMonth(prev, -1))}>
                    <Text style={{ color: '#fff', fontSize: 16 }}>{'<'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowYear(true)}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{monthLabel(currentMonth)}</Text>
                    <Text style={{ color: '#5B6EF5', fontSize: 12, textAlign: 'center' }}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setCurrentMonth((prev) => shiftMonth(prev, 1))}>
                    <Text style={{ color: '#fff', fontSize: 16 }}>{'>'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={{ flex: 1, textAlign: 'center', color: '#9CA3AF', fontSize: 11 }}>
                      {day}
                    </Text>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {getMonthCells(currentMonth).map((cell, idx) => {
                    if (!cell) return <View key={`empty-${idx}`} style={{ width: '14.285%', aspectRatio: 1 }} />;
                    const blocked = isBlocked(cell.iso);
                    const selected = selectedIso === cell.iso;
                    return (
                      <TouchableOpacity
                        key={cell.iso}
                        disabled={blocked}
                        onPress={() => {
                          onChange(cell.iso);
                          setOpen(false);
                        }}
                        style={{
                          width: '14.285%',
                          aspectRatio: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          backgroundColor: selected ? '#5B6EF5' : 'transparent',
                          opacity: blocked ? 0.4 : 1,
                        }}
                      >
                        <Text style={{ color: selected ? '#fff' : '#fff', fontSize: 13 }}>{cell.day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#334155',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showYear} transparent animationType="fade" onRequestClose={() => setShowYear(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 320, borderRadius: 12, backgroundColor: '#0B1220', padding: 16 }}>
            <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 10 }}>Select Year</Text>
            <View style={{ maxHeight: 280 }}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  onPress={() => {
                    const base = new Date(`${currentMonth}T00:00:00`);
                    base.setFullYear(year);
                    base.setDate(1);
                    setCurrentMonth(toIso(base));
                    setShowYear(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text style={{ color: '#fff' }}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowYear(false)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: '#fff' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
