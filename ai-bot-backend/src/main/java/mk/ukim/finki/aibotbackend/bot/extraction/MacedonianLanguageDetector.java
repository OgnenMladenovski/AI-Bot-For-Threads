package mk.ukim.finki.aibotbackend.bot.extraction;

import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Component
public class MacedonianLanguageDetector implements LanguageDetector {

    private static final Set<Character> UNIQUE_MACEDONIAN_LETTERS = Set.of('ѓ', 'ќ', 'ѕ', 'џ', 'љ', 'њ');
    private static final Set<Character> FOREIGN_LETTERS = Set.of('я', 'й', 'ъ', 'ю', 'ђ', 'ћ', 'ы', 'э', 'щ', 'ё', 'ї', 'є');
    private static final Set<String> MACEDONIAN_WORDS = Set.of("ќе", "во", "со", "дека", "ова", "тоа", "зошто", "кај", "го", "ја", "ги", "им", "нив", "нешто", "уште", "веќе");
    private static final Set<String> FOREIGN_WORDS = Set.of("је", "у", "са", "ће", "није", "нису", "су", "јер", "него", "већ", "који", "која", "које", "њих", "ово", "шта", "ще", "от", "това", "със", "че", "като", "който", "в", "с", "към", "защо");
    private static final Set<String> MACEDONIAN_SUFFIXES = Set.of("от", "та", "те", "то");

    @Override
    public double macedonianConfidence(String text) {
        if (text == null || text.isBlank()) {
            return 0.0;
        }

        String toLowercase = text.toLowerCase();

        long lettersCount = toLowercase.chars().filter(Character::isLetter).count();

        if(lettersCount == 0) {
            return 0;
        }

        long cyrillicCount = toLowercase
                .chars()
                .filter(Character::isLetter)
                .filter(character -> Character.UnicodeScript.of(character) == Character.UnicodeScript.CYRILLIC)
                .count();

        double cyrillicRatio = (double) cyrillicCount / lettersCount;

        //If less than half of the letters are Cyrillic the score is capped at 0.1
        if(cyrillicRatio < 0.5) {
            return Math.min(0.1, cyrillicRatio);
        }

        //Starting score is 0.5 if the text is Cyrillic
        double score = 0.5;

        boolean hasUniqueMacedonianLetter = toLowercase.chars().anyMatch(c -> UNIQUE_MACEDONIAN_LETTERS.contains((char) c));

        //Having unique Macedonian letters is a big indicator that the post is in Macedonian so 0.25 points are added to the score
        if(hasUniqueMacedonianLetter) {
            score += 0.25;
        }

        List<String> wordsList = Arrays
                .stream(toLowercase.split("[^\\p{L}]+"))
                .filter(word -> !word.isBlank())
                .toList();

        //Macedonian-only words
        long macedonianWords = wordsList.stream()
                .filter(MACEDONIAN_WORDS::contains)
                .count();

        //Words that have Macedonian suffixes
        long wordsWithMacedonianSuffixes = wordsList
                .stream()
                .filter(word -> word.length() >= 5)
                .filter(word -> MACEDONIAN_SUFFIXES.stream().anyMatch(word::endsWith))
                .count();

        //Foreign words that don't appear in Macedonian
        long foreignWords = wordsList
                .stream()
                .filter(FOREIGN_WORDS::contains)
                .count();

        //Both Macedonian signals count the same (Macedonian words)
        long definiteMacedonianWords = macedonianWords + wordsWithMacedonianSuffixes;

        //Every Macedonian signal adds 0.08 points, but at most they can add 0.35 points
        score += Math.min(0.35, 0.08 * definiteMacedonianWords);

        //Every foreign word takes away 0.15 points, but at most they can take away 0.45 points
        score -= Math.min(0.45, 0.15 * foreignWords);

        boolean hasForeignLetter = toLowercase.chars().anyMatch(c -> FOREIGN_LETTERS.contains((char) c));

        //Having a Foreign letter is a big indicator that the text ISN'T in Macedonian so the score loses 0.45 points
        if(hasForeignLetter) {
            score -= 0.45;
        }

        //Having less than 3 words sets the max score a post can have to 0.6
        if (wordsList.size() < 3) {
            score = Math.min(score, 0.6);
        }

        return Math.max(0.0, Math.min(1.0, score));
    }
}
