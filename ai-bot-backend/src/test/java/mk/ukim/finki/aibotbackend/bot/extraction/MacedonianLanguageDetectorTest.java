package mk.ukim.finki.aibotbackend.bot.extraction;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

public class MacedonianLanguageDetectorTest {
    private final MacedonianLanguageDetector detector = new MacedonianLanguageDetector();

    @Test
    void testMacedonianTextScoresHigh() {
        assertThat(detector.macedonianConfidence(
                "Владата на редовната седница ја усвои новата стратегија за дигитализација на јавните услуги."))
                .isGreaterThan(0.7);
        assertThat(detector.macedonianConfidence(
                "Денес во Скопје ќе биде сончево, а температурата ќе достигне триесет степени."))
                .isGreaterThan(0.7);
    }

    @Test
    void testSerbianAndBulgarianTextScoreLow() {
        assertThat(detector.macedonianConfidence(
                "Влада је на редовној седници усвојила нову стратегију за дигитализацију јавних услуга."))
                .isLessThan(0.5);
        assertThat(detector.macedonianConfidence(
                "Правителството прие нова стратегия за цифровизация на публичните услуги."))
                .isLessThan(0.5);
    }

    @Test
    void testEnglishTextScoresAlmostZero() {
        assertThat(detector.macedonianConfidence(
                "The government adopted a new strategy for the digitalisation of public services."))
                .isLessThan(0.1);
    }

    @Test
    void testEmptyAndShortText() {
        assertThat(detector.macedonianConfidence(null)).isEqualTo(0.0);
        assertThat(detector.macedonianConfidence("   ")).isEqualTo(0.0);
        assertThat(detector.macedonianConfidence("🇲🇰🇲🇰")).isEqualTo(0.0);
        assertThat(detector.macedonianConfidence("Здраво")).isLessThanOrEqualTo(0.6);
    }
}