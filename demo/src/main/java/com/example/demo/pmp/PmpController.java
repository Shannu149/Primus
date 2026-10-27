package com.example.demo.pmp;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/pmp")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class PmpController {
    private final JdbcTemplate db;
    public PmpController(JdbcTemplate db) { this.db = db; }
    public record Request(String name, String mobile, String area, Integer age) {}
    public record Card(String status, String hospitalName, String doctorName, String qualifications,
                       String hospitalAddress, String hospitalPhone, boolean cardReady) {}
    private String clean(String value, int max, boolean required) {
        String result = value == null ? "" : value.trim();
        if ((required && result.isEmpty()) || result.length() > max)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please complete the fields within their length limits.");
        return result;
    }
    @PostMapping("/requests")
    public Map<String, String> create(@RequestBody Request request) {
        String name = clean(request.name(),120,true), mobile = clean(request.mobile(),15,true);
        String area = clean(request.area(),200,true);
        if (!mobile.matches("[6-9][0-9]{9}") || request.age() == null || request.age() < 0 || request.age() > 120)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid 10-digit mobile number and age from 0 to 120.");
        String token = UUID.randomUUID().toString();
        db.update("INSERT INTO pmp_requests(request_token,customer_name,mobile,area,age) VALUES (?,?,?,?,?)",
                  token,name,mobile,area,request.age());
        return Map.of("token",token,"status","NEW");
    }
    // This local-only app preserves the existing unauthenticated admin model.
    @GetMapping("/requests")
    public List<Map<String,Object>> list() {
        return db.queryForList("SELECT * FROM pmp_requests ORDER BY id DESC LIMIT 1000");
    }
    @PutMapping("/requests/{id}")
    public Map<String, Boolean> save(@PathVariable long id, @RequestBody Card card) {
        if (card.status() == null || !Set.of("NEW","CONTACTED","CLOSED").contains(card.status()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid request status");
        String hospital=clean(card.hospitalName(),200,card.cardReady());
        String doctor=clean(card.doctorName(),160,card.cardReady());
        String qualifications=clean(card.qualifications(),200,card.cardReady());
        int updated=db.update("UPDATE pmp_requests SET status=?,hospital_name=?,doctor_name=?,qualifications=?,hospital_address=?,hospital_phone=?,card_ready=?,published_at=CASE WHEN ? THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE NULL END WHERE id=?",
            card.status(),hospital,doctor,qualifications,clean(card.hospitalAddress(),500,false),clean(card.hospitalPhone(),30,false),card.cardReady(),card.cardReady(),id);
        if(updated==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Request not found");
        return Map.of("saved",true);
    }
    @GetMapping("/cards/{token}")
    public Map<String,Object> card(@PathVariable String token) {
        // Public lookup deliberately omits callback name, mobile, age and area.
        List<Map<String,Object>> rows=db.queryForList("SELECT request_token,card_ready,hospital_name,doctor_name,qualifications,hospital_address,hospital_phone,published_at FROM pmp_requests WHERE request_token=?",token);
        if(rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Request token not found");
        Map<String,Object> row=rows.get(0);
        Object ready=row.get("card_ready");
        if(!Boolean.TRUE.equals(ready) && !(ready instanceof Number n && n.intValue()==1))
            return Map.of("card_ready",false,"request_token",token);
        return row;
    }
}
