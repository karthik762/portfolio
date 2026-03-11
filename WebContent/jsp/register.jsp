<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Register - Portfolio Builder</title>
</head>
<body>
<h2>Register</h2>
<% String error = (String) request.getAttribute("error"); if (error != null) { %>
    <p style="color:red;"><%= error %></p>
<% } %>
<form method="post" action="<%= request.getContextPath() %>/auth">
    <input type="hidden" name="action" value="register" />
    <label>Name: <input type="text" name="name" required /></label><br/>
    <label>Email: <input type="email" name="email" required /></label><br/>
    <label>Password: <input type="password" name="password" required /></label><br/>
    <label>Bio: <textarea name="bio"></textarea></label><br/>
    <button type="submit">Register</button>
</form>
<p>Already have an account? <a href="<%= request.getContextPath() %>/jsp/login.jsp">Login</a></p>
</body>
</html>
