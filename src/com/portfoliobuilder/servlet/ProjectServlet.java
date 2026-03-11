package com.portfoliobuilder.servlet;

import com.portfoliobuilder.util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.*;

@WebServlet("/project")
public class ProjectServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getParameter("action");
        if ("add".equalsIgnoreCase(action)) {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                response.sendRedirect(request.getContextPath() + "/jsp/login.jsp");
                return;
            }
            int userId = (Integer) session.getAttribute("userId");

            String title = request.getParameter("title");
            String description = request.getParameter("description");
            String techStack = request.getParameter("tech_stack");
            String link = request.getParameter("link");
            String start = request.getParameter("start_date");
            String end = request.getParameter("end_date");

            String sql = "INSERT INTO projects (user_id, title, description, tech_stack, link, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
            try (Connection conn = DBConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, userId);
                stmt.setString(2, title);
                stmt.setString(3, description);
                stmt.setString(4, techStack);
                stmt.setString(5, link);
                if (start == null || start.isEmpty()) stmt.setNull(6, Types.DATE); else stmt.setDate(6, java.sql.Date.valueOf(start));
                if (end == null || end.isEmpty()) stmt.setNull(7, Types.DATE); else stmt.setDate(7, java.sql.Date.valueOf(end));
                stmt.executeUpdate();
                response.sendRedirect(request.getContextPath() + "/dashboard");
            } catch (SQLException e) {
                throw new ServletException(e);
            }
        } else {
            response.sendRedirect(request.getContextPath() + "/dashboard");
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getParameter("action");
        if ("delete".equalsIgnoreCase(action)) {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                response.sendRedirect(request.getContextPath() + "/jsp/login.jsp");
                return;
            }
            int userId = (Integer) session.getAttribute("userId");
            String idParam = request.getParameter("id");
            if (idParam != null) {
                int id = Integer.parseInt(idParam);
                String sql = "DELETE FROM projects WHERE id = ? AND user_id = ?";
                try (Connection conn = DBConnection.getConnection();
                     PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, id);
                    stmt.setInt(2, userId);
                    stmt.executeUpdate();
                } catch (SQLException e) {
                    throw new ServletException(e);
                }
            }
            response.sendRedirect(request.getContextPath() + "/dashboard");
        } else {
            response.sendRedirect(request.getContextPath() + "/dashboard");
        }
    }
}
