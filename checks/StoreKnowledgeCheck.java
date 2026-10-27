import com.example.demo.store.StoreKnowledge;
import com.example.demo.chat.HealthGuard;
import java.util.*;
public class StoreKnowledgeCheck {
    static int count;
    static void check(boolean value, String description) { count++; if (!value) throw new AssertionError(description); }
    public static void main(String[] args) {
        var facts = List.of(new StoreKnowledge.Entry("contact", "Phone: 9398643062. Email: srirajeswari1@gmail.com."),
            new StoreKnowledge.Entry("delivery", "Free delivery above an unconfirmed minimum; call to confirm."),
            new StoreKnowledge.Entry("location", "Sarpavaram-Panasapadu Road, Kakinada."));
        check(StoreKnowledge.reply("How do I contact you?", facts).contains("9398643062"), "Contact from records");
        check(StoreKnowledge.reply("Where is your store?", facts).contains("Sarpavaram"), "Address from records");
        check(StoreKnowledge.reply("minimum order for delivery?", facts).contains("unconfirmed"), "No invented minimum");
        check(StoreKnowledge.reply("Horlicks price", facts) == null, "Product questions remain product lookups");
        var changed = List.of(new StoreKnowledge.Entry("contact", "UPDATED NUMBER"));
        check(StoreKnowledge.reply("phone number", changed).equals("UPDATED NUMBER"), "New paragraphs used immediately");
        for (String q : List.of("I have chest pain", "sudden shortness of breath", "I am coughing up blood", "sudden speech difficulties"))
            check(HealthGuard.reply(q).contains("emergency"), "Urgent guidance: " + q);
        for (String q : List.of("I have blurred vision", "my hair is thinning and I have hair loss", "planning pregnancy", "I have low hemoglobin", "recommend a vitamin for insomnia"))
            check(HealthGuard.reply(q).contains("cannot recommend treatment"), "No symptom-based supplement recommendation: " + q);
        check(HealthGuard.reply("Vitamin B12 price and stock") == null, "Named product lookup remains available");
        check(HealthGuard.reply("Where is your store?") == null, "Normal store enquiry");
        System.out.println(count + " store and health-routing checks passed.");
    }
}
