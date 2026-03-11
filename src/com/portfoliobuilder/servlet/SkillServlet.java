package com.portfoliobuilder.servlet;

import com.portfoliobuilder.util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.*;

@WebServlet("/skill")
public class SkillServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getParameter("action");
        if ("add".equalsIgnoreCase(action)) {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                response.sendRedirect(request.getContextPath() + "/jsp/login.jsp");
                return;
            }
            int userId = (Integer) session.getAttribute("userId");
            String name = request.getParameter("name");
            String level = request.getParameter("level");

            String sql = "INSERT INTO skills (user_id, name, level) VALUES (?, ?, ?)";
            try (Connection conn = DBConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, userId);
                stmt.setString(2, name);
                stmt.setString(3, level);
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
                String sql = "DELETE FROM skills WHERE id = ? AND user_id = ?";
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
