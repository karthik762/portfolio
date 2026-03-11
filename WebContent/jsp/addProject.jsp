<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Add Project</title></head>
<body>
<h2>Add Project</h2>
<form method="post" action="<%= request.getContextPath() %>/project">
    <input type="hidden" name="action" value="add" />
    <label>Title: <input type="text" name="title" required /></label><br/>
    <label>Description: <textarea name="description"></textarea></label><br/>
    <label>Tech Stack: <input type="text" name="tech_stack" /></label><br/>
    <label>Link: <input type="url" name="link" /></label><br/>
    <label>Start Date: <input type="date" name="start_date" /></label><br/>
    <label>End Date: <input type="date" name="end_date" /></label><br/>
    <button type="submit">Add Project</button>
</form>
<p><a href="<%= request.getContextPath() %>/dashboard">Back to Dashboard</a></p>
</body>
</html>
