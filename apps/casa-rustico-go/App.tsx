import { useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import catalog from "./src/catalog.json";
import { WelcomeGate } from "./src/welcome/WelcomeGate";

type Bean = {
  id: string;
  title: string;
  origin: string;
  roast: string;
  size: string;
  sku: string;
  description: string;
};

/**
 * Casa Rustico Go — brand shop shell.
 * Catalog seeded from dripshipper-single-origin.json.
 * Next: Shopify / checkout, loyalty, deep-link from Espresso Escape.
 */
function ShopShell() {
  const items = catalog as Bean[];
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Bean | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (b) =>
        b.title.toLowerCase().includes(s) ||
        b.origin.toLowerCase().includes(s) ||
        b.roast.toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.brand}>CASA RUSTICO</Text>
        <Text style={styles.title}>Go</Text>
        <Text style={styles.sub}>Single-origin · ship ready</Text>
        <TextInput
          style={styles.search}
          placeholder="Search origin or roast…"
          placeholderTextColor="#8A7A6A"
          value={q}
          onChangeText={setQ}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.card,
              selected?.id === item.id && styles.cardOn,
            ]}
            onPress={() => setSelected(item)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {[item.roast, item.size].filter(Boolean).join(" · ")}
            </Text>
            {selected?.id === item.id ? (
              <Text style={styles.cardBody}>{item.description}</Text>
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No beans match that search.</Text>
        }
      />

      <View style={styles.footer}>
        <Pressable
          style={styles.cta}
          onPress={() => Linking.openURL("https://rusticopr.com")}
        >
          <Text style={styles.ctaText}>
            {selected
              ? `Selected: ${selected.title}`
              : `${items.length} origins · open rusticopr.com`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <WelcomeGate>
      <ShopShell />
    </WelcomeGate>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#14100C" },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  brand: {
    color: "#C4A484",
    letterSpacing: 3,
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: "#F5E6D3",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 4,
  },
  sub: { color: "#9A8A78", marginBottom: 12 },
  search: {
    backgroundColor: "#221C16",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3A3028",
    color: "#F5E6D3",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: "#1E1812",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2E261E",
  },
  cardOn: { borderColor: "#C4A484" },
  cardTitle: { color: "#F5E6D3", fontSize: 18, fontWeight: "700" },
  cardMeta: { color: "#A89480", marginTop: 4, fontSize: 13 },
  cardBody: { color: "#C8B8A4", marginTop: 10, lineHeight: 20, fontSize: 13 },
  empty: { color: "#8A7A6A", textAlign: "center", marginTop: 40 },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },
  cta: {
    backgroundColor: "#6B3F2A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: { color: "#FFF8F0", fontWeight: "700" },
});
