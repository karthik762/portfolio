package com.portfoliobuilder.model;

public class Skill {
    private int id;
    private int userId;
    private String name;
    private String level;

    public Skill() {}

    public Skill(int id, int userId, String name, String level) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.level = level;
    }

    public int getId() { return id; }
    public int getUserId() { return userId; }
    public String getName() { return name; }
    public String getLevel() { return level; }

    public void setId(int id) { this.id = id; }
    public void setUserId(int userId) { this.userId = userId; }
    public void setName(String name) { this.name = name; }
    public void setLevel(String level) { this.level = level; }
}
