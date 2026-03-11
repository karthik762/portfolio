<%@ page import="com.portfoliobuilder.model.User,com.portfoliobuilder.model.Project,com.portfoliobuilder.model.Skill,java.util.List" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Dashboard - Portfolio Builder</title>
</head>
<body>
<%
    User user = (User) request.getAttribute("user");
    List<Project> projects = (List<Project>) request.getAttribute("projects");
    List<Skill> skills = (List<Skill>) request.getAttribute("skills");
%>

<h2>Welcome, <%= (user != null ? user.getName() : "User") %></h2>
<p><strong>Email:</strong> <%= (user != null ? user.getEmail() : "") %></p>
<p><strong>Bio:</strong> <%= (user != null ? user.getBio() : "") %></p>

<hr/>

<h3>Projects</h3>
<p><a href="<%= request.getContextPath() %>/jsp/addProject.jsp">Add Project</a></p>
<% if (projects != null && !projects.isEmpty()) { %>
    <ul>
    <% for (Project p : projects) { %>
        <li>
            <strong><%= p.getTitle() %></strong> - <%= p.getTechStack() %><br/>
            <%= p.getDescription() %><br/>
            <a href="<%= p.getLink() != null ? p.getLink() : "#" %>">Project Link</a><br/>
            <a href="<%= request.getContextPath() %>/project?action=delete&id=<%= p.getId() %>" onclick="return confirm('Delete project?');">Delete</a>
        </li>
    <% } %>
    </ul>
<% } else { %>
    <p>No projects added yet.</p>
<% } %>

<hr/>

<h3>Skills</h3>
<p><a href="<%= request.getContextPath() %>/jsp/addSkill.jsp">Add Skill</a></p>
<% if (skills != null && !skills.isEmpty()) { %>
    <ul>
    <% for (Skill s : skills) { %>
        <li>
            <%= s.getName() %> - <%= s.getLevel() %>
            <a href="<%= request.getContextPath() %>/skill?action=delete&id=<%= s.getId() %>" onclick="return confirm('Delete skill?');">Delete</a>
        </li>
    <% } %>
    </ul>
<% } else { %>
    <p>No skills added yet.</p>
<% } %>

<hr/>
<form method="post" action="<%= request.getContextPath() %>/auth">
    <input type="hidden" name="action" value="logout" />
    <button type="submit">Logout</button>
</form>

</body>
</html>
