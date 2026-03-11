package com.portfoliobuilder.servlet;

import com.portfoliobuilder.util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.*;

@WebServlet("/admin")
public class AdminServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("isAdmin") == null || !(Boolean) session.getAttribute("isAdmin")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String action = request.getParameter("action");
        if ("list_users".equalsIgnoreCase(action)) {
            handleListUsers(request, response);
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    private void handleListUsers(HttpServletRequest request, HttpServletResponse response) throws IOException {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT u.id, u.name, u.email, u.created_at, " +
                "(SELECT COUNT(*) FROM projects WHERE user_id = u.id) as proj_count, " +
                "(SELECT COUNT(*) FROM skills WHERE user_id = u.id) as skill_count " +
                "FROM users u ORDER BY u.created_at DESC";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            boolean first = true;
            while (rs.next()) {
                if (!first)
                    json.append(",");
                json.append("{")
                        .append("\"id\":").append(rs.getInt("id")).append(",")
                        .append("\"name\":\"").append(esc(rs.getString("name"))).append("\",")
                        .append("\"email\":\"").append(esc(rs.getString("email"))).append("\",")
                        .append("\"joined\":\"").append(rs.getTimestamp("created_at")).append("\",")
                        .append("\"projects\":").append(rs.getInt("proj_count")).append(",")
                        .append("\"skills\":").append(rs.getInt("skill_count"))
                        .append("}");
                first = false;
            }
            json.append("]");
            response.getWriter().write(json.toString());
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Database error\"}");
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("isAdmin") == null || !(Boolean) session.getAttribute("isAdmin")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        String action = request.getParameter("action");
        if ("delete_user".equalsIgnoreCase(action)) {
            handleDeleteUser(request, response);
        }
    }

    private void handleDeleteUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String idParam = request.getParameter("id");
        if (idParam == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        int userId = Integer.parseInt(idParam);

        // Prevent deleting yourself
        HttpSession session = request.getSession();
        if ((Integer) session.getAttribute("userId") == userId) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"message\":\"Cannot delete your own account\"}");
            return;
        }

        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            stmt.executeUpdate();
            response.getWriter().write("{\"success\":true}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private String esc(String s) {
        if (s == null)
            return "";
        return s.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
