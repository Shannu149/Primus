package com.example.demo.chat;
import java.util.*;
import java.util.stream.Collectors;
/** Pure catalogue matching and request validation. */
public final class ChatRules {
    private ChatRules() {}
    public record Turn(String role, String content) {}
    public record Item(Long id, String name, String category, String price, Integer stock) {}
    private static final Set<String> STOP = Set.of("a", "an", "the", "i", "you", "your", "do", "have", "is", "are", "in", "of", "for", "me", "show", "find", "please", "products", "product", "stock", "price", "available", "any", "what", "and", "to", "can");
    public static List<Turn> validate(List<Turn> messages) {
        if (messages == null || messages.isEmpty() || messages.size() > 12) throw new IllegalArgumentException("Send between 1 and 12 messages.");
        int total = 0;
        for (Turn m : messages) {
            if (m == null || !("user".equals(m.role()) || "assistant".equals(m.role())) || m.content() == null || m.content().isBlank() || m.content().length() > 1200)
                throw new IllegalArgumentException("Messages must be user/assistant text, 1-1200 characters each.");
            total += m.content().length();
        }
        if (total > 10000 || !"user".equals(messages.get(messages.size()-1).role())) throw new IllegalArgumentException("Conversation is too long or does not end with a question.");
        return messages;
    }
    public static List<Item> match(String query, List<Item> items) {
        Set<String> tokens = Arrays.stream(query.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+"))
                .filter(t -> t.length() > 1 && !STOP.contains(t)).collect(Collectors.toSet());
        return items.stream().filter(i -> score(i, tokens) > 0)
                .sorted(Comparator.<Item>comparingInt(i -> score(i, tokens)).reversed()).limit(30).toList();
    }
    private static int score(Item item, Set<String> tokens) {
        String value = (item.name() + " " + item.category()).toLowerCase(Locale.ROOT);
        return (int) tokens.stream().filter(value::contains).count();
    }
    public static String catalogueReply(String query, List<Item> matches) {
        String q = query.toLowerCase(Locale.ROOT);
        if (q.matches("(?s).*(deliver|pincode|pin code|53300).*"))
            return "The store currently accepts delivery orders for Kakinada PIN codes 533005 and 533002. Delivery time and fees are not specified here; please confirm with the store.";
        if (q.matches("(?s).*(checkout|payment|pay |order|cash|upi).*"))
            return "Add items to My Cart, choose Checkout, enter your delivery details, then Place Order. This version supports Cash on Delivery. Store staff will call to confirm. I cannot access or change orders.";
        if (!matches.isEmpty()) return "Here are catalogue matches for your words. These are search results, not medical recommendations. Select View in store to inspect an item. Prices are in INR; final availability is confirmed by the store.";
        return "Catalogue-only mode: try a product or category name, or ask about delivery and checkout. I could not find matching items in the catalogue snapshot. I cannot assess symptoms, recommend medicines or provide dosage advice; please ask a qualified pharmacist or doctor.";
    }
}
