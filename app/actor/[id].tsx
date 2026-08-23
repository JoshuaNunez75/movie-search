import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type PersonDetails = {
  name: string;
  profile_path: string | null;
  biography: string;
  movie_credits: {
    cast: { id: number; title: string; poster_path: string | null; character: string }[];
  };
};

export default function ActorDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerson();
  }, [id]);

  async function fetchPerson() {
    setLoading(true);
    const response = await fetch(
      `https://api.themoviedb.org/3/person/${id}?append_to_response=movie_credits`,
      {
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_TOKEN}`,
        },
      }
    );
    const data = await response.json();
    setPerson(data);
    setLoading(false);
  }

  if (loading || !person) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d4a017" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: "#121212" }} contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back</Text>
      </Pressable>

      {person.profile_path && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w300${person.profile_path}` }}
          style={styles.photo}
        />
      )}
      <Text style={styles.name}>{person.name}</Text>
      {person.biography !== "" && (
        <Text style={styles.biography} numberOfLines={6}>
          {person.biography}
        </Text>
      )}

      <Text style={styles.sectionLabel}>Known For</Text>
      <View style={{ width: "100%" }}>
        {person.movie_credits.cast.slice(0, 15).map((film) => (
          <Pressable key={film.id} style={styles.filmRow} onPress={() => router.push(`/movie/${film.id}`)}>
            {film.poster_path ? (
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w200${film.poster_path}` }}
                style={styles.filmPoster}
              />
            ) : (
              <View style={[styles.filmPoster, styles.filmPosterPlaceholder]} />
            )}
            <View style={styles.filmInfo}>
              <Text style={styles.filmTitle}>{film.title}</Text>
              {film.character !== "" && <Text style={styles.filmCharacter}>as {film.character}</Text>}
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#121212", padding: 20, alignItems: "center", paddingTop: 60 },
  centered: { flex: 1, backgroundColor: "#121212", justifyContent: "center", alignItems: "center" },
  backButton: { alignSelf: "flex-start", marginBottom: 16 },
  backButtonText: { color: "#d4a017", fontSize: 16, fontWeight: "600" },

  photo: { width: 150, height: 150, borderRadius: 75, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "700", color: "#f5f5f5", textAlign: "center", marginBottom: 10 },
  biography: { color: "#e0e0e0", lineHeight: 20, marginBottom: 20 },
  sectionLabel: { color: "#f5f5f5", fontWeight: "600", fontSize: 14, marginBottom: 8, alignSelf: "flex-start" },
  
  filmRow: { flexDirection: "row", backgroundColor: "#1e1e1e", borderRadius: 8, padding: 10, marginBottom: 10, width: "100%" },
  filmPoster: { width: 50, height: 75, borderRadius: 4, marginRight: 12 },
  filmPosterPlaceholder: { backgroundColor: "#333" },
  filmInfo: { flex: 1, justifyContent: "center" },
  filmTitle: { color: "#f5f5f5", fontWeight: "600", fontSize: 14, marginBottom: 2 },
  filmCharacter: { color: "#a3a3a3", fontSize: 12 },
});