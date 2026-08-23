import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
};

export default function Index() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  async function fetchPopularMovies() {
    const response = await fetch("https://api.themoviedb.org/3/movie/popular", {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_TOKEN}`,
      },
    });
    const data = await response.json();
    setPopularMovies(data.results);
  }

  async function searchMovies() {
    if (query.trim() === "") return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_TOKEN}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Request failed");
      }
      const data = await response.json();
      setMovies(data.results);
      setHasSearched(true);
    } catch (err) {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: "#121212" }} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Movie Search</Text>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search a movie title"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={searchMovies}
          style={styles.input}
        />
        <Pressable style={styles.searchButton} onPress={searchMovies}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator size="large" color="#d4a017" style={{ marginTop: 20 }} />}
      {error !== "" && <Text style={styles.hint}>{error}</Text>}
      {!loading && hasSearched && movies.length === 0 && error === "" && (
        <Text style={styles.hint}>No results found — try a different title.</Text>
      )}

      {!loading && (
        <View style={{ width: "100%" }}>
          <Text style={styles.sectionLabel}>{hasSearched ? "Results" : "Popular Movies"}</Text>
          {(hasSearched ? movies : popularMovies).map((movie) => (
            <Pressable key={movie.id} style={styles.movieRow} onPress={() => router.push(`/movie/${movie.id}`)}>
              {movie.poster_path ? (
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
                  style={styles.poster}
                />
              ) : (
                <View style={[styles.poster, styles.posterPlaceholder]} />
              )}
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <Text style={styles.movieYear}>
                  {movie.release_date ? movie.release_date.slice(0, 4) : "Unknown year"}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  title: { fontSize: 26, fontWeight: "700", color: "#f5f5f5", marginBottom: 20 },
  searchRow: { flexDirection: "row", width: "100%", marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    backgroundColor: "#1e1e1e",
    color: "#f5f5f5",
  },
  searchButton: {
    backgroundColor: "#d4a017",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchButtonText: { color: "#121212", fontWeight: "700" },
  hint: { color: "#a3a3a3", fontStyle: "italic", marginTop: 20, textAlign: "center" },
  sectionLabel: { color: "#f5f5f5", fontWeight: "600", fontSize: 14, marginBottom: 8, alignSelf: "flex-start" },
  movieRow: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  poster: { width: 60, height: 90, borderRadius: 4, marginRight: 12 },
  posterPlaceholder: { backgroundColor: "#333" },
  movieInfo: { flex: 1, justifyContent: "center" },
  movieTitle: { color: "#f5f5f5", fontWeight: "600", fontSize: 15, marginBottom: 4 },
  movieYear: { color: "#a3a3a3", fontSize: 13 },
});