package com.example.demo.store;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class StoreInformationService {
    private final JdbcTemplate jdbc;
    public StoreInformationService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    // No cache: edits in MySQL are visible on the next chat request.
    public List<StoreKnowledge.Entry> read() {
        return jdbc.query("SELECT topic, LEFT(content, 2000) AS content FROM store_information ORDER BY topic LIMIT 20",
            (row, index) -> new StoreKnowledge.Entry(row.getString("topic"), row.getString("content")));
    }
}
