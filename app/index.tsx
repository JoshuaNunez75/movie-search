import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function Index() {
  const [query, setQuery] = useState("");
  const [resultCount, setResultCount] = useState<number | null>(null);

  async function testSearch() {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_TOKEN}`,
        },
      }
    );
    const data = await response.json();
    setResultCount(data.results.length);
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <TextInput
        placeholder="Search a movie title"
        value={query}
        onChangeText={setQuery}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, width: 220, marginBottom: 10 }}
      />
      <Button title="Test Search" onPress={testSearch} />
      {resultCount !== null && <Text style={{ marginTop: 16 }}>Found {resultCount} results</Text>}
    </View>
  );
}