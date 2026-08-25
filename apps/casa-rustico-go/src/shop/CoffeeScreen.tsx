import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { coffees, gear, origins } from "../catalog";
import { colors, fonts } from "../theme";
import { Chip, ProductCard, StoreTitle } from "./ui";

type Filter = "origins" | "pods" | "gear";

export function CoffeeScreen({ openProduct }: { openProduct: (id: string) => void }) {
  const [filter, setFilter] = useState<Filter>("origins");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    let next =
      filter === "gear"
        ? gear()
        : filter === "pods"
          ? coffees().filter((p) => p.id === "cr-capsules")
          : origins();
    const needle = q.trim().toLowerCase();
    if (needle) {
      next = next.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.origin ?? "").toLowerCase().includes(needle) ||
          (p.notes ?? "").toLowerCase().includes(needle),
      );
    }
    return next;
  }, [filter, q]);

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <StoreTitle title="Order." sub="Single-origin bags, capsules, and the house mug." />
      <View style={s.searchWrap}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search origins"
          placeholderTextColor={colors.linenMuted}
          accessibilityLabel="Search coffee"
          autoCapitalize="none"
          autoCorrect={false}
          style={s.search}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
      >
        <Chip label="Origins" on={filter === "origins"} onPress={() => setFilter("origins")} />
        <Chip label="Capsules" on={filter === "pods"} onPress={() => setFilter("pods")} />
        <Chip label="Accessories" on={filter === "gear"} onPress={() => setFilter("gear")} />
      </ScrollView>
      {list.length === 0 ? (
        <Text style={s.empty}>No bags match that search.</Text>
      ) : (
        <View style={s.grid}>
          {list.map((p) => (
            <View key={p.id} style={s.cell}>
              <ProductCard product={p} onPress={() => openProduct(p.id)} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: 28 },
  searchWrap: { paddingHorizontal: 20 },
  search: {
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineBright,
    backgroundColor: colors.elevated,
    paddingHorizontal: 20,
    color: colors.linen,
    fontFamily: fonts.sans,
    fontSize: 16,
  },
  chips: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  empty: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    textAlign: "center",
    color: colors.linenMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  grid: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 22,
  },
  cell: { width: "48%" },
});
