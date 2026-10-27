package com.example.demo.chat;
import java.util.Locale;
/** Conservative English-language backup; not a diagnostic or triage system. */
public final class HealthGuard {
    private HealthGuard() {}
    public static String reply(String question) {
        String q = question.toLowerCase(Locale.ROOT);
        if (q.matches("(?s).*(chest pain|sudden shortness of breath|can.?t breathe|cannot breathe|severe abdominal (pain|agony)|sudden (speech difficult|difficulty speaking)|coughing up blood).*"))
            return "If these symptoms are happening now, seek emergency medical care immediately or contact local emergency services. Do not wait for a supplement or a chat reply. I cannot assess or treat an emergency.";
        if (q.matches("(?s).*(night blindness|dry eyes|blurred vision|chronic fatigue|brain fog|tingling|numbness|nerve weakness|pregnan|prenatal|bleeding gums|easy bruising|slow.healing wound|bone pain|joint pain|joint weakness|fracture|hair (loss|fall|thinning)|brittle nails|splitting nails|muscle (cramp|twitch)|leg cramp|insomnia|anemia|anaemia|low (iron|hemoglobin|haemoglobin)|breathless|boost.*immunity|fight.*cold|recover.*flu|what.*dose|which.*vitamin.*should).*"))
            return "These symptoms or circumstances do not tell me which supplement is appropriate. Please speak with a qualified doctor or pharmacist before choosing one; for an animal, consult a veterinarian. I can check the price and stock of a product you already know by name, but cannot recommend treatment or a dose.";
        return null;
    }
}
