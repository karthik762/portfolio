package com.portfoliobuilder.servlet;

import com.portfoliobuilder.model.Project;
import com.portfoliobuilder.model.Skill;
import com.portfoliobuilder.model.User;
import com.portfoliobuilder.util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/dashboard")
public class DashboardServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        StringBuilder json = new StringBuilder("{");
        try (Connection conn = DBConnection.getConnection()) {

            // User Profile
            String uSql = "SELECT name, email, bio FROM users WHERE id = ?";
            try (PreparedStatement uStmt = conn.prepareStatement(uSql)) {
                uStmt.setInt(1, userId);
                try (ResultSet rs = uStmt.executeQuery()) {
                    if (rs.next()) {
                        json.append("\"profile\":{")
                                .append("\"name\":\"").append(esc(rs.getString("name"))).append("\",")
                                .append("\"email\":\"").append(esc(rs.getString("email"))).append("\",")
                                .append("\"bio\":\"").append(esc(rs.getString("bio"))).append("\"},");
                    }
                }
            }

            // Projects
            json.append("\"projects\":[");
            String pSql = "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC";
            try (PreparedStatement pStmt = conn.prepareStatement(pSql)) {
                pStmt.setInt(1, userId);
                try (ResultSet rs = pStmt.executeQuery()) {
                    boolean first = true;
                    while (rs.next()) {
                        if (!first)
                            json.append(",");
                        json.append("{")
                                .append("\"id\":").append(rs.getInt("id")).append(",")
                                .append("\"title\":\"").append(esc(rs.getString("title"))).append("\",")
                                .append("\"desc\":\"").append(esc(rs.getString("description"))).append("\",")
                                .append("\"tech\":\"").append(esc(rs.getString("tech_stack"))).append("\",")
                                .append("\"link\":\"").append(esc(rs.getString("link"))).append("\",")
                                .append("\"start\":\"")
                                .append(rs.getDate("start_date") == null ? "" : rs.getDate("start_date")).append("\",")
                                .append("\"end\":\"")
                                .append(rs.getDate("end_date") == null ? "" : rs.getDate("end_date")).append("\"}");
                        first = false;
                    }
                }
            }
            json.append("],");

            // Skills
            json.append("\"skills\":[");
            String sSql = "SELECT * FROM skills WHERE user_id = ? ORDER BY id DESC";
            try (PreparedStatement sStmt = conn.prepareStatement(sSql)) {
                sStmt.setInt(1, userId);
                try (ResultSet rs = sStmt.executeQuery()) {
                    boolean first = true;
                    while (rs.next()) {
                        if (!first)
                            json.append(",");
                        json.append("{")
                                .append("\"id\":").append(rs.getInt("id")).append(",")
                                .append("\"name\":\"").append(esc(rs.getString("name"))).append("\",")
                                .append("\"level\":\"").append(esc(rs.getString("level"))).append("\"}");
                        first = false;
                    }
                }
            }
            json.append("],");

            // Experience
            json.append("\"experience\":[");
            String eSql = "SELECT * FROM experience WHERE user_id = ? ORDER BY created_at DESC";
            try (PreparedStatement eStmt = conn.prepareStatement(eSql)) {
                eStmt.setInt(1, userId);
                try (ResultSet rs = eStmt.executeQuery()) {
                    boolean first = true;
                    while (rs.next()) {
                        if (!first)
                            json.append(",");
                        json.append("{")
                                .append("\"id\":").append(rs.getInt("id")).append(",")
                                .append("\"company\":\"").append(esc(rs.getString("company"))).append("\",")
                                .append("\"title\":\"").append(esc(rs.getString("role"))).append("\",")
                                .append("\"desc\":\"").append(esc(rs.getString("description"))).append("\",")
                                .append("\"start\":\"")
                                .append(rs.getDate("start_date") == null ? "" : rs.getDate("start_date")).append("\",")
                                .append("\"end\":\"")
                                .append(rs.getDate("end_date") == null ? "" : rs.getDate("end_date")).append("\"}");
                        first = false;
                    }
                }
            }
            json.append("]");

            json.append("}");
            response.getWriter().write(json.toString());

        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Database error\"}");
        }
    }

    private String esc(String s) {
        if (s == null)
            return "";
        return s.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
