import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type MovieDetails = {
    title: string;
    tagline: string;
    poster_path: string | null;
    release_date: string;
    runtime: number;
    vote_average: number;
    vote_count: number;
    status: string;
    overview: string;
    genres: { id: number; name: string }[];
    credits: {
        cast: { id: number; name: string; profile_path: string | null }[];
    };
};

export default function MovieDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovie();
    }, [id]);

    async function fetchMovie() {
        setLoading(true);
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?append_to_response=credits`, {
            headers: {
                Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_TOKEN}`,
            },
        });
        const data = await response.json();
        setMovie(data);
        setLoading(false);
    }

    if (loading || !movie) {
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
            {movie.poster_path && (
                <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w300${movie.poster_path}` }}
                    style={styles.poster}
                />
            )}
            <Text style={styles.title}>{movie.title}</Text>
            {movie.tagline !== "" && <Text style={styles.tagline}>"{movie.tagline}"</Text>}
            <Text style={styles.meta}>
                {movie.release_date ? movie.release_date.slice(0, 4) : "Unknown year"}
                {movie.runtime ? ` · ${movie.runtime} min` : ""}
                {" · "}⭐ {movie.vote_average.toFixed(1)} ({movie.vote_count.toLocaleString()} votes)
            </Text>
            <Text style={styles.genres}>{movie.genres.map((genre) => genre.name).join(", ")}</Text>
            <Text style={styles.status}>{movie.status}</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
            {movie.credits.cast.length > 0 && (
                <View style={styles.castSection}>
                    <Text style={styles.sectionLabel}>Starring</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {movie.credits.cast.slice(0, 8).map((actor) => (
                            <View key={actor.id} style={styles.castItem}>
                                {actor.profile_path ? (
                                    <Image
                                        source={{ uri: `https://image.tmdb.org/t/p/w200${actor.profile_path}` }}
                                        style={styles.castPhoto}
                                    />
                                ) : (
                                    <View style={[styles.castPhoto, styles.castPhotoPlaceholder]} />
                                )}
                                <Text style={styles.castName} numberOfLines={2}>
                                    {actor.name}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: "#121212", padding: 20, alignItems: "center", paddingTop: 60 },
    centered: { flex: 1, backgroundColor: "#121212", justifyContent: "center", alignItems: "center" },
    poster: { width: 180, height: 270, borderRadius: 8, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: "700", color: "#f5f5f5", textAlign: "center", marginBottom: 6 },
    meta: { color: "#d4a017", marginBottom: 6 },
    genres: { color: "#a3a3a3", marginBottom: 8, textAlign: "center" },
    tagline: { color: "#a3a3a3", fontStyle: "italic", marginBottom: 8, textAlign: "center" },
    status: { color: "#a3a3a3", fontSize: 13, marginBottom: 16 },
    overview: { color: "#e0e0e0", lineHeight: 20, marginBottom: 16 },

    castSection: { width: "100%", marginBottom: 16 },
    sectionLabel: { color: "#f5f5f5", fontWeight: "600", fontSize: 14, marginBottom: 8 },
    castItem: { width: 80, marginRight: 12, alignItems: "center" },
    castPhoto: { width: 70, height: 70, borderRadius: 35, marginBottom: 6 },
    castPhotoPlaceholder: { backgroundColor: "#333" },
    castName: { color: "#e0e0e0", fontSize: 12, textAlign: "center" },

    backButton: { alignSelf: "flex-start", marginBottom: 16 },
    backButtonText: { color: "#d4a017", fontSize: 16, fontWeight: "600" },
});