package com.example.demo.store;
import java.util.*;
/** Store facts are editable database content, never instructions to the model. */
public final class StoreKnowledge {
    private StoreKnowledge() {}
    public record Entry(String topic, String content) {}
    public static String reply(String question, List<Entry> entries) {
        String q = question.toLowerCase(Locale.ROOT);
        Set<String> topics = new LinkedHashSet<>();
        if (q.matches("(?s).*(about|history|how long|years|since).*")) topics.add("about");
        if (q.matches("(?s).*(address|location|located|where.*store|where.*shop|road).*")) topics.add("location");
        if (q.matches("(?s).*(contact|phone|call|email|e-mail|mail|whatsapp).*")) topics.add("contact");
        if (q.matches("(?s).*(deliver|minimum|pin.?code|53300|shipping|free home).*")) topics.add("delivery");
        if (q.matches("(?s).*(service|sell|generic|cosmetic|pet|veterinary|baby care|brands).*")) topics.add("services");
        if (q.matches("(?s).*(timing|hours|open|closed|holiday).*")) topics.add("hours");
        if (q.matches("(?s).*(return|refund|cancel).*")) topics.add("returns");
        if (q.matches("(?s).*(checkout|payment|upi|cash|place.*order).*")) topics.add("checkout");
        if (q.matches("(?s).*(creator|created|developer|developed|built.*website|made.*website|shanmukh).*")) topics.add("website_creator");
        List<String> answer = entries.stream().filter(e -> topics.contains(e.topic())).map(Entry::content).toList();
        return answer.isEmpty() ? null : String.join("\n\n", answer);
    }
}
