package com.portfoliobuilder.model;

public class Project {
    private int id;
    private int userId;
    private String title;
    private String description;
    private String techStack;
    private String link;
    private java.sql.Date startDate;
    private java.sql.Date endDate;

    public Project() {}

    public Project(int id, int userId, String title, String description, String techStack, String link, java.sql.Date startDate, java.sql.Date endDate) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.techStack = techStack;
        this.link = link;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public int getId() { return id; }
    public int getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getTechStack() { return techStack; }
    public String getLink() { return link; }
    public java.sql.Date getStartDate() { return startDate; }
    public java.sql.Date getEndDate() { return endDate; }

    public void setId(int id) { this.id = id; }
    public void setUserId(int userId) { this.userId = userId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setTechStack(String techStack) { this.techStack = techStack; }
    public void setLink(String link) { this.link = link; }
    public void setStartDate(java.sql.Date startDate) { this.startDate = startDate; }
    public void setEndDate(java.sql.Date endDate) { this.endDate = endDate; }
}
