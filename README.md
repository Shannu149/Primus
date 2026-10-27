# Project Primus

A local store ordering application with CHITTI shopping assistance, monthly/once order labels, and practitioner callback requests with downloadable visit cards.

## Stack
React and Vite frontend, Java and Spring Boot backend, MySQL database, Groq AI API.

## Run locally
Install Java 17+, Node.js compatible with the included Vite version, npm and MySQL. Start MySQL and open START-PRIMUS.cmd. Enter your database settings and optionally a Groq key. Choose UPDATE for a new empty database. Wait for the backend to start.

Store: http://localhost:5173/  
Admin: http://localhost:5173/admin

Source folders: `demo` (backend), `primus-frontend` (frontend), `checks` (Java checks).

This is a development version. Admin access is currently unprotected; public deployment needs authentication, server-side checkout validation and hosting configuration. The last reported chatbot connection issue still needs verification. Monthly orders are tracked manually.

Credentials and customer database records are not included. Configure secrets locally; do not commit them.
