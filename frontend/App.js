import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, ScrollView, StatusBar, Modal,
  TextInput, Alert
} from 'react-native';

const C = {
  bg: '#F7F7F2',
  card: '#FFFFFF',
  primary: '#5DB075',
  dark: '#1A1A1A',
  gray: '#888',
  lightGray: '#F0F0EB',
  border: '#E8E8E3',
  red: '#FF6B6B',
};

const DAYS = [
  { label: 'Mån', num: 19 },
  { label: 'Tis', num: 20 },
  { label: 'Ons', num: 21 },
  { label: 'Tor', num: 22 },
  { label: 'Fre', num: 23 },
  { label: 'Lör', num: 24 },
  { label: 'Sön', num: 25 },
];

const MEAL_TYPES = ['Frukost', 'Lunch', 'Middag', 'Snack'];

const SAMPLE_INGREDIENTS = [
  { id: '1', name: 'Ägg', qty: 6, unit: 'st' },
  { id: '2', name: 'Mjölk', qty: 1, unit: 'L' },
  { id: '3', name: 'Kyckling', qty: 500, unit: 'g' },
  { id: '4', name: 'Tomater', qty: 4, unit: 'st' },
  { id: '5', name: 'Ost', qty: 200, unit: 'g' },
];

const SAMPLE_RECIPES = [
  { id: '1', name: 'Omelett med ost', time: '10 min', calories: 380, protein: 28, fat: 24, carbs: 4, ingredients: ['Ägg', 'Ost', 'Mjölk'], steps: ['Vispa 3 ägg med lite mjölk.', 'Hetta upp stekpanna med smör.', 'Häll i äggblandningen och lägg på osten.', 'Vik omeletten och servera.'] },
  { id: '2', name: 'Kycklingpasta', time: '25 min', calories: 620, protein: 48, fat: 14, carbs: 72, ingredients: ['Kyckling', 'Tomater'], steps: ['Koka pasta enligt förpackning.', 'Stek kycklingen i bitar tills genomstekt.', 'Tillsätt tomaterna och låt puttra 5 min.', 'Blanda med pastan och servera.'] },
  { id: '3', name: 'Caprese', time: '5 min', calories: 220, protein: 12, fat: 16, carbs: 6, ingredients: ['Tomater', 'Ost'], steps: ['Skiva tomater och ost.', 'Lägg omvartannat på tallrik.', 'Ringla över olivolja och strö på salt.'] },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: '', gender: 'man', goal: 'maintain', weight: '', height: '' });
  const [meals, setMeals] = useState({});
  const [ingredients, setIngredients] = useState(SAMPLE_INGREDIENTS);
  const [water, setWater] = useState(0);

  const todayKey = 'ons-21';
  const todayMeals = meals[todayKey] || [];
  const totalCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const goalCalories = profile.goal === 'lose' ? 1600 : profile.goal === 'gain' ? 2400 : 2000;
  const remaining = goalCalories - totalCalories;

  const addMeal = (meal) => {
    setMeals(prev => ({
      ...prev,
      [todayKey]: [...(prev[todayKey] || []), meal]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {showProfile && (
        <ProfileModal
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      <View style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomeTab
            profile={profile}
            todayMeals={todayMeals}
            totalCalories={totalCalories}
            goalCalories={goalCalories}
            remaining={remaining}
            water={water}
            setWater={setWater}
            onOpenProfile={() => setShowProfile(true)}
            onGoToScan={() => setActiveTab('scan')}
            onAddMeal={addMeal}
          />
        )}
        {activeTab === 'scan' && (
          <ScanTab onMealScanned={meal => { addMeal(meal); setActiveTab('home'); }} />
        )}
        {activeTab === 'fridge' && (
          <FridgeTab
            ingredients={ingredients}
            setIngredients={setIngredients}
          />
        )}
        {activeTab === 'recipes' && (
          <RecipesTab ingredients={ingredients} onAddMeal={addMeal} />
        )}
      </View>

      <BottomNav active={activeTab} setActive={setActiveTab} />
    </SafeAreaView>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

function HomeTab({ profile, todayMeals, totalCalories, goalCalories, remaining, water, setWater, onOpenProfile, onGoToScan, onAddMeal }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(null);
  const pct = Math.min((totalCalories / goalCalories) * 100, 100);
  const totalProtein = todayMeals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalFat = todayMeals.reduce((s, m) => s + (m.fat || 0), 0);
  const totalCarbs = todayMeals.reduce((s, m) => s + (m.carbs || 0), 0);

  return (
    <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
      {/* Header */}
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.greeting}>
            {profile.name ? `Hej, ${profile.name} 👋` : 'Hej 👋'}
          </Text>
          <Text style={styles.subText}>Onsdag 21 maj</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={onOpenProfile}>
          <Text style={styles.avatarText}>
            {profile.name ? profile.name[0].toUpperCase() : '?'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Datumbläddring */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {DAYS.map((d, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setSelectedDay(i)}
            style={[styles.dayBtn, selectedDay === i && styles.dayBtnActive]}
          >
            <Text style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{d.label}</Text>
            <Text style={[styles.dayNum, selectedDay === i && styles.dayNumActive]}>{d.num}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Kalori-kort */}
      <View style={[styles.card, { paddingVertical: 28, alignItems: 'center' }]}>
        <Text style={styles.calorieNum}>{remaining}</Text>
        <Text style={styles.calorieLabel}>kcal kvar av {goalCalories}</Text>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={[styles.subText, { marginBottom: 20 }]}>{totalCalories} kcal ätit</Text>

        <View style={styles.macroRow}>
          {[
            { label: 'Protein', value: `${totalProtein}g`, goal: '150g' },
            { label: 'Fett', value: `${totalFat}g`, goal: '65g' },
            { label: 'Kolhydrat', value: `${totalCarbs}g`, goal: '250g' },
          ].map((m, i) => (
            <View key={i} style={styles.macroItem}>
              <Text style={styles.macroValue}>{m.value}</Text>
              <Text style={styles.macroLabel}>{m.label}</Text>
              <Text style={[styles.subText, { fontSize: 11 }]}>/ {m.goal}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Vattentracker */}
      <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <View>
          <Text style={styles.mealName}>💧 Vatten</Text>
          <Text style={styles.mealSub}>{water * 250} ml av 2000 ml</Text>
        </View>
        <View style={styles.rowGap}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setWater(w => Math.max(0, w - 1))}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{water}</Text>
          <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: C.primary }]} onPress={() => setWater(w => w + 1)}>
            <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scan-knapp */}
      <TouchableOpacity style={styles.scanCta} onPress={onGoToScan}>
        <Text style={styles.scanCtaText}>📷  Scanna mat</Text>
      </TouchableOpacity>

      {/* Måltider */}
      <Text style={styles.sectionTitle}>Dagens måltider</Text>
      {MEAL_TYPES.map(type => {
        const typeMeals = todayMeals.filter(m => m.type === type);
        const typeCalories = typeMeals.reduce((s, m) => s + (m.calories || 0), 0);
        return (
          <View key={type} style={styles.card}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.mealName}>{type}</Text>
                <Text style={styles.mealSub}>
                  {typeCalories > 0 ? `${typeCalories} kcal` : 'Lägg till mat'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddModal(type)}
              >
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            {typeMeals.map((m, i) => (
              <View key={i} style={styles.loggedMeal}>
                <Text style={styles.loggedMealName}>{m.name}</Text>
                <Text style={styles.mealSub}>{m.calories} kcal</Text>
              </View>
            ))}
          </View>
        );
      })}

      {showAddModal && (
        <AddMealModal
          type={showAddModal}
          onAdd={meal => { onAddMeal({ ...meal, type: showAddModal }); setShowAddModal(null); }}
          onClose={() => setShowAddModal(null)}
        />
      )}
    </ScrollView>
  );
}

// ─── ADD MEAL MODAL ───────────────────────────────────────────────────────────

function AddMealModal({ type, onAdd, onClose }) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  return (
    <Modal animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.scanTitle}>Lägg till {type}</Text>
          <TextInput style={styles.input} placeholder="Maträtt" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Kalorier (kcal)" value={calories} onChangeText={setCalories} keyboardType="numeric" />
          <View style={styles.rowGap}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Fett (g)" value={fat} onChangeText={setFat} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Kolh (g)" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              if (!name || !calories) return Alert.alert('Fyll i namn och kalorier');
              onAdd({ name, calories: parseInt(calories), protein: parseInt(protein) || 0, fat: parseInt(fat) || 0, carbs: parseInt(carbs) || 0 });
            }}
          >
            <Text style={styles.primaryBtnText}>Lägg till</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={onClose}>
            <Text style={{ color: C.gray }}>Avbryt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── SCAN ─────────────────────────────────────────────────────────────────────

