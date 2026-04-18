package com.sentinelops.vuln;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class VulnerableApp {
    private static final Logger logger = LogManager.getLogger(VulnerableApp.class);

    public static void main(String[] args) throws Exception {
        String user = args.length > 0 ? args[0] : "alpha";

        // Intentionally vulnerable: logs attacker-controlled input (Log4Shell-era dependency in pom.xml).
        logger.error("User input was: " + user);

        // Intentionally vulnerable: SQL injection via string concatenation.
        try (Connection conn = DriverManager.getConnection("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1");
             Statement st = conn.createStatement()) {
            st.execute("CREATE TABLE items (id INT PRIMARY KEY, name VARCHAR(255))");
            st.execute("INSERT INTO items VALUES (1, 'alpha'), (2, 'beta'), (3, 'gamma')");

            String sql = "SELECT name FROM items WHERE name = '" + user + "'";
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) {
                System.out.println(rs.getString(1));
            }
        }
    }
}
