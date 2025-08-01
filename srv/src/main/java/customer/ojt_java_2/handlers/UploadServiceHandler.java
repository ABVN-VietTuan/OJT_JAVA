package customer.ojt_java_2.handlers;

import com.sap.cds.CdsData;
import com.sap.cds.Result;
import com.sap.cds.ql.Insert;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnInsert;
import com.sap.cds.services.cds.CdsCreateEventContext;
import com.sap.cds.services.cds.CdsUpdateEventContext;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.persistence.PersistenceService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import cds.gen.adminservice.Employees;
import cds.gen.adminservice.Employees_;
import cds.gen.uploadservice.UploadService_;
import cds.gen.uploadservice.UploadedCSV;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Component
@ServiceName(UploadService_.CDS_NAME)
public class UploadServiceHandler implements EventHandler {
    @Autowired
    private final PersistenceService db;

    private static final Logger logger = LoggerFactory.getLogger(UploadServiceHandler.class);

    public UploadServiceHandler(PersistenceService db) {
        this.db = db;
    }

    @On(event = "UPDATE", entity = "UploadService.UploadedCSV")
    public void onUpdateContent(CdsUpdateEventContext context, UploadedCSV uploadedCSV) {
        int success = 0, failed = 0;

        InputStream inputStream = uploadedCSV.getContent();
        if (inputStream == null) {
            logger.error("InputStream is null");
            return;
        }

        // Define the input and output formatters
        DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("M/d/yyyy");
        DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            List<String> lines = reader.lines().skip(1).collect(Collectors.toList());
            logger.info("Lines: " + lines.size());

            for (String line : lines) {
                try {
                    String[] values = line.split(",");

                    if (values.length < 7) {
                        logger.warn("Skipped line (not enough fields): " + line);
                        failed++;
                        continue;
                    }

                    Map<String, Object> emply = new HashMap<>();
                    emply.put("firstName", values[0].trim());
                    emply.put("lastName", values[1].trim());
                    emply.put("email", values[2].trim());

                    // Parse and reformat the date
                    String inputDateStr = values[3].trim();
                    LocalDate date = LocalDate.parse(inputDateStr, inputFormatter);
                    String formattedDate = date.format(outputFormatter);

                    emply.put("dateOfBirth", formattedDate);
                    emply.put("salary", Double.parseDouble(values[4].trim()));

                    try {
                        UUID deptId = UUID.fromString(values[5].trim());
                        UUID roleId = UUID.fromString(values[6].trim());
                        emply.put("department_ID", deptId);
                        emply.put("role_ID", roleId);
                    } catch (Exception uuidEx) {
                        logger.error("Invalid UUIDs in line: " + Arrays.toString(values), uuidEx);
                        failed++;
                        continue;
                    }

                    CqnInsert insert = Insert.into(Employees_.CDS_NAME).entry(emply);
                    db.run(insert);
                    success++;

                } catch (Exception e) {
                    logger.error("⚠️ Error inserting line: " + line, e);
                    failed++;
                }
            }

            logger.info("CSV upload result → Success: " + success + ", Failed: " + failed);

        } catch (IOException e) {
            logger.error("Error reading uploaded CSV file", e);
        }

        // Clean up
        uploadedCSV.setContent(null);
        context.setResult(List.of(uploadedCSV));
    }

    // @On(event = "UPDATE", entity = "UploadService.UploadedCSV")
    // public void onUpdateContent(CdsUpdateEventContext context, UploadedCSV
    // uploadedCSV) {
    // Map<String, Object> employee = new HashMap<>();
    // employee.put("firstName", "values[0].trim()");
    // employee.put("lastName", "Viet");
    // employee.put("email", "viet@gmail.com");
    // employee.put("department_ID", "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    // employee.put("role_ID", "11111111-1111-1111-1111-111111111111");
    // logger.info("Employee" + employee);
    // CqnInsert insert = Insert.into(Employees_.CDS_NAME).entry(employee);
    // Result result = db.run(insert);

    // }

}