function ScanTab({ onMealScanned }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mealType, setMealType] = useState('Lunch');

  const mockScan = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setResult({
      name: 'Grillad kyckling med ris',
      calories: 520,
      protein: 42,
      fat: 12,
      carbs: 58,
      ingredients: ['Kyckling 150g', 'Ris 100g', 'Broccoli 80g'],
    });
    setLoading(false);
  };

  return (
    <ScrollView style={styles.tab} contentContainerStyle={[styles.tabContent, styles.center]}>
      <Text style={styles.pageTitle}>Scanna mat</Text>

      {!result ? (
        <>
          <View style={styles.cameraBox}>
            {loading ? (
              <Text style={{ fontSize: 40 }}>⏳</Text>
            ) : (
              <Text style={{ fontSize: 64 }}>📷</Text>
            )}
            <Text style={[styles.subText, { textAlign: 'center', marginTop: 12 }]}>
              {loading ? 'Analyserar bilden...' : 'Fota din mat för AI-analys'}
            </Text>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, { width: '100%', marginTop: 24 }]} onPress={mockScan} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Analyserar...' : 'Ta foto'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={{ width: '100%' }}>
          <View style={[styles.card, { marginBottom: 16 }]}>
            <Text style={styles.scanTitle}>{result.name}</Text>
            <View style={styles.macroRow}>
              {[
                { label: 'Kcal', value: result.calories },
                { label: 'Protein', value: `${result.protein}g` },
                { label: 'Fett', value: `${result.fat}g` },
                { label: 'Kolh', value: `${result.carbs}g` },
              ].map((m, i) => (
                <View key={i} style={styles.macroItem}>
                  <Text style={styles.macroValue}>{m.value}</Text>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Ingredienser</Text>
            {result.ingredients.map((ing, i) => (
              <Text key={i} style={{ color: C.gray, marginBottom: 4 }}>• {ing}</Text>
            ))}
          </View>

          <Text style={styles.inputLabel}>Lägg till som</Text>
          <View style={[styles.rowGap, { flexWrap: 'wrap' }]}>
            {MEAL_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.selectBtn, mealType === t && styles.selectBtnActive, { flex: 0, paddingHorizontal: 16 }]}
                onPress={() => setMealType(t)}
              >
                <Text style={[styles.selectBtnText, mealType === t && { color: '#fff' }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => onMealScanned({ ...result, type: mealType })}>
            <Text style={styles.primaryBtnText}>Logga måltid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setResult(null)}>
            <Text style={{ color: C.gray }}>Scanna igen</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ─── FRIDGE ───────────────────────────────────────────────────────────────────

function FridgeTab({ ingredients, setIngredients }) {
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanning, setScanning] = useState(false);

  const updateQty = (id, delta) => {
    setIngredients(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
    );
  };

  const removeIngredient = (id) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const scanFridge = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 2000));
    const newItems = [
      { id: Date.now().toString(), name: 'Spenat', qty: 100, unit: 'g' },
      { id: (Date.now() + 1).toString(), name: 'Yoghurt', qty: 2, unit: 'st' },
    ];
    setIngredients(prev => [...prev, ...newItems]);
    setScanning(false);
    setShowScanModal(false);
  };

  return (
    <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
      <View style={styles.rowBetween}>
        <Text style={styles.pageTitle}>Din kyl 🧊</Text>
        <TouchableOpacity style={styles.primaryBtnSmall} onPress={() => setShowScanModal(true)}>
          <Text style={styles.primaryBtnSmallText}>📷 Scanna</Text>
        </TouchableOpacity>
      </View>

      {ingredients.map(item => (
        <View key={item.id} style={[styles.card, styles.mealCard]}>
          <Text style={styles.mealName}>{item.name}</Text>
          <View style={styles.rowGap}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{item.qty} {item.unit}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeIngredient(item.id)}>
              <Text style={{ color: C.red, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {showScanModal && (
        <Modal animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.scanTitle}>Scanna kylen</Text>
              <View style={styles.cameraBox}>
                {scanning ? (
                  <Text style={{ fontSize: 40 }}>⏳</Text>
                ) : (
                  <Text style={{ fontSize: 64 }}>📷</Text>
                )}
                <Text style={[styles.subText, { textAlign: 'center', marginTop: 12 }]}>
                  {scanning ? 'Analyserar kylen...' : 'AI identifierar dina ingredienser'}
                </Text>
              </View>
              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20 }]} onPress={scanFridge} disabled={scanning}>
                <Text style={styles.primaryBtnText}>{scanning ? 'Analyserar...' : 'Ta foto av kylen'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setShowScanModal(false)}>
                <Text style={{ color: C.gray }}>Avbryt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

// ─── RECIPES ──────────────────────────────────────────────────────────────────

function RecipesTab({ ingredients, onAddMeal }) {
  const [selected, setSelected] = useState(null);
  const ingredientNames = ingredients.map(i => i.name);

  const matchScore = (recipe) => {
    const matches = recipe.ingredients.filter(i => ingredientNames.includes(i)).length;
    return Math.round((matches / recipe.ingredients.length) * 100);
  };

  return (
    <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
      <Text style={styles.pageTitle}>Recept 🍳</Text>
      <Text style={styles.subText}>Baserat på vad du har i kylen</Text>

      {SAMPLE_RECIPES.sort((a, b) => matchScore(b) - matchScore(a)).map(recipe => {
        const score = matchScore(recipe);
        return (
          <TouchableOpacity key={recipe.id} style={styles.card} onPress={() => setSelected(recipe)}>
            <View style={styles.rowBetween}>
              <Text style={styles.mealName}>{recipe.name}</Text>
              <View style={[styles.badge, { backgroundColor: score > 70 ? C.primary : C.lightGray }]}>
                <Text style={[styles.badgeText, { color: score > 70 ? '#fff' : C.gray }]}>{score}% match</Text>
              </View>
            </View>
            <Text style={styles.mealSub}>{recipe.time} · {recipe.calories} kcal</Text>
            <Text style={[styles.mealSub, { marginTop: 4 }]}>{recipe.ingredients.join(', ')}</Text>
          </TouchableOpacity>
        );
      })}

      {selected && (
        <Modal animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: '85%' }]}>
              <ScrollView>
                <Text style={styles.scanTitle}>{selected.name}</Text>
                <Text style={styles.subText}>{selected.time} · {selected.calories} kcal</Text>

                <View style={[styles.macroRow, { marginTop: 16, marginBottom: 16 }]}>
                  {[
                    { label: 'Protein', value: `${selected.protein}g` },
                    { label: 'Fett', value: `${selected.fat}g` },
                    { label: 'Kolh', value: `${selected.carbs}g` },
                  ].map((m, i) => (
                    <View key={i} style={styles.macroItem}>
                      <Text style={styles.macroValue}>{m.value}</Text>
                      <Text style={styles.macroLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Ingredienser</Text>
                {selected.ingredients.map((ing, i) => (
                  <Text key={i} style={{ color: C.dark, marginBottom: 6 }}>• {ing}</Text>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Steg</Text>
                {selected.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNum}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.mealSub, { flex: 1 }]}>{step}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 20 }]}
                  onPress={() => { onAddMeal({ name: selected.name, calories: selected.calories, protein: selected.protein, fat: selected.fat, carbs: selected.carbs, type: 'Lunch' }); setSelected(null); }}
                >
                  <Text style={styles.primaryBtnText}>Logga som Lunch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setSelected(null)}>
                  <Text style={{ color: C.gray }}>Stäng</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

function ProfileModal({ profile, setProfile, onClose }) {
  const [form, setForm] = useState(profile);

  const goals = [
    { id: 'lose', label: 'Gå ner i vikt', sub: '~1600 kcal/dag' },
    { id: 'maintain', label: 'Hålla vikten', sub: '~2000 kcal/dag' },
    { id: 'gain', label: 'Gå upp i vikt', sub: '~2400 kcal/dag' },
  ];

  return (
    <Modal animationType="slide">
      <SafeAreaView style={[styles.container]}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={styles.pageTitle}>Din profil</Text>

          <Text style={styles.inputLabel}>Namn</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={v => setForm(f => ({ ...f, name: v }))}
            placeholder="Ditt namn"
          />

          <View style={styles.rowGap}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Vikt (kg)</Text>
              <TextInput style={styles.input} value={form.weight} onChangeText={v => setForm(f => ({ ...f, weight: v }))} placeholder="70" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Längd (cm)</Text>
              <TextInput style={styles.input} value={form.height} onChangeText={v => setForm(f => ({ ...f, height: v }))} placeholder="175" keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.inputLabel}>Kön</Text>
          <View style={styles.rowGap}>
            {['man', 'kvinna'].map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.selectBtn, { flex: 1 }, form.gender === g && styles.selectBtnActive]}
                onPress={() => setForm(f => ({ ...f, gender: g }))}
              >
                <Text style={[styles.selectBtnText, form.gender === g && { color: '#fff' }]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Mål</Text>
          {goals.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalBtn, form.goal === g.id && styles.goalBtnActive]}
              onPress={() => setForm(f => ({ ...f, goal: g.id }))}
            >
              <Text style={[styles.goalBtnText, form.goal === g.id && { color: '#fff' }]}>{g.label}</Text>
              <Text style={[styles.subText, form.goal === g.id && { color: 'rgba(255,255,255,0.7)' }]}>{g.sub}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 32 }]}
            onPress={() => { setProfile(form); onClose(); }}
          >
            <Text style={styles.primaryBtnText}>Spara profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={onClose}>
            <Text style={{ color: C.gray }}>Avbryt</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function BottomNav({ active, setActive }) {
  const tabs = [
    { id: 'home', label: 'Hem' },
    { id: 'scan', label: 'Scanna' },
    { id: 'fridge', label: 'Kyl' },
    { id: 'recipes', label: 'Recept' },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab.id} style={styles.navItem} onPress={() => setActive(tab.id)}>
          <View style={[styles.navDot, active === tab.id && styles.navDotActive]} />
          <Text style={[styles.navLabel, active === tab.id && styles.navLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  tab: { flex: 1 },
  tabContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 20 },
  center: { alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  rowGap: { flexDirection: 'row', gap: 10, marginBottom: 12 },

  greeting: { fontSize: 24, fontWeight: '700', color: C.dark, letterSpacing: -0.5 },
  subText: { fontSize: 13, color: C.gray, marginTop: 2 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: C.dark, marginBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.dark, marginBottom: 10 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.gray, marginBottom: 6, marginTop: 16 },

  avatarBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  dayBtn: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, marginRight: 8, backgroundColor: C.card },
  dayBtnActive: { backgroundColor: C.primary },
  dayLabel: { fontSize: 11, color: C.gray },
  dayLabelActive: { color: '#fff' },
  dayNum: { fontSize: 17, fontWeight: '700', color: C.dark },
  dayNumActive: { color: '#fff' },

  card: { backgroundColor: C.card, borderRadius: 20, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  calorieNum: { fontSize: 56, fontWeight: '800', color: C.primary, letterSpacing: -2 },
  calorieLabel: { fontSize: 14, color: C.gray, marginTop: 4, marginBottom: 12 },
  progressBar: { width: '100%', height: 8, backgroundColor: C.lightGray, borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 4 },
  macroRow: { flexDirection: 'row', gap: 24 },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 17, fontWeight: '700', color: C.dark },
  macroLabel: { fontSize: 12, color: C.gray, marginTop: 2 },

  scanCta: { backgroundColor: C.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 24 },
  scanCtaText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  mealCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealName: { fontSize: 16, fontWeight: '600', color: C.dark },
  mealSub: { fontSize: 13, color: C.gray, marginTop: 2 },
  loggedMeal: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', justifyContent: 'space-between' },
  loggedMealName: { fontSize: 14, color: C.dark },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.lightGray, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { fontSize: 22, color: C.dark, lineHeight: 24 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.lightGray, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, color: C.dark },
  qtyNum: { fontSize: 15, fontWeight: '600', color: C.dark, minWidth: 50, textAlign: 'center' },

  cameraBox: { width: '100%', height: 200, backgroundColor: C.lightGray, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scanTitle: { fontSize: 22, fontWeight: '700', color: C.dark, marginBottom: 8 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  primaryBtn: { backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  primaryBtnSmall: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  primaryBtnSmallText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  input: { backgroundColor: C.card, borderRadius: 14, padding: 14, fontSize: 16, color: C.dark, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  selectBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, backgroundColor: C.card, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  selectBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  selectBtnText: { fontSize: 15, fontWeight: '600', color: C.dark },
  goalBtn: { padding: 16, borderRadius: 14, marginBottom: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  goalBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  goalBtnText: { fontSize: 15, fontWeight: '600', color: C.dark },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 48 },

  bottomNav: { flexDirection: 'row', backgroundColor: C.card, paddingVertical: 12, paddingBottom: 28, borderTopWidth: 1, borderTopColor: C.border },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'transparent' },
  navDotActive: { backgroundColor: C.primary },
  navLabel: { fontSize: 11, color: C.gray },
  navLabelActive: { color: C.primary, fontWeight: '700' },
});