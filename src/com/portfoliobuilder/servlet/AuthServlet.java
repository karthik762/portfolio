package com.portfoliobuilder.servlet;

import com.portfoliobuilder.util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.security.MessageDigest;
import java.sql.*;

@WebServlet("/auth")
public class AuthServlet extends HttpServlet {

    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(password.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes)
                sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getParameter("action");
        if ("register".equalsIgnoreCase(action)) {
            handleRegister(request, response);
        } else if ("login".equalsIgnoreCase(action)) {
            handleLogin(request, response);
        } else if ("logout".equalsIgnoreCase(action)) {
            HttpSession session = request.getSession(false);
            if (session != null)
                session.invalidate();
            response.sendRedirect(request.getContextPath() + "/jsp/login.jsp");
        } else if ("update_profile".equalsIgnoreCase(action)) {
            handleUpdateProfile(request, response);
        } else {
            response.sendRedirect(request.getContextPath() + "/jsp/login.jsp");
        }
    }

    private void handleUpdateProfile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        int userId = (Integer) session.getAttribute("userId");
        String name = request.getParameter("name");
        String bio = request.getParameter("bio");

        String sql = "UPDATE users SET name = ?, bio = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, name);
            stmt.setString(2, bio);
            stmt.setInt(3, userId);
            stmt.executeUpdate();
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"success\":true}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private void handleRegister(HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException {
        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String bio = request.getParameter("bio");

        response.setContentType("application/json");
        if (name == null || email == null || password == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"message\":\"Missing fields\"}");
            return;
        }

        String hashed = hashPassword(password);
        String checkSql = "SELECT id FROM users WHERE email = ?";
        String insertSql = "INSERT INTO users (name, email, password, bio) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {

            checkStmt.setString(1, email);
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    response.setStatus(HttpServletResponse.SC_CONFLICT);
                    response.getWriter().write("{\"success\":false,\"message\":\"Email already registered\"}");
                    return;
                }
            }

            try (PreparedStatement insertStmt = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                insertStmt.setString(1, name);
                insertStmt.setString(2, email);
                insertStmt.setString(3, hashed);
                insertStmt.setString(4, bio);
                insertStmt.executeUpdate();
                try (ResultSet keys = insertStmt.getGeneratedKeys()) {
                    if (keys.next()) {
                        int userId = keys.getInt(1);
                        HttpSession session = request.getSession();
                        session.setAttribute("userId", userId);
                        session.setAttribute("isAdmin", false);
                        response.getWriter().write(
                                "{\"success\":true,\"user\":{\"email\":\"" + email + "\",\"name\":\"" + name
                                        + "\",\"isAdmin\":false}}");
                        return;
                    }
                }
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\":false,\"message\":\"Database error\"}");
        }
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException {
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        response.setContentType("application/json");

        if (email == null || password == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"message\":\"Missing credentials\"}");
            return;
        }

        String sql = "SELECT id, password, name, is_admin FROM users WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String storedHash = rs.getString("password");
                    if (storedHash.equals(hashPassword(password))) {
                        int userId = rs.getInt("id");
                        String name = rs.getString("name");
                        boolean isAdmin = rs.getBoolean("is_admin");
                        HttpSession session = request.getSession();
                        session.setAttribute("userId", userId);
                        session.setAttribute("isAdmin", isAdmin);
                        response.getWriter().write(
                                "{\"success\":true,\"user\":{\"email\":\"" + email + "\",\"name\":\"" + name
                                        + "\",\"isAdmin\":" + isAdmin + "}}");
                        return;
                    }
                }
            }
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"success\":false,\"message\":\"Invalid email or password\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\":false,\"message\":\"Database error\"}");
        }
    }
}
