<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Add Skill</title></head>
<body>
<h2>Add Skill</h2>
<form method="post" action="<%= request.getContextPath() %>/skill">
    <input type="hidden" name="action" value="add" />
    <label>Skill Name: <input type="text" name="name" required /></label><br/>
    <label>Level: 
        <select name="level">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
        </select>
    </label><br/>
    <button type="submit">Add Skill</button>
</form>
<p><a href="<%= request.getContextPath() %>/dashboard">Back to Dashboard</a></p>
</body>
</html>
