<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login - Portfolio Builder</title>
</head>
<body>
<h2>Login</h2>
<% String error = (String) request.getAttribute("error"); if (error != null) { %>
    <p style="color:red;"><%= error %></p>
<% } %>
<form method="post" action="<%= request.getContextPath() %>/auth">
    <input type="hidden" name="action" value="login" />
    <label>Email: <input type="email" name="email" required /></label><br/>
    <label>Password: <input type="password" name="password" required /></label><br/>
    <button type="submit">Login</button>
</form>
<p>Don't have an account? <a href="<%= request.getContextPath() %>/jsp/register.jsp">Register</a></p>
</body>
</html>
