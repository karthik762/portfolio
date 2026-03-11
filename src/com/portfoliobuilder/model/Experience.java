package com.portfoliobuilder.model;

import java.sql.Date;

public class Experience {
    private int id;
    private int userId;
    private String company;
    private String role;
    private String description;
    private Date startDate;
    private Date endDate;

    public Experience() {}

    public Experience(int id, int userId, String company, String role, String description, Date startDate, Date endDate) {
        this.id = id;
        this.userId = userId;
        this.company = company;
        this.role = role;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
}
