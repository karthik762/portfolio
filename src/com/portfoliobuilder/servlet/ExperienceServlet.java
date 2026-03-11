package com.portfoliobuilder.servlet;

import com.portfoliobuilder.util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.*;

@WebServlet("/experience")
public class ExperienceServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getParameter("action");
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        int userId = (Integer) session.getAttribute("userId");

        if ("add".equalsIgnoreCase(action)) {
            String company = request.getParameter("company");
            String role = request.getParameter("role");
            String description = request.getParameter("description");
            String start = request.getParameter("start_date");
            String end = request.getParameter("end_date");

            String sql = "INSERT INTO experience (user_id, company, role, description, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)";
            try (Connection conn = DBConnection.getConnection();
                    PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, userId);
                stmt.setString(2, company);
                stmt.setString(3, role);
                stmt.setString(4, description);
                if (start == null || start.isEmpty())
                    stmt.setNull(5, Types.DATE);
                else
                    stmt.setDate(5, java.sql.Date.valueOf(start));
                if (end == null || end.isEmpty())
                    stmt.setNull(6, Types.DATE);
                else
                    stmt.setDate(6, java.sql.Date.valueOf(end));
                stmt.executeUpdate();
                response.setStatus(HttpServletResponse.SC_OK);
            } catch (SQLException e) {
                throw new ServletException(e);
            }
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getParameter("action");
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        int userId = (Integer) session.getAttribute("userId");

        if ("delete".equalsIgnoreCase(action)) {
            String idParam = request.getParameter("id");
            if (idParam != null) {
                int id = Integer.parseInt(idParam);
                String sql = "DELETE FROM experience WHERE id = ? AND user_id = ?";
                try (Connection conn = DBConnection.getConnection();
                        PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, id);
                    stmt.setInt(2, userId);
                    stmt.executeUpdate();
                    response.setStatus(HttpServletResponse.SC_OK);
                } catch (SQLException e) {
                    throw new ServletException(e);
                }
            }
        }
    }
}
